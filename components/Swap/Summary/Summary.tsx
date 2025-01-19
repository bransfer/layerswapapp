import Image from "next/image";
import { Fuel } from "lucide-react";
import { FC } from "react";
import { truncateDecimals } from "../../utils/RoundDecimals";
import LayerSwapApiClient, { Refuel } from "../../../lib/layerSwapApiClient";
import { ApiResponse } from "../../../Models/ApiResponse";
import { Partner } from "../../../Models/Partner";
import useSWR from 'swr'
import { useQueryState } from "../../../context/query";
import { Network, Token } from "../../../Models/Network";
import { Exchange } from "../../../Models/Exchange";
import { addressFormat } from "../../../lib/address/formatter";
import { ExtendedAddress } from "../../Input/Address/AddressPicker/AddressWithIcon";
import { isValidAddress } from "../../../lib/address/validator";
import shortenAddress from "../../utils/ShortenAddress";

type SwapInfoProps = {
    sourceCurrency: Token,
    destinationCurrency: Token,
    source: Network,
    destination: Network;
    requestedAmount: number | undefined;
    receiveAmount: number | undefined;
    destinationAddress: string;
    refuel?: Refuel;
    fee?: number,
    exchange_account_connected: boolean;
    exchange_account_name?: string;
    destExchange?: Exchange;
    sourceExchange?: Exchange;
    sourceAccountAddress: string
}

const Summary: FC<SwapInfoProps> = ({ sourceAccountAddress, sourceCurrency, destinationCurrency, source: from, destination: to, requestedAmount, destinationAddress, refuel, exchange_account_connected, exchange_account_name, destExchange, sourceExchange, receiveAmount }) => {

    const {
        hideFrom,
        hideTo,
        account,
        appName,
        hideAddress
    } = useQueryState()

    const layerswapApiClient = new LayerSwapApiClient()
    const { data: partnerData } = useSWR<ApiResponse<Partner>>(appName && `/internal/apps?name=${appName}`, layerswapApiClient.fetcher)
    const partner = partnerData?.data

    const source = (hideFrom && partner && account) ? partner : from
    const destination = (hideTo && partner && account) ? partner : to

    const requestedAmountInUsd = requestedAmount && (sourceCurrency?.price_in_usd * requestedAmount).toFixed(2)
    const receiveAmountInUsd = receiveAmount ? (destinationCurrency?.price_in_usd * receiveAmount).toFixed(2) : undefined
    const nativeCurrency = refuel?.token

    const truncatedRefuelAmount = nativeCurrency && !!refuel ?
        truncateDecimals(refuel.amount, nativeCurrency?.precision) : null
    const refuelAmountInUsd = nativeCurrency && ((nativeCurrency?.price_in_usd || 1) * (truncatedRefuelAmount || 0)).toFixed(2)

    const destAddress = (hideAddress && hideTo && account) ? account : destinationAddress

    return (
        <div>
            <div className="font-normal flex flex-col w-full relative z-10 space-y-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        {
                            sourceExchange ?
                                <Image src={sourceExchange.logo} alt={sourceExchange.display_name} width={32} height={32} className="rounded-lg" />
                                : source ?
                                    <Image src={source.logo} alt={source.display_name} width={32} height={32} className="rounded-lg" />
                                    :
                                    null
                        }
                        <div>
                            <p className="text-primary-text text-sm leading-5">{sourceExchange ? sourceExchange?.display_name : source?.display_name}</p>
                            {
                                sourceExchange ?
                                    <p className="text-sm text-secondary-text">Exchange</p>
                                    : sourceAccountAddress ?
                                        isValidAddress(sourceAccountAddress, from) ?
                                            <div className="text-sm group/addressItem text-secondary-text">
                                                <ExtendedAddress address={addressFormat(sourceAccountAddress, from)} network={from} />
                                            </div>
                                            :
                                            <p className="text-sm text-secondary-text">{shortenAddress(sourceAccountAddress)}</p>
                                        :
                                        null
                            }
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        {
                            requestedAmount &&
                            <p className="text-primary-text text-sm">{truncateDecimals(requestedAmount, sourceCurrency.precision)} {sourceCurrency.symbol}</p>
                        }
                        <p className="text-secondary-text text-sm flex justify-end">${requestedAmountInUsd}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between  w-full ">
                    <div className="flex items-center gap-3">
                        {
                            destExchange ?
                                <Image src={destExchange.logo} alt={destExchange.display_name} width={32} height={32} className="rounded-lg" />
                                : destination ?
                                    <Image src={destination.logo} alt={destination.display_name} width={32} height={32} className="rounded-lg" />
                                    :
                                    null
                        }
                        <div className="group/addressItem text-sm text-secondary-text">
                            <p className="text-primary-text leading-5">{destExchange ? destExchange?.display_name : destination?.display_name}</p>
                            <ExtendedAddress address={addressFormat(destAddress, to)} network={to} />
                        </div>
                    </div>
                    {
                        receiveAmount != undefined ?
                            <div className="flex flex-col justify-end">
                                <p className="text-primary-text text-sm">{truncateDecimals(receiveAmount, destinationCurrency.precision)} {destinationCurrency.symbol}</p>
                                <p className="text-secondary-text text-sm flex justify-end">${receiveAmountInUsd}</p>
                            </div>
                            :
                            <div className="flex flex-col justify-end">
                                <div className="h-[10px] my-[5px] w-20 animate-pulse rounded bg-gray-500" />
                                <div className="h-[10px] my-[5px] w-10 animate-pulse rounded bg-gray-500 ml-auto" />
                            </div>
                    }
                </div>
                {
                    (!!refuel != undefined && nativeCurrency) ?
                        <div className="flex items-center justify-between w-full ">
                            <div className='flex items-center gap-3 text-sm'>
                                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg p-2 bg-primary/20">
                                    <Fuel className="h-5 w-5 text-primary" aria-hidden="true" />
                                </span>
                                <p>Refuel</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-primary-text text-sm">{truncatedRefuelAmount} {nativeCurrency?.symbol}</p>
                                <p className="text-secondary-text text-sm flex justify-end">${refuelAmountInUsd}</p>
                            </div>
                        </div>
                        :
                        <></>
                }
            </div>
        </div>
    )
}

export default Summary