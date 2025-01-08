import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAccount, useConfig, useDisconnect } from "wagmi"
import { NetworkType } from "../../../Models/Network"
import { useSettingsState } from "../../../context/settings"
import { WalletProvider } from "../../../hooks/useWallet"
import KnownInternalNames from "../../knownIds"
import resolveWalletConnectorIcon from "../utils/resolveWalletIcon"
import { evmConnectorNameResolver } from "./KnownEVMConnectors"
import { useEffect, useState } from "react"
import { CreatePreHTLCParams, CommitmentParams, LockParams, GetCommitsParams, RefundParams, ClaimParams } from "../phtlc"
import { writeContract, simulateContract, readContract, waitForTransactionReceipt, signTypedData } from '@wagmi/core'
import { ethers } from "ethers"
import { Commit } from "../../../Models/PHTLC"
import PHTLCAbi from "../../../lib/abis/atomic/EVM_PHTLC.json"
import ERC20PHTLCAbi from "../../../lib/abis/atomic/EVMERC20_PHTLC.json"
import IMTBLZKERC20 from "../../../lib/abis/IMTBLZKERC20.json"
import formatAmount from "../../formatAmount"
import LayerSwapApiClient from "../../layerSwapApiClient"
import { Chain, createPublicClient, http, PublicClient } from "viem"
import resolveChain from "../../resolveChain"

