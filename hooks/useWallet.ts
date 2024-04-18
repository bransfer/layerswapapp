import toast from "react-hot-toast"
import LayerSwapApiClient, { SwapItem } from "../lib/layerSwapApiClient"
import { Wallet } from "../stores/walletStore"
import useTON from "../lib/wallets/ton/useTON"
import useEVM from "../lib/wallets/evm/useEVM"
import useStarknet from "../lib/wallets/starknet/useStarknet"
import useImmutableX from "../lib/wallets/immutableX/useIMX"
import useSolana from "../lib/wallets/solana/useSolana"
import { Network } from "../Models/Network"


export type WalletProvider = {
    connectWallet: (chain?: string | number | undefined | null) => Promise<void> | undefined | void,
    disconnectWallet: () => Promise<void> | undefined | void,
    getConnectedWallet: () => Wallet | undefined,
    autofillSupportedNetworks?: string[],
    withdrawalSupportedNetworks: string[],
    name: string,
}

export default function useWallet() {

    const WalletProviders: WalletProvider[] = [
        useTON(),
        useEVM(),
        useStarknet(),
        useImmutableX(),
        useSolana()
    ]

    async function handleConnect(providerName: string, chain?: string | number) {
        const provider = WalletProviders.find(provider => provider.name === providerName)
        try {
            await provider?.connectWallet(chain)
        }
        catch {
            toast.error("Couldn't connect the account")
        }
    }

    const handleDisconnect = async (providerName: string, swap?: SwapItem) => {
        const provider = WalletProviders.find(provider => provider.name === providerName)
        try {
            if (swap?.source_exchange) {
                const apiClient = new LayerSwapApiClient()
                await apiClient.DisconnectExchangeAsync(swap.id, "coinbase")
            }
            else {
                await provider?.disconnectWallet()
            }
        }
        catch {
            toast.error("Couldn't disconnect the account")
        }
    }

    const getConnectedWallets = () => {
        const connectedWallets: Wallet[] = []

        WalletProviders.forEach(provider => {
            const wallet = provider.getConnectedWallet()
            if (wallet) {
                connectedWallets.push(wallet)
            }
        })

        return connectedWallets
    }

    const getWithdrawalProvider = (network: Network) => {
        const provider = WalletProviders.find(provider => provider.withdrawalSupportedNetworks.includes(network.name))
        return provider
    }

    const getAutofillProvider = (network: Network) => {
        const provider = WalletProviders.find(provider => provider?.autofillSupportedNetworks?.includes(network.name))
        return provider
    }

    return {
        wallets: getConnectedWallets(),
        connectWallet: handleConnect,
        disconnectWallet: handleDisconnect,
        getWithdrawalProvider,
        getAutofillProvider,
    }
}