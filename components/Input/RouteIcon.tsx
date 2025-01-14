import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip"
import { Info, RouteOff } from "lucide-react"

type Props = {
    isAvailable: boolean,
    routeNotFound: boolean,
    direction: string,
    type: 'network' | 'token'
}

const ResolveRouteIcon = (props: Props) => {
    const { isAvailable, routeNotFound, direction, type } = props

    if (!isAvailable)
        return <Tooltip delayDuration={200}>
            <TooltipTrigger asChild >
                <div className="absolute top-0.5 z-50 inset-0 flex items-center cursor-pointer">
                    <Info className="!w-4 text-primary-text-placeholder hover:text-primary-text" />
                </div>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p className="max-w-72 p-2 text-base text-primary-text">
                    <span>Transfers</span> <span>{direction}</span> <span>this</span> <span>{type}</span> <span>are not available at the moment. Please try later.</span>
                </p>
            </TooltipContent>
        </Tooltip>

    if (routeNotFound)
        return <Tooltip delayDuration={200}>
            <TooltipTrigger asChild >
                <div className="absolute top-0.5 z-50 inset-0 flex items-center cursor-pointer">
                    <RouteOff className="!w-4 text-primary-text-placeholder hover:text-primary-text" />
                </div>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p className="max-w-72 py-1.5 text-base text-primary-text">
                    Route unavailable
                </p>
            </TooltipContent>
        </Tooltip >

    return undefined
}

export default ResolveRouteIcon