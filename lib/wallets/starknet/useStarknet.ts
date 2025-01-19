import { useWalletStore } from "../../../stores/walletStore"
import KnownInternalNames from "../../knownIds"
import { resolveWalletConnectorIcon } from "../utils/resolveWalletIcon";
import toast from "react-hot-toast";
import { Call, Contract, RpcProvider, shortString } from "starknet";
import PHTLCAbi from "../../../lib/abis/atomic/STARKNET_PHTLC.json"
import ETHABbi from "../../../lib/abis/STARKNET_ETH.json"
import { ClaimParams, CommitmentParams, CreatePreHTLCParams, GetCommitsParams, LockParams, RefundParams } from "../phtlc";
import { BigNumberish, ethers } from "ethers";
import { Commit } from "../../../Models/PHTLC";
import { toHex } from "viem";
import formatAmount from "../../formatAmount";
import { useSettingsState } from "../../../context/settings";
import { useConnect, useDisconnect } from "@starknet-react/core";
import { InternalConnector, Wallet, WalletProvider } from "../../../Models/WalletProvider";
import { useConnectModal } from "../../../components/WalletModal";
import { useMemo } from "react";

const starknetNames = [KnownInternalNames.Networks.StarkNetGoerli, KnownInternalNames.Networks.StarkNetMainnet, KnownInternalNames.Networks.StarkNetSepolia]
export default function useStarknet(): WalletProvider {
    const commonSupportedNetworks = [
        KnownInternalNames.Networks.StarkNetMainnet,
        KnownInternalNames.Networks.StarkNetGoerli,
        KnownInternalNames.Networks.StarkNetSepolia
    ]

    const withdrawalSupportedNetworks = [
        ...commonSupportedNetworks
    ]

    const name = 'Starknet'
    const id = 'starknet'
    const { networks } = useSettingsState()

    const { connectors } = useConnect();
    const { disconnectAsync } = useDisconnect()

    const wallets = useWalletStore((state) => state.connectedWallets)
    const addWallet = useWalletStore((state) => state.connectWallet)
    const removeWallet = useWalletStore((state) => state.disconnectWallet)

    const isMainnet = networks?.some(network => network.name === KnownInternalNames.Networks.StarkNetMainnet)
    const network = networks?.find(network => starknetNames.some(name => name === network.name))
    const nodeUrl = network?.node_url

    const starknetWallet = useMemo(() => {
        const wallet = wallets.find(wallet => wallet.providerName === name)

        if (!wallet) return

        return wallet

    }, [wallets])

    const { connect } = useConnectModal()

    const connectWallet = async () => {
        try {
            return await connect(provider)
        }
        catch (e) {
            console.log(e)
        }
    }

    const connectConnector = async ({ connector }) => {
        toast.dismiss('connect-wallet')

        try {
            const starknetConnector = connectors.find(c => c.id === connector.id)

            if (!starknetConnector?.["_wallet"]) {
                const installLink = connectorsConfigs.find(c => c.id === connector.id)
                if (installLink) {
                    window.open(installLink.installLink, "_blank");
                    return
                }
            }

            const result = await starknetConnector?.connect({})

            const walletChain = `0x${result?.chainId?.toString(16)}`
            const wrongChanin = walletChain == '0x534e5f4d41494e' ? !isMainnet : isMainnet

            if (result?.account && wrongChanin) {
                disconnectWallets()
                const errorMessage = `Please switch the network in your wallet to ${isMainnet ? 'Mainnet' : 'Sepolia'} and click connect again`
                toast.error(errorMessage)
                // throw new Error(errorMessage)
            }

            if (result?.account && starknetConnector) {
                const starkent = networks.find(n => n.name === KnownInternalNames.Networks.StarkNetMainnet || n.name === KnownInternalNames.Networks.StarkNetSepolia)
                const WalletAccount = (await import('starknet')).WalletAccount

                const starknetWalletAccount = new WalletAccount({ nodeUrl: starkent?.node_url }, (starknetConnector as any).wallet);

                const wallet: Wallet = {
                    id: connector.name,
                    displayName: `${connector.name} - Starknet`,
                    address: result?.account,
                    addresses: [result?.account],
                    chainId: walletChain,
                    icon: resolveWalletConnectorIcon({ connector: connector.name, address: result?.account }),
                    providerName: name,
                    metadata: {
                        starknetAccount: starknetWalletAccount,
                        // wallet: account
                    },
                    isActive: true,
                    connect: () => connectWallet(),
                    disconnect: () => disconnectWallets(),
                    withdrawalSupportedNetworks,
                    autofillSupportedNetworks: commonSupportedNetworks,
                    asSourceSupportedNetworks: commonSupportedNetworks,
                    networkIcon: networks.find(n => starknetNames.some(name => name === n.name))?.logo
                }

                addWallet(wallet)

                return wallet
            }
        }

        catch (e) {
            console.log(e)
            toast.error(e.message, { id: 'connect-wallet', duration: 30000 })
        }
    }

    const disconnectWallets = async () => {
        try {
            await disconnectAsync()
            removeWallet(name)
        }
        catch (e) {
            console.log(e)
        }
    }

    const availableWalletsForConnect: InternalConnector[] = connectors.map(connector => {
        const name = (!connectorsConfigs.some(c => c.id === connector.id) || connector?.["_wallet"]) ? connector.name : `Install ${connectorsConfigs.find(c => c.id === connector.id)?.name}`

        return {
            name: name,
            id: connector.id,
            icon: typeof connector.icon === 'string' ? connector.icon : (connector.icon.light.startsWith('data:') ? connector.icon.light : `data:image/svg+xml;base64,${btoa(connector.icon.light.replaceAll('currentColor', '#FFFFFF'))}`),
            type: connector?.["_wallet"] ? 'injected' : 'other',
        }
    })

    const LOCK_TIME = 1000 * 60 * 15 // 15 minutes
    const timeLock = Math.floor((Date.now() + LOCK_TIME) / 1000)

    const createPreHTLC = async (params: CreatePreHTLCParams) => {
        const { destinationChain, destinationAsset, sourceAsset, lpAddress, address, tokenContractAddress, amount, decimals, atomicContract: atomicAddress } = params
        if (!starknetWallet?.metadata?.starknetAccount) {
            throw new Error('Wallet not connected')
        }
        if (!tokenContractAddress) {
            throw new Error('No token contract address')
        }

        try {
            const parsedAmount = ethers.utils.parseUnits(amount.toString(), decimals).toNumber().toString()

            const erc20Contract = new Contract(
                ETHABbi,
                tokenContractAddress,
                starknetWallet.metadata?.starknetAccount,
            )
            const increaseAllowanceCall: Call = erc20Contract.populate("increaseAllowance", [atomicAddress, parsedAmount])

            function generateBytes32Hex() {
                const bytes = new Uint8Array(32); // 32 bytes = 64 hex characters
                crypto.getRandomValues(bytes);
                return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
            }

            const id = BigInt(`0x${generateBytes32Hex()}`)

            const args = [
                parsedAmount,
                destinationChain,
                destinationAsset,
                address,
                sourceAsset.symbol,
                id,
                lpAddress,
                timeLock,
                tokenContractAddress,
            ]

            const atomicContract = new Contract(
                PHTLCAbi,
                atomicAddress,
                starknetWallet.metadata?.starknetAccount,
            )

            const committmentCall: Call = atomicContract.populate("commit", args)

            const trx = (await starknetWallet?.metadata?.starknetAccount?.execute([increaseAllowanceCall, committmentCall]))

            await starknetWallet.metadata.starknetAccount.waitForTransaction(
                trx.transaction_hash
            );

            const res = toHex(id as bigint, { size: 32 })
            return { hash: trx.transaction_hash as `0x${string}`, commitId: res as `0x${string}` }
        }
        catch (e) {
            console.log(e)
            throw new Error(e)
        }

    }

    const refund = async (params: RefundParams) => {
        const { contractAddress: atomicAddress, id } = params

        if (!starknetWallet?.metadata?.starknetAccount) {
            throw new Error('Wallet not connected')
        }

        const atomicContract = new Contract(
            PHTLCAbi,
            atomicAddress,
            starknetWallet.metadata?.starknetAccount,
        )

        const refundCall: Call = atomicContract.populate('refund', [id])
        const trx = (await starknetWallet?.metadata?.starknetAccount?.execute(refundCall))

        if (!trx) {
            throw new Error("No result")
        }
        return trx.transaction_hash
    }

    const claim = async (params: ClaimParams) => {
        const { contractAddress: atomicAddress, id, secret } = params

        if (!starknetWallet?.metadata?.starknetAccount) {
            throw new Error('Wallet not connected')
        }

        const atomicContract = new Contract(
            PHTLCAbi,
            atomicAddress,
            starknetWallet.metadata?.starknetAccount,
        )

        const claimCall: Call = atomicContract.populate('redeem', [id, secret])
        const trx = (await starknetWallet?.metadata?.starknetAccount?.execute(claimCall))

        if (!trx) {
            throw new Error("No result")
        }
    }

    const getDetails = async (params: CommitmentParams): Promise<Commit> => {
        const { id, contractAddress, chainId } = params

        const atomicContract = new Contract(
            PHTLCAbi,
            contractAddress,
            new RpcProvider({
                nodeUrl: nodeUrl,
            })
        )

        const result = await atomicContract.functions.getHTLCDetails(id)

        if (!result) {
            throw new Error("No result")
        }
        const networkToken = networks.find(network => chainId && Number(network.chain_id) == Number(chainId))?.tokens.find(token => token.symbol === shortString.decodeShortString(ethers.utils.hexlify(result.srcAsset as BigNumberish)))

        const parsedResult = {
            sender: ethers.utils.hexlify(result.sender as BigNumberish),
            srcReceiver: ethers.utils.hexlify(result.srcReceiver as BigNumberish),
            timelock: Number(result.timelock),
            id: result.lockId && toHex(result.id, { size: 32 }),
            amount: formatAmount(Number(result.amount), networkToken?.decimals),
            hashlock: result.hashlock && toHex(result.hashlock, { size: 32 }),
            secret: result.secret || null,
            claimed: result.claimed
        }

        return parsedResult
    }

    const addLock = async (params: CommitmentParams & LockParams) => {
        const { id, hashlock, contractAddress } = params

        if (!starknetWallet?.metadata?.starknetAccount) {
            throw new Error('Wallet not connected')
        }
        const args = [
            id,
            hashlock,
            timeLock
        ]
        const atomicContract = new Contract(
            PHTLCAbi,
            contractAddress,
            starknetWallet.metadata?.starknetAccount,
        )

        const committmentCall: Call = atomicContract.populate("addLock", args)

        const trx = (await starknetWallet?.metadata?.starknetAccount?.execute(committmentCall))
        return { hash: trx.transaction_hash as `0x${string}`, result: trx.transaction_hash as `0x${string}` }
    }


    const getContracts = async (params: GetCommitsParams) => {
        const { contractAddress } = params

        const atomicContract = new Contract(
            PHTLCAbi,
            contractAddress,
            new RpcProvider({
                nodeUrl: nodeUrl,
            })
        )

        if (!starknetWallet?.address) {
            throw new Error('No connected wallet')
        }

        const result = await atomicContract.functions.getCommits(starknetWallet?.address)

        if (!result) {
            throw new Error("No result")
        }

        return result.reverse().map((commit: any) => toHex(commit, { size: 32 }))
    }

    const provider = {
        connectWallet,
        connectConnector,
        connectedWallets: starknetWallet ? [starknetWallet] : undefined,
        activeWallet: starknetWallet,
        withdrawalSupportedNetworks,
        autofillSupportedNetworks: commonSupportedNetworks,
        asSourceSupportedNetworks: commonSupportedNetworks,
        availableWalletsForConnect,
        name,
        id,

        createPreHTLC,
        claim,
        refund,
        getDetails,
        addLock: addLock,
        getContracts
    }

    return provider
}


const connectorsConfigs = [
    {
        id: "braavos",
        name: "Braavos",
        installLink: "https://chromewebstore.google.com/detail/braavos-starknet-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma"
    },
    {
        id: "argentX",
        name: 'Argent X',
        installLink: "https://chromewebstore.google.com/detail/argent-x-starknet-wallet/dlcobpjiigpikoobohmabehhmhfoodbb"
    },
    {
        id: "keplr",
        name: 'Keplr',
        installLink: "https://chromewebstore.google.com/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap"
    }
]
