import { WalletProvider } from "../../../hooks/useWallet";
import { useWalletStore } from "../../../stores/walletStore"
import KnownInternalNames from "../../knownIds"
import { useCallback } from "react";
import resolveWalletConnectorIcon from "../utils/resolveWalletIcon";
import toast from "react-hot-toast";

export default function useStarknet(): WalletProvider {
    const commonSupportedNetworks = [
        KnownInternalNames.Networks.StarkNetMainnet,
        KnownInternalNames.Networks.StarkNetGoerli,
        KnownInternalNames.Networks.StarkNetSepolia
    ]

    const withdrawalSupportedNetworks = [
        ...commonSupportedNetworks,
        KnownInternalNames.Networks.ParadexMainnet,
        KnownInternalNames.Networks.ParadexTestnet,
    ]

    const name = 'starknet'
    const WALLETCONNECT_PROJECT_ID = '28168903b2d30c75e5f7f2d71902581b';
    const wallets = useWalletStore((state) => state.connectedWallets)

    const addWallet = useWalletStore((state) => state.connectWallet)
    const removeWallet = useWalletStore((state) => state.disconnectWallet)

    const getWallet = () => {
        return wallets.find(wallet => wallet.providerName === name)
    }

    const connectWallet = useCallback(async (chain: string) => {
        const constants = (await import('starknet')).constants
        const chainId = process.env.NEXT_PUBLIC_API_VERSION === "sandbox" ? constants.NetworkName.SN_SEPOLIA : constants.NetworkName.SN_MAIN
        const connect = (await import('starknetkit')).connect
        try {
            const { wallet } = await connect({
                argentMobileOptions: {
                    dappName: 'Layerswap',
                    projectId: WALLETCONNECT_PROJECT_ID,
                    url: 'https://www.layerswap.io/app',
                    description: 'Move crypto across exchanges, blockchains, and wallets.',
                    chainId: chainId as any
                },
                dappName: 'Layerswap',
                modalMode: 'alwaysAsk'
            })
            if (wallet && chain && ((wallet.provider?.chainId && wallet.provider?.chainId != constants.StarknetChainId[chainId]) || (wallet.provider?.provider?.chainId && wallet.provider?.provider?.chainId != constants.StarknetChainId[chainId]))) {
                await disconnectWallet()
                const errorMessage = `Please switch the network in your wallet to ${chainId === constants.NetworkName.SN_SEPOLIA ? 'Sepolia' : 'Mainnet'} and click connect again`
                throw new Error(errorMessage)
            }

            if (wallet && wallet.account && wallet.isConnected) {
                addWallet({
                    address: wallet.account.address,
                    chainId: wallet.provider?.chainId || wallet.provider?.provider?.chainId,
                    icon: resolveWalletConnectorIcon({ connector: wallet.name, address: wallet.account.address }),
                    connector: wallet.name,
                    providerName: name,
                    metadata: {
                        starknetAccount: wallet
                    }
                })
            } else if (wallet?.isConnected === false) {
                await disconnectWallet()
                connectWallet(chain)
            }

        }
        catch (e) {
            console.log(e)
            toast.error(e.message, { duration: 30000 })
        }
    }, [addWallet])

    const disconnectWallet = async () => {
        const disconnect = (await import('starknetkit')).disconnect
        try {
            await disconnect({ clearLastWallet: true })
            removeWallet(name)
        }
        catch (e) {
            console.log(e)
        }
    }

    const reconnectWallet = async (chain: string) => {
        await disconnectWallet()
        await connectWallet(chain)
    }

    return {
        getConnectedWallet: getWallet,
        connectWallet,
        disconnectWallet,
        reconnectWallet,
        withdrawalSupportedNetworks,
        autofillSupportedNetworks: commonSupportedNetworks,
        asSourceSupportedNetworks: commonSupportedNetworks,
        name
    }
}