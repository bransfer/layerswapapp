import { Layer } from "../../../Models/Layer"
import { NetworkType } from "../../../Models/CryptoNetwork"
import { useSettingsState } from "../../../context/settings"
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react"
import { Address } from "@ton/core";


export default function useTON() {
    const { layers } = useSettingsState()
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();

    const getWallet = () => {
        if (wallet && wallet.account.address && wallet.provider) {
            return {
                address: Address.parse(wallet.account.address).toString({ bounceable: false }),
                connector: 'TON',
                network: layers.find(l => l.type === NetworkType.TON) as Layer
            }
        }
    }

    const connectWallet = () => {
        return tonConnectUI.openModal()
    }

    const disconnectWallet = async () => {
        try {
            await tonConnectUI.disconnect()
        }
        catch (e) {
            console.log(e)
        }
    }

    return {
        getTONWallet: getWallet,
        connectTON: connectWallet,
        disconnectTON: disconnectWallet
    }
}