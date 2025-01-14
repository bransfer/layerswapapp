import { ISelectMenuItem } from "./Props/selectMenuItem";

export default function SelectItem({ item }: { item: ISelectMenuItem }) {

    return (
        <div className={`${item.noWalletsConnectedText ? "group-hover:bg-secondary-500" : "hover:bg-secondary-500 "} px-1 flex items-center justify-between w-full overflow-hidden rounded-md p-2`}>
            <div className="relative flex items-center gap-1.5">
                <div className="relative items-center flex-shrink-0 w-4">
                    {item.leftIcon}
                </div>
                <div className="flex-shrink-0">
                    {item.logo}
                </div>
                <p className="text-md font-medium flex w-full justify-between space-x-2 items-center">
                    <span className="flex items-center justify-center pb-0.5">
                        {item.menuItemImage && item.menuItemImage}
                        {item.menuItemLabel ?
                            <span className="flex space-x-1 group">
                                <span className="truncate flex-grow min-w-0 max-w-full">{item.menuItemLabel}</span>
                                {item?.extendedAddress && (
                                    <span className="self-end truncate invisible group-hover:visible">{item?.extendedAddress}</span>
                                )}
                            </span>
                            :
                            item.name}
                    </span>
                    {item.badge && <span>{item.badge}</span>}
                </p>
            </div>
            <div>
                {item.menuItemDetails && item.menuItemDetails}
            </div>
            {item.noWalletsConnectedText && (
                <div className="hidden group-hover:block">
                    <span>{item.noWalletsConnectedText}</span>
                </div>
            )}
        </div>
    );
}