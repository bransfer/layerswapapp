import { AnimatePresence } from "framer-motion";
import React, { Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState } from "react";
import { FC } from "react"
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { Leaflet, LeafletHeight } from "./leaflet";
import ReactPortal from "../Common/ReactPortal";

export interface ModalProps {
    header?: ReactNode;
    subHeader?: string | JSX.Element
    children?: JSX.Element | JSX.Element[];
    className?: string;
    height?: LeafletHeight;
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    modalId: string;
    onClose?: () => void;
    walletComp?: React.ReactNode;
}

const Modal: FC<ModalProps> = (({ header, height, className, children, subHeader, show, setShow, modalId, onClose, walletComp }) => {
    const { isMobile, isDesktop } = useWindowDimensions()
    const mobileModalRef = useRef(null)
    //Fixes draggebles closing
    const [delayedShow, setDelayedShow] = useState<boolean>()

    useEffect(() => {
        setDelayedShow(show)
    }, [show])

    return (
        <>
            {isDesktop && (
                <ReactPortal wrapperId="widget_root">
                    <AnimatePresence>
                        {delayedShow &&
                            <Leaflet
                                key={modalId}
                                position="absolute"
                                height={height ?? 'full'}
                                show={delayedShow}
                                setShow={setShow}
                                title={header}
                                description={subHeader}
                                className={className}
                                onClose={onClose}
                                walletComp={walletComp}
                            >
                                {children}
                            </Leaflet>
                        }
                    </AnimatePresence>
                </ReactPortal>
            )}
            {isMobile && (
                <AnimatePresence>
                    {delayedShow &&
                        <Leaflet
                            position="fixed"
                            height={height == 'full' ? '80%' : height == 'fit' ? 'fit' : 'full'}
                            ref={mobileModalRef}
                            show={delayedShow}
                            setShow={setShow}
                            title={header}
                            description={subHeader}
                            className={className}
                            key={modalId}
                            onClose={onClose}
                            walletComp={walletComp}
                        >
                            {children}
                        </Leaflet>
                    }
                </AnimatePresence>
            )}
        </>
    )
})

export default Modal;