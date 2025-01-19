import Image from "next/image";
import { FC } from "react";
import { truncateDecimals } from "../../utils/RoundDecimals";
import { Network, Token } from "../../../Models/Network";
import { addressFormat } from "../../../lib/address/formatter";
import { ExtendedAddress } from "../../Input/Address/AddressPicker/AddressWithIcon";
import { isValidAddress } from "../../../lib/address/validator";
import { ArrowDown } from "lucide-react";

type AtomicSummaryProps = {
    sourceCurrency: Token,
    destinationCurrency: Token,
    source: Network,
    destination: Network;
    requestedAmount: number | undefined;
    receiveAmount: number | undefined;
    destinationAddress: string;
    fee?: number,
    sourceAccountAddress?: string,
}

const Summary: FC<AtomicSummaryProps> = ({ sourceAccountAddress, sourceCurrency, destinationCurrency, source: from, destination: to, requestedAmount, destinationAddress, receiveAmount }) => {

    const source = from
    const destination = to

    const requestedAmountInUsd = requestedAmount && (sourceCurrency?.price_in_usd * requestedAmount).toFixed(2)
    const receiveAmountInUsd = receiveAmount ? (destinationCurrency?.price_in_usd * receiveAmount).toFixed(2) : undefined
    const destAddress = destinationAddress

    return (
        <div className='bg-secondary-800 rounded-componentRoundness p-3 w-full relative z-10'>
            <div className="font-normal flex flex-col w-full relative z-10 space-y-3">
                <div className="flex items-center justify-between w-full bg-secondary-600/60 p-2 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Image src={source.logo} alt={source.display_name} width={32} height={32} className="rounded-lg" />
                        <div>
                            <p className="text-primary-text text-sm leading-5">{source?.display_name}</p>
                            {
                                sourceAccountAddress && isValidAddress(sourceAccountAddress, from) ?
                                    <div className="text-sm group/addressItem text-secondary-text">
                                        <ExtendedAddress address={addressFormat(sourceAccountAddress, from)} network={from} />
                                    </div>
                                    :
                                    <p className="text-sm text-secondary-text">Network</p>
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
                <div className='absolute right-[calc(50%-16px)] top-[37px] z-10 border-2 border-secondary-900 bg-secondary-900 rounded-xl'>
                    <ArrowDown className="w-6 h-auto p-0.5 bg-secondary-900 border-2 border-secondary-500 rounded-lg disabled:opacity-30" />
                </div>
                <div className="flex items-center justify-between w-full bg-secondary-600/60 p-2 rounded-xl">
                    <div className="flex items-center gap-3">
                        {
                            <Image src={destination.logo} alt={destination.display_name} width={32} height={32} className="rounded-lg" />

                        }
                        <div className="group/addressItem text-sm text-secondary-text">
                            <p className="text-primary-text leading-5">{destination?.display_name}</p>
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
            </div>
        </div>
    )
}

export default Summary