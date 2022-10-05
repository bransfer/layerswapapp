import { FC, useState } from "react"
import Modal from "./modalComponent"
import QRCode from "qrcode.react";
import { classNames } from "./utils/classNames";
import { QrcodeIcon } from "@heroicons/react/outline";
import SubmitButton from "./buttons/submitButton";
import shortenAddress from "./utils/ShortenAddress";
import CopyButton from "./buttons/copyButton";

type QRCodeModalProps = {
    qrUrl: string;
    className?: string
    iconHeight?: number
    iconWidth?: number
    iconClassName?: string
}

const QRCodeModal: FC<QRCodeModalProps> = ({ qrUrl, className, iconHeight, iconWidth, iconClassName }) => {
    const qrCode = (
        <QRCode
            className="p-4 bg-white rounded-3xl"
            value={qrUrl}
            size={250}
            fgColor={'#111827'}
            level={"H"}
        />
    );
    const [isOpen, setIsOpen] = useState(false)

    const handleOpenModal = () => setIsOpen(true)
    const handleCloseModal = () => setIsOpen(false)

    return (
        <>
            <div className={classNames(className)} onClick={handleOpenModal}>
                <div className="flex items-center gap-1 cursor-pointer">
                    <QrcodeIcon className={iconClassName} width={iconWidth ? iconWidth : 16} height={iconHeight ? iconHeight : 16} />
                </div>
            </div>
            <Modal onDismiss={handleCloseModal} isOpen={isOpen}>
                <div className="flex flex-col justify-between items-center space-y-6 md:space-y-8 mt-6 md:mt-8 px-6 md:px-8">
                    <div>
                        {qrCode}
                    </div>
                    <p className="text-xl md:text-2xl text-primary-text">
                        <CopyButton toCopy={qrUrl} iconHeight={22} iconWidth={22}>
                            <span>{shortenAddress(qrUrl)}</span>
                        </CopyButton>
                    </p>
                    <SubmitButton onClick={handleCloseModal} isDisabled={false} isSubmitting={false}>
                        Got it
                    </SubmitButton>
                </div>
            </Modal>
        </>
    )
}


export default QRCodeModal