
import useSWR from "swr"
import LayerSwapApiClient, { SwapResponse, TransactionType } from "../../lib/layerSwapApiClient"
import { ApiResponse } from "../../Models/ApiResponse"
import Image from 'next/image';
import { useQueryState } from "../../context/query"
import { Partner } from "../../Models/Partner"
import { addressEnding, shortenEmail } from "../utils/ShortenAddress"
import KnownInternalNames from "../../lib/knownIds"
import { ChevronRightIcon } from 'lucide-react'
import StatusIcon from "./StatusIcons"
import { FC } from "react"
import { findIndexOfFirstNonZeroAfterComma, truncateDecimalsToFloor } from "../utils/RoundDecimals";
import useWallet from "../../hooks/useWallet";
import AddressIcon from "../AddressIcon";
import { addressFormat } from "../../lib/address/formatter";
import { SwapStatus } from "../../Models/SwapStatus";
import { Wallet } from "../../Models/WalletProvider";

type SwapInfoProps = {
    className?: string,
    swapResponse: SwapResponse,
    wallets: Wallet[]
}
const HistorySummary: FC<SwapInfoProps> = ({
    swapResponse,
    wallets,
    className
}) => {

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
    const { swap, quote } = swapResponse

    const { source_network, destination_network, source_token, destination_token, source_exchange, destination_exchange, destination_address, exchange_account_connected, exchange_account_name, requested_amount } = swap || {}

    const source = hideFrom ? partner : (source_exchange || source_network)
    const destination = hideTo ? partner : (destination_exchange || destination_network)

    const sourceTransaction = swap.transactions?.find(t => t.type === TransactionType.Input)
    const destinationTransaction = swap.transactions?.find(t => t.type === TransactionType.Output)
    const sourceAddressFromInput = sourceTransaction?.from;
    const calculatedReceiveAmount = destinationTransaction?.amount ?? quote?.receive_amount

    let sourceAccountAddress: string | undefined = undefined
    if (source_exchange) {
        sourceAccountAddress = "Exchange"
    }
    else if (sourceAddressFromInput) {
        sourceAccountAddress = addressEnding(sourceAddressFromInput)
    }
    else if (source_network?.name === KnownInternalNames.Exchanges.Coinbase && exchange_account_connected) {
        sourceAccountAddress = shortenEmail(exchange_account_name, 10);
    }

    const destAddress = (hideAddress && hideTo && account) ? account : destination_address

    const source_wallet = sourceAddressFromInput ? wallets.find(w => (addressFormat(w.address, source_network) === addressFormat(sourceAddressFromInput, source_network))) : null
    const destination_wallet = wallets.find(w => addressFormat(w.address, destination_network) === addressFormat(destAddress, destination_network))

    return (
        source_token && <>
            <div className={`${className || ''} bg-secondary-700 z-10 p-3 w-full relative font-normal space-y-3 hover:bg-secondary-600 rounded-xl overflow-hidden cursor-pointer`}>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 w-full items-center">
                    {source?.display_name !== destination?.display_name ?
                        <div className="col-span-1 h-11 w-11 relative min-w-11">
                            {
                                source &&
                                <Image
                                    src={source.logo}
                                    alt={source.display_name}
                                    width={28}
                                    height={28}
                                    className="rounded" />
                            }
                            {
                                destination &&
                                <Image
                                    src={destination.logo}
                                    alt={destination.display_name}
                                    width={28}
                                    height={28}
                                    className="rounded absolute left-4 top-4" />
                            }
                        </div>
                        :
                        <div className="w-11 h-11 col-span-1">
                            {
                                source &&
                                <Image
                                    src={source.logo}
                                    alt={source.display_name}
                                    width={44}
                                    height={44}
                                    className="rounded-md" />
                            }
                        </div>
                    }
                    <div className="col-span-5 sm:col-span-7 flex flex-col gap-0.5 w-full">

                        <div className="flex items-baseline justify-between w-full overflow-hidden">
                            <p className="text-secondary-text text-sm sm:text-base truncate max-w-[55%]">
                                {
                                    source?.display_name === destination?.display_name ?
                                        <>
                                            <span>Swap in</span> <span>{source?.display_name}</span>
                                        </>
                                        :
                                        <>
                                            <span>{source?.display_name} </span> <span>to</span> <span>{destination?.display_name}</span>
                                        </>
                                }
                            </p>

                            <p className="font-light text-secondary-text text-xs sm:text-sm ">{smartDecimalTruncate(sourceTransaction?.amount || swap.requested_amount, source_token?.price_in_usd)} {source_token.symbol}</p>
                        </div>
                        <div className="flex w-full justify-between items-start text-end">
                            <div className="flex items-center gap-0.5">
                                {
                                    sourceAccountAddress &&
                                    <div className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-secondary-950 rounded-md">
                                        {
                                            source_wallet?.icon ?
                                                <source_wallet.icon className="h-3.5 w-3.5" />
                                                :
                                                (
                                                    sourceAddressFromInput && !source_exchange ?
                                                        <div className='flex bg-secondary-400 text-primary-text  items-center justify-center rounded h-3.5 overflow-hidden w-3.5'>
                                                            <AddressIcon className="scale-150 h-3.5 w-3.5" address={sourceAddressFromInput} size={14} />
                                                        </div>
                                                        :
                                                        null
                                                )
                                        }
                                        <p className="text-secondary-text text-xs">{sourceAccountAddress}</p>
                                    </div>
                                }
                                {
                                    addressFormat(destAddress, destination_network) !== (sourceAddressFromInput ? addressFormat(sourceAddressFromInput, source_network) : null) &&
                                    <>
                                        <ChevronRightIcon className="h-3 w-3" />
                                        <div className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-secondary-950 rounded-md">
                                            {
                                                destination_wallet?.icon ?
                                                    <destination_wallet.icon className="h-3.5 w-3.5" />
                                                    :
                                                    !destination_exchange &&
                                                    <div className='flex bg-secondary-400 text-primary-text  items-center justify-center rounded h-3.5 overflow-hidden w-3.5'>
                                                        <AddressIcon className="scale-150 h-3.5 w-3.5" address={destAddress} size={14} />
                                                    </div>
                                            }
                                            <p className="text-secondary-text text-xs">{destination_exchange ? 'Exchange' : addressEnding(destAddress)}</p>
                                        </div>

                                    </>
                                }
                            </div>
                            <p className="font-medium text-primary-text text-sm sm:text-lg leading-5 sm:leading-5">{smartDecimalTruncate(calculatedReceiveAmount, destination_token?.price_in_usd)} {destination_token.symbol}</p>
                        </div>
                    </div>
                </div>
                {
                    swap.status !== SwapStatus.Completed &&
                    <StatusIcon swap={swap} withBg />
                }
            </div>
        </>
    )
}

const smartDecimalTruncate = (value: number, price_in_usd: number) => {
    let decimals = findIndexOfFirstNonZeroAfterComma((0.01 / Number(price_in_usd.toFixed()))) || 0
    let truncatedAmount = truncateDecimalsToFloor(value, decimals)

    if (truncatedAmount === 0) {
        while (truncatedAmount === 0) {
            decimals += 1
            truncatedAmount = truncateDecimalsToFloor(value, decimals)
        }
    }

    return truncateDecimalsToFloor(value, decimals)
}


export default HistorySummary