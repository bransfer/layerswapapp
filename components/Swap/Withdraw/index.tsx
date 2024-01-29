import { AlignLeft } from 'lucide-react';
import { FC, useEffect, useState } from 'react'
import WalletTransfer from './Wallet';
import ManualTransfer from './ManualTransfer';
import { useSettingsState } from '../../../context/settings';
import { useSwapDataState, useSwapDataUpdate } from '../../../context/swap';
import KnownInternalNames from '../../../lib/knownIds';
import { Tab, TabHeader } from '../../Tabs/Index';
import SwapSummary from '../Summary';
import Coinbase from './Coinbase';
import External from './External';
import { WithdrawType } from '../../../lib/layerSwapApiClient';
import WalletIcon from '../../icons/WalletIcon';
import { NetworkType } from '../../../Models/CryptoNetwork';
import { useQueryState } from '../../../context/query';
import { Widget } from '../../Widget/Index';
import WalletTransferContent from './WalletTransferContent';

const Withdraw: FC = () => {
    const { swap } = useSwapDataState()
    const { setWithdrawType } = useSwapDataUpdate()
    const { layers } = useSettingsState()
    const { appName, signature } = useQueryState()

    const sourceIsStarknet = swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.StarkNetMainnet?.toUpperCase()
        || swap?.source_network === KnownInternalNames.Networks.StarkNetGoerli?.toUpperCase()
        || swap?.source_network === KnownInternalNames.Networks.StarkNetSepolia?.toUpperCase()
    const sourceIsImmutableX = swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.ImmutableXMainnet?.toUpperCase()
        || swap?.source_network === KnownInternalNames.Networks.ImmutableXGoerli?.toUpperCase()
    const sourceIsZkSync = swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.ZksyncMainnet?.toUpperCase()
    const sourceIsArbitrumOne = swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.ArbitrumMainnet?.toUpperCase()
        || swap?.source_network === KnownInternalNames.Networks.ArbitrumGoerli?.toUpperCase()
    const sourceIsCoinbase =
        swap?.source_exchange?.toUpperCase() === KnownInternalNames.Exchanges.Coinbase?.toUpperCase()
    const sourceIsSolana = swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.SolanaMainnet?.toUpperCase()

    const source_layer = layers.find(n => n.internal_name === swap?.source_network)
    const sourceLayerIsEthereum = source_layer?.internal_name?.toUpperCase() === KnownInternalNames.Networks.EthereumMainnet || source_layer?.internal_name?.toUpperCase() === KnownInternalNames.Networks.EthereumGoerli
    const sourceNetworkType = source_layer?.type
    const manualIsAvailable = !(sourceIsStarknet || sourceIsImmutableX)
    const walletIsAvailable = !swap?.source_exchange
        && (sourceNetworkType === NetworkType.EVM
            || sourceNetworkType === NetworkType.Starknet
            || sourceIsImmutableX || sourceIsZkSync || sourceIsSolana)

    const isImtblMarketplace = (signature && appName === "imxMarketplace" && sourceIsImmutableX)
    const sourceIsSynquote = appName === "ea7df14a1597407f9f755f05e25bab42" && sourceIsArbitrumOne

    let tabs: Tab[] = []
    // TODO refactor
    if (isImtblMarketplace || sourceIsSynquote) {
        tabs = [{
            id: WithdrawType.External,
            label: "Withdrawal pending",
            enabled: true,
            icon: <WalletIcon className='stroke-2 w-6 h-6 -ml-0.5' />,
            content: <External />
        }]
    }
    else if (sourceIsStarknet || sourceIsImmutableX) {
        tabs = [
            {
                id: WithdrawType.Wallet,
                label: "Via wallet",
                enabled: true,
                icon: <WalletIcon className='stroke-2 w-6 h-6 -ml-0.5' />,
                content: <WalletTransferContent />,
                footer: <WalletTransfer />
            }]
    }
    else {
        tabs = [
            {
                id: WithdrawType.Wallet,
                label: "Via wallet",
                enabled: walletIsAvailable,
                icon: <WalletIcon className='stroke-2 w-6 h-6 -ml-0.5' />,
                content: <WalletTransferContent />,
                footer: <WalletTransfer />
            },
            {
                id: WithdrawType.Coinbase,
                label: "Automatically",
                enabled: sourceIsCoinbase && sourceLayerIsEthereum,
                icon: <WalletIcon className='stroke-2 w-6 h-6 -ml-0.5' />,
                content: <WalletTransferContent />,
                footer: <Coinbase />
            },
            {
                id: WithdrawType.Manually,
                label: "Manually",
                enabled: manualIsAvailable,
                icon: <AlignLeft />,
                footer: <ManualTransfer />,
                content: <></>
            }
        ];
    }
    const [activeTabId, setActiveTabId] = useState(tabs.find(t => t.enabled)?.id);

    const activeTab = tabs.find(t => t.id === activeTabId)
    const showTabsHeader = tabs?.filter(t => t.enabled)?.length > 1

    useEffect(() => {
        activeTab && setWithdrawType(activeTab.id)
    }, [activeTab])

    return (
        <>
            <Widget.Content>
                <div className="w-full flex flex-col justify-between  text-secondary-text">
                    <div className='grid grid-cols-1 gap-4 '>
                        <div className="bg-secondary-700 rounded-lg px-3 py-4 border border-secondary-500 w-full relative z-10 space-y-4">
                            <SwapSummary />
                        </div>
                        <span>

                            {
                                showTabsHeader &&
                                <>
                                    <div className="mb-4 ml-1 text-base">Choose how you&apos;d like to complete the swap</div>
                                    <div className="flex space-x-3 w-full">
                                        {activeTabId && tabs.filter(t => t.enabled).map((tab) => (
                                            <TabHeader
                                                activeTabId={activeTabId}
                                                onCLick={setActiveTabId}
                                                tab={tab}
                                                key={tab.id}
                                            />
                                        ))}
                                    </div>
                                </>
                            }
                        </span>
                        <span>
                            {activeTab?.content}
                        </span>
                    </div>
                </div>
            </Widget.Content>
            {
                activeTab?.footer &&
                <Widget.Footer sticky={true} key={activeTabId}>
                    {activeTab?.footer}
                </Widget.Footer>
            }
        </>
    )
}


export default Withdraw