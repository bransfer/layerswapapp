import { useFormikContext } from "formik";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { useSettingsState } from "../../context/settings";
import { SwapDirection, SwapFormValues } from "../DTOs/SwapFormValues";
import { ISelectMenuItem, SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import CommandSelectWrapper from "../Select/Command/CommandSelectWrapper";
import { ResolveNetworkOrder, SortAscending } from "../../lib/sorting"
import { LayerDisabledReason } from "../Select/Popover/PopoverSelect";
import NetworkSettings from "../../lib/NetworkSettings";
import { SelectMenuItemGroup } from "../Select/Command/commandSelect";
import { useQueryState } from "../../context/query";
import CurrencyFormField from "./CurrencyFormField";
import useSWR from 'swr'
import { ApiResponse } from "../../Models/ApiResponse";
import LayerSwapApiClient from "../../lib/layerSwapApiClient";
import { NetworkType, RouteNetwork } from "../../Models/Network";
import { Exchange } from "../../Models/Exchange";
import CurrencyGroupFormField from "./CEXCurrencyFormField";
import { QueryParams } from "../../Models/QueryParams";
import { Info } from "lucide-react";
import ClickTooltip from "../Tooltips/ClickTooltip";
import { resolveNetworkRoutesURL } from "../../helpers/routes";

type Props = {
    direction: SwapDirection,
    label: string,
    className?: string,
}
type LayerIsAvailable = {
    value: boolean;
    disabledReason: LayerDisabledReason;
} | {
    value: boolean;
    disabledReason: null;
}
const GROUP_ORDERS = { "Popular": 1, "Fiat": 3, "Networks": 4, "Exchanges": 5, "Other": 10, "Unavailable": 20 };
export const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
const getGroupName = (value: RouteNetwork | Exchange, type: 'cex' | 'network', layerIsAvailable?: LayerIsAvailable) => {
    if (NetworkSettings.KnownSettings[value.name]?.isFeatured && layerIsAvailable?.disabledReason !== LayerDisabledReason.InvalidRoute) {
        return "Popular";
    }
    else if (type === 'network') {
        return "Networks";
    }
    else if (type === 'cex') {
        return "Exchanges";
    }
    else {
        return "Other";
    }
}

const NetworkFormField = forwardRef(function NetworkFormField({ direction, label, className }: Props, ref: any) {
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();
    const name = direction

    const { from, to, fromCurrency, toCurrency, fromExchange, toExchange } = values
    const query = useQueryState()
    const { lockFrom, lockTo } = query

    const { destinationRoutes, sourceRoutes } = useSettingsState();
    let placeholder = "";
    let searchHint = "";
    let menuItems: (SelectMenuItem<RouteNetwork | Exchange> & { isExchange: boolean })[];

    const networkRoutesURL = resolveNetworkRoutesURL(direction, values)
    const apiClient = new LayerSwapApiClient()
    const {
        data: routes,
        isLoading,
        error
    } = useSWR<ApiResponse<RouteNetwork[]>>(`${networkRoutesURL}`, apiClient.fetcher, { keepPreviousData: true })

    const [routesData, setRoutesData] = useState<RouteNetwork[] | undefined>(direction === 'from' ? sourceRoutes : destinationRoutes)

    useEffect(() => {
        if (!isLoading && routes?.data) setRoutesData(routes.data)
    }, [routes])

    if (direction === "from") {
        placeholder = "Source";
        searchHint = "Swap from";
        menuItems = GenerateMenuItems(routesData, direction, !!(from && lockFrom), query);
    }
    else {
        placeholder = "Destination";
        searchHint = "Swap to";
        menuItems = GenerateMenuItems(routesData, direction, !!(to && lockTo), query);
    }

    const value = menuItems.find(x => !x.isExchange ?
        x.id == (direction === "from" ? from : to)?.name :
        x.id == (direction === 'from' ? fromExchange : toExchange)?.name);

    const handleSelect = useCallback((item: SelectMenuItem<RouteNetwork | Exchange> & { isExchange: boolean }) => {
        if (item.baseObject.name === value?.baseObject.name)
            return
        if (!item.isAvailable.value && item.isAvailable.disabledReason == LayerDisabledReason.InvalidRoute) {
            setFieldValue(name === "from" ? "to" : "from", null)
            setFieldValue(name === "from" ? "toExchange" : "fromExchange", null)
            setFieldValue(name, item.baseObject, true)
        } else if (item.isExchange) {
            setFieldValue(`${name}Exchange`, item.baseObject, true)
            setFieldValue(name, null, true)
        } else {
            setFieldValue(`${name}Exchange`, null, true)
            setFieldValue(name, item.baseObject, true)
            const currency = name == "from" ? fromCurrency : toCurrency
            const assetSubstitute = (item.baseObject as RouteNetwork)?.tokens?.find(a => a.symbol === currency?.symbol)
            if (assetSubstitute) {
                setFieldValue(`${name}Currency`, assetSubstitute, true)
            }
        }
    }, [name, value])

    const pickNetworkDetails = <div>
        {
            value?.isAvailable.disabledReason === LayerDisabledReason.LockNetworkIsTrue &&
            <div className='text-xs text-left text-secondary-text mb-2'>
                <Info className='h-3 w-3 inline-block mb-0.5' /><span>&nbsp;You&apos;re accessing Layerswap from a partner&apos;s page. In case you want to transact with other networks, please open layerswap.io in a separate tab.</span>
            </div>
        }
    </div>

    return (<div className={`p-3 bg-secondary-700 ${className}`}>
        <label htmlFor={name} className="block font-semibold text-secondary-text text-xs">
            {label}
        </label>
        <div ref={ref} className="mt-1.5 grid grid-flow-row-dense grid-cols-8 md:grid-cols-6 items-center pr-2">
            <div className="col-span-5 md:col-span-4">
                <CommandSelectWrapper
                    disabled={isLoading || error}
                    valueGrouper={groupByType}
                    placeholder={placeholder}
                    setValue={handleSelect}
                    value={value}
                    values={menuItems}
                    searchHint={searchHint}
                    isLoading={isLoading}
                    modalContent={pickNetworkDetails}
                />
            </div>
            <div className="col-span-3 md:col-span-2 w-full ml-2">
                {
                    value?.isExchange ?
                        <CurrencyGroupFormField direction={name} />
                        :
                        <CurrencyFormField direction={name} />
                }
            </div>
        </div>
    </div>)
});

function groupByType(values: ISelectMenuItem[]) {
    let groups: SelectMenuItemGroup[] = [];
    values.forEach((v) => {
        let group = groups.find(x => x.name == v.group) || new SelectMenuItemGroup({ name: v.group, items: [] });
        group.items.push(v);
        if (!groups.find(x => x.name == v.group)) {
            groups.push(group);
        }
    });

    groups.sort((a, b) => {
        // Sort put networks first then exchanges
        return (GROUP_ORDERS[a.name] || GROUP_ORDERS.Other) - (GROUP_ORDERS[b.name] || GROUP_ORDERS.Other);
    });

    return groups;
}

function GenerateMenuItems(routes: RouteNetwork[] | undefined, direction: SwapDirection, lock: boolean, query: QueryParams): (SelectMenuItem<RouteNetwork | Exchange> & { isExchange: boolean })[] {

    let layerIsAvailable = (route: RouteNetwork) => {
        if (lock) {
            return { value: false, disabledReason: LayerDisabledReason.LockNetworkIsTrue }
        }
        else if (!route.tokens?.some(r => r.status === 'active') || route.type === NetworkType.TON) {
            if (query.lockAsset || query.lockFromAsset || query.lockToAsset || query.lockFrom || query.lockTo || query.lockNetwork || query.lockExchange || !route.tokens?.some(r => r.status !== 'inactive') || route.type === NetworkType.TON) {
                return { value: false, disabledReason: LayerDisabledReason.InvalidRoute }
            }
            else {
                return { value: true, disabledReason: LayerDisabledReason.InvalidRoute }
            }
        }
        else {
        return { value: true, disabledReason: null }
    }
}

const mappedLayers = routes?.map(r => {
    const details = !r.tokens?.some(r => r.status !== 'inactive') ? <ClickTooltip side="left" text={`Transfers ${direction} this network are not available at the moment. Please try later.`} /> : undefined
    const isNewlyListed = r?.tokens?.every(t => new Date(t?.listing_date)?.getTime() >= new Date().getTime() - ONE_WEEK);
    const badge = isNewlyListed ? (
        <span className="bg-secondary-50 px-1 rounded text-xs flex items-center">New</span>
    ) : undefined;

    const res: SelectMenuItem<RouteNetwork> & { isExchange: boolean } = {
        baseObject: r,
        id: r.name,
        name: r.display_name,
        order: ResolveNetworkOrder(r, direction, isNewlyListed),
        imgSrc: r.logo,
        isAvailable: layerIsAvailable(r),
        group: getGroupName(r, 'network', layerIsAvailable(r)),
        isExchange: false,
        details,
        badge
    }
    return res;
}).sort(SortAscending) || [];

return mappedLayers
}

export default NetworkFormField