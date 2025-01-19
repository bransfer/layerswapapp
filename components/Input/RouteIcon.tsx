import { FC } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { Info, RouteOff } from "lucide-react"

type Props = {
    isAvailable: boolean,
    routeNotFound: boolean,
    direction: string,
    type: 'network' | 'token'
}

const RouteIcon: FC<Props> = (props) => {
    const { isAvailable, routeNotFound, direction, type } = props

    if (!isAvailable)
        return <Tooltip delayDuration={200}>
            <TooltipTrigger asChild >
                <div className="absolute -left-1 top-0.5 z-50">
                    <Info className="!w-4 text-primary-text-placeholder hover:text-primary-text icoooooooooon" />
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p className="max-w-72">
                    <span>Transfers</span> <span>{direction}</span> <span>this</span> <span>{type}</span> <span>are not available at the moment. Please try later.</span>
                </p>
            </TooltipContent>
        </Tooltip>

    if (routeNotFound)
        return <Tooltip delayDuration={200}>
            <TooltipTrigger asChild >
                <div className="absolute -left-0.5 top-0.5 z-50">
                    <RouteOff className="!w-3 text-primary-text-placeholder hover:text-primary-text icoooooooooon" />
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p className="max-w-72">
                    Route unavailable
                </p>
            </TooltipContent>
        </Tooltip>

    return undefined
}

export default RouteIcon