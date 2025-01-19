import { useWalletStore } from "../../../stores/walletStore"
import ImtblClient from "../../imtbl"
import KnownInternalNames from "../../knownIds"
import IMX from "../../../components/icons/Wallets/IMX"
import { Wallet, WalletProvider } from "../../../Models/WalletProvider"
import { useSettingsState } from "../../../context/settings"

export default function useImtblX() {
    const withdrawalSupportedNetworks = [
        KnownInternalNames.Networks.ImmutableXMainnet,
        KnownInternalNames.Networks.ImmutableXGoerli,
        KnownInternalNames.Networks.ImmutableXSepolia,
    ]

    const { networks } = useSettingsState()

    const name = 'ImmutableX'
    const id = 'imx'
    const wallets = useWalletStore((state) => state.connectedWallets)
    const addWallet = useWalletStore((state) => state.connectWallet)
    const removeWallet = useWalletStore((state) => state.disconnectWallet)
    const wallet = wallets.find(wallet => wallet.providerName === id)

    const getWallet = () => {
        if (wallet) {
            return [wallet]
        }
        return undefined
    }

    const connectWallet = async () => {
        const isMainnet = networks?.some(network => network.name === KnownInternalNames.Networks.ImmutableXMainnet)
        const chain = (isMainnet ? KnownInternalNames.Networks.ImmutableXMainnet : KnownInternalNames.Networks.ImmutableXGoerli)

        if (!chain) throw new Error('No chain id for imx connect wallet')
        const networkName = chain == 'testnet' ? KnownInternalNames.Networks.ImmutableXGoerli : KnownInternalNames.Networks.ImmutableXMainnet

        try {
            const imtblClient = new ImtblClient(networkName)
            const res = await imtblClient.ConnectWallet();

            const wallet: Wallet = {
                id: 'immutablex',
                displayName: name,
                address: res.address,
                providerName: id,
                icon: IMX,
                disconnect: () => disconnectWallet(),
                isActive: true,
                addresses: [res.address],
                withdrawalSupportedNetworks,
                asSourceSupportedNetworks: withdrawalSupportedNetworks,
            }

            addWallet(wallet);
            return wallet
        }
        catch (e) {
            console.log(e)
        }
    }

    const disconnectWallet = () => {
        return removeWallet(id)
    }

    return {
        switchAccount: async () => { },
        connectedWallets: getWallet(),
        activeWallet: wallet,
        connectWallet,
        withdrawalSupportedNetworks,
        asSourceSupportedNetworks: withdrawalSupportedNetworks,
        name,
        id,
    }
}