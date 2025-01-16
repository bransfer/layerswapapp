import { Network } from "../../../Models/Network"
import KnownInternalNames from "../../knownIds"
import { useMemo } from "react"
import toast from "react-hot-toast"
import { LSConnector } from "../connectors/EthereumProvider"
import { InternalConnector, Wallet, WalletProvider } from "../../../Models/WalletProvider"
import { useConnectModal } from "../../../components/WalletModal"
import { type ConnectorAlreadyConnectedError } from '@wagmi/core'
import useEVM from "../evm/useEVM"
import useStarknet from "../starknet/useStarknet"
import { useWalletStore } from "../../../stores/walletStore"
import { AuthorizeStarknet } from "./Authorize/Starknet"
import { walletClientToSigner } from "../../ethersToViem/ethers"
import AuhorizeEthereum from "./Authorize/Ethereum"
import { getWalletClient } from '@wagmi/core'
import { useConfig } from "wagmi"
import { usePersistedState } from "../../../hooks/usePersistedState"
import { LOCAL_STORAGE_KEY } from "./lib/constants"
import { useSettingsState } from "../../../context/settings"

type Props = {
    network: Network | undefined,
}

export default function useParadex({ network }: Props): WalletProvider {
    const name = 'paradex'
    const id = 'prdx'
    const { networks } = useSettingsState()
    const selectedProvider = useWalletStore((state) => state.selectedProveder)
    const selectProvider = useWalletStore((state) => state.selectProvider)
    const [paradexAddresses, updateParadexAddresses] = usePersistedState<{ [key: string]: string }>({}, LOCAL_STORAGE_KEY);

    const withdrawalSupportedNetworks = [
        KnownInternalNames.Networks.ParadexMainnet,
        KnownInternalNames.Networks.ParadexTestnet,
    ]

    const { connect, setSelectedProvider } = useConnectModal()
    const evmProvider = useEVM({ network })
    const starknetProvider = useStarknet()

    const connectWallet = async () => {
        try {
            return await connect(provider)
        }
        catch (e) {
            console.log(e)
        }
    }
    const config = useConfig()

    const connectConnector = async ({ connector }: { connector: InternalConnector & LSConnector }) => {

        try {
            setSelectedProvider({ ...provider, connector: { name: connector.name } })
            const isEvm = evmProvider.availableWalletsForConnect?.find(w => w.id === connector.id)
            const isStarknet = starknetProvider.availableWalletsForConnect?.find(w => w.id === connector.id)
            if (isEvm) {
                const connectionResult = evmProvider.connectConnector && await evmProvider.connectConnector({ connector })
                if (!connectionResult) return
                selectProvider(evmProvider.name)
                if (!paradexAddresses[connectionResult.address.toLowerCase()]) {
                    const l1Network = networks.find(n => n.name === KnownInternalNames.Networks.EthereumMainnet || n.name === KnownInternalNames.Networks.EthereumSepolia);
                    const l1ChainId = Number(l1Network?.chain_id)
                    if (!Number(l1ChainId)) {
                        throw Error("Could not find ethereum network")
                    }
                    const client = await getWalletClient(config, {
                        chainId: l1ChainId,
                    })
                    const ethersSigner = walletClientToSigner(client)
                    if (!ethersSigner) {
                        throw Error("Could not initialize ethers signer")
                    }
                    const paradexAccount = await AuhorizeEthereum(ethersSigner)
                    updateParadexAddresses({ ...paradexAddresses, [connectionResult.address.toLowerCase()]: paradexAccount.address })
                }
                const wallet: Wallet = { ...connectionResult, providerName: name }
                return wallet
            }
            else if (isStarknet) {
                const connectionResult = starknetProvider.connectConnector && await starknetProvider.connectConnector({ connector })
                if (!connectionResult) return
                selectProvider(starknetProvider.name)
                if (!paradexAddresses[connectionResult.address.toLowerCase()]) {
                    const snAccount = connectionResult.metadata?.starknetAccount
                    if (!snAccount) {
                        throw Error("Starknet account not found")
                    }
                    const paradexAccount = await AuthorizeStarknet(snAccount)
                    updateParadexAddresses({ ...paradexAddresses, [connectionResult.address.toLowerCase()]: paradexAccount.address })
                }
                const wallet: Wallet = { ...connectionResult, providerName: name }
                return wallet
            }
        } catch (e) {
            //TODO: handle error like in transfer
            const error = e as ConnectorAlreadyConnectedError
            if (error.name == 'ConnectorAlreadyConnectedError') {
                toast.error('Wallet is already connected.')
            }
            else {
                toast.error(e.message)
            }
            throw new Error(e)
        }
    }

    const paradexL1Addresses = useMemo(() => Object.keys(paradexAddresses), [paradexAddresses])
    const connectedWallets = useMemo(() => {
        return [
            ...(evmProvider.connectedWallets ?
                evmProvider.connectedWallets.filter(w => w.addresses.some(wa => paradexL1Addresses.some(pa => pa.toLowerCase() === wa.toLowerCase()))).map(w => ({ ...w, providerName: name })) : []),
            ...(starknetProvider?.connectedWallets ?
                starknetProvider.connectedWallets.filter(w => w.addresses.some(wa => paradexL1Addresses.some(pa => pa.toLowerCase() === wa.toLowerCase()))).map(w => ({ ...w, providerName: name })) : [])]
    }, [evmProvider, starknetProvider, paradexL1Addresses])

    const availableWalletsForConnect = useMemo(() => {
        return [...(evmProvider.availableWalletsForConnect ? evmProvider.availableWalletsForConnect : []), ...(starknetProvider?.availableWalletsForConnect ? starknetProvider.availableWalletsForConnect : [])]
    }, [evmProvider, starknetProvider])

    const switchAccount = async (wallet: Wallet, address: string) => {
        if (evmProvider.connectedWallets?.some(w => w.address.toLowerCase() === address.toLowerCase()) && evmProvider.switchAccount) {
            evmProvider.switchAccount(wallet, address)
            selectProvider(evmProvider.name)
        }
        else if (starknetProvider.connectedWallets?.some(w => w.address.toLowerCase() === address.toLowerCase()) && starknetProvider.switchAccount) {
            starknetProvider.switchAccount(wallet, address)
            selectProvider(starknetProvider.name)
        }
    }

    const activeWallet = useMemo(() => {
        if (selectedProvider === starknetProvider.name) {
            return starknetProvider?.activeWallet
        }
        else if (selectedProvider === evmProvider.name) {
            return evmProvider?.activeWallet
        }
    }, [evmProvider.activeWallet, starknetProvider.activeWallet, selectedProvider])

    const provider = {
        connectWallet,
        connectConnector,
        switchAccount,
        connectedWallets,
        activeWallet: activeWallet,
        withdrawalSupportedNetworks,
        availableWalletsForConnect: availableWalletsForConnect as any,
        name,
        id,
        isWrapper: true
    }

    return provider
}

