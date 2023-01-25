import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react'
import { useSettingsState } from '../../context/settings';
import LayerSwapApiClient, { SwapItem } from '../../lib/layerSwapApiClient';
import Image from 'next/image'
import toast from 'react-hot-toast';
import shortenAddress from '../utils/ShortenAddress';
import CopyButton from '../buttons/copyButton';
import { SwapDetailsComponentSceleton } from '../Sceletons';
import StatusIcon from './StatusIcons';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import isGuid from '../utils/isGuid';
import KnownInternalNames from '../../lib/knownIds';

type Props = {
    id: string
}

const SwapDetails: FC<Props> = ({ id }) => {
    const [swap, setSwap] = useState<SwapItem>()
    const [loading, setLoading] = useState(false)
    const router = useRouter();
    const settings = useSettingsState()
    const { currencies, exchanges, networks, discovery: { resource_storage_url } } = settings

    const { source_exchange: source_exchange_internal_name,
        destination_network: destination_network_internal_name,
        source_network: source_network_internal_name,
        destination_exchange: destination_exchange_internal_name,
        source_network_asset
    } = swap || {}

    const source = source_exchange_internal_name ? exchanges.find(e => e.internal_name === source_exchange_internal_name) : networks.find(e => e.internal_name === source_network_internal_name)
    const destination_exchange = destination_exchange_internal_name && exchanges.find(e => e.internal_name === destination_exchange_internal_name)
    const exchange_currency = destination_exchange_internal_name && destination_exchange.currencies?.find(c => swap?.source_network_asset?.toUpperCase() === c?.asset?.toUpperCase() && c?.is_default)

    const destination_network = destination_network_internal_name ? networks.find(n => n.internal_name === destination_network_internal_name) : networks?.find(e => e?.internal_name?.toUpperCase() === exchange_currency?.network?.toUpperCase())

    const destination = destination_exchange_internal_name ? destination_exchange : networks.find(n => n.internal_name === destination_network_internal_name)

    const currency = currencies.find(c=>c.asset === source_network_asset)

    useEffect(() => {
        (async () => {
            if (!id)
                return
            setLoading(true)
            try {
                const layerswapApiClient = new LayerSwapApiClient(router)
                const swapResponse = await layerswapApiClient.GetSwapDetailsAsync(id)
                setSwap(swapResponse.data)
            }
            catch (e) {
                toast.error(e.message)
            }
            finally {
                setLoading(false)
            }
        })()
    }, [id, router.query])

    if (loading)
        return <SwapDetailsComponentSceleton />

    return (
        <>
            <div className="w-full grid grid-flow-row animate-fade-in">
                <div className="rounded-md w-full grid grid-flow-row">
                    <div className="items-center space-y-1.5 block text-base font-lighter leading-6 text-primary-text">
                        <div className="flex justify-between p items-baseline">
                            <span className="text-left">Id </span>
                            <span className="text-white">
                                <div className='inline-flex items-center'>
                                    <CopyButton toCopy={swap?.id} iconClassName="text-gray-500">
                                        {shortenAddress(swap?.id)}
                                    </CopyButton>
                                </div>
                            </span>
                        </div>
                        <hr className='horizontal-gradient' />
                        <div className="flex justify-between p items-baseline">
                            <span className="text-left">Status </span>
                            <span className="text-white">
                                {swap && <StatusIcon status={swap?.status} />}
                            </span>
                        </div>
                        <hr className='horizontal-gradient' />
                        <div className="flex justify-between items-baseline">
                            <span className="text-left">Date </span>
                            <span className='text-white font-normal'>{(new Date(swap?.created_date)).toLocaleString()}</span>
                        </div>
                        <hr className='horizontal-gradient' />
                        <div className="flex justify-between items-baseline">
                            <span className="text-left">From  </span>
                            {
                                source && <div className="flex items-center">
                                    <div className="flex-shrink-0 h-5 w-5 relative">
                                        {
                                            <Image
                                            src={`${resource_storage_url}/layerswap/networks/${source?.internal_name?.toLocaleLowerCase()}.png`}
                                            alt="Exchange Logo"
                                                height="60"
                                                width="60"
                                                layout="responsive"
                                                className="rounded-md object-contain"
                                            />
                                        }

                                    </div>
                                    <div className="mx-1 text-white">{source?.display_name}</div>
                                </div>
                            }
                        </div>
                        <hr className='horizontal-gradient' />
                        <div className="flex justify-between items-baseline">
                            <span className="text-left">To </span>
                            {
                                destination && <div className="flex items-center">
                                    <div className="flex-shrink-0 h-5 w-5 relative">
                                        {
                                            <Image
                                            src={`${resource_storage_url}/layerswap/networks/${destination?.internal_name?.toLocaleLowerCase()}.png`}
                                            alt="Exchange Logo"
                                                height="60"
                                                width="60"
                                                layout="responsive"
                                                className="rounded-md object-contain"
                                            />
                                        }
                                    </div>
                                    <div className="mx-1 text-white">{destination?.display_name}</div>
                                </div>
                            }
                        </div>
                        <hr className='horizontal-gradient' />
                        <div className="flex justify-between items-baseline">
                            <span className="text-left">Address </span>
                            <span className="text-white">
                                <div className='inline-flex items-center'>
                                    <CopyButton toCopy={swap?.destination_address} iconClassName="text-gray-500">
                                        {swap?.destination_address.slice(0, 8) + "..." + swap?.destination_address.slice(swap?.destination_address.length - 5, swap?.destination_address.length)}
                                    </CopyButton>
                                </div>
                            </span>
                        </div>
                        {(swap?.output_transaction?.transaction_id && (!isGuid(swap?.output_transaction?.transaction_id)) && swap?.destination_exchange != KnownInternalNames.Exchanges.Coinbase) &&
                            <>
                                <hr className='horizontal-gradient' />
                                <div className="flex justify-between items-baseline">
                                    <span className="text-left">Transaction </span>
                                    <span className="text-white">
                                        <div className='inline-flex items-center'>
                                            <div className="underline hover:no-underline flex items-center space-x-1">
                                                <a target={"_blank"} href={destination_network?.transaction_explorer_template?.replace("{0}", swap?.output_transaction.transaction_id)}>{shortenAddress(swap.output_transaction.transaction_id)}</a>
                                                <ExternalLinkIcon className='h-4' />
                                            </div>
                                        </div>
                                    </span>
                                </div>
                            </>
                        }
                        <hr className='horizontal-gradient' />
                        <div className="flex justify-between items-baseline">
                            <span className="text-left">Requested amount</span>
                            <span className='text-white font-normal flex'>
                                {swap?.requested_amount} {swap?.destination_network_asset}
                            </span>
                        </div>
                        {
                            swap?.input_transaction &&
                            <>
                                <hr className='horizontal-gradient' />
                                <div className="flex justify-between items-baseline">
                                    <span className="text-left">Transfered amount</span>
                                    <span className='text-white font-normal flex'>
                                        {swap?.input_transaction?.amount} {swap?.destination_network_asset}
                                    </span>
                                </div>
                            </>
                        }
                        <hr className='horizontal-gradient' />
                        <div className="flex justify-between items-baseline">
                            <span className="text-left">Layerswap Fee </span>
                            <span className='text-white font-normal'>{parseFloat(swap?.fee?.toFixed(currency?.precision))} {currency?.asset}</span>
                        </div>
                        {
                            swap?.output_transaction &&
                            <>
                                <hr className='horizontal-gradient' />
                                <div className="flex justify-between items-baseline">
                                    <span className="text-left">Amount You Received</span>
                                    <span className='text-white font-normal flex'>
                                        {swap?.output_transaction?.amount} {currency?.asset}
                                    </span>
                                </div>
                            </>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default SwapDetails;