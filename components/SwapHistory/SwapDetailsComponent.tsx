import { FC } from 'react'
import LayerSwapApiClient, { SwapResponse, TransactionType } from '../../lib/layerSwapApiClient';
import Image from 'next/image'
import shortenAddress, { shortenEmail } from '../utils/ShortenAddress';
import CopyButton from '../buttons/copyButton';
import StatusIcon from './StatusIcons';
import { ArrowRight, ExternalLink, Fuel, Info, RefreshCw } from 'lucide-react';
import isGuid from '../utils/isGuid';
import KnownInternalNames from '../../lib/knownIds';
import { useQueryState } from '../../context/query';
import { ApiResponse } from '../../Models/ApiResponse';
import { Partner } from '../../Models/Partner';
import useSWR from 'swr';
import { isValidAddress } from '../../lib/address/validator';
import { ExtendedAddress } from '../Input/Address/AddressPicker/AddressWithIcon';
import { addressFormat } from '../../lib/address/formatter';
import { truncateDecimals } from '../utils/RoundDecimals';
import Link from 'next/link';
import calculateDatesDifference from '../../lib/calculateDatesDifference';
import { SwapStatus } from '../../Models/SwapStatus';
import { useRouter } from 'next/router';
import { resolvePersistantQueryParams } from '../../helpers/querryHelper';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../shadcn/accordion';
import VaulDrawer from '../modal/vaulModal';
import { Tooltip, TooltipContent, TooltipTrigger } from '../shadcn/tooltip';

type Props = {
    swapResponse: SwapResponse
}

