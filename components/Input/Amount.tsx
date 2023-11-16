import { useFormikContext } from "formik";
import { forwardRef, useCallback, useRef, useState } from "react";
import { useSettingsState } from "../../context/settings";
import { CalculateMaxAllowedAmount, CalculateMinAllowedAmount } from "../../lib/fees";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import NumericInput from "./NumericInput";
import SecondaryButton from "../buttons/secondaryButton";
import { useWalletState, useWalletUpdate } from "../../context/wallet";
import { truncateDecimals } from "../utils/RoundDecimals";
import { useAccount } from "wagmi";
import { useQueryState } from "../../context/query";

const AmountField = forwardRef(function AmountField(_, ref: any) {

    const { values, setFieldValue, handleChange } = useFormikContext<SwapFormValues>();
    const [requestedAmountInUsd, setRequestedAmountInUsd] = useState<string>();
    const { networks, currencies } = useSettingsState()
    const query = useQueryState()
    const { currency, from, to, amount, destination_address } = values
    const { address } = useAccount()
    const { balances, isBalanceLoading, gases, isGasLoading } = useWalletState()
    const gasAmount = gases[from?.internal_name || '']?.find(g => g?.token === currency?.asset)?.gas || 0
    const { getBalance, getGas } = useWalletUpdate()
    const name = "amount"
    const walletBalance = balances?.find(b => b?.network === from?.internal_name && b?.token === currency?.asset)
    const walletBalanceAmount = walletBalance?.amount && truncateDecimals(walletBalance?.amount, currency?.precision)

    const minAllowedAmount = CalculateMinAllowedAmount(values, networks, currencies);
    const maxAllowedAmount = CalculateMaxAllowedAmount(values, query.balances as string, walletBalance?.amount, gasAmount, minAllowedAmount)
    const maxAllowedDisplayAmont = truncateDecimals(maxAllowedAmount, currency?.precision)

    const placeholder = (currency && from && to && !isBalanceLoading && !isGasLoading) ? `${minAllowedAmount} - ${maxAllowedDisplayAmont}` : '0.01234'
    const step = 1 / Math.pow(10, currency?.precision || 1)
    const amountRef = useRef(ref)

    const updateRequestedAmountInUsd = useCallback((requestedAmount: number) => {
        if (currency?.usd_price && !isNaN(requestedAmount)) {
            setRequestedAmountInUsd((currency?.usd_price * requestedAmount).toFixed(2));
        } else {
            setRequestedAmountInUsd(undefined);
        }
    }, [requestedAmountInUsd, currency]);

    const handleSetMinAmount = () => {
        setFieldValue(name, minAllowedAmount);
        updateRequestedAmountInUsd(minAllowedAmount);
    }

    const handleSetMaxAmount = useCallback(() => {
        setFieldValue(name, maxAllowedAmount);
        address && from && getBalance(from);
        address && from && currency && getGas(from, currency, destination_address || address);
        updateRequestedAmountInUsd(maxAllowedAmount)
    }, [address, from, currency, destination_address, maxAllowedAmount])

    return (<>
        <AmountLabel detailsAvailable={!!(from && to && amount)}
            maxAllowedAmount={maxAllowedDisplayAmont}
            minAllowedAmount={minAllowedAmount}
            isBalanceLoading={(isBalanceLoading || isGasLoading)}
        />
        <div className="flex w-full justify-between bg-secondary-700 rounded-lg">
            <div className="relative">
                <NumericInput
                    disabled={!currency}
                    placeholder={placeholder}
                    min={minAllowedAmount}
                    max={maxAllowedAmount}
                    step={isNaN(step) ? 0.01 : step}
                    name={name}
                    ref={amountRef}
                    precision={currency?.precision}
                    className="rounded-r-none text-primary-text w-full !pb-6 text-lg"
                    onChange={e => {
                        /^[0-9]*[.,]?[0-9]*$/.test(e.target.value) && handleChange(e);
                        updateRequestedAmountInUsd(parseFloat(e.target.value))
                    }}
                >
                    {requestedAmountInUsd ? (
                        <span className="absolute block w-full min-w-0 rounded-lg font-semibold border-0 pl-3 text-xs pb-2">
                            ${requestedAmountInUsd}
                        </span>
                    ) : null}
                </NumericInput>
            </div>
            <div className="inline-flex items-center">
                {
                    from && to && currency ? <div className="text-xs flex flex-col items-center space-x-1 md:space-x-2 ml-2 md:ml-5 pt-2 px-2">
                        <div className="flex">
                            <SecondaryButton onClick={handleSetMinAmount} size="xs">
                                MIN
                            </SecondaryButton>
                            <SecondaryButton onClick={handleSetMaxAmount} size="xs" className="ml-1.5">
                                MAX
                            </SecondaryButton>
                        </div>
                        {
                            walletBalanceAmount != undefined && !isNaN(walletBalanceAmount) &&
                            <div className='bg-secondary-700 py-2 px-2 pl-0 text-xs'>
                                <span>Balance:&nbsp;</span>
                                {isBalanceLoading ?
                                    <span className="ml-1 h-3 w-6 rounded-sm bg-gray-500 animate-pulse" />
                                    :
                                    <span>{walletBalanceAmount}</span>}
                            </div>
                        }
                    </div>
                        : <></>
                }

            </div>
        </div>
    </>)
});

type AmountLabelProps = {
    detailsAvailable: boolean;
    minAllowedAmount: number;
    maxAllowedAmount: number;
    isBalanceLoading: boolean;
}
const AmountLabel = ({
    detailsAvailable,
    minAllowedAmount,
    maxAllowedAmount,
    isBalanceLoading,
}: AmountLabelProps) => {
    return <div className="flex items-center w-full justify-between">
        <div className="flex items-center space-x-2">
            <p className="block font-semibold text-secondary-text text-sm">Amount</p>
            {
                detailsAvailable &&
                <div className="text-xs text-secondary-text flex items-center space-x-1">
                    <span>(Min:&nbsp;</span>{minAllowedAmount}<span>&nbsp;- Max:&nbsp;</span>{isBalanceLoading ? <span className="ml-1 h-3 w-6 rounded-sm bg-gray-500 animate-pulse" /> : <span>{maxAllowedAmount}</span>}<span>)</span>
                </div>
            }
        </div>
    </div>
}

export default AmountField