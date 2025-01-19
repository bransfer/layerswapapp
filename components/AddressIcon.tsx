import Jazzicon from "@metamask/jazzicon";
import { FC, useEffect, useRef } from "react";

type Props = {
    address: string;
    size: number;
    className?: string;
}

const AddressIcon: FC<Props> = ({ address, size, className }) => {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (address && ref.current) {
            ref.current.innerHTML = "";
            const iconElement = Jazzicon(size, parseInt(address.slice(2, 10), 16))
            if (iconElement) {
                iconElement.style.display = 'block'
                iconElement.style.width = "100%"
                iconElement.style.height = "100%"
                ref.current.appendChild(iconElement);
            }
        }
    }, [address, size]);

    return <div className={className} ref={ref as any} />
}
export default AddressIcon
