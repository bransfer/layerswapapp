import { useCallback, useEffect, useMemo } from "react"
import useWallet from "../../../hooks/useWallet"
import SecondaryButton from "../../buttons/secondaryButton"
import { useFormikContext } from "formik";
import { SwapFormValues } from "../../DTOs/SwapFormValues";
import useBalance from "../../../hooks/useBalance";
import { useFee } from "../../../context/feeContext";
import { useBalancesState } from "../../../context/balances";
import { useQueryState } from "../../../context/query";
import upperCaseKeys from "../../utils/upperCaseKeys";

const MinMax = ({ onAddressGet }: { onAddressGet: (address: string) => void }) => {

    const { values, setFieldValue } = useFormikContext<SwapFormValues>();
    const { fromCurrency, from, to, destination_address } = values || {};
    const { minAllowedAmount, maxAllowedAmount: maxAmountFromApi } = useFee()
    const { balances, gases } = useBalancesState()
    const query = useQueryState()

    const { getAutofillProvider: getProvider } = useWallet()
    const provider = useMemo(() => {
        return from && getProvider(from)
    }, [from, getProvider])

    const { fetchBalance, fetchGas } = useBalance()

    const wallet = provider?.getConnectedWallet()

    const handleSetMinAmount = () => {
        setFieldValue('amount', minAllowedAmount);
    }

    const gasAmount = gases[from?.internal_name || '']?.find(g => g?.token === fromCurrency?.asset)?.gas || 0
    const walletBalance = wallet && balances[wallet.address]?.find(b => b?.network === from?.internal_name && b?.token === fromCurrency?.asset)
    const native_currency = from?.assets.find(a => a.is_native)

    let maxAllowedAmount: number | null = maxAmountFromApi || 0
    if (query.balances && fromCurrency) {
        try {
            const balancesFromQueries = new URL(window.location.href.replaceAll('&quot;', '"')).searchParams.get('balances');
            const parsedBalances = balancesFromQueries && JSON.parse(balancesFromQueries)
            let balancesTyped = parsedBalances
            if (balancesTyped && balancesTyped[fromCurrency.asset] && balancesTyped[fromCurrency.asset] > Number(minAllowedAmount)) {
                maxAllowedAmount = Math.min(maxAllowedAmount, balancesTyped[fromCurrency.asset]);
            }
        }
        // in case the query parameter had bad formatting just ignoe
        catch { }
    } else if (walletBalance && (walletBalance.amount >= Number(minAllowedAmount) && walletBalance.amount <= Number(maxAmountFromApi))) {
        if (((native_currency?.asset === fromCurrency?.asset) || !native_currency) && ((walletBalance.amount - gasAmount) >= Number(minAllowedAmount) && (walletBalance.amount - gasAmount) <= Number(maxAmountFromApi))) {
            maxAllowedAmount = walletBalance.amount - gasAmount
        }
        else maxAllowedAmount = walletBalance.amount
    }
    else {
        maxAllowedAmount = Number(maxAmountFromApi) || 0
    }


    const handleSetMaxAmount = useCallback(async () => {
        setFieldValue('amount', maxAllowedAmount);
        from && fetchBalance(from);
        from && fromCurrency && fetchGas(from, fromCurrency, destination_address || "");
    }, [from, to, fromCurrency, destination_address, maxAllowedAmount])

    useEffect(() => {
        wallet?.address && onAddressGet(wallet.address)
    }, [wallet])

    return (
        <div className="flex flex-col justify-center">
            <div className="text-xs flex flex-col items-center space-x-1 md:space-x-2 ml-2 md:ml-5 px-2">
                <div className="flex">
                    <SecondaryButton disabled={!minAllowedAmount} onClick={handleSetMinAmount} size="xs">
                        MIN
                    </SecondaryButton>
                    <SecondaryButton disabled={!maxAllowedAmount} onClick={handleSetMaxAmount} size="xs" className="ml-1.5">
                        MAX
                    </SecondaryButton>
                </div>
            </div>
        </div>
    )
}

export default MinMax