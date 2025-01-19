import { DetailedHTMLProps, HTMLAttributes } from "react"

const Snippet = () => {
    return <div className="text-sm py-3 space-y-4 font-medium focus:outline-none overflow-hidden">
        {[...Array(5)]?.map((item, index) => (
            <HistoryItemSceleton className="animate-pulse" key={index} />
        ))}
        <div className="relative" aria-hidden="true">
            <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-10% from-secondary-900 pt-[90%] sm:pt-[30%] lg:pt-[80%]" />
        </div>
    </div>
}

export const HistoryItemSceleton = (props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    return <div {...props} className={`w-full rounded-xl bg-secondary-700 ${props.className}`}>
        <div className="rounded-lg px-3 py-4 w-full relative z-10 space-y-4">
            <div className="font-normal flex flex-col w-full relative z-10 space-y-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex col-span-5 items-center gap-3 grow ">
                        <div className="w-11 h-11 rounded-md border border-secondary-400 bg-secondary-500"></div>
                        <div className="flex flex-col items-start gap-2">
                            <p className="w-32 sm:w-40 h-3 border border-secondary-400 bg-secondary-500 rounded"></p>
                            <p className="w-28 sm:w-32 h-3 border border-secondary-400 bg-secondary-500 rounded"></p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <p className="w-14 h-3 border border-secondary-400 bg-secondary-500 rounded"></p>
                        <p className="w-20 sm:w-28 h-3 border border-secondary-400 bg-secondary-500 rounded"></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default Snippet