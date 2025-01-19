import React, { FC, SetStateAction, Dispatch } from 'react'
import { useTimerState } from '../context/timerContext';

type TimerProps = {
    seconds?: number
    isStarted?: boolean;
    setIsStarted?: Dispatch<SetStateAction<boolean>>,
    waitingComponent: (remainigTime: string) => JSX.Element | JSX.Element[]
    children: JSX.Element | JSX.Element[]
}

const TimerWithContext: FC<TimerProps> = (({ isStarted, waitingComponent, children }, ref) => {
    const { secondsRemaining, started } = useTimerState()
    const twoDigits = (num) => String(num).padStart(2, '0')

    const secondsToDisplay = Number(secondsRemaining) % 60
    const minutesRemaining = (Number(secondsRemaining) - secondsToDisplay) / 60
    const minutesToDisplay = minutesRemaining % 60

    return (
        <span>
            {
                started ?
                    waitingComponent(`${twoDigits(minutesToDisplay)}:${twoDigits(secondsToDisplay)}`)
                    :
                    children
            }
        </span>
    )
})


export default TimerWithContext