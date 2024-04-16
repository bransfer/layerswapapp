import { FC, useCallback, useEffect, useState } from "react";
import { SwapStatus } from "../../Models/SwapStatus";
import { useIntercom } from "react-use-intercom";
import { useAuthState } from "../../context/authContext";
import { SwapItem, TransactionType } from "../../lib/layerSwapApiClient";
import { datadogRum } from "@datadog/browser-rum";

const CountdownTimer: FC<{ avgTime: string, timestamp: string, swapId?: string, swapStatus?: SwapStatus }> = ({ avgTime, timestamp, swapId, swapStatus }) => {

    const [countdown, setCountdown] = useState<number>();

    useEffect(() => {
        const timer = setInterval(() => {
            const currentTime = new Date();
            const elapsedTime = currentTime.getTime() - new Date(timestamp).getTime();
            const remainingTime = Math.max(timeStringToMilliseconds(avgTime) - Math.abs(elapsedTime), 0)
            setCountdown(remainingTime);
        }, 1000);

        return () => clearInterval(timer);
    }, [avgTime, swapStatus, timestamp]);

    const formatted = formatTime(countdown!);

    return (
        <div className='flex items-center space-x-1'>
            {
                <div className='text-secondary-text flex items-center'><span>Estimated time:</span> <span className='text-primary-text ml-0.5'>{formatted}</span></div>
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

function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formattedHours = hours > 0 ? String(hours).padStart(2, '0') + ":" : ''
    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(seconds).padStart(2, '0')

    return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
};