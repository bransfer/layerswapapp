import { FC } from 'react'
import WalletTransfer from './Wallet';
import ManualTransfer from './ManualTransfer';
import { useSwapDataState } from '../../../context/swap';
import KnownInternalNames from '../../../lib/knownIds';
import SwapSummary from '../Summary';
import External from './External';
import { useQueryState } from '../../../context/query';
import { Widget } from '../../Widget/Index';
import WalletTransferContent from './WalletTransferContent';

const Withdraw: FC = () => {
    const { swapResponse } = useSwapDataState()
    const { swap } = swapResponse || {}
    const { appName, signature } = useQueryState()

    const sourceIsImmutableX = swap?.source_network.name?.toUpperCase() === KnownInternalNames.Networks.ImmutableXMainnet?.toUpperCase()
        || swap?.source_network.name === KnownInternalNames.Networks.ImmutableXGoerli?.toUpperCase()
    const sourceIsArbitrumOne = swap?.source_network.name?.toUpperCase() === KnownInternalNames.Networks.ArbitrumMainnet?.toUpperCase()
        || swap?.source_network.name === KnownInternalNames.Networks.ArbitrumGoerli?.toUpperCase()

    const isImtblMarketplace = (signature && appName === "imxMarketplace" && sourceIsImmutableX)
    const sourceIsSynquote = appName === "ea7df14a1597407f9f755f05e25bab42" && sourceIsArbitrumOne

    let withdraw: {
        content?: JSX.Element | JSX.Element[],
        footer?: JSX.Element | JSX.Element[],
    } = {}

    if (swap?.use_deposit_address === false) {
        withdraw = {
            content: <WalletTransferContent />,
            footer: <WalletTransfer />
        }
    } else if (swap?.use_deposit_address === true) {
        withdraw = {
            footer: <ManualTransfer />,
            content: <></>
        }
    }

    if (isImtblMarketplace || sourceIsSynquote) {
        withdraw = {
            content: <External />
        }
    }

    return (
        <>
            <Widget.Content>
                <div className="w-full flex flex-col justify-between  text-secondary-text">
                    <div className='grid grid-cols-1 gap-4 '>
                        <div className="bg-secondary-700 rounded-lg px-3 py-4 border border-secondary-500 w-full relative z-10 space-y-4">
                            <SwapSummary />
                        </div>
                        <span>
                            {withdraw?.content}
                        </span>
                    </div>
                </div>
            </Widget.Content>
            {
                withdraw?.footer &&
                <Widget.Footer sticky={true}>
                    {withdraw?.footer}
                </Widget.Footer>
            }
        </>
    )
}


export default Withdraw