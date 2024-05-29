import { useCallback, useEffect, useMemo } from "react"
import useWallet from "../../../hooks/useWallet"
import SecondaryButton from "../../buttons/secondaryButton"
import { useFormikContext } from "formik";
import { SwapFormValues } from "../../DTOs/SwapFormValues";
import useBalance from "../../../hooks/useBalance";
import { useFee } from "../../../context/feeContext";
import { useBalancesState } from "../../../context/balances";
import { useQueryState } from "../../../context/query";
import { Token } from "../../../Models/Network";
import { QueryParams } from "../../../Models/QueryParams";
import { Balance } from "../../../Models/Balance";

const MinMax = ({ onAddressGet }: { onAddressGet: (address: string) => void }) => {

    const { values, setFieldValue } = useFormikContext<SwapFormValues>();
    const { fromCurrency, from, to, toCurrency, destination_address, amount } = values || {};
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

    const gasAmount = gases[from?.name || '']?.find(g => g?.token === fromCurrency?.symbol)?.gas || 0
    const walletBalance = wallet && balances[wallet.address]?.find(b => b?.network === from?.name && b?.token === fromCurrency?.symbol)
    const native_currency = from?.token

    const maxAllowedAmount = calculateMaxAmount(maxAmountFromApi, query, fromCurrency, minAllowedAmount, walletBalance, gasAmount, native_currency)

    const handleSetMaxAmount = useCallback(async () => {
        const balance = from && native_currency && await fetchBalance(from, native_currency);
        const maxAmount = calculateMaxAmount(maxAmountFromApi, query, fromCurrency, minAllowedAmount, balance, gasAmount, native_currency)
        setFieldValue('amount', maxAmount);

        from &&
            fromCurrency &&
            amount && fetchGas(from, fromCurrency, destination_address || "");

    }, [from, fromCurrency, destination_address, minAllowedAmount, fetchBalance, fetchGas, setFieldValue, amount, query, gasAmount, native_currency])

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


const calculateMaxAmount = (maxAmountFromApi: number | undefined, query: QueryParams, fromCurrency: Token | undefined, minAllowedAmount: number | undefined, walletBalance: Balance | undefined | null, gasAmount: number, native_currency: Token | undefined) => {
    let maxAllowedAmount: number | null = maxAmountFromApi || 0

    if (query.balances && fromCurrency) {
        try {
            const balancesFromQueries = new URL(window.location.href.replaceAll('&quot;', '"')).searchParams.get('balances');
            const parsedBalances = balancesFromQueries && JSON.parse(balancesFromQueries)
            let balancesTyped = parsedBalances
            if (balancesTyped && balancesTyped[fromCurrency.symbol] && balancesTyped[fromCurrency.symbol] > Number(minAllowedAmount)) {
                maxAllowedAmount = Math.min(maxAllowedAmount, balancesTyped[fromCurrency.symbol]);
            }
        }
        // in case the query parameter had bad formatting just ignoe
        catch { }
    } else if (walletBalance && (walletBalance.amount >= Number(minAllowedAmount) && walletBalance.amount <= Number(maxAmountFromApi))) {
        if (((native_currency?.symbol === fromCurrency?.symbol) || !native_currency) && ((walletBalance.amount - gasAmount) >= Number(minAllowedAmount) && (walletBalance.amount - gasAmount) <= Number(maxAmountFromApi))) {
            maxAllowedAmount = walletBalance.amount - gasAmount
        }
        else maxAllowedAmount = walletBalance.amount
    }
    else {
        maxAllowedAmount = Number(maxAmountFromApi) || 0
    }

    return maxAllowedAmount
}

export default MinMax