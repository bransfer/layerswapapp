import KnownInternalNames from "../../knownIds"
import { useWallet } from "@solana/wallet-adapter-react"
import { resolveWalletConnectorIcon } from "../utils/resolveWalletIcon"
import { Network } from "../../../Models/Network"
import { InternalConnector, Wallet, WalletProvider } from "../../../Models/WalletProvider"
import { useMemo } from "react"
import { useConnectModal } from "../../../components/WalletModal"
import { useSettingsState } from "../../../context/settings"

const solanaNames = [KnownInternalNames.Networks.SolanaMainnet, KnownInternalNames.Networks.SolanaDevnet, KnownInternalNames.Networks.SolanaTestnet]

export default function useSolana({ network }: { network: Network | undefined }): WalletProvider {

    const commonSupportedNetworks = [
        KnownInternalNames.Networks.SolanaMainnet,
        KnownInternalNames.Networks.SolanaDevnet,
        KnownInternalNames.Networks.EclipseTestnet,
        KnownInternalNames.Networks.EclipseMainnet
    ]

    const name = 'Solana'
    const id = 'solana'
    const { disconnect, wallet: solanaWallet, select, wallets } = useWallet();
    const { networks } = useSettingsState()

    const connectedWallet = wallets.find(w => w.adapter.connected === true)
    const connectedAddress = connectedWallet?.adapter.publicKey?.toBase58()
    const connectedAdapterName = connectedWallet?.adapter.name

    const connectedWallets = useMemo(() => {

        if (network?.name.toLowerCase().startsWith('eclipse') && !(connectedAdapterName?.toLowerCase() === "backpack" || connectedAdapterName?.toLowerCase() === "nightly")) {
            return undefined
        }

        const wallet: Wallet | undefined = (connectedAddress && connectedAdapterName) ? {
            id: connectedAdapterName,
            address: connectedAddress,
            displayName: `${connectedWallet?.adapter.name} - Solana`,
            providerName: name,
            icon: resolveWalletConnectorIcon({ connector: String(connectedAdapterName), address: connectedAddress, iconUrl: connectedWallet?.adapter.icon }),
            disconnect,
            connect: () => connectWallet(),
            isActive: true,
            addresses: [connectedAddress],
            withdrawalSupportedNetworks: commonSupportedNetworks,
            asSourceSupportedNetworks: commonSupportedNetworks,
            autofillSupportedNetworks: commonSupportedNetworks,
            networkIcon: networks.find(n => solanaNames.some(name => name === n.name))?.logo
        } : undefined

        if (wallet) {
            return [wallet]
        }

    }, [network, connectedAddress, connectedAdapterName])

    const { connect } = useConnectModal()

    const connectWallet = async () => {
        try {
            return await connect(provider)
        }
        catch (e) {
            console.log(e)
            throw new Error(e)
        }
    }

    const connectConnector = async ({ connector }: { connector: InternalConnector }) => {
        const solanaConnector = wallets.find(w => w.adapter.name === connector.name)
        if (!solanaConnector) throw new Error('Connector not found')
        select(solanaConnector.adapter.name)
        await solanaConnector.adapter.connect()

        const connectedWallet = wallets.find(w => w.adapter.connected === true)
        const connectedAddress = connectedWallet?.adapter.publicKey?.toBase58()
        const wallet: Wallet | undefined = connectedAddress && connectedWallet ? {
            id: connectedWallet.adapter.name,
            address: connectedAddress,
            displayName: `${connectedWallet?.adapter.name} - Solana`,
            providerName: name,
            icon: resolveWalletConnectorIcon({ connector: String(connectedWallet?.adapter.name), address: connectedAddress, iconUrl: connectedWallet?.adapter.icon }),
            disconnect,
            connect: () => connectWallet(),
            isActive: true,
            addresses: [connectedAddress],
            withdrawalSupportedNetworks: commonSupportedNetworks,
            asSourceSupportedNetworks: commonSupportedNetworks,
            autofillSupportedNetworks: commonSupportedNetworks,
            networkIcon: networks.find(n => solanaNames.some(name => name === n.name))?.logo
        } : undefined

        return wallet
    }

    const disconnectWallet = async () => {
        try {
            await disconnect()
        }
        catch (e) {
            console.log(e)
        }
    }

    const availableWalletsForConnect = useMemo(() => {
        const connectors: InternalConnector[] = [];
        const solNetwork = network?.name?.toLowerCase().includes('eclipse') ? 'eclipse' : 'solana'

        for (const wallet of wallets) {

            const internalConnector: InternalConnector = {
                name: wallet.adapter.name,
                id: wallet.adapter.name,
                icon: wallet.adapter.icon,
                type: wallet.readyState === 'Installed' ? 'injected' : 'other'
            }

            if (solNetwork === 'eclipse') {
                if (!(wallet.adapter.name.toLowerCase() === "backpack" || wallet.adapter.name.toLowerCase() === "nightly")) {
                    continue
                } else {
                    connectors.push(internalConnector)
                }
            } else {
                connectors.push(internalConnector)
            }
        }

        return connectors;
    }, [wallets]);

    const provider = {
        connectedWallets: connectedWallets,
        activeWallet: connectedWallets?.[0],
        connectWallet,
        connectConnector,
        disconnectWallets: disconnectWallet,
        availableWalletsForConnect,
        withdrawalSupportedNetworks: commonSupportedNetworks,
        autofillSupportedNetworks: commonSupportedNetworks,
        asSourceSupportedNetworks: commonSupportedNetworks,
        name,
        id,
    }

    return provider
}