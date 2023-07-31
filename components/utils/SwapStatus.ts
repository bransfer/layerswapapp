import { PublishedSwapTransactions, PublishedSwapTransactionStatus, SwapItem, TransactionType } from "../../lib/layerSwapApiClient";
import { SwapStatus } from "../../Models/SwapStatus";
import { SwapStep, SwapWithdrawalStep } from "../../Models/Wizard";

export const GetSwapStep = (swap: SwapItem): SwapStep => {

    const swapStatus = swap?.status;

    const data: PublishedSwapTransactions = JSON.parse(localStorage.getItem('swapTransactions') || "{}")
    const txForSwap = data?.[swap.id];
    const swapInputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Input)

    if (swapStatus == SwapStatus.Completed)
        return SwapStep.Success;
    else if (swapStatus == SwapStatus.Failed || swapStatus == SwapStatus.Cancelled || swapStatus === SwapStatus.Expired)
        return SwapStep.Failed;
    else if (swapStatus == SwapStatus.UserTransferDelayed)
        return SwapStep.Delay;
    else if (swapStatus == SwapStatus.LsTransferPending)
        return SwapStep.LSTransferPending;
    else if (swapInputTransaction && swapStatus == SwapStatus.UserTransferPending)
        return SwapStep.TransactionDetected;
    else if (txForSwap && !swapInputTransaction)
        return SwapStep.TransactionDone;
    else
        return SwapStep.UserTransferPending
}

export const ResolvePollingInterval = (step: SwapStep): 10000 | 0 => {
    switch (step) {
        case SwapStep.Failed:
        case SwapStep.Delay:
        case SwapStep.Success:
            return 0;
        default:
            return 10000
    }
}