export default function useEVM(): WalletProvider {
    const { networks } = useSettingsState()
    const [shouldConnect, setShouldConnect] = useState(false)
    const { disconnectAsync } = useDisconnect()
    const config = useConfig()

    const asSourceSupportedNetworks = [
        ...networks.filter(network => network.type === NetworkType.EVM && network.name !== KnownInternalNames.Networks.RoninMainnet).map(l => l.name),
        KnownInternalNames.Networks.ZksyncMainnet,
        KnownInternalNames.Networks.LoopringGoerli,
        KnownInternalNames.Networks.LoopringMainnet,
        KnownInternalNames.Networks.LoopringSepolia
    ]

    const withdrawalSupportedNetworks = [
        ...asSourceSupportedNetworks,
        KnownInternalNames.Networks.ParadexMainnet,
        KnownInternalNames.Networks.ParadexTestnet,
    ]

    const autofillSupportedNetworks = [
        ...asSourceSupportedNetworks,
        KnownInternalNames.Networks.ImmutableXMainnet,
        KnownInternalNames.Networks.ImmutableXGoerli,
        KnownInternalNames.Networks.BrineMainnet,
    ]

    const name = 'evm'
    const account = useAccount()
    const { openConnectModal } = useConnectModal()

    useEffect(() => {
        if (shouldConnect) {
            connectWallet()
            setShouldConnect(false)
        }
    }, [shouldConnect])

    const getWallet = () => {
        if (account && account.address && account.connector) {
            const connector = account.connector.id

            return {
                address: account.address,
                connector: account.connector.name || connector.charAt(0).toUpperCase() + connector.slice(1),
                providerName: name,
                icon: resolveWalletConnectorIcon({ connector: evmConnectorNameResolver(account.connector), address: account.address }),
                chainId: account.chainId
            }
        }
    }

    const connectWallet = () => {
        try {
            return openConnectModal && openConnectModal()
        }
        catch (e) {
            console.log(e)
        }
    }

    const disconnectWallet = async () => {
        try {
            account.connector && await account.connector.disconnect()
            await disconnectAsync()
        }
        catch (e) {
            console.log(e)
        }
    }

    const reconnectWallet = async () => {
        try {
            account.connector && await account.connector.disconnect()
            await disconnectAsync()
            setShouldConnect(true)
        }
        catch (e) {
            console.log(e)
        }
    }

    const createPreHTLC = async (params: CreatePreHTLCParams) => {
        const { destinationChain, destinationAsset, sourceAsset, lpAddress, address, amount, decimals, atomicContract, chainId } = params

        const LOCK_TIME = 1000 * 60 * 15 // 15 minutes
        const timeLockMS = Date.now() + LOCK_TIME
        const timeLock = Math.floor(timeLockMS / 1000)

        if (!account.address) {
            throw Error("Wallet not connected")
        }
        if (isNaN(Number(chainId))) {
            throw Error("Invalid source chain")
        }
        if (!lpAddress) {
            throw Error("No LP address")
        }
        if (!atomicContract) {
            throw Error("No contract address")
        }

        const parsedAmount = ethers.utils.parseUnits(amount.toString(), decimals).toBigInt()

        const abi = sourceAsset.contract ? ERC20PHTLCAbi : PHTLCAbi

        let simulationData: any = {
            abi: abi,
            address: atomicContract,
            functionName: 'commit',
            args: [
                [destinationChain],
                [destinationAsset],
                [lpAddress],
                destinationChain,
                destinationAsset,
                address,
                sourceAsset.symbol,
                lpAddress,
                timeLock,
            ],
            chainId: Number(chainId),
        }

        if (sourceAsset.contract) {
            simulationData.args = [
                ...simulationData.args,
                parsedAmount as any,
                sourceAsset.contract
            ]
            const allowance = await readContract(config, {
                abi: IMTBLZKERC20,
                address: sourceAsset.contract as `0x${string}`,
                functionName: 'allowance',
                args: [account.address, atomicContract],
                chainId: Number(chainId),
            })

            if (Number(allowance) < parsedAmount) {
                const res = await writeContract(config, {
                    abi: IMTBLZKERC20,
                    address: sourceAsset.contract as `0x${string}`,
                    functionName: 'approve',
                    args: [atomicContract, parsedAmount],
                    chainId: Number(chainId),
                })

                await waitForTransactionReceipt(config, {
                    chainId: Number(chainId),
                    hash: res,
                })
            }

        } else {
            simulationData.value = parsedAmount as any
        }

        const { request, result } = await simulateContract(config, simulationData)

        const hash = await writeContract(config, request)
        return { hash, commitId: (result as string) }
    }

    const getDetails = async (params: CommitmentParams): Promise<Commit> => {
        const { chainId, id, contractAddress, type } = params
        const abi = type === 'erc20' ? ERC20PHTLCAbi : PHTLCAbi

        const result: any = await readContract(config, {
            abi: abi,
            address: contractAddress,
            functionName: 'getDetails',
            args: [id],
            chainId: Number(chainId),
        })

        const networkToken = networks.find(network => chainId && network.chain_id == chainId)?.tokens.find(token => token.symbol === result.srcAsset)

        const parsedResult = {
            ...result,
            secret: Number(result.secret) !== 1 ? result.secret : null,
            hashlock: (result.hashlock == "0x0100000000000000000000000000000000000000000000000000000000000000" || result.hashlock == "0x0000000000000000000000000000000000000000000000000000000000000000") ? null : result.hashlock,
            amount: formatAmount(Number(result.amount), networkToken?.decimals),
            timelock: Number(result.timelock)
        }

        if (!result) {
            throw new Error("No result")
        }
        return parsedResult
    }

    const secureGetDetails = async (params: CommitmentParams): Promise<Commit | null> => {
        const { chainId, id, contractAddress, type } = params
        const abi = type === 'erc20' ? ERC20PHTLCAbi : PHTLCAbi

        const network = networks.find(n => n.chain_id === chainId)
        const nodeUrls: string[] | undefined = network?.node_urls || (network?.node_url ? [network?.node_url] : undefined)
        if (!network?.chain_id) throw new Error("No network found")
        if (!nodeUrls) throw new Error("No node urls found")

        const chain = resolveChain(network) as Chain

        async function getDetailsFetch(client: PublicClient): Promise<Commit> {
            const result: any = await client.readContract({
                abi: abi,
                address: contractAddress,
                functionName: 'getDetails',
                args: [id],
            })
            return result
        }

        // Create an array of PublicClients for each RPC endpoint
        const clients = nodeUrls.map((url) =>
            createPublicClient({ transport: http(url), chain })
        )

        // Fetch all results in parallel
        const results = await Promise.all(clients.map((client) => getDetailsFetch(client)))

        // Extract hashlocks
        const hashlocks = results.map(r => r.hashlock).filter(h => h !== "0x0100000000000000000000000000000000000000000000000000000000000000" && h !== "0x0000000000000000000000000000000000000000000000000000000000000000")

        if (!hashlocks.length) return null

        // Verify all hashlocks are the same
        const [firstHashlock, ...otherHashlocks] = hashlocks
        if (!otherHashlocks.every(h => h === firstHashlock)) {
            throw new Error('Hashlocks do not match across the provided nodes')
        }

        // All hashlocks match, return one of the results (e.g., the first one)
        return results[0]

    }

    const addLock = async (params: CommitmentParams & LockParams) => {
        const { chainId, id, hashlock, contractAddress } = params

        const LOCK_TIME = 1000 * 60 * 15 // 15 minutes
        const timeLockMS = Date.now() + LOCK_TIME
        const timeLock = Math.floor(timeLockMS / 1000)

        const apiClient = new LayerSwapApiClient()

        const domain = {
            name: "LayerswapV8",
            version: "1",
            chainId: Number(chainId),
            verifyingContract: contractAddress as `0x${string}`,
            salt: "0x2e4ff7169d640efc0d28f2e302a56f1cf54aff7e127eededda94b3df0946f5c0" as `0x${string}`
        };

        const types = {
            addLockMsg: [
                { name: "Id", type: "bytes32" },
                { name: "hashlock", type: "bytes32" },
                { name: "timelock", type: "uint48" },
            ],
        };

        const message = {
            Id: id,
            hashlock: hashlock,
            timelock: timeLock,
        };

        const signature = await signTypedData(config, {
            domain, types, message,
            primaryType: "addLockMsg"
        });

        const sig = ethers.utils.splitSignature(signature)

        try {
            account.address && await apiClient.AddLockSig({
                signature,
                signer_address: account.address,
                v: sig.v.toString(),
                r: sig.r,
                s: sig.s,
                timelock: timeLock,
            }, id)
        } catch (e) {
            throw new Error("Failed to add lock")
        }

        return { hash: signature, result: signature }
    }

    const refund = async (params: RefundParams) => {
        const { chainId, id, contractAddress, type } = params
        const abi = type === 'erc20' ? ERC20PHTLCAbi : PHTLCAbi

        const { request } = await simulateContract(config, {
            abi: abi,
            address: contractAddress,
            functionName: 'refund',
            args: [id],
            chainId: Number(chainId),
        })

        const result = await writeContract(config, request)

        if (!result) {
            throw new Error("No result")
        }
        return result
    }

    const claim = async (params: ClaimParams) => {
        const { chainId, id, contractAddress, type, secret } = params
        const abi = type === 'erc20' ? ERC20PHTLCAbi : PHTLCAbi

        const { request } = await simulateContract(config, {
            abi: abi,
            address: contractAddress,
            functionName: 'redeem',
            args: [id, secret],
            chainId: Number(chainId),
        })

        const result = await writeContract(config, request)

        if (!result) {
            throw new Error("No result")
        }
    }

    const getContracts = async (params: GetCommitsParams) => {
        const { chainId, contractAddress, type } = params
        const abi = type === 'erc20' ? ERC20PHTLCAbi : PHTLCAbi

        if (!account.address) {
            throw Error("Wallet not connected")
        }
        const result = await readContract(config, {
            abi: abi,
            address: contractAddress,
            functionName: 'getContracts',
            args: [account.address],
            chainId: Number(chainId),
        })
        if (!result) {
            throw new Error("No result")
        }
        return (result as string[]).reverse()
    }

    return {
        getConnectedWallet: getWallet,
        connectWallet,
        disconnectWallet,
        reconnectWallet,
        autofillSupportedNetworks,
        withdrawalSupportedNetworks,
        asSourceSupportedNetworks,
        name,
        createPreHTLC,
        claim,
        refund,
        addLock,
        getDetails,
        secureGetDetails,
        getContracts
    }
}
