import { useAccount, useConfig, useConnect, useConnectors, useDisconnect, useSwitchAccount, Connector } from "wagmi"
import { Network, NetworkType, NetworkWithTokens } from "../../../Models/Network"
import { useSettingsState } from "../../../context/settings"
import KnownInternalNames from "../../knownIds"
import { resolveWalletConnectorIcon, resolveWalletConnectorIndex } from "../utils/resolveWalletIcon"
import { evmConnectorNameResolver } from "./KnownEVMConnectors"
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
import { useMemo } from "react"
import { getAccount, getConnections } from '@wagmi/core'
import toast from "react-hot-toast"
import { isMobile } from "../../isMobile"
import convertSvgComponentToBase64 from "../../../components/utils/convertSvgComponentToBase64"
import { LSConnector } from "../connectors/EthereumProvider"
import { InternalConnector, Wallet, WalletProvider } from "../../../Models/WalletProvider"
import { useConnectModal } from "../../../components/WalletModal"
import { explicitInjectedproviderDetected } from "../connectors/getInjectedConnector"
import { type ConnectorAlreadyConnectedError } from '@wagmi/core'
import { useSwapDataState } from "../../../context/swap"

type Props = {
    network: Network | undefined,
}
const ethereumNames = [KnownInternalNames.Networks.EthereumMainnet, KnownInternalNames.Networks.EthereumSepolia]
const immutableZKEvm = [KnownInternalNames.Networks.ImmutableZkEVMMainnet, KnownInternalNames.Networks.ImmutableZkEVMTestnet]

