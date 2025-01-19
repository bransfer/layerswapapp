import { FC, useCallback, useEffect, useState } from "react";
import { SwapStatus } from "../../Models/SwapStatus";
import { useIntercom } from "react-use-intercom";
import { useAuthState } from "../../context/authContext";
import { SwapItem, TransactionType } from "../../lib/layerSwapApiClient";
import { datadogRum } from "@datadog/browser-rum";

const CountdownTimer: FC<{ initialTime: string, swap: SwapItem }> = ({ initialTime, swap }) => {

    const { email, userId } = useAuthState();
    const { boot, show, update } = useIntercom();
    const [countdown, setCountdown] = useState<number>();
    const [thresholdElapsed, setThresholdElapsed] = useState<boolean>(false);
    const swapInputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Input)

    useEffect(() => {
        const timer = setInterval(() => {
            const currentTime = new Date();
            const elapsedTime = currentTime.getTime() - new Date(swapInputTransaction?.timestamp!).getTime();
            const remainingTime = Math.max(timeStringToMilliseconds(initialTime) - Math.abs(elapsedTime), 0)
            setCountdown(remainingTime);

            if (elapsedTime > 2 * timeStringToMilliseconds(initialTime)) {
                setThresholdElapsed(true);
            } else {
                setThresholdElapsed(false);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [initialTime, swap.status, swapInputTransaction, thresholdElapsed]);

    const updateWithProps = () => update({ userId, customAttributes: { email: email, swapId: swap.id } })
    const startIntercom = useCallback(() => {
        boot();
        show();
        updateWithProps();
    }, [boot, show, updateWithProps]);

    const formatTime = (milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const formattedHours = hours > 0 ? String(hours).padStart(2, '0') + ":" : ''
        const formattedMinutes = String(minutes).padStart(2, '0')
        const formattedSeconds = String(seconds).padStart(2, '0')

        return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
    };
    const formatted = countdown && formatTime(countdown);

    if (thresholdElapsed && swap.status !== SwapStatus.Completed) {
        const renderingError = new Error("Transaction is taking longer than expected");
        renderingError.name = `LongTransactionError`;
        renderingError.cause = renderingError;
        datadogRum.addError(renderingError);
    }

    return (
        <div className='flex items-center space-x-1'>
            {
                thresholdElapsed && swap.status !== SwapStatus.UserTransferPending ? (
                    <div>
                        <span>Transaction is taking longer than expected</span>
                        <a className='underline hover:cursor-pointer' onClick={() => startIntercom()}> please contact our support.</a>
                    </div>
                ) : countdown === 0 && swap.status !== SwapStatus.Completed ? (
                    <div>
                        <span>Taking a bit longer than expected</span>
                    </div>
                ) : swap.status === SwapStatus.Completed && (!countdown || countdown === 0) ? (
                    ""
                ) : (
                    <div className='text-secondary-text flex items-center'>
                        <span>Estimated time:</span>
                        <span className='text-primary-text ml-0.5'>
                            {countdown ? formatted : <div className="h-[10px] mt-1 w-16 ml-1 animate-pulse rounded bg-gray-500" />}
                        </span>
                    </div>
                )
            }
        </div>

    );
};

export default CountdownTimer;

function timeStringToMilliseconds(timeString) {
    const parts = timeString.split('.');
    const time = parts[0];
    const [hours, minutes, seconds] = time.split(':').map(parseFloat);
    const milliseconds = ((hours * 3600) + (minutes * 60) + seconds) * 1000;

    return milliseconds;
}
