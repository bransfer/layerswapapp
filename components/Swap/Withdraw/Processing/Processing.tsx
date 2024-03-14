import { ExternalLink } from 'lucide-react';
import { FC, useEffect } from 'react'
import { Widget } from '../../../Widget/Index';
import shortenAddress from '../../../utils/ShortenAddress';
import Steps from '../../StepsComponent';
import SwapSummary from '../../Summary';
import { GetDefaultAsset } from '../../../../helpers/settingsHelper';
import AverageCompletionTime from '../../../Common/AverageCompletionTime';
import LayerSwapApiClient, { SwapItem, BackendTransactionStatus, TransactionType, TransactionStatus } from '../../../../lib/layerSwapApiClient';
import { truncateDecimals } from '../../../utils/RoundDecimals';
import { LayerSwapAppSettings } from '../../../../Models/LayerSwapAppSettings';
import { SwapStatus } from '../../../../Models/SwapStatus';
import { SwapFailReasons } from '../../../../Models/RangeError';
import { Gauge } from '../../../gauge';
import Failed from '../Failed';
import { Progress, ProgressStates, ProgressStatus, StatusStep } from './types';
import { useFee } from '../../../../context/feeContext';
import { useSwapTransactionStore } from '../../../../stores/swapTransactionStore';
import useSWR from 'swr';
import { ApiResponse } from '../../../../Models/ApiResponse';
import { datadogRum } from '@datadog/browser-rum';

type Props = {
    settings: LayerSwapAppSettings;
    swap: SwapItem;
}