const SwapDetails: FC<Props> = ({ swapResponse }) => {
    const { swap, refuel, quote } = swapResponse
    const { source_token, destination_token, destination_address, source_network, destination_network, source_exchange, destination_exchange, requested_amount } = swap

    const router = useRouter()
    const {
        hideFrom,
        hideTo,
        account,
        appName
    } = useQueryState()

    const layerswapApiClient = new LayerSwapApiClient()
    const { data: partnerData } = useSWR<ApiResponse<Partner>>(appName && `/internal/apps?name=${appName}`, layerswapApiClient.fetcher)
    const partner = partnerData?.data

    const input_tx_explorer_template = source_network?.transaction_explorer_template
    const output_tx_explorer_template = destination_network?.transaction_explorer_template

    const swapInputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Input)
    const swapOutputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Output)

    const source = (hideFrom && partner && account) ? partner : source_network
    const destination = (hideTo && partner && account) ? partner : destination_network

    const receive_amount = swapOutputTransaction?.amount ?? quote?.receive_amount
    const receiveAmountInUsd = receive_amount ? (destination_token?.price_in_usd * receive_amount).toFixed(2) : undefined
    const requestedAmountInUsd = requested_amount && (source_token?.price_in_usd * requested_amount).toFixed(2)

    const inputTransactionFee = swapInputTransaction?.fee_amount
    const inputTransactionFeeInUsd = inputTransactionFee && swapInputTransaction?.fee_token && (swapInputTransaction?.fee_token?.price_in_usd * inputTransactionFee)
    const displayInputFeeInUsd = inputTransactionFeeInUsd ? (inputTransactionFeeInUsd < 0.01 ? '<$0.01' : `$${inputTransactionFeeInUsd?.toFixed(2)}`) : null
    const calculatedFeeAmountInUsd = inputTransactionFeeInUsd ? inputTransactionFeeInUsd + quote?.total_fee_in_usd : quote?.total_fee_in_usd
    const displayCalculatedFeeAmountInUsd = calculatedFeeAmountInUsd ? (calculatedFeeAmountInUsd < 0.01 ? '<$0.01' : `$${calculatedFeeAmountInUsd?.toFixed(2)}`) : null
    const displayLayerswapFeeInUsd = quote?.total_fee_in_usd ? (quote?.total_fee_in_usd < 0.01 ? '<$0.01' : `$${quote?.total_fee_in_usd?.toFixed(2)}`) : null
    const nativeCurrency = refuel?.token
    const truncatedRefuelAmount = nativeCurrency && !!refuel ?
        truncateDecimals(refuel.amount, nativeCurrency?.precision) : null
    const refuelAmountInUsd = nativeCurrency && ((nativeCurrency?.price_in_usd || 1) * (truncatedRefuelAmount || 0)).toFixed(2)

    let sourceAccountAddress: string | undefined = undefined
    if (hideFrom && account) {
        sourceAccountAddress = account;
    }
    else if (swapInputTransaction?.from) {
        sourceAccountAddress = swapInputTransaction?.from;
    }
    else if (source_network?.name === KnownInternalNames.Exchanges.Coinbase && swap?.exchange_account_connected) {
        sourceAccountAddress = shortenEmail(swap?.exchange_account_name, 10);
    }
    else if (source_exchange) {
        sourceAccountAddress = "Exchange"
    }

    return (
        <>
            <VaulDrawer.Snap id='item-1' className='pb-3 space-y-3'>
                <div className='p-3 bg-secondary-700 rounded-xl'>
                    <div className={`font-normal flex flex-col w-full relative ${(source_exchange || destination_exchange) ? 'space-y-2' : 'space-y-4'}`}>

                        {/* From and To */}
                        <div className='space-y-1'>
                            <p className='text-xs font-normal text-secondary-text pl-1'>From</p>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={source_exchange?.logo || source.logo}
                                        alt={source_exchange?.display_name || source.display_name}
                                        width={32}
                                        height={32}
                                        className="rounded-md w-11 h-11"
                                    />
                                    <div>
                                        <p className="text-secondary-text text-base">{source_exchange ? source_exchange?.display_name : source?.display_name}</p>
                                        {
                                            sourceAccountAddress &&
                                            (
                                                source_exchange ?
                                                    <p className="text-xs text-secondary-text">Exchange</p>
                                                    : sourceAccountAddress ?
                                                        isValidAddress(sourceAccountAddress, source_network) ?
                                                            <div className="group/addressItem text-secondary-text">
                                                                <ExtendedAddress address={addressFormat(sourceAccountAddress, source_network)} network={source_network} addressClassNames='text-xs' />
                                                            </div>
                                                            :
                                                            <p className="text-xs text-secondary-text">{sourceAccountAddress}</p>
                                                        :
                                                        null
                                            )
                                        }
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    {
                                        (swapInputTransaction?.amount || requested_amount) &&
                                        <p className="text-primary-text text-base font-semibold">{truncateDecimals(swapInputTransaction?.amount || requested_amount, source_token.precision)} {source_token.symbol}</p>
                                    }
                                    <p className="text-secondary-text text-sm flex justify-end">${swapInputTransaction?.usd_value || requestedAmountInUsd}</p>
                                </div>
                            </div>
                        </div>

                        {
                            (source_exchange || destination_exchange) &&
                            <div className='flex flex-row space-x-2'>
                                <div className='flex flex-col gap-1 justify-start items-center w-fit ml-2.5'>
                                    <div className="w-0.5 h-2.5 bg-[#d9d9d9] rounded-sm" />
                                    <Image
                                        src={source_exchange ? source_network?.logo : destination_network?.logo}
                                        alt={source_exchange ? source_network?.display_name : destination_network?.display_name}
                                        width={24}
                                        height={24}
                                        className="rounded-md w-6 h-6"
                                    />
                                    <div className="w-0.5 h-2.5 bg-[#d9d9d9] rounded-sm" />
                                </div>
                                <span className='text-secondary-text text-sm self-center'>{source_exchange ? source_network?.display_name : destination_network?.display_name}</span>
                            </div>

                        }

                        <div className='space-y-1'>
                            <p className='text-xs font-normal text-secondary-text pl-1'>To</p>
                            <div className="flex items-center justify-between w-full ">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={destination_exchange?.logo || destination.logo}
                                        alt={destination_exchange?.display_name || destination.display_name}
                                        width={32}
                                        height={32}
                                        className="rounded-md w-11 h-11"
                                    />
                                    <div className="group/addressItem text-sm text-secondary-text">
                                        <p className="text-secondary-text text-base">{destination_exchange ? destination_exchange?.display_name : destination?.display_name}</p>
                                        {
                                            destination_exchange ?
                                                <p className="text-xs text-secondary-text">Exchange</p>
                                                :
                                                <ExtendedAddress address={addressFormat(destination_address, destination_network)} network={destination_network} addressClassNames='text-xs' />
                                        }
                                    </div>
                                </div>
                                {
                                    receive_amount != undefined ?
                                        <div className="flex flex-col justify-end">
                                            <p className="text-primary-text text-base font-semibold">{truncateDecimals(receive_amount, destination_token.precision)} {destination_token.symbol}</p>
                                            <p className="text-secondary-text text-sm flex justify-end">${receiveAmountInUsd}</p>
                                        </div>
                                        :
                                        <>-</>
                                }
                            </div>
                        </div>

                        {/* Refuel */}
                        {
                            refuel && <div className=' bg-secondary-700 rounded-xl py-1.5'>
                                <div className="flex justify-between items-center text-sm font-normal">
                                    <div className='inline-flex items-center text-primary-text gap-2'>
                                        <Fuel className='h-4 w-4' />
                                        <p className="text-left">Refuel</p>
                                    </div>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger className='flex flex-col items-end'>
                                            <div className="flex items-center gap-1 text-primary-buttonTextColor">
                                                <Info className='h-3.5 w-3.5' />
                                                <p className="text-primary-text text-sm font-normal">{truncatedRefuelAmount} {nativeCurrency?.symbol}</p>
                                            </div>
                                            {/* <p className="text-secondary-text text-sm font-normal">${refuelAmountInUsd}</p> */}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className='flex flex-col gap-2 justify-start text-sm font-normal'>
                                                <p className='text-secondary-text'>Conversion rate</p>
                                                <div className="inline-flex gap-2 items-center text-primary-text">
                                                    <p>{quote.refuel_in_source} {source_token.symbol}</p>
                                                    <ArrowRight className='h-4 w-4' />
                                                    <p>{refuel.amount} {refuel.token.symbol}</p>
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        }

                    </div>
                </div>
                {/* Fees */}
                <div className='p-3 bg-secondary-700 rounded-xl'>
                    {
                        (inputTransactionFeeInUsd && !source_exchange) ?
                            <Accordion type="single" collapsible>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className='w-full'>
                                        <div className="flex justify-between items-baseline text-sm w-full mr-1">
                                            <span className="text-left">Fees</span>
                                            <span className='font-semibold text-primary-text'>{displayCalculatedFeeAmountInUsd}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent >
                                        <div className='flex flex-col gap-3 mt-4'>
                                            <div className="flex justify-between items-baseline text-sm">
                                                <span className="text-left text-secondary-text">Layerswap Fee</span>
                                                <div className="flex flex-col items-end justify-end">
                                                    <p className="text-primary-text text-sm font-semibold">{swapResponse?.quote.total_fee?.toFixed(source_token?.precision)} {source_token?.symbol}</p>
                                                    <p className="text-secondary-text text-xs flex justify-end">{displayLayerswapFeeInUsd}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-baseline text-sm">
                                                <span className="text-left text-secondary-text">Gas Fee</span>
                                                <div className="flex flex-col items-end justify-end">
                                                    <p className="text-primary-text text-sm font-semibold">{inputTransactionFee?.toFixed(swapInputTransaction?.fee_token?.precision)} {swapInputTransaction?.fee_token?.symbol}</p>
                                                    <p className="text-secondary-text text-xs flex justify-end">{displayInputFeeInUsd}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            :
                            <div className="flex justify-between items-baseline text-sm w-full">
                                <p className="text-left">Fees</p>
                                <div className="flex flex-col justify-end">
                                    <p className="text-primary-text text-sm font-semibold">{swapResponse?.quote.total_fee?.toFixed(source_token?.precision)} {source_token?.symbol}</p>
                                    <p className="text-secondary-text text-xs flex justify-end">${quote.total_fee_in_usd}</p>
                                </div>
                            </div>
                    }
                </div>

                {/* Date and Status */}
                <div className='p-3 bg-secondary-700 rounded-xl'>
                    <div className='text-sm flex flex-col gap-3'>
                        <div className="flex justify-between items-center text-sm text-primary-text">
                            <p className="text-left text-secondary-text">Swap Id</p>
                            <CopyButton toCopy={swap?.id} iconClassName='order-2 ml-1'>
                                {shortenAddress(swap?.id)}
                            </CopyButton>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-left text-secondary-text">Date & Time</span>
                            <span className='text-primary-text'>{(new Date(swap.created_date)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-left text-secondary-text">Completion Time</span>
                            <span className='text-primary-text'>
                                {
                                    (swapInputTransaction?.timestamp && swapOutputTransaction?.timestamp) ?
                                        calculateDatesDifference(swapInputTransaction?.timestamp, swapOutputTransaction?.timestamp)
                                        :
                                        '-'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between p items-baseline">
                            <span className="text-left text-secondary-text">Status </span>
                            <span className="text-primary-text">
                                <StatusIcon swap={swap} />
                            </span>
                        </div>
                    </div>
                </div>


            </VaulDrawer.Snap>

            <VaulDrawer.Snap className='pb-3' id='item-2'>
                <div className='flex flex-col justify-between w-full h-full gap-3'>
                    <div className='space-y-3'>

                        {/* Source and Destination Transactions */}
                        <div className='p-3 bg-secondary-700 rounded-xl text-primary-text'>
                            <div className='text-sm flex flex-col gap-3'>
                                <div className="flex justify-between items-baseline">
                                    <p className="text-left text-secondary-text">Source transaction</p>
                                    {
                                        swapInputTransaction?.transaction_hash ?
                                            <Link
                                                target="_blank"
                                                href={input_tx_explorer_template?.replace("{0}", swapInputTransaction.transaction_hash)}
                                                className='flex items-center space-x-1'
                                            >
                                                <span>{shortenAddress(swapInputTransaction.transaction_hash)}</span>
                                                <ExternalLink className='h-4' />
                                            </Link>
                                            :
                                            <span>-</span>
                                    }
                                </div >
                                <div className="flex justify-between items-baseline">
                                    <p className="text-left text-secondary-text">Destination transaction</p>
                                    {
                                        swapOutputTransaction?.transaction_hash ?
                                            (
                                                (swapOutputTransaction?.transaction_hash && swap?.destination_exchange?.name === KnownInternalNames.Exchanges.Coinbase && (isGuid(swapOutputTransaction?.transaction_hash))) ?
                                                    <span><CopyButton toCopy={swapOutputTransaction.transaction_hash} iconClassName="text-primary-text order-2">{shortenAddress(swapOutputTransaction.transaction_hash)}</CopyButton></span>
                                                    :
                                                    <Link
                                                        target="_blank"
                                                        href={output_tx_explorer_template?.replace("{0}", swapOutputTransaction.transaction_hash)}
                                                        className='flex items-center space-x-1'
                                                    >
                                                        <span>{shortenAddress(swapOutputTransaction.transaction_hash)}</span>
                                                        <ExternalLink className='h-4' />
                                                    </Link>
                                            )
                                            :
                                            <span>-</span>
                                    }
                                </div >
                            </div>
                        </div>
                    </div>

                    {
                        swap.status === SwapStatus.Completed &&
                        <button
                            type='button'
                            onClick={() => router.push({
                                pathname: `/`,
                                query: {
                                    amount: requested_amount,
                                    destAddress: destination_address,
                                    from: source_network?.name,
                                    to: destination_network?.name,
                                    fromAsset: source_token.symbol,
                                    toAsset: destination_token.symbol,
                                    ...resolvePersistantQueryParams(router.query),
                                }
                            }, undefined, { shallow: false })}
                            className='w-full inline-flex items-center gap-2 justify-center py-2.5 px-3 text-xl font-semibold bg-primary-text-placeholder hover:opacity-90 duration-200 active:opacity-80 transition-opacity rounded-lg text-secondary-950'
                        >
                            <RefreshCw className='h-6 w-6' />
                            <p>
                                Repeat Swap
                            </p>
                        </button>
                    }
                    {
                        (swap.status !== SwapStatus.Completed && swap.status !== SwapStatus.Expired && swap.status !== SwapStatus.Failed) &&
                        <button
                            type='button'
                            onClick={() => router.push({
                                pathname: `/swap/${swap.id}`,
                                query: resolvePersistantQueryParams(router.query),
                            }, undefined, { shallow: false })}
                            className='w-full inline-flex items-center gap-2 justify-center py-2.5 px-3 text-xl font-semibold bg-primary hover:opacity-90 duration-200 active:opacity-80 transition-opacity rounded-lg text-primary-text'
                        >
                            <p>
                                Complete Swap
                            </p>
                        </button>
                    }

                </div>
            </VaulDrawer.Snap>
        </>
    )
}

export default SwapDetails;