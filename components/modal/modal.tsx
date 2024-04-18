import { AnimatePresence } from "framer-motion";
import React, { Dispatch, ReactNode, SetStateAction, useEffect, useRef } from "react";
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
}

const Modal: FC<ModalProps> = (({ header, height, className, children, subHeader, show, setShow, modalId }) => {
    const { isMobile, isDesktop } = useWindowDimensions()
    const mobileModalRef = useRef(null)

    useEffect(() => {
        if (isMobile && show) {
            window.document.body.style.overflow = 'hidden'
        }
        return () => { window.document.body.style.overflow = '' }
    }, [isMobile, show])

    return (
        <>
            {isDesktop && (
                <ReactPortal wrapperId="widget_root">
                    <AnimatePresence>
                        {show &&
                            <Leaflet key={`desktop_${modalId}`} position="absolute" height={height ?? 'full'} ref={mobileModalRef} show={show} setShow={setShow} title={header} description={subHeader} className={className}>
                                {children}
                            </Leaflet>
                        }
                    </AnimatePresence>
                </ReactPortal>
            )}
            {isMobile && (
                <AnimatePresence>
                    {show &&
                        <Leaflet
                            position="fixed"
                            height={height == 'full' ? '80%' : height == 'fit' ? 'fit' : 'full'}
                            ref={mobileModalRef}
                            show={show}
                            setShow={setShow}
                            title={header}
                            description={subHeader}
                            className={className}
                            key={`mobile_${modalId}`}>
                            {children}
                        </Leaflet>
                    }
                </AnimatePresence>
            )}
        </>
    )
})

export default Modal;