export default function useEVM({ network }: Props): WalletProvider {
    const name = 'EVM'
    const id = 'evm'
    const { networks } = useSettingsState()
    const config = useConfig()
    const { selectedSourceAccount } = useSwapDataState()
    const account = selectedSourceAccount
    const asSourceSupportedNetworks = [
        ...networks.filter(network => network.type === NetworkType.EVM).map(l => l.name),
        KnownInternalNames.Networks.ZksyncMainnet,
        KnownInternalNames.Networks.LoopringGoerli,
        KnownInternalNames.Networks.LoopringMainnet,
        KnownInternalNames.Networks.LoopringSepolia
    ]

    const withdrawalSupportedNetworks = [
        ...asSourceSupportedNetworks,
    ]

    const autofillSupportedNetworks = [
        ...asSourceSupportedNetworks,
        KnownInternalNames.Networks.ImmutableXMainnet,
        KnownInternalNames.Networks.ImmutableXGoerli,
        KnownInternalNames.Networks.BrineMainnet,
    ]

    const { disconnectAsync } = useDisconnect()
    const { connectors: activeConnectors, switchAccountAsync } = useSwitchAccount()
    const activeAccount = useAccount()
    const allConnectors = useConnectors()
    const { connectAsync } = useConnect();

    const { connect, setSelectedProvider } = useConnectModal()

    const connectWallet = async () => {
        try {
            return await connect(provider)
        }
        catch (e) {
            console.log(e)
        }
    }

    const disconnectWallet = async (connectorName: string) => {

        try {
            const connector = activeConnectors.find(w => w.name.toLowerCase() === connectorName.toLowerCase())
            await disconnectAsync({
                connector: connector
            })
        }
        catch (e) {
            console.log(e)
        }
    }

    const disconnectWallets = () => {
        try {
            activeConnectors.forEach(async (connector) => {
                disconnectWallet(connector.name)
            })
        }
        catch (e) {
            console.log(e)
        }
    }

    const connectConnector = async ({ connector }: { connector: InternalConnector & LSConnector }) => {
        try {

            setSelectedProvider({ ...provider, connector: { name: connector.name } })
            if (connector.id !== "coinbaseWalletSDK") {
                await connector.disconnect()
                await disconnectAsync({ connector })
            }

            if (isMobile()) {
                if (connector.id !== "walletConnect") {
                    getWalletConnectUri(connector, connector?.resolveURI, (uri: string) => {
                        window.location.href = uri;
                    })
                }
            }
            else {
                getWalletConnectUri(connector, connector?.resolveURI, (uri: string) => {
                    const Icon = resolveWalletConnectorIcon({ connector: evmConnectorNameResolver(connector) })
                    const base64Icon = convertSvgComponentToBase64(Icon)

                    setSelectedProvider({ ...provider, connector: { name: connector.name, qr: uri, iconUrl: base64Icon } })
                })
            }

            await connectAsync({
                connector: connector,
            });

            const activeAccount = getAccount(config)
            const connections = getConnections(config)
            const connection = connections.find(c => c.connector.id === activeAccount.connector?.id)

            const wallet = ResolveWallet({
                activeConnection: (activeAccount.connector && activeAccount.address) ? {
                    id: activeAccount.connector.id,
                    address: activeAccount.address
                } : undefined,
                connection,
                discconnect: disconnectWallet,
                networks,
                network,
                supportedNetworks: {
                    asSource: asSourceSupportedNetworks,
                    autofill: autofillSupportedNetworks,
                    withdrawal: withdrawalSupportedNetworks
                },
                providerName: name
            })

            return wallet

        } catch (e) {
            //TODO: handle error like in transfer
            const error = e as ConnectorAlreadyConnectedError
            if (error.name == 'ConnectorAlreadyConnectedError') {
                toast.error('Wallet is already connected.')
            }
            else {
                toast.error('Error connecting wallet')
            }
            throw new Error(e)
        }
    }

    const resolvedConnectors: Wallet[] = useMemo(() => {
        const connections = getConnections(config)
        return activeConnectors.map((w): Wallet | undefined => {

            const connection = connections.find(c => c.connector.id === w.id)

            const wallet = ResolveWallet({
                activeConnection: (activeAccount.connector && activeAccount.address) ? {
                    id: activeAccount.connector.id,
                    address: activeAccount.address
                } : undefined,
                connection,
                discconnect: disconnectWallet,
                networks,
                network,
                supportedNetworks: {
                    asSource: asSourceSupportedNetworks,
                    autofill: autofillSupportedNetworks,
                    withdrawal: withdrawalSupportedNetworks
                },
                providerName: name
            })

            return wallet
        }).filter(w => w !== undefined) as Wallet[]
    }, [activeAccount, activeConnectors, config, network])

    const switchAccount = async (wallet: Wallet, address: string) => {
        const connector = getConnections(config).find(c => c.connector.name === wallet.id)?.connector
        if (!connector)
            throw new Error("Connector not found")
        const { accounts } = await switchAccountAsync({ connector })
        const account = accounts.find(a => a.toLowerCase() === address.toLowerCase())
        if (!account)
            throw new Error("Account not found")
    }

    const createPreHTLC = async (params: CreatePreHTLCParams) => {
        const { destinationChain, destinationAsset, sourceAsset, lpAddress, address, amount, decimals, atomicContract, chainId } = params

        const LOCK_TIME = 1000 * 60 * 16 // 16 minutes
        const timeLockMS = Date.now() + LOCK_TIME
        const timeLock = Math.floor(timeLockMS / 1000)

        if (!account?.address) {
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

        function generateBytes32Hex() {
            const bytes = new Uint8Array(32); // 32 bytes = 64 hex characters
            crypto.getRandomValues(bytes);
            return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        const id = `0x${generateBytes32Hex()}`;

        let simulationData: any = {
            account: account.address as `0x${string}`,
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
                id,
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
                account: account.address as `0x${string}`,
                abi: IMTBLZKERC20,
                address: sourceAsset.contract as `0x${string}`,
                functionName: 'allowance',
                args: [account.address, atomicContract],
                chainId: Number(chainId),
            })

            if (Number(allowance) < parsedAmount) {
                const res = await writeContract(config, {
                    account: account.address as `0x${string}`,
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

        const { request } = await simulateContract(config, simulationData)

        const hash = await writeContract(config, request)
        return { hash, commitId: id }
    }

    const getDetails = async (params: CommitmentParams): Promise<Commit> => {
        const { chainId, id, contractAddress, type } = params
        const abi = type === 'erc20' ? ERC20PHTLCAbi : PHTLCAbi

        const result: any = await readContract(config, {
            abi: abi,
            address: contractAddress,
            functionName: 'getHTLCDetails',
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
                functionName: 'getHTLCDetails',
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

        const LOCK_TIME = 1000 * 60 * 16 // 16 minutes
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

        if (!account?.address) throw new Error("Wallet not connected")

        const signature = await signTypedData(config, {
            account: account.address as `0x${string}`,
            domain, types, message,
            primaryType: "addLockMsg"
        });

        const sig = ethers.utils.splitSignature(signature)

        try {
            account?.address && await apiClient.AddLockSig({
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

        if (!account?.address) throw new Error("Wallet not connected")

        const { request } = await simulateContract(config, {
            account: account.address as `0x${string}`,
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

        if (!account?.address) throw new Error("Wallet not connected")

        const { request } = await simulateContract(config, {
            account: account.address as `0x${string}`,
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

        if (!account?.address) {
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

    const activeBrowserWallet = explicitInjectedproviderDetected() && allConnectors.filter(c => c.id !== "com.immutable.passport" && c.type === "injected").length === 1
    const filterConnectors = wallet => !isNotAvailable(wallet, network) && ((wallet.id === "injected" ? activeBrowserWallet : true))

    {/* //TODO: refactor ordering */ }
    const availableWalletsForConnect = allConnectors.filter(filterConnectors)
        .map(w => ({
            ...w,
            order: resolveWalletConnectorIndex(w.id),
            type: (!network?.name.toLowerCase().includes("immutable") && w.id === "com.immutable.passport") ? "other" : w.type
        }))

    const provider = {
        connectWallet,
        connectConnector,
        disconnectWallets,
        switchAccount,
        connectedWallets: resolvedConnectors,
        activeWallet: resolvedConnectors.find(w => w.isActive),
        autofillSupportedNetworks,
        withdrawalSupportedNetworks,
        asSourceSupportedNetworks,
        availableWalletsForConnect: availableWalletsForConnect as any,
        name,
        id,
        createPreHTLC,
        claim,
        refund,
        addLock,
        getDetails,
        secureGetDetails,
        getContracts
    }

    return provider
}


const getWalletConnectUri = async (
    connector: Connector,
    uriConverter: (uri: string) => string = (uri) => uri,
    useCallback: (uri: string) => void,
): Promise<void> => {
    const provider = await connector.getProvider();
    if (connector.id === 'coinbase') {
        // @ts-expect-error
        return provider.qrUrl;
    }
    return new Promise<void>((resolve) => {
        return provider?.['once'] && provider['once']('display_uri', (uri) => {
            resolve(useCallback(uriConverter(uri)));
        })
    }
    );
};

const isNotAvailable = (connector: Connector | undefined, network: Network | undefined) => {
    if (!network) return false
    if (!connector) return true
    return resolveSupportedNetworks([network.name], connector.id).length === 0
}

type ResolveWalletProps = {
    connection: {
        accounts: readonly [`0x${string}`, ...`0x${string}`[]];
        chainId: number;
        connector: Connector;
    } | undefined,
    networks: NetworkWithTokens[],
    network: Network | undefined,
    activeConnection: {
        id: string,
        address: string
    } | undefined,
    discconnect: (connectorName: string | undefined) => Promise<void>,
    supportedNetworks: {
        asSource: string[],
        autofill: string[],
        withdrawal: string[]
    },
    providerName: string
}

const ResolveWallet = (props: ResolveWalletProps): Wallet | undefined => {
    const { activeConnection, connection, networks, discconnect, network, supportedNetworks, providerName } = props
    const accountIsActive = activeConnection?.id === connection?.connector.id

    const addresses = connection?.accounts as (string[] | undefined);
    const activeAddress = activeConnection?.address
    const connector = connection?.connector
    if (!connector)
        return undefined

    const address = accountIsActive ? activeAddress : addresses?.[0]
    if (!address) return undefined

    const walletname = `${connector?.name} ${connector.id === "com.immutable.passport" ? "" : " - EVM"}`

    const wallet = {
        id: connector.name,
        isActive: accountIsActive,
        address,
        addresses: addresses || [address],
        displayName: walletname,
        providerName,
        chainId: connection?.chainId,
        icon: resolveWalletConnectorIcon({ connector: evmConnectorNameResolver(connector), address, iconUrl: connector.icon }),
        disconnect: () => discconnect(connector.name),
        isNotAvailable: isNotAvailable(connector, network),
        asSourceSupportedNetworks: resolveSupportedNetworks(supportedNetworks.asSource, connector.id),
        autofillSupportedNetworks: resolveSupportedNetworks(supportedNetworks.autofill, connector.id),
        withdrawalSupportedNetworks: resolveSupportedNetworks(supportedNetworks.withdrawal, connector.id),
        networkIcon: networks.find(n => connector?.id === "com.immutable.passport" ? immutableZKEvm.some(name => name === n.name) : ethereumNames.some(name => name === n.name))?.logo
    }

    return wallet
}

const resolveSupportedNetworks = (supportedNetworks: string[], connectorId: string) => {

    const specificNetworksConnectors = [
        {
            id: "com.immutable.passport",
            supportedNetworks: [
                KnownInternalNames.Networks.ImmutableXMainnet,
                KnownInternalNames.Networks.ImmutableXGoerli,
                KnownInternalNames.Networks.ImmutableXSepolia,
                KnownInternalNames.Networks.ImmutableZkEVMMainnet,
                KnownInternalNames.Networks.ImmutableZkEVMTestnet,
            ]
        },
        {
            id: "com.roninchain.wallet",
            supportedNetworks: [
                KnownInternalNames.Networks.RoninMainnet,
                KnownInternalNames.Networks.EthereumMainnet,
                KnownInternalNames.Networks.PolygonMainnet,
                KnownInternalNames.Networks.BNBChainMainnet,
                KnownInternalNames.Networks.ArbitrumMainnet
            ]
        }
    ]

    const specificNetworks = specificNetworksConnectors.find(c => c.id === connectorId)

    if (specificNetworks) {
        const values = specificNetworks.supportedNetworks.filter(n => supportedNetworks.some(name => name === n))
        return values
    }

    return supportedNetworks

}
