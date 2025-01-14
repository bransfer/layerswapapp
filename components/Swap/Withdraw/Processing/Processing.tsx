import { ExternalLink } from 'lucide-react';
import { FC, useCallback, useEffect, useRef } from 'react'
import { Widget } from '../../../Widget/Index';
import shortenAddress from '../../../utils/ShortenAddress';
import Steps from '../../StepsComponent';
import SwapSummary from '../../Summary';
import LayerSwapApiClient, { BackendTransactionStatus, TransactionType, TransactionStatus, SwapResponse, Transaction } from '../../../../lib/layerSwapApiClient';
import { truncateDecimals } from '../../../utils/RoundDecimals';
import { SwapStatus } from '../../../../Models/SwapStatus';
import { SwapFailReasons } from '../../../../Models/RangeError';
import { Gauge } from '../../../gauge';
import Failed from '../Failed';
import { Progress, ProgressStates, ProgressStatus, StatusStep } from './types';
import { useSwapTransactionStore } from '../../../../stores/swapTransactionStore';
import FormattedAverageCompletionTime from '../../../Common/FormattedAverageCompletionTime';
import CountdownTimer from '../../../Common/CountDownTimer';
import useSWR from 'swr';
import { ApiResponse } from '../../../../Models/ApiResponse';
import { datadogRum } from '@datadog/browser-rum';
import { useIntercom } from 'react-use-intercom';
import { useAuthState } from '../../../../context/authContext';
import logError from '../../../../lib/logError';

type Props = {
    swapResponse: SwapResponse;
}

