import { FC } from "react"
import { clsx } from 'clsx';
import LoaderIcon from "../../../../icons/LoaderIcon";

type Props = {
    isLoading?: boolean;
    isDisabled?: boolean;
    children: React.ReactNode;
}

const ButtonStatus: FC<Props> = ({ isDisabled, isLoading, children }) => {
    return (
        <div
            className={clsx('items-center space-x-1 relative w-full flex justify-center font-semibold rounded-componentRoundness transform transition duration-200 ease-in-out bg-secondary-500 text-primary-text py-3 px-2 md:px-3 cursor-progress', {
                'bg-opacity-90 cursor-not-allowed text-opacity-40': isDisabled,
            })}
        >
            {children}
            {
                isLoading &&
                <span className="order-first absolute right-0 inset-y-0 flex items-center pr-3">
                    <LoaderIcon className="animate-reverse-spin h-6 w-6" />
                </span>
            }
        </div>
    )
}

export default ButtonStatus