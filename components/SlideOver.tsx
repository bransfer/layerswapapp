import { Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import React from "react";
import { FC, forwardRef, Fragment, ReactNode, useImperativeHandle, useState } from "react"

type Props = {
    opener?: ReactNode,
    children?: ReactNode;
    moreClassNames?: string;
    slide?: boolean;
}
export type SildeOverRef = {
    close: () => void;
    open: () => void;
};

const SlideOver = forwardRef<SildeOverRef, Props>(({ opener, moreClassNames, children, slide = true }, ref) => {
    const [open, setOpen] = useState(false)
    const handleClose = () => {
        setOpen(false)
    }
    const handleOpen = () => {
        setOpen(true)
    }
    useImperativeHandle(ref, () => ({
        close: handleClose,
        open: handleOpen
    }), []);

    return (
        <>
            <span onClick={handleOpen}>{opener}</span>
            <Transition
                appear
                show={open}
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom={slide ? "translate-y-full" : "opacity-0"}
                enterTo={slide ? "translate-y-0" : "opacity-100"}
                leave="ease-in duration-200"
                leaveFrom={slide ? "translate-y-0" : "opacity-100"}
                leaveTo={slide ? "translate-y-full" : "opacity-0"}>
                <div className={`absolute inset-0 z-40 flex flex-col w-full bg-darkblue ${moreClassNames}`}>
                    <span className='relative z-40 overflow-hidden bg-darkblue px-6 pb-6 sm:px-8 sm:pb-8 pt-0'>
                        <div className='relative grid grid-cols-1 gap-4 place-content-end z-40 mb-2 mt-1'>
                            <span className="justify-self-end text-primary-text cursor-pointer">
                                <div className="">
                                    <button
                                        type="button"
                                        className="rounded-md text-darkblue-200 hover:text-primary-text"
                                        onClick={handleClose}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                            </span>
                        </div>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="relative inset-0" ></div>
                        </Transition.Child>

                        <div className="relative inset-0 text-primary-text flex flex-col scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-darkblue-500 scrollbar-track:!bg-slate-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-slate-300 scrollbar-track:!rounded scrollbar-track:!bg-slate-500/[0.16] scrollbar-thumb:!bg-slate-500/50">
                            <div className="relative min-h-full items-center justify-center pt-0 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >

                                    <div className='grid grid-flow-row min-h-[480px] text-primary-text'>
                                        {children}
                                    </div>
                                </Transition.Child>
                            </div>
                        </div>
                    </span>
                </div>
            </Transition>
        </>
    )
})

export default SlideOver;