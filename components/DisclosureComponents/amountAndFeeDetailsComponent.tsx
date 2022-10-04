import { ChevronDownIcon } from '@heroicons/react/outline'
import { Disclosure } from "@headlessui/react";
import HoverTooltip from '../Tooltips/HoverTooltip';
import { Currency } from '../../Models/Currency';
import { Exchange } from '../../Models/Exchange';
import { GetExchangeFee, CalculateFee, CalculateReceiveAmount } from '../../lib/fees';
import { CryptoNetwork } from '../../Models/CryptoNetwork';
import { getCurrencyDetails } from '../../helpers/currencyHelper';
import { SwapType } from '../../lib/layerSwapApiClient';

type Props = {
    amount: number,
    currency: Currency,
    exchange: Exchange,
    swapType: SwapType,
    network: CryptoNetwork,
}

export default function AmountAndFeeDetails({ amount, currency, exchange, network, swapType }: Props) {
    let exchangeFee = GetExchangeFee(currency, exchange);
    let fee = CalculateFee(amount, currency, exchange, network, swapType);
    let receive_amount = CalculateReceiveAmount(amount, currency, exchange, network, swapType);
    const currencyDetails = getCurrencyDetails(currency, exchange, network, swapType)

    return (
        <>
            <div className="mx-auto w-full rounded-lg border border-darkblue-500 hover:border-darkblue-50 bg-darkblue-700 p-2">
                <Disclosure>
                    {({ open }) => (
                        <>
                            <Disclosure.Button className="items-center flex w-full relative justify-between rounded-lg p-1.5 text-left text-base font-medium">
                                <span className="md:font-semibold text-sm md:text-base text-primary-text">You will receive</span>
                                <span className="absolute right-9">
                                    {
                                        receive_amount ?
                                            <span className="font-semibold md:font-bold text-center">
                                                {receive_amount.toFixed(currencyDetails?.precision)}
                                                <span>
                                                    {
                                                        ` ${currencyDetails?.asset || ""}`
                                                    }
                                                </span>
                                            </span>
                                            : '-'
                                    }

                                </span>
                                <ChevronDownIcon
                                    className={`${open ? 'rotate-180 transform' : ''
                                        } h-4 w-4 text-primary-text`}
                                />
                            </Disclosure.Button>
                            <Disclosure.Panel className="p-2 text-sm text-primary-text font-normal">
                                <>
                                    <div className="mt-2 flex flex-row items-baseline justify-between">
                                        <label className="inline-flex items-center text-left">
                                            Layerswap Fee
                                        </label>
                                        <span className="text-center text-white">
                                            {fee.toFixed(currencyDetails?.precision)}
                                            <span>  {currencyDetails?.asset} </span>
                                        </span>
                                    </div>
                                    {
                                        swapType === SwapType.OnRamp &&
                                        <div className="mt-2 flex flex-row items-baseline justify-between">
                                            <label className="inline-flex text-left">
                                                Exchange Fee
                                                <HoverTooltip text="Some exchanges charge a fee to cover gas fees of on-chain transfers." moreClassNames='w-36' />
                                            </label>
                                            <span className="text-center text-white">
                                                {exchangeFee.toFixed(currencyDetails?.precision)}
                                                <span>  {currencyDetails?.asset} {exchange?.internal_name === "binance" && <span className='inline-flex'>(Refundable) <HoverTooltip text="After initiating the withdrawal, this fee will be refunded to your Binance account." moreClassNames='w-36' /></span>}</span>
                                            </span>
                                        </div>
                                    }

                                    <div className="mt-2 flex flex-row items-baseline justify-between">
                                        <label className="block text-center">
                                            Time Of Arrival
                                        </label>
                                        <span className="text-center text-white">
                                            ~1-2 minutes
                                        </span>
                                    </div>
                                </>
                            </Disclosure.Panel>
                        </>
                    )}
                </Disclosure>
            </div>
        </>
    )
}