const Processing: FC<Props> = ({ swapResponse }) => {

    const { swap, refuel, quote } = swapResponse
    const { boot, show, update } = useIntercom();
    const { email, userId } = useAuthState();
    const { setSwapTransaction, swapTransactions } = useSwapTransactionStore();

    const {
        source_network,
        destination_network
    } = swap

    const updateWithProps = () => update({ userId, customAttributes: { swapId: swap.id, email: email, } });
    const startIntercom = useCallback(() => {
        boot();
        show();
        updateWithProps();
    }, [boot, show, updateWithProps]);

    const input_tx_explorer = source_network?.transaction_explorer_template
    const output_tx_explorer = destination_network?.transaction_explorer_template

    const swapInputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Input)
    const storedWalletTransaction = swapTransactions?.[swap?.id]

    const transactionHash = swapInputTransaction?.transaction_hash || storedWalletTransaction?.hash
    const swapOutputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Output)
    const swapRefuelTransaction = swap?.transactions?.find(t => t.type === TransactionType.Refuel)

    const apiClient = new LayerSwapApiClient()
    const { data: inputTxStatusData } = useSWR<ApiResponse<{ status: TransactionStatus }>>((transactionHash && swapInputTransaction?.status !== BackendTransactionStatus.Completed) ? [source_network?.name, transactionHash] : null, ([network, tx_id]) => apiClient.GetTransactionStatus(network, tx_id as any), { dedupingInterval: 6000 })

    const inputTxStatus = swapInputTransaction ? swapInputTransaction.status : inputTxStatusData?.data?.status.toLowerCase() as TransactionStatus

    const loggedNotDetectedTxAt = useRef<number | null>(null);

    useEffect(() => {
        if (inputTxStatus === TransactionStatus.Completed || inputTxStatus === TransactionStatus.Pending) {
            if (swap?.transactions?.find(t => t.type === TransactionType.Input) || !swap) {
                return
            }
            if (Date.now() - (loggedNotDetectedTxAt.current || storedWalletTransaction.timestamp) > 60000) {
                loggedNotDetectedTxAt.current = Date.now();
                logError(`Transaction not detected in ${swap.source_network.name}. Tx hash: ${transactionHash}. Tx status: ${inputTxStatus}. Swap id: ${swap.id}. ${source_network.display_name} explorer: ${source_network?.transaction_explorer_template?.replace("{0}", transactionHash)} . LS explorer: https://layerswap.io/explorer/${storedWalletTransaction?.hash} `);
            }
        }
    }, [swap, storedWalletTransaction]);

    useEffect(() => {
        if (storedWalletTransaction?.status !== inputTxStatus) setSwapTransaction(swap?.id, inputTxStatus, storedWalletTransaction?.hash)
    }, [inputTxStatus])

    useEffect(() => {
        if (inputTxStatus === TransactionStatus.Failed) {
            const err = new Error("Transaction failed")
            const renderingError = new Error(`Swap:${swap?.id} transaction:${transactionHash} failed`);
            renderingError.name = `TransactionFailed`;
            renderingError.cause = err;
            datadogRum.addError(renderingError);
        }
    }, [inputTxStatus, transactionHash, swap?.id])

    const truncatedRefuelAmount = refuel && truncateDecimals(refuel.amount, refuel.token?.precision)

    const progressStatuses = getProgressStatuses(swapResponse, inputTxStatusData?.data?.status.toLowerCase() as TransactionStatus)
    const stepStatuses = progressStatuses.stepStatuses;

    const outputPendingDetails = quote?.avg_completion_time && <div className='flex items-center space-x-1'>
        <span>Estimated time:</span>
        <div className='text-primary-text'>
            <FormattedAverageCompletionTime avgCompletionTime={quote?.avg_completion_time} />
        </div>
    </div>

    const countDownTimer = quote?.avg_completion_time && <div className='flex items-center space-x-1'>
        <div className='text-primary-text'>
            <CountdownTimer initialTime={String(quote?.avg_completion_time)} swap={swap} />
        </div>
    </div>

    const progressStates: ProgressStates = {
        "input_transfer": {
            upcoming: {
                name: 'Waiting for your transfer',
                description: null
            },
            current: {
                name: 'Processing your deposit',
                description: <div className='flex space-x-1'>
                    <div className='flex items-center space-x-1'>
                        <div className='underline hover:no-underline flex items-center space-x-1'>
                            <a target={"_blank"} href={input_tx_explorer?.replace("{0}", transactionHash)}>{shortenAddress(transactionHash)}</a>
                            <ExternalLink className='h-4' />
                        </div>
                    </div>
                    <div>
                        <span>
                            {swapInputTransaction && swapInputTransaction?.confirmations && (
                                <div>
                                    <span className='whitespace-nowrap'>| Confirmations</span>
                                    <span className="text-primary-text ml-1">
                                        <span>{swapInputTransaction?.confirmations >= swapInputTransaction?.max_confirmations
                                            ? swapInputTransaction?.max_confirmations
                                            : swapInputTransaction?.confirmations}</span>
                                        <span>/</span>{swapInputTransaction?.max_confirmations}
                                    </span>
                                </div>
                            )}
                        </span>
                    </div>
                </div>
            },
            complete: {
                name: `Your deposit is confirmed`,
                description: <div className='flex items-center space-x-1'>
                    <span>Transaction: {swapInputTransaction?.confirmations} {swapInputTransaction?.max_confirmations}</span>
                    <div className='underline hover:no-underline flex items-center space-x-1'>
                        <a target={"_blank"} href={input_tx_explorer?.replace("{0}", transactionHash)}>{shortenAddress(transactionHash)}</a>
                        <ExternalLink className='h-4' />
                    </div>
                </div>
            },
            failed: {
                name: `The transfer failed`,
                description: <div className='flex space-x-1'>
                    <div className='space-x-1 text-primary-text'>
                        {inputTxStatus === TransactionStatus.Failed ?
                            <div className="flex flex-col">
                                <p>Check the transfer in the explorer</p>
                                <div className='underline hover:no-underline flex items-center space-x-1'>
                                    <a target={"_blank"} href={input_tx_explorer?.replace("{0}", transactionHash)}>{shortenAddress(transactionHash)}</a>
                                    <ExternalLink className='h-4' />
                                </div>
                            </div>
                            :
                            swap?.fail_reason == SwapFailReasons.RECEIVED_MORE_THAN_VALID_RANGE ?
                                "Your deposit is higher than the max limit. We'll review and approve your transaction in up to 2 hours."
                                :
                                swap?.fail_reason == SwapFailReasons.RECEIVED_LESS_THAN_VALID_RANGE ?
                                    "Your deposit is lower than the minimum required amount. Unfortunately, we can't process the transaction. Please contact support to check if you're eligible for a refund."
                                    :
                                    <div><span className='text-secondary-text'>Something went wrong while processing the transfer.</span> <a className='underline hover:cursor-pointer text-secondary-text' onClick={() => startIntercom()}> please contact our support.</a></div>
                        }
                    </div>
                </div>
            },
            delayed: {
                name: `This transfer is being delayed by Coinbase`,
                description: null
            }
        },
        "output_transfer": {
            upcoming: {
                name: `Sending ${swap.destination_token.symbol} to your address`,
                description: null
            },
            current: {
                name: `Sending ${swap.destination_token.symbol} to your address`,
                description: null
            },
            complete: {
                name: `${swapOutputTransaction?.amount} ${swap?.destination_token.symbol} was sent to your address`,
                description: swapOutputTransaction ? <div className="flex flex-col">
                    <div className='flex items-center space-x-1'>
                        <span>Transaction: </span>
                        <div className='underline hover:no-underline flex items-center space-x-1'>
                            <a target={"_blank"} href={output_tx_explorer?.replace("{0}", swapOutputTransaction.transaction_hash)}>{shortenAddress(swapOutputTransaction.transaction_hash)}</a>
                            <ExternalLink className='h-4' />
                        </div>
                    </div>
                </div> : null,
            },
            failed: {
                name: swap?.fail_reason == SwapFailReasons.RECEIVED_MORE_THAN_VALID_RANGE ? `The transfer is on hold` : "The transfer has failed",
                description: <div className='flex space-x-1'>
                    <div className='space-x-1 text-secondary-text'>
                        {swap?.fail_reason == SwapFailReasons.RECEIVED_MORE_THAN_VALID_RANGE ?
                            "Your deposit is higher than the max limit. We'll review and approve your transaction in up to 2 hours."
                            :
                            swap?.fail_reason == SwapFailReasons.RECEIVED_LESS_THAN_VALID_RANGE ?
                                "Your deposit is lower than the minimum required amount. Unfortunately, we can't process the transaction. Please contact support to check if you're eligible for a refund."
                                :
                                <div><span className='text-secondary-text'>Something went wrong while processing the transfer.</span> <a className='underline hover:cursor-pointer text-secondary-text' onClick={() => startIntercom()}> please contact our support.</a></div>
                        }
                    </div>
                </div>
            },
            delayed: {
                name: `This swap is being delayed by Coinbase`,
                description: null
            }
        },
        "refuel": {
            upcoming: {
                name: `Sending ${refuel?.token?.symbol} to your address`,
                description: null
            },
            current: {
                name: `Sending ${refuel?.token?.symbol} to your address`,
                description: null
            },
            complete: {
                name: `${truncatedRefuelAmount} ${refuel?.token?.symbol} was sent to your address`,
                description: <div className='flex items-center space-x-1'>
                    <span>Transaction: </span>
                    <div className='underline hover:no-underline flex items-center space-x-1'>
                        {swapRefuelTransaction && <>
                            <a target={"_blank"} href={output_tx_explorer?.replace("{0}", swapRefuelTransaction.transaction_hash)}>{shortenAddress(swapRefuelTransaction?.transaction_hash)}</a>
                            <ExternalLink className='h-4' />
                        </>}
                    </div>
                </div>
            },
            delayed: {
                name: `This transfers is being delayed`,
                description: null
            }
        }
    }

    const allSteps: StatusStep[] = [
        {
            name: progressStates.input_transfer?.[stepStatuses?.input_transfer]?.name,
            status: stepStatuses.input_transfer,
            description: progressStates?.input_transfer?.[stepStatuses?.input_transfer]?.description,
            index: 1
        },
        {
            name: progressStates.output_transfer?.[stepStatuses?.output_transfer]?.name,
            status: stepStatuses.output_transfer,
            description: progressStates?.output_transfer?.[stepStatuses?.output_transfer]?.description,
            index: 2
        },
        {
            name: progressStates.refuel?.[stepStatuses?.refuel]?.name,
            status: stepStatuses.refuel,
            description: progressStates.refuel?.[stepStatuses?.refuel]?.description,
            index: 3
        }
    ]

    let currentSteps = allSteps.filter((s) => s.status && s.status != ProgressStatus.Removed);
    let stepsProgressPercentage = currentSteps.filter(x => x.status == ProgressStatus.Complete).length / currentSteps.length * 100;

    if (!swap) return <></>

    return (
        <Widget.Content>
            <div className={`w-full min-h-[422px] space-y-5 flex flex-col justify-between text-primary-text`}>
                <div className='space-y-5'>
                    <div className="w-full flex flex-col h-full space-y-5">
                        <div className="bg-secondary-700 font-normal px-3 py-4 rounded-lg flex flex-col border border-secondary-500 w-full relative z-10">
                            <SwapSummary />
                        </div>
                    </div>
                    <div className="bg-secondary-700 font-normal px-3 py-6 rounded-lg flex flex-col border border-secondary-500 w-full relative z-10 divide-y-2 divide-secondary-500 divide-dashed">
                        <div className='pb-4'>
                            <div className='flex flex-col gap-2 items-center'>
                                <div className='flex items-center'>
                                    <Gauge value={stepsProgressPercentage} size="small" showCheckmark={swap?.status === SwapStatus.Completed} />
                                </div>
                                <div className="flex-col text-center ">
                                    <span className="font-medium text-primary-text">
                                        {progressStatuses.generalStatus.title}
                                    </span>
                                    {!swapInputTransaction && (swap?.status !== SwapStatus.Cancelled && swap?.status !== SwapStatus.Expired && swap?.status !== SwapStatus.Failed) &&
                                        <span className='text-sm block space-x-1 text-secondary-text'>
                                            <span>{outputPendingDetails}</span>
                                        </span>
                                    }
                                    {swapInputTransaction?.timestamp && swapOutputTransaction?.status != BackendTransactionStatus.Completed && (swap?.status !== SwapStatus.Cancelled && swap?.status !== SwapStatus.Expired && swap?.status !== SwapStatus.Failed) &&
                                        <span className='text-sm block space-x-1 text-secondary-text'>
                                            <span>{countDownTimer}</span>
                                        </span>
                                    }
                                </div>
                            </div></div>
                        <div className='pt-4'>
                            {
                                swap?.status != SwapStatus.Cancelled && swap?.status != SwapStatus.Expired && currentSteps.find(x => x.status != null) &&
                                <div className='flex flex-col h-full justify-center'>
                                    <Steps steps={currentSteps} />
                                </div>
                            }
                            {
                                ([SwapStatus.Expired, SwapStatus.Cancelled, SwapStatus.UserTransferDelayed].includes(swap?.status)) &&
                                <Failed />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </Widget.Content>
    )
}

