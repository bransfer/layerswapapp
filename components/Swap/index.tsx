import { FC, useCallback } from 'react'
import { Widget } from '../Widget/Index';
import { useSwapDataState } from '../../context/swap';
import Withdraw from './Withdraw';
import Processing from './Withdraw/Processing';
import { BackendTransactionStatus, TransactionType } from '../../lib/layerSwapApiClient';
import { SwapStatus } from '../../Models/SwapStatus';

type Props = {
    type: "widget" | "contained",
}
import { useSwapTransactionStore } from '../../stores/swapTransactionStore';
import SubmitButton from '../buttons/submitButton';

const SwapDetails: FC<Props> = ({ type }) => {
    const { swapResponse } = useSwapDataState()
    const { swap } = swapResponse || {}

    const swapStatus = swap?.status;
    const storedWalletTransactions = useSwapTransactionStore()

    const swapInputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Input)
    const storedWalletTransaction = storedWalletTransactions.swapTransactions?.[swap?.id || '']

    const removeStoredTransaction = useCallback(() => {
        useSwapTransactionStore.getState().removeSwapTransaction(swap?.id || '');
    }, [swap?.id, storedWalletTransactions])

    if (!swap) return <>
        <div className="w-full h-[430px]">
            <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-6 py-1">
                    <div className="h-32 bg-secondary-700 rounded-lg"></div>
                    <div className="h-40 bg-secondary-700 rounded-lg"></div>
                    <div className="h-12 bg-secondary-700 rounded-lg"></div>
                </div>
            </div>
        </div>
    </>

    return (
        <>
            <Container type={type}>
                {
                    ((swapStatus === SwapStatus.UserTransferPending
                        && !(swapInputTransaction || storedWalletTransaction))) ?
                        <Withdraw />
                        :
                        <>
                            <Processing />
                            {
                                storedWalletTransaction?.status == BackendTransactionStatus.Failed &&
                                <SubmitButton isDisabled={false} isSubmitting={false} onClick={removeStoredTransaction}>
                                    Try again
                                </SubmitButton>
                            }
                        </>
                }
            </Container>
        </>
    )
}

const Container = ({ type, children }: Props & {
    children: JSX.Element | JSX.Element[]
}) => {
    if (type === "widget")
        return <Widget><>{children}</></Widget>
    else
        return <div className="w-full flex flex-col justify-between h-full space-y-5 text-secondary-text">
            {children}
        </div>

}

export default SwapDetails