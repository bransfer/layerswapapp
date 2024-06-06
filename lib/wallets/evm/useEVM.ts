import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAccount, useDisconnect } from "wagmi"
import { NetworkType } from "../../../Models/Network"
import { useSettingsState } from "../../../context/settings"
import { WalletProvider } from "../../../hooks/useWallet"
import KnownInternalNames from "../../knownIds"
import resolveWalletConnectorIcon from "../utils/resolveWalletIcon"
import { evmConnectorNameResolver } from "./KnownEVMConnectors"
import { useEffect, useState } from "react"

export default function useEVM(): WalletProvider {
    const { networks } = useSettingsState()
    const [shouldConnect, setShouldConnect] = useState(false)
    const { disconnectAsync } = useDisconnect()

    useEffect(() => {
        if (shouldConnect) {
            connectWallet()
            setShouldConnect(false)
        }
    }, [shouldConnect])

    const withdrawalSupportedNetworks = [
        ...networks.filter(layer => layer.type === NetworkType.EVM && layer.name !== KnownInternalNames.Networks.RoninMainnet).map(l => l.name),
        KnownInternalNames.Networks.ZksyncMainnet,
        KnownInternalNames.Networks.LoopringGoerli,
        KnownInternalNames.Networks.LoopringMainnet
    ]

    const autofillSupportedNetworks = [
        ...withdrawalSupportedNetworks,
        KnownInternalNames.Networks.ImmutableXMainnet,
        KnownInternalNames.Networks.ImmutableXGoerli,
        KnownInternalNames.Networks.BrineMainnet,
        KnownInternalNames.Networks.LoopringGoerli,
        KnownInternalNames.Networks.LoopringMainnet
    ]
    const name = 'evm'
    
    const account = useAccount()

    const { openConnectModal } = useConnectModal()
    const getWallet = () => {
        if (account && account.address && account.connector) {
            return {
                address: account.address,
                connector: (account.connector as any)?._wallets?.[0]?.id || account.connector.id,
                providerName: name,
                icon: resolveWalletConnectorIcon({ connector: evmConnectorNameResolver(account.connector), address: account.address })
            }
        }
    }

    const connectWallet = async () => {
        if (account && account.address && account.connector) {
            await reconnectWallet()
        }
        else {
            return openConnectModal && openConnectModal()
        }
    }

    const disconnectWallet = async () => {
        try {
            await disconnectAsync()
        }
        catch (e) {
            console.log(e)
        }
    }

    const reconnectWallet = async () => {
        try {
            await disconnectAsync()
            setShouldConnect(true)
        }
        catch (e) {
            console.log(e)
        }
    }

    return {
        getConnectedWallet: getWallet,
        connectWallet,
        disconnectWallet,
        reconnectWallet,
        autofillSupportedNetworks,
        withdrawalSupportedNetworks,
        name
    }
}