const Processing: FC<Props> = ({ settings, swap }) => {

    const swapStatus = swap.status;
    const { setSwapTransaction, swapTransactions } = useSwapTransactionStore();
    const { fee } = useFee()

    const source_layer = settings.layers?.find(e => e.internal_name === swap.source_network)
    const destination_layer = settings.layers?.find(e => e.internal_name === swap.destination_network)

    const input_tx_explorer = source_layer?.transaction_explorer_template
    const output_tx_explorer = destination_layer?.transaction_explorer_template

    const destinationNetworkCurrency = destination_layer ? GetDefaultAsset(destination_layer, swap?.destination_network_asset) : null

    const swapInputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Input)
    const storedWalletTransaction = swapTransactions?.[swap?.id]

    const transactionHash = swapInputTransaction?.transaction_id || storedWalletTransaction?.hash
    const swapOutputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Output)
    const swapRefuelTransaction = swap?.transactions?.find(t => t.type === TransactionType.Refuel)

    const apiClient = new LayerSwapApiClient()
    const { data: inputTxStatusData } = useSWR<ApiResponse<{ status: TransactionStatus }>>((transactionHash && swapInputTransaction?.status !== BackendTransactionStatus.Completed) ? [source_layer?.internal_name, transactionHash] : null, ([network, tx_id]) => apiClient.GetTransactionStatus(network, tx_id as any), { dedupingInterval: 6000 })

    const inputTxStatus = swapInputTransaction ? swapInputTransaction.status : inputTxStatusData?.data?.status.toLowerCase() as TransactionStatus

    useEffect(() => {
        if (storedWalletTransaction?.status !== inputTxStatus) setSwapTransaction(swap?.id, inputTxStatus, storedWalletTransaction?.hash)
    }, [inputTxStatus])

    useEffect(() => {
        if (inputTxStatus === TransactionStatus.Failed) {
            const err = new Error("Transaction failed")
            const renderingError = new Error("Transaction failed test");
            renderingError.name = `TransactionFailed`;
            renderingError.cause = err;
            datadogRum.addError(renderingError);
        }
    }, [inputTxStatus])

    const nativeCurrency = destination_layer?.assets?.find(c => c.asset === destination_layer?.assets.find(a => a.is_native)?.asset)
    const truncatedRefuelAmount = swapRefuelTransaction?.amount ? truncateDecimals(swapRefuelTransaction?.amount, nativeCurrency?.precision) : null

    const progressStatuses = getProgressStatuses(swap, swapStatus, inputTxStatusData?.data?.status.toLowerCase() as TransactionStatus)
    const stepStatuses = progressStatuses.stepStatuses;

    const outputPendingDetails = <div className='flex items-center space-x-1'>
        <span>Estimated arrival after confirmation:</span>
        <div className='text-primary-text'>
            <AverageCompletionTime avgCompletionTime={fee?.avgCompletionTime} />
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
                description: <div>
                    <span>
                        <span>Waiting for confirmations</span>
                        {swapInputTransaction && swapInputTransaction?.confirmations && (
                            <span className="text-primary-text ml-1">
                                <span>{swapInputTransaction?.confirmations >= swapInputTransaction?.max_confirmations
                                    ? swapInputTransaction?.max_confirmations
                                    : swapInputTransaction?.confirmations}</span>
                                <span>/</span>{swapInputTransaction?.max_confirmations}
                            </span>
                        )}
                    </span>
                </div>
            },
            complete: {
                name: `Your deposit is confirmed`,
                description: <div className='flex items-center space-x-1'>
                    <span>Transaction: </span>
                    <div className='underline hover:no-underline flex items-center space-x-1'>
                        <a target={"_blank"} href={input_tx_explorer?.replace("{0}", transactionHash)}>{shortenAddress(transactionHash)}</a>
                        <ExternalLink className='h-4' />
                    </div>
                </div>
            },
            failed: {
                name: `The transfer failed`,
                description: <div className='flex space-x-1'>
                    <span>Error: </span>
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
                                    "Something went wrong while processing the transfer. Please contact support"
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
                name: `Sending ${destinationNetworkCurrency?.asset} to your address`,
                description: null
            },
            current: {
                name: `Sending ${destinationNetworkCurrency?.asset} to your address`,
                description: null
            },
            complete: {
                name: `${swapOutputTransaction?.amount} ${swap?.destination_network_asset} was sent to your address`,
                description: swapOutputTransaction ? <div className="flex flex-col">
                    <div className='flex items-center space-x-1'>
                        <span>Transaction: </span>
                        <div className='underline hover:no-underline flex items-center space-x-1'>
                            <a target={"_blank"} href={output_tx_explorer?.replace("{0}", swapOutputTransaction.transaction_id)}>{shortenAddress(swapOutputTransaction.transaction_id)}</a>
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
                                "Something went wrong while processing the transfer. Please contact support"
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
                name: `Sending ${nativeCurrency?.asset} to your address`,
                description: null
            },
            current: {
                name: `Sending ${nativeCurrency?.asset} to your address`,
                description: null
            },
            complete: {
                name: `${truncatedRefuelAmount} ${nativeCurrency?.asset} was sent to your address`,
                description: <div className='flex items-center space-x-1'>
                    <span>Transaction: </span>
                    <div className='underline hover:no-underline flex items-center space-x-1'>
                        {swapRefuelTransaction && <>
                            <a target={"_blank"} href={output_tx_explorer?.replace("{0}", swapRefuelTransaction.transaction_id)}>{shortenAddress(swapRefuelTransaction?.transaction_id)}</a>
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
                                    <span className='text-sm block space-x-1 text-secondary-text'>
                                        <span>{progressStatuses.generalStatus.subTitle ?? outputPendingDetails}</span>
                                    </span>
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

const getProgressStatuses = (swap: SwapItem, swapStatus: SwapStatus, inputTxStatus: TransactionStatus): { stepStatuses: { [key in Progress]: ProgressStatus }, generalStatus: { title: string, subTitle: string | null } } => {
    let generalTitle = "Transfer in progress";
    let subtitle: string | null = "";
    //TODO might need to check stored wallet transaction statuses
    const swapInputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Input)

    const swapOutputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Output);
    const swapRefuelTransaction = swap?.transactions?.find(t => t.type === TransactionType.Refuel);

    let inputIsCompleted = swapInputTransaction && inputTxStatus == TransactionStatus.Completed && swapInputTransaction.confirmations >= swapInputTransaction.max_confirmations;
    if (!inputIsCompleted) {
        // Magic case, shows estimated time
        subtitle = null
    }
    let input_transfer = transactionStatusToProgressStatus(swapInputTransaction?.status) || ''

    let output_transfer =
        (!swapOutputTransaction && inputIsCompleted) || swapOutputTransaction?.status == BackendTransactionStatus.Pending ? ProgressStatus.Current
            : swapOutputTransaction?.status == BackendTransactionStatus.Initiated || swapOutputTransaction?.status == BackendTransactionStatus.Completed ? ProgressStatus.Complete
                : ProgressStatus.Upcoming;

    let refuel_transfer =
        (swap.has_refuel && !swapRefuelTransaction) ? ProgressStatus.Upcoming
            : swapRefuelTransaction?.status == BackendTransactionStatus.Pending ? ProgressStatus.Current
                : swapRefuelTransaction?.status == BackendTransactionStatus.Initiated || swapRefuelTransaction?.status == BackendTransactionStatus.Completed ? ProgressStatus.Complete
                    : ProgressStatus.Removed;

    if (swapStatus === SwapStatus.Failed) {
        output_transfer = output_transfer == ProgressStatus.Complete ? ProgressStatus.Complete : ProgressStatus.Failed;
        refuel_transfer = refuel_transfer !== ProgressStatus.Complete ? ProgressStatus.Removed : refuel_transfer;
        generalTitle = swap?.fail_reason == SwapFailReasons.RECEIVED_MORE_THAN_VALID_RANGE ? "Transfer on hold" : "Transfer failed";
        subtitle = "View instructions below"
    }

    if (swapInputTransaction?.status == BackendTransactionStatus.Failed || inputTxStatus == TransactionStatus.Failed) {
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

const transactionStatusToProgressStatus = (transactionStatus: BackendTransactionStatus | undefined): ProgressStatus => {
    switch (transactionStatus) {
        case BackendTransactionStatus.Completed:
            return ProgressStatus.Complete;
        case BackendTransactionStatus.Failed:
            return ProgressStatus.Failed;
        case BackendTransactionStatus.Initiated:
            return ProgressStatus.Current;
        default:
            return ProgressStatus.Upcoming;
    }
}

export default Processing;