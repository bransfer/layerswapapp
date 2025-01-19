import { useCallback, useEffect, useState } from "react"
import { useInterval } from "../../../hooks/useInterval"
import { Tooltip, TooltipContent, TooltipTrigger } from "../../shadcn/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover"
import { HelpCircle } from "lucide-react"
import useWindowDimensions from "../../../hooks/useWindowDimensions"

const TimelockTimer = ({ timelock }: { timelock: number }) => {
    const [secondsRemaining, setSecondsRemaining] = useState<number>()
    const [started, setStarted] = useState(false)

    const { isMobile } = useWindowDimensions()

    const start = (seconds: number) => {
        setSecondsRemaining(seconds)
        setStarted(true)
    }

    useEffect(() => {
        if (timelock) {
            start(Number(timelock) - (Date.now() / 1000))
        }
    }, [timelock])

    const callback = useCallback(() => {
        if (Number(secondsRemaining) > 0) {
            if (secondsRemaining == 1) {
                setStarted(false)
            }
            setSecondsRemaining(Number(secondsRemaining) - 1)

        }
    }, [secondsRemaining])

    useInterval(
        callback,
        started ? 1000 : null,
    )

    const twoDigits = (num: number) => String(num).padStart(2, '0')

    const secondsToDisplay = Number(secondsRemaining?.toFixed()) % 60
    const minutesRemaining = (Number(secondsRemaining) - secondsToDisplay) / 60
    const minutesToDisplay = Number(minutesRemaining.toFixed()) % 60

    return (
        started &&
        (
            isMobile ?
                <Popover>
                    <PopoverTrigger>
                        <div className="px-2 py-0.5 rounded-md bg-opacity-0 hover:bg-opacity-100 transition-all duration-200 bg-secondary-700 text-sm text-secondary-text w-max">
                            <div className="flex items-center gap-1.5">
                                <p>Refund</p>
                                <HelpCircle className="h-4 w-4" />
                            </div>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent side="top" className="max-w-[300px] !border-0 !bg-secondary-600 p-3 space-y-1 !rounded-lg">
                        <p className="text-sm text-primary-text">
                            <span>Refund available in</span> <span className="w-9"><Timer timelock={timelock}/></span>
                        </p>
                        <p className="text-xs">If the swap is not completed before the timelock expires, you can always refund</p>
                    </PopoverContent>
                </Popover>
                :
                <Tooltip delayDuration={150}>
                    <TooltipTrigger>
                        <div className="px-2 py-0.5 rounded-md bg-opacity-0 hover:bg-opacity-100 transition-all duration-200 bg-secondary-700 text-sm text-secondary-text w-max">
                            <div className="flex items-center gap-1.5">
                                <p>Refund</p>
                                <HelpCircle className="h-4 w-4" />
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[300px] !border-0 !bg-secondary-600 p-3 space-y-1 !rounded-lg">
                        <p className="text-sm text-primary-text">
                            <span>Refund available in</span> <span className="w-9"><Timer timelock={timelock}/></span>
                        </p>
                        <p className="text-xs">If the swap is not completed before the timelock expires, you can always refund</p>
                    </TooltipContent>
                </Tooltip>
        )

    )
}

export const Timer = ({ timelock }: { timelock: number }) => {
    const [secondsRemaining, setSecondsRemaining] = useState<number>()
    const [started, setStarted] = useState(false)

    const { isMobile } = useWindowDimensions()

    const start = (seconds: number) => {
        setSecondsRemaining(seconds)
        setStarted(true)
    }

    useEffect(() => {
        if (timelock) {
            start(Number(timelock) - (Date.now() / 1000))
        }
    }, [timelock])

    const callback = useCallback(() => {
        if (Number(secondsRemaining) > 0) {
            if (secondsRemaining == 1) {
                setStarted(false)
            }
            setSecondsRemaining(Number(secondsRemaining) - 1)

        }
    }, [secondsRemaining])

    useInterval(
        callback,
        started ? 1000 : null,
    )

    const twoDigits = (num: number) => String(num).padStart(2, '0')

    const secondsToDisplay = Number(secondsRemaining?.toFixed()) % 60
    const minutesRemaining = (Number(secondsRemaining) - secondsToDisplay) / 60
    const minutesToDisplay = Number(minutesRemaining.toFixed()) % 60

    return <>{twoDigits(minutesToDisplay)}:{twoDigits(secondsToDisplay)}</>

}


export default TimelockTimer