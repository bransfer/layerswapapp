import { FC } from "react";
import { Layer } from "../../Models/Layer";
import { GetDefaultAsset } from "../../helpers/settingsHelper";
import { NetworkCurrency } from "../../Models/CryptoNetwork";
import { Fee } from "../../context/feeContext";
import { Fuel } from "lucide-react";

type WillReceiveProps = {
    sourceIsExchange: boolean;
    currency?: NetworkCurrency | null;
    to: Layer | undefined | null;
    refuel: boolean;
    fee: Fee | undefined
    onButtonClick: () => void
}
export const ReceiveAmounts: FC<WillReceiveProps> = ({ sourceIsExchange, currency, to, refuel, fee, onButtonClick }) => {
    const receive_amount = sourceIsExchange ? fee?.manualReceiveAmount : fee?.walletReceiveAmount
    const parsedReceiveAmount = parseFloat(receive_amount?.toFixed(currency?.precision) || "")
    const destinationNetworkCurrency = (to && currency) ? GetDefaultAsset(to, currency.asset) : null

    const destinationAsset = to?.assets?.find(c => c?.asset === currency?.asset)
    const destinationNativeAsset = to?.assets.find(a => a.is_native)
    const receiveAmountInUsd = receive_amount && destinationAsset ? (destinationAsset?.usd_price * receive_amount).toFixed(2) : undefined

    return <div className="flex items-start justify-between w-full">
        <span className="md:font-semibold text-sm md:text-base text-primary-buttonTextColor leading-8 md:leading-8 flex-1">
            <span>
                You will receive
            </span>
        </span>
        <div className='flex items-end flex-col'>
            <span className="text-sm md:text-base">
                {
                    parsedReceiveAmount > 0 ?
                        <div className="font-semibold md:font-bold text-right leading-8">
                            <div className="flex items-center">
                                <p>
                                    <>{parsedReceiveAmount}</>
                                    &nbsp;
                                    <span>
                                        {destinationNetworkCurrency?.asset}
                                    </span>
                                    {
                                        receiveAmountInUsd !== undefined && Number(receiveAmountInUsd) > 0 &&
                                        <span className="text-secondary-text text-xs font-medium ml-1 block md:inline-block">
                                            (${receiveAmountInUsd})
                                        </span>
                                    }
                                </p>
                            </div>
                            {
                                refuel ?
                                    <p onClick={() => onButtonClick()} className='flex cursor-pointer justify-end rounded-md gap-1 items-center text-xs text-primary-buttonTextColor leading-8 md:leading-none font-semibold'>
                                        <span>+</span> <span>{fee?.refuelAmount} {destinationNativeAsset?.asset}</span> <span className="bg-primary/20 p-1 rounded-md"><Fuel className="h-3 w-3 text-primary" /></span>
                                    </p>
                                    :
                                    <></>
                            }
                        </div>
                        : '-'
                }
            </span>
        </div>
    </div>
}