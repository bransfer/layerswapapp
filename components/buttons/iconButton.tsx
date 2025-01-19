import React, { ComponentProps, FC, forwardRef } from 'react'
import { classNames } from '../utils/classNames'

interface IconButtonProps extends Omit<ComponentProps<'button'>, 'color' | 'ref'> {
    icon?: React.ReactNode
}

const IconButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, IconButtonProps>(function IconButton({ className, icon, ...props }, ref){
    const theirProps = props as object;

    return (
        <button {...theirProps} type="button" className={classNames("py-1.5 justify-self-start text-secondary-text hover:bg-secondary-500 hover:text-primary-text focus:outline-none inline-flex rounded-lg items-center", className)}>
            <div className='mx-2'>
                <div>
                    {icon}
                </div>
            </div>

            <span className="sr-only">Icon description</span>
        </button>
    )
})

export default IconButton