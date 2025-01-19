import { useState } from "react"
import { ExternalLink } from "lucide-react";
import { DocInFrameSceleton } from "./Sceletons";

type Props = {
    URl: string;
    className?: string;
    onConfirm?: () => void
}
export function DocIframe({ URl, onConfirm, className }: Props) {
    const [loading, setLoading] = useState(true)

    const handleLoad = () => {
        setLoading(false)
    }

    return (
        <div className="flex flex-col justify-between space-y-4 h-full">
            {
                loading && <DocInFrameSceleton />
            }
            <div className='h-full'>

                <iframe onLoad={handleLoad} height="100%" allow="clipboard-write" src={URl} className={`${loading ? 'invisible h-0 w-0' : `visible animate-fade-in-down ${className}`} h-full md:min-h-full border-0 self-center w-full sm:rounded-md`} />
            </div>
            {
                !loading &&
                <a
                    target="_blank"
                    href={URl}
                    onClick={onConfirm}
                    className="shadowed-button flex justify-center items-center mt-3 group disabled:white disabled:bg-primary-600 disabled:cursor-not-allowed text-primary relative w-full font-semibold focus:outline-none"
                >
                    <span>View in new tab</span>
                    <ExternalLink className='ml-2 h-5 w-5' />
                </a>
            }
        </div>)
}