const resolveSwapInputTxStatus = (swapInputTransaction: Transaction | undefined, inputTxStatusFromApi: TransactionStatus) => {
    if (swapInputTransaction) {
        if (swapInputTransaction.status === BackendTransactionStatus.Completed && swapInputTransaction.confirmations < swapInputTransaction.max_confirmations)
            return TransactionStatus.Pending
        return swapInputTransaction?.status
    }
    if (inputTxStatusFromApi === TransactionStatus.Failed)
        return inputTxStatusFromApi
    else
        ///For cases when transaction is completed but not detected by bridge API
        return TransactionStatus.Pending
}

const getProgressStatuses = (swapResponse: SwapResponse, inputTxStatusFromApi: TransactionStatus): { stepStatuses: { [key in Progress]: ProgressStatus }, generalStatus: { title: string, subTitle: string | null } } => {
    const { swap, refuel: swapRefuel } = swapResponse
    const swapStatus = swap.status
    let generalTitle = "Transfer in progress";
    let subtitle: string | null = "";
    const swapInputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Input)
    const swapInputTxStatus = resolveSwapInputTxStatus(swapInputTransaction, inputTxStatusFromApi)

    const swapOutputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Output);
    const swapRefuelTransaction = swap?.transactions?.find(t => t.type === TransactionType.Refuel);

    let inputIsCompleted = swapInputTransaction && swapInputTransaction.confirmations >= swapInputTransaction.max_confirmations;

    if (!inputIsCompleted) {
        // Magic case, shows estimated time
        subtitle = null
    }

    let input_transfer = transactionStatusToProgressStatus(swapInputTxStatus) || ''

    let output_transfer =
        (!swapOutputTransaction && inputIsCompleted) || swapOutputTransaction?.status == BackendTransactionStatus.Pending ? ProgressStatus.Current
            : swapOutputTransaction?.status == BackendTransactionStatus.Initiated || swapOutputTransaction?.status == BackendTransactionStatus.Completed ? ProgressStatus.Complete
                : ProgressStatus.Upcoming;

    let refuel_transfer =
        (!!swapRefuel && !swapRefuelTransaction) ? ProgressStatus.Upcoming
            : swapRefuelTransaction?.status == BackendTransactionStatus.Pending ? ProgressStatus.Current
                : swapRefuelTransaction?.status == BackendTransactionStatus.Initiated || swapRefuelTransaction?.status == BackendTransactionStatus.Completed ? ProgressStatus.Complete
                    : ProgressStatus.Removed;


    if (swapStatus === SwapStatus.Failed) {
        output_transfer = output_transfer == ProgressStatus.Complete ? ProgressStatus.Complete : ProgressStatus.Failed;
        refuel_transfer = refuel_transfer !== ProgressStatus.Complete ? ProgressStatus.Removed : refuel_transfer;
        generalTitle = swap?.fail_reason == SwapFailReasons.RECEIVED_MORE_THAN_VALID_RANGE ? "Transfer on hold" : "Transfer failed";
        subtitle = "View instructions below"
    }

    if (swapInputTxStatus == TransactionStatus.Failed) {
        input_transfer = ProgressStatus.Failed;
        generalTitle = swap?.fail_reason == SwapFailReasons.RECEIVED_MORE_THAN_VALID_RANGE ? "Transfer on hold" : "Transfer failed";
        subtitle = "View instructions below"
    }

    if (swapStatus === SwapStatus.UserTransferDelayed) {
        input_transfer = ProgressStatus.Removed;
        output_transfer = ProgressStatus.Removed;
        refuel_transfer = ProgressStatus.Removed;
        generalTitle = "Transfer delayed"
        subtitle = "View instructions below"
    }

    if (swapStatus == SwapStatus.Completed) {
        generalTitle = "Transfer completed"
        subtitle = "Thanks for using Layerswap"
    }
    if (swapStatus == SwapStatus.Cancelled) {
        generalTitle = "Transfer cancelled"
        subtitle = "..."
    }
    if (swapStatus == SwapStatus.Expired) {
        generalTitle = "Transfer expired"
        subtitle = "..."
    }
    return {
        stepStatuses: {
            "input_transfer": input_transfer,
            "output_transfer": output_transfer,
            "refuel": refuel_transfer,
        },
        generalStatus: {
            title: generalTitle,
            subTitle: subtitle
        }
    };

}

const transactionStatusToProgressStatus = (transactionStatus: BackendTransactionStatus | TransactionStatus | undefined): ProgressStatus => {
    switch (transactionStatus) {
        case BackendTransactionStatus.Completed:
            return ProgressStatus.Complete;
        case BackendTransactionStatus.Failed:
            return ProgressStatus.Failed;
        case BackendTransactionStatus.Initiated:
        case BackendTransactionStatus.Pending:
            return ProgressStatus.Current;
        default:
            return ProgressStatus.Upcoming;
    }
}

export default Processing;