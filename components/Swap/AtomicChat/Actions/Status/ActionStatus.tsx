import { FC, ReactNode } from "react";
import { CircleX } from "lucide-react";
import CheckedIcon from "../../../../icons/CheckedIcon";
import clsx from "clsx";

type Props = {
    title: ReactNode;
    status: "pending" | "success" | "error";
}
const ActionStatus: FC<Props> = ({ title, status }) => {

    return <div
        className={clsx('flex text-center space-x-3.5 bg-secondary-700 p-3 rounded-componentRoundness', {
            '!bg-primary-900 !p-2 !pl-2.5': status === 'success',
        })}
    >
        <div className='relative self-center'>
            {resolveIcon(status)}
        </div>
        <div
            className={clsx('text-md text-left self-center text-primary-text', {
                '!text-black': status === 'success',
            })}
        >
            {title}
        </div>
    </div >
}

const resolveIcon = (status: "pending" | "success" | "error") => {
    switch (status) {
        case "pending":
            return <>
                <div className='absolute top-1 left-1 w-4 h-4 md:w-5 md:h-5 opacity-40 bg bg-primary rounded-full animate-ping'></div>
                <div className='absolute top-2 left-2 w-2 h-2 md:w-3 md:h-3 opacity-40 bg bg-primary rounded-full animate-ping'></div>
                <div className='relative top-0 left-0 w-6 h-6 md:w-7 md:h-7 scale-50 bg bg-primary rounded-full '></div>
            </>
        case "success":
            return <CheckedIcon className="h-8 w-8 !text-black" aria-hidden="true" />
        case "error":
            return <CircleX className="h-7 w-7 text-red-500" aria-hidden="true" />
    }
}

export default ActionStatus