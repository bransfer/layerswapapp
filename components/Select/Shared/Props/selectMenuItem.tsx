import { Balance } from "../../../../Models/Balance";
import { CurrencyDisabledReason } from "../../../Input/CurrencyFormField";
import { LayerDisabledReason } from "../../Popover/PopoverSelect";

export class SelectMenuItem<T> implements ISelectMenuItem {
    id: string;
    name: React.ReactNode;
    menuItemLabel?: React.ReactNode;
    menuItemDetails?: React.ReactNode;
    menuItemImage?: React.ReactNode;
    balanceAmount?: number | undefined;
    order: number;
    imgSrc: string;
    displayName?: string | undefined;
    isAvailable: {
        value: boolean;
        disabledReason?: LayerDisabledReason | CurrencyDisabledReason | null
    };
    group?: string;
    details?: string;
    network_display_name?: string | undefined;
    network?: string | undefined;
    baseObject: T;
    constructor(baseObject: T, id: string, name: string, order: number, imgSrc: string, group?: string, details?: string) {
        this.baseObject = baseObject;
        this.id = id;
        this.name = name;
        this.order = order;
        this.imgSrc = imgSrc;
        this.group = group;
        this.details = details
        this.isAvailable = {
            value: true,
            disabledReason: null
        }
    }
}

export interface ISelectMenuItem {
    id: string;
    name: React.ReactNode;
    menuItemLabel?: React.ReactNode;
    menuItemDetails?: React.ReactNode;
    menuItemImage?: React.ReactNode;
    balanceAmount?: number | undefined;
    imgSrc: string;
    displayName?: string | undefined;
    group?: string;
    isAvailable: {
        value: boolean;
        disabledReason?: LayerDisabledReason | CurrencyDisabledReason | null
    };
    details?: string;
    network_display_name?: string | undefined;
    network?: string | undefined;
    order?: number;
}
