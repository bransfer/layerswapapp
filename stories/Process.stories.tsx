import type { Meta, StoryObj } from '@storybook/react';
import Processing from '../components/Swap/Withdraw/Processing';
import LayerSwapApiClient, { SwapItem } from '../lib/layerSwapApiClient';
import { SwapStatus } from '../Models/SwapStatus';
import { SwapDataStateContext } from '../context/swap';
import { SettingsStateContext } from '../context/settings';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { supportedChains } from '../lib/chainConfigs';
import { publicProvider } from 'wagmi/providers/public';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { walletConnectWallet, rainbowWallet, metaMaskWallet, coinbaseWallet, bitKeepWallet, argentWallet } from '@rainbow-me/rainbowkit/wallets';
import { WalletStateContext } from '../context/wallet';
import { QueryStateContext } from '../context/query';
import { FC, useEffect, useState } from 'react';
import { LayerSwapAppSettings } from '../Models/LayerSwapAppSettings';
import { swap, failedSwap, failedSwapOutOfRange } from './Data/swaps'

const WALLETCONNECT_PROJECT_ID = '28168903b2d30c75e5f7f2d71902581b';

const { chains, publicClient } = configureChains(
    supportedChains,
    [
        publicProvider()
    ]
);

const projectId = WALLETCONNECT_PROJECT_ID;
const connectors = connectorsForWallets([
    {
        groupName: 'Popular',
        wallets: [
            metaMaskWallet({ projectId, chains }),
            walletConnectWallet({ projectId, chains }),
        ],
    },
    {
        groupName: 'Wallets',
        wallets: [
            coinbaseWallet({ chains, appName: 'Layerswap' }),
            argentWallet({ projectId, chains }),
            bitKeepWallet({ projectId, chains }),
            rainbowWallet({ projectId, chains }),
        ],
    },
]);

const Comp: FC<{ swap: SwapItem, failedSwap?: SwapItem, failedSwapOutOfRange?: SwapItem, }> = ({ swap, failedSwap, failedSwapOutOfRange }) => {
    const [appSettings, setAppSettings] = useState(null);
    const version = process.env.NEXT_PUBLIC_API_VERSION;
    const wagmiConfig = createConfig({
        autoConnect: true,
        connectors,
        publicClient,
    })
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await (await fetch(`${LayerSwapApiClient.apiBaseEndpoint}/api/settings?version=${version}`)).json();
                let appSettings = new LayerSwapAppSettings(res.data)
                setAppSettings(appSettings);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, []);
    const swapContextInitialValues = { codeRequested: false, swap, failedSwap, failedSwapOutOfRange, addressConfirmed: false, walletAddress: "", depositeAddressIsfromAccount: false, withdrawType: undefined, swapTransaction: undefined, selectedAssetNetwork: undefined }

    if (!appSettings) {
        return <div>Loading...</div>
    }

    return <WagmiConfig config={wagmiConfig}>
        <SettingsStateContext.Provider value={appSettings}>
            <QueryStateContext.Provider value={{}}>
                <SwapDataStateContext.Provider value={swapContextInitialValues}>
                    <WalletStateContext.Provider value={{}}>
                        <div className={`flex content-center items-center justify-center space-y-5 flex-col container mx-auto sm:px-6 max-w-lg`}>
                            <div className={`flex flex-col w-full text-white`}>
                                <div className={`bg-secondary-900 md:shadow-card rounded-lg w-full sm:overflow-hidden relative`}>
                                    <div className="relative px-6">
                                        <Processing />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </WalletStateContext.Provider>
                </SwapDataStateContext.Provider >
            </QueryStateContext.Provider>
        </SettingsStateContext.Provider>
    </WagmiConfig>
}

const meta = {
    title: 'Example/Process',
    component: Comp,
    parameters: {
        layout: 'centered',
    }
} satisfies Meta<typeof Comp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = {
    args: {
        swap: { ...swap, status: SwapStatus.Created }
    }
};

export const OutputPending: Story = {
    args: {
        swap: { ...swap, status: SwapStatus.LsTransferPending }
    }
};

export const Completed: Story = {
    args: {
        swap: { ...swap, status: SwapStatus.Completed }
    }
};

export const UserTransferPending: Story = {
    args: {
        swap: { ...swap, status: SwapStatus.UserTransferPending }
    }
};

export const UserTransferDelayed: Story = {
    args: {
        swap: { ...swap, status: SwapStatus.UserTransferDelayed }
    }
};

export const Failed: Story = {
    args: {
        swap: { ...failedSwap, status: SwapStatus.Failed }
    }
};

export const FailedOutOfRangeAmount: Story = {
    args: {
        swap: { ...failedSwapOutOfRange, status: SwapStatus.Failed }
    }
};