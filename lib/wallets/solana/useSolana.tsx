import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { WalletProvider } from "../../../hooks/useWallet"
import KnownInternalNames from "../../knownIds"
import { useWallet } from "@solana/wallet-adapter-react"
import resolveWalletConnectorIcon from "../utils/resolveWalletIcon"
import { useSettingsState } from "../../../context/settings"

export default function useSolana(): WalletProvider {
    const withdrawalSupportedNetworks = [KnownInternalNames.Networks.SolanaMainnet, KnownInternalNames.Networks.SolanaDevnet]
    const { networks } = useSettingsState()

    const name = 'solana'
    const { publicKey, disconnect, wallet } = useWallet();
    const { setVisible } = useWalletModal();

    const network = networks.find(network => network.type === KnownInternalNames.Networks.SolanaMainnet)

    const getWallet = () => {
        if (publicKey) {
            return {
                address: publicKey?.toBase58(),
                connector: wallet?.adapter?.name,
                providerName: name,
                icon: resolveWalletConnectorIcon({ connector: String(wallet?.adapter.name), address: publicKey?.toBase58() }),
                chainId: network?.chain_id || 0
            }
        }
    }

    const connectWallet = () => {
        return setVisible && setVisible(true)
    }

    const disconnectWallet = async () => {
        try {
            await disconnect()
        }
        catch (e) {
            console.log(e)
        }
    }

    const reconnectWallet = async () => {
        await disconnectWallet()
        connectWallet()
    }

    return {
        getConnectedWallet: getWallet,
        connectWallet,
        disconnectWallet,
        reconnectWallet,
        withdrawalSupportedNetworks,
        autofillSupportedNetworks: withdrawalSupportedNetworks,
        asSourceSupportedNetworks: withdrawalSupportedNetworks,
        name
    }
}