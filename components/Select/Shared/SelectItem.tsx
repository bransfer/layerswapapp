import { ISelectMenuItem } from "./Props/selectMenuItem";
import Image from 'next/image';

export default function SelectItem({ item }: { item: ISelectMenuItem }) {

    return (
        <div className={`${item?.displayName ? "px-3" : "px-1.5"} flex items-center justify-between gap-3 w-full overflow-hidden`}>
            <div className={`${item?.displayName ? "gap-2.5" : "gap-3"} relative flex items-center  pl-1 w-full`}>
                {!item?.displayName &&
                    <div className="flex-shrink-0">
                        <div>{item.leftIcon}</div>
                    </div>
                }
                <div className={`${item?.displayName ? "h-9 w-9" : "h-6 w-6"} flex-shrink-0 relative`}>
                    {item.imgSrc && (
                        <Image
                            src={item.imgSrc}
                            alt="Project Logo"
                            height="40"
                            width="40"
                            loading="eager"
                            className="rounded-md object-contain"
                        />
                    )}
                </div>
                <div className="flex justify-between w-full">
                    <span className="flex items-center pb-0.5">
                        {item.displayName ? item.displayName : item.name}
                    </span>
                    {item.badge && <span className="ml-2">{item.badge}</span>}
                    <span className="ml-auto pl-2">{item.details}</span>
                </div>
            </div>
        </div>
    );
}