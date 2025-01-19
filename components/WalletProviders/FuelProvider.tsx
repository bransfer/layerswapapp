
import { CHAIN_IDS, Provider } from '@fuel-ts/account';
import { WagmiProvider, useConfig } from 'wagmi';
import KnownInternalNames from '../../lib/knownIds';
import { useSettingsState } from '../../context/settings';
import { BaskoRequestAPI } from '../../lib/wallets/fuel/Bako';
import { BakoSafeConnector } from '../../lib/fuels/connectors/bako-safe';
// import { WalletConnectConnector } from '../../lib/fuels/connectors/walletConnect';
// import { BakoSafeConnector, FuelWalletConnector, FueletWalletConnector, SolanaConnector, WalletConnectConnector, defaultConnectors } from '@fuels/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FuelProvider } from '@fuels/react';
import { FueletWalletConnector } from '../../lib/fuels/connectors/fuelet-wallet';
import { FuelWalletConnector } from '../../lib/fuels/connectors/fuel-wallet';

export const HOST_URL = 'https://api.bako.global';
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '28168903b2d30c75e5f7f2d71902581b';

const queryClient = new QueryClient()

const FuelProviderWrapper = ({
    children
}: { children: React.ReactNode }) => {
    const { networks } = useSettingsState()

    const network = networks.find(network => network.name === KnownInternalNames.Networks.FuelMainnet || network.name === KnownInternalNames.Networks.FuelTestnet)
    const isMainnet = network?.name === KnownInternalNames.Networks.FuelMainnet
    const config = useConfig()
    const fuelConfig = {
        connectors: [
            new FuelWalletConnector(),
            new BakoSafeConnector({
                api: new BaskoRequestAPI(HOST_URL)
            }),
            new FueletWalletConnector(),
            // new WalletConnectConnector({
            //     projectId: WALLETCONNECT_PROJECT_ID,
            //     wagmiConfig: config,
            //     chainId: isMainnet ? CHAIN_IDS.fuel.mainnet : CHAIN_IDS.fuel.testnet,
            //     ...(network?.node_url ? { fuelProvider: Provider.create(network?.node_url) } : {}),
            // }),
            // new SolanaConnector({
            //     projectId: WALLETCONNECT_PROJECT_ID,
            //     chainId: isMainnet ? CHAIN_IDS.fuel.mainnet : CHAIN_IDS.fuel.testnet,
            //     ...(network?.node_url ? { fuelProvider: Provider.create(network?.node_url) } : {}),
            // })
        ]
    }

    return (
        <FuelProvider uiConfig={{ suggestBridge: false }} theme={'dark'} fuelConfig={fuelConfig}>
            {children}
        </FuelProvider>
    );
};


export default FuelProviderWrapper;