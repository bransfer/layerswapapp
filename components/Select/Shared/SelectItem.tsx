import { CurrencyDisabledReason } from "../../Input/CurrencyFormField";
import { ISelectMenuItem } from "./Props/selectMenuItem";
import Image from 'next/image'

export default function SelectItem({ item }: { item: ISelectMenuItem }) {
    return (<div className={`${item?.isAvailable?.disabledReason == CurrencyDisabledReason.InvalidRoute ? "opacity-40" : ""} flex items-center w-full`}>
        <div className="flex-shrink-0 h-6 w-6 relative">
            {item.imgSrc && <Image
                src={item.imgSrc}
                alt="Project Logo"
                height="40"
                width="40"
                loading="eager"
                className="rounded-md object-contain" />}
            {item.menuItemImage && item.menuItemImage}
        </div>
        <div className="ml-4 flex items-center gap-3 justify-between w-full">
            <div className='text-md font-medium'>
                {item.menuItemLabel || item.name}
            </div>
            <>
                {item.menuItemDetails}
            </>
        </div>
    </div>);
}