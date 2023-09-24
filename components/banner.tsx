import { X } from 'lucide-react'
import { FC } from 'react'
import { useBrowserStorage } from '../hooks/useBrowserStorage';
interface BannerProps {
    mobileMessage: string;
    desktopMessage: string;
    localStorageId: string;
    className?: string;
}

const Banner: FC<BannerProps> = ({ localStorageId, desktopMessage, mobileMessage, className }) => {
    const localStorageItemKey = `HideBanner-${localStorageId}`;
    let [isVisible, setIsVisible] = useBrowserStorage(localStorageItemKey, true);
    if (!isVisible) {
        return <></>
    }

    function onClickClose() {
        setIsVisible(false);
    }

    return (
        <div className={className + ' ' + "w-full mx-auto"}>
            <div className="p-2 rounded-lg bg-primary-600 shadow-lg">
                <div className="flex items-center justify-between flex-wrap">
                    <div className="w-0 flex-1 flex items-center">
                        <span className="flex p-1 text-lg rounded-lg bg-primary-900">
                            🥳
                        </span>
                        <p className="ml-3 font-medium text-white truncate">
                            <span className="md:hidden">{mobileMessage}</span>
                            <span className="hidden md:inline">{desktopMessage}</span>
                        </p>
                    </div>
                    <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
                        <button
                            type="button"
                            onClick={() => onClickClose()}
                            className="-mr-1 flex p-2 rounded-md hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-white"
                        >
                            <span className="sr-only">Dismiss</span>
                            <X className="h-4 w-5 text-white" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Banner;