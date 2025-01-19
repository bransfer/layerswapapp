import { FC } from "react"
import resolveError from "./resolveError"
import { ActionData } from "./sharedTypes"
import { BaseError } from 'viem'
import { datadogRum } from '@datadog/browser-rum';
import TransactionMessages from "../../messages/TransactionMessages";

type TransactionMessageProps = {
    wait?: ActionData,
    transaction: ActionData,
    applyingTransaction: boolean,
    activeAddress: string | undefined
    selectedSourceAddress: string | undefined
}

const TransactionMessage: FC<TransactionMessageProps> = ({
    wait, transaction, applyingTransaction, activeAddress, selectedSourceAddress
}) => {
    const transactionResolvedError = resolveError(transaction?.error as BaseError)
    const hasError = transaction?.isError || wait?.isError

    if (wait?.isPending || applyingTransaction) {
        return <TransactionMessages.TransactionInProgressMessage />
    }
    else if (transaction?.isPending || applyingTransaction) {
        return <TransactionMessages.ConfirmTransactionMessage />
    }
    else if (transaction?.isError && transactionResolvedError === "insufficient_funds") {
        return <TransactionMessages.InsufficientFundsMessage />
    }
    else if (transaction?.isError && transactionResolvedError === "transaction_rejected") {
        return <TransactionMessages.TransactionRejectedMessage />
    }
    else if (transaction.isError && activeAddress && selectedSourceAddress && (activeAddress?.toLowerCase() !== selectedSourceAddress?.toLowerCase())) {
        return <TransactionMessages.WaletMismatchMessage address={selectedSourceAddress} />
    }
    else if (hasError) {
        const unexpectedError = transaction?.error?.['data']?.message || transaction?.error
            || wait?.error

        const renderingError = new Error(unexpectedError.message);
        renderingError.name = `SwapWithdrawalError`;
        renderingError.cause = unexpectedError;
        datadogRum.addError(renderingError);

        return <TransactionMessages.UexpectedErrorMessage message={unexpectedError?.message} />
    }
    else return <></>
}

export default TransactionMessage
