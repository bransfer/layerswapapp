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
import { Commit } from "../../../Models/PHTLC"
import { CreatePreHTLCParams, ClaimParams, RefundParams, CommitmentParams, LockParams } from "../phtlc"

type Props = {
    network: Network | undefined,
}

export default function useParadex({ network }: Props): WalletProvider {
    const name = 'paradex'
    const id = 'prdx'
    const selectedProvider = useWalletStore((state) => state.selectedProveder)
    const selectProvider = useWalletStore((state) => state.selectProvider)

    const withdrawalSupportedNetworks = [
        KnownInternalNames.Networks.ParadexMainnet,
        KnownInternalNames.Networks.ParadexTestnet,
    ]

    const { connect, setSelectedProvider } = useConnectModal()
    const evmProvider = useEVM({ network })
    const starknetProvider = useStarknet()

    const connectWallet = async () => {
        try {
            return await connect(provider as unknown as WalletProvider)
        }
        catch (e) {
            console.log(e)
        }
    }

    const connectConnector = async ({ connector }: { connector: InternalConnector & LSConnector }) => {

        try {
            setSelectedProvider({
                ...provider, connector: { name: connector.name },
                createPreHTLC: function (args: CreatePreHTLCParams): Promise<{ hash: string; commitId: string } | null | undefined> {
                    throw new Error("Function not implemented.")
                },
                claim: function (args: ClaimParams): Promise<void> | undefined | void {
                    throw new Error("Function not implemented.")
                },
                refund: function (args: RefundParams): Promise<any> | undefined | void {
                    throw new Error("Function not implemented.")
                },
                getDetails: function (args: CommitmentParams): Promise<Commit | null> {
                    throw new Error("Function not implemented.")
                },
                addLock: function (args: CommitmentParams & LockParams): Promise<{ hash: string; result: any } | null> {
                    throw new Error("Function not implemented.")
                }
            })
            const isEvm = evmProvider.availableWalletsForConnect?.find(w => w.id === connector.id)
            const isStarknet = starknetProvider.availableWalletsForConnect?.find(w => w.id === connector.id)
            if (isEvm) {
                const result = evmProvider.connectConnector && await evmProvider.connectConnector({ connector })
                if (!result) return
                selectProvider(evmProvider.name)
                return { ...result, providerName: name }
            }
            else if (isStarknet) {
                const result = starknetProvider.connectConnector && await starknetProvider.connectConnector({ connector })
                if (!result) return
                selectProvider(starknetProvider.name)
                return { ...result, providerName: name }
            }

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

    const connectedWallets = useMemo(() => {
        return [...(evmProvider.connectedWallets ? evmProvider.connectedWallets.map(w => ({ ...w, providerName: name })) : []), ...(starknetProvider?.connectedWallets ? starknetProvider.connectedWallets.map(w => ({ ...w, providerName: name })) : [])]
    }, [evmProvider, starknetProvider])

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

    return provider as WalletProvider
}

