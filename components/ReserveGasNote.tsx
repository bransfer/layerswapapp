import { useBalancesState } from "../context/balances"
import useWallet from "../hooks/useWallet"
import WarningMessage from "./WarningMessage"
import { useFormikContext } from "formik"
import { SwapFormValues } from "./DTOs/SwapFormValues"
import { truncateDecimals } from "./utils/RoundDecimals"
import { useFee } from "../context/feeContext"
import { Balance, Gas } from "../Models/Balance"

const ReserveGasNote = ({ onSubmit }: { onSubmit: (walletBalance: Balance, networkGas: Gas) => void }) => {
    const {
        values,
    } = useFormikContext<SwapFormValues>();
    const { balances, gases } = useBalancesState()
    const { minAllowedAmount } = useFee()

    const { provider } = useWallet(values.from, 'autofil')
    const wallet = provider?.activeWallet

    const walletBalance = wallet && balances[wallet.address || '']?.find(b => b?.network === values?.from?.name && b?.token === values?.fromCurrency?.symbol)
    const networkGas = values.from?.name ?
        gases?.[values.from?.name]?.find(g => g?.token === values?.fromCurrency?.symbol)
        : null

    const mightBeAutOfGas = !!(networkGas && walletBalance?.isNativeCurrency && (Number(values.amount)
        + networkGas?.gas) > walletBalance.amount
        && minAllowedAmount
        && walletBalance.amount > minAllowedAmount
    )
    const gasToReserveFormatted = mightBeAutOfGas ? truncateDecimals(networkGas?.gas, values?.fromCurrency?.precision) : 0

    return (
        mightBeAutOfGas && gasToReserveFormatted > 0 &&
        <WarningMessage messageType="warning" className="mt-4">
            <div className="font-normal text-primary-text">
                <div>
                    You might not be able to complete the transaction.
                </div>
                <div onClick={() => onSubmit(walletBalance, networkGas)} className="cursor-pointer border-b border-dotted border-primary-text w-fit hover:text-primary hover:border-primary text-primary-text">
                    <span>Reserve</span> <span>{gasToReserveFormatted}</span> <span>{values?.fromCurrency?.symbol}</span> <span>for gas.</span>
                </div>
            </div>
        </WarningMessage>
    )
}

export default ReserveGasNote