import { Info } from 'lucide-react';
import { FC } from "react";
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover';
import { classNames } from '../utils/classNames';

type Props = {
    text: string | JSX.Element | JSX.Element[];
    moreClassNames?: string,
    side?: 'left' | 'right' | 'top' | 'bottom'
}

const ClickTooltip: FC<Props> = (({ text, moreClassNames, side }) => {
    return (
        <Popover>
            <PopoverTrigger>
                <Info className={classNames("h-4 text-secondary-text hover:text-secondary-buttonTextColor", moreClassNames)} aria-hidden="true" strokeWidth={2.5} />
            </PopoverTrigger>
            <PopoverContent side={side} className='text-sm'>{text}</PopoverContent>
        </Popover>
    )
})

export default ClickTooltip