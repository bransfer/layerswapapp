import { SwapFormValues } from "../../../DTOs/SwapFormValues";
import { CurrencyDisabledReason } from "../../../Input/CurrencyFormField";
import { LayerDisabledReason } from "../../Popover/PopoverSelect";

export class SelectMenuItem<T> implements ISelectMenuItem {
    id: string;
    name: string;
    menuItemDetails?: React.ReactNode;
    order: number;
    imgSrc: string;
    asset?: string | undefined;
    displayName?: string | undefined;
    isAvailable: {
        value: boolean;
        disabledReason: LayerDisabledReason | CurrencyDisabledReason | null
    };
    type: ItemType;
    group?: string;
    details?: string;
    baseObject: T;
    constructor(baseObject: T, id: string, name: string, order: number, imgSrc: string, type: ItemType, group?: string, details?: string) {
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
        this.type = type
    }
}

export interface ISelectMenuItem {
    id: string;
    name: string;
    menuItemDetails?: React.ReactNode;
    imgSrc: string;
    asset?: string | undefined;
    displayName?: string | undefined;
    group?: string;
    isAvailable: {
        value: boolean;
        disabledReason: LayerDisabledReason | CurrencyDisabledReason | null
    };
    type: ItemType
    details?: string;
    order?: number;
}
type ItemType = 'layer' | 'cex' | 'currency'
