import { useFormikContext } from "formik";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { useSettingsState } from "../../context/settings";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import { ISelectMenuItem, SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import { Layer } from "../../Models/Layer";
import CommandSelectWrapper from "../Select/Command/CommandSelectWrapper";
import ExchangeSettings from "../../lib/ExchangeSettings";
import { SortingByAvailability, SortingByOrder } from "../../lib/sorting"
import { LayerDisabledReason } from "../Select/Popover/PopoverSelect";
import NetworkSettings from "../../lib/NetworkSettings";
import { SelectMenuItemGroup } from "../Select/Command/commandSelect";
import { useQueryState } from "../../context/query";
import CurrencyFormField from "./CurrencyFormField";
import useSWR from 'swr'
import { ApiResponse } from "../../Models/ApiResponse";
import LayerSwapApiClient from "../../lib/layerSwapApiClient";
import { NetworkCurrency } from "../../Models/CryptoNetwork";
import { Exchange } from "../../Models/Exchange";
import CurrencyGroupFormField from "./CEXCurrencyFormField";
import { QueryParams } from "../../Models/QueryParams";

type SwapDirection = "from" | "to";
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
const GROUP_ORDERS = { "Popular": 1, "New": 2, "Fiat": 3, "Networks": 4, "Exchanges": 5, "Other": 10, "Unavailable": 20 };
const getGroupName = (value: Layer | Exchange, type: 'cex' | 'layer', layerIsAvailable?: LayerIsAvailable) => {
    if (value.is_featured && layerIsAvailable?.disabledReason !== LayerDisabledReason.InvalidRoute) {
        return "Popular";
    }
    else if (new Date(value.created_date).getTime() >= (new Date().getTime() - 2629800000)) {
        return "New";
    }
    else if (type === 'layer') {
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

    const { from, to, fromCurrency, toCurrency, fromExchange, toExchange, currencyGroup } = values
    const query = useQueryState()
    const { lockFrom, lockTo } = query

    const { resolveImgSrc, layers, exchanges, destinationRoutes, sourceRoutes, assetGroups } = useSettingsState();
    let placeholder = "";
    let searchHint = "";
    let filteredLayers: Layer[];
    let menuItems: SelectMenuItem<Layer | Exchange>[];

    const filterWith = direction === "from" ? to : from
    const filterWithAsset = direction === "from" ? toCurrency?.asset : fromCurrency?.asset

    const filterWithExchange = direction === 'from' ? toExchange : fromExchange

    const apiClient = new LayerSwapApiClient()
    const version = LayerSwapApiClient.apiVersion

    const exchangeParams = new URLSearchParams({
        version,
        ...(currencyGroup?.groupedInBackend ?
            (currencyGroup ? {
                [direction === 'to' ? 'source_asset_group' : 'destination_asset_group']: currencyGroup.name
            } : {})
            :
            {
                [direction === 'to' ? 'source_network' : 'destination_network']: filterWith?.internal_name,
                [direction === 'to' ? 'source_asset' : 'destination_asset']: filterWithAsset,
            }
        )
    });

    const networkParams = new URLSearchParams({
        version,
        ...(filterWith && filterWithAsset ?
            {
                [direction === 'to' ? 'source_network' : 'destination_network']: filterWith?.internal_name,
                [direction === 'to' ? 'source_asset' : 'destination_asset']: filterWithAsset,
            }
            : {}
        )
    });

    const params = (filterWithExchange && currencyGroup) ? exchangeParams : networkParams
    const sourceRoutesURL = `/routes/sources?${params.toString()}`
    const destinationRoutesURL = `/routes/destinations?${params.toString()}`
    const routesEndpoint = direction === "from" ? sourceRoutesURL : destinationRoutesURL

    const { data: routes, isLoading, error } = useSWR<ApiResponse<Route[]>>(routesEndpoint, apiClient.fetcher)

    const [routesData, setRoutesData] = useState<Route[]>()

    useEffect(() => {
        if (!isLoading && routes?.data) setRoutesData(routes.data)
        else if (!isLoading && !routes?.data) setRoutesData(undefined)
    }, [routes])

    if (direction === "from") {
        placeholder = "Source";
        searchHint = "Swap from";
        filteredLayers = layers.filter(l => sourceRoutes?.some(r => r.network === l.internal_name))
        menuItems = GenerateMenuItems(filteredLayers, toExchange ? [] : exchanges.filter(e => e.is_enabled), resolveImgSrc, direction, !!(from && lockFrom), routesData, query);
    }
    else {
        placeholder = "Destination";
        searchHint = "Swap to";
        filteredLayers = layers.filter(l => destinationRoutes?.some(r => r.network === l.internal_name))
        menuItems = GenerateMenuItems(filteredLayers, fromExchange ? [] : exchanges.filter(e => e.is_enabled), resolveImgSrc, direction, !!(to && lockTo), routesData, query);
    }

    const value = menuItems.find(x => x.type === 'layer' ?
        x.id == (direction === "from" ? from : to)?.internal_name :
        x.id == (direction === 'from' ? fromExchange : toExchange)?.internal_name);

    const handleSelect = useCallback((item: SelectMenuItem<Layer | Exchange>) => {
        if (item.baseObject.internal_name === value?.baseObject.internal_name)
            return
        if (!item.isAvailable.value && item.isAvailable.disabledReason == LayerDisabledReason.InvalidRoute) {
            setFieldValue(name === "from" ? "to" : "from", null)
            setFieldValue(name === "from" ? "toExchange" : "fromExchange", null)
            setFieldValue(name, item.baseObject, true)
        } else if (item.type === 'cex') {
            setFieldValue(`${name}Exchange`, item.baseObject, true)
            setFieldValue(name, null, true)
        } else {
            setFieldValue(`${name}Exchange`, null, true)
            setFieldValue(name, item.baseObject, true)
            const currency = name == "from" ? fromCurrency : toCurrency
            const groupSubstitute = (item.baseObject as Layer)?.assets?.find(a => a.group_name === currency?.group_name)
            if (groupSubstitute) {
                setFieldValue(`${name}Currency`, groupSubstitute, true)
            }
        }
    }, [name, assetGroups, toCurrency, fromCurrency, value])

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
                />
            </div>
            <div className="col-span-3 md:col-span-2 w-full ml-2">
                {
                    value?.type === 'cex' ?
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

function GenerateMenuItems(layers: Layer[], exchanges: Exchange[], resolveImgSrc: (item: Layer | Exchange | NetworkCurrency) => string, direction: SwapDirection, lock: boolean, routesData: Route[] | undefined, query: QueryParams): SelectMenuItem<Layer | Exchange>[] {

    let layerIsAvailable = (layer: Layer) => {
        if (lock) {
            return { value: false, disabledReason: LayerDisabledReason.LockNetworkIsTrue }
        }
        else if (!routesData?.some(r => r.network === layer.internal_name)) {
            if (query.lockAsset || query.lockFromAsset || query.lockToAsset || query.lockFrom || query.lockTo || query.lockNetwork || query.lockExchange) {
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

    let exchangeIsAvailable = (exchange: Exchange) => {
        if (lock) {
            return { value: false, disabledReason: LayerDisabledReason.LockNetworkIsTrue }
        } else {
            return { value: true, disabledReason: null }
        }
    }

    const mappedLayers = layers.map(l => {
        let orderProp: keyof NetworkSettings | keyof ExchangeSettings = direction == 'from' ? 'OrderInSource' : 'OrderInDestination';
        const order = NetworkSettings.KnownSettings[l.internal_name]?.[orderProp]
        const res: SelectMenuItem<Layer> = {
            baseObject: l,
            id: l.internal_name,
            name: l.display_name,
            order: order || 100,
            imgSrc: resolveImgSrc && resolveImgSrc(l),
            isAvailable: layerIsAvailable(l),
            type: 'layer',
            group: getGroupName(l, 'layer', layerIsAvailable(l))
        }
        return res;
    }).sort(SortingByAvailability);

    const mappedExchanges = exchanges.map(e => {
        let orderProp: keyof ExchangeSettings = direction == 'from' ? 'OrderInSource' : 'OrderInDestination';
        const order = ExchangeSettings.KnownSettings[e.internal_name]?.[orderProp]
        const res: SelectMenuItem<Exchange> = {
            baseObject: e,
            id: e.internal_name,
            name: e.display_name,
            order: order || 100,
            imgSrc: resolveImgSrc && resolveImgSrc(e),
            isAvailable: exchangeIsAvailable(e),
            type: 'cex',
            group: getGroupName(e, 'cex')
        }
        return res;
    }).sort(SortingByAvailability);

    const items = [...mappedExchanges, ...mappedLayers]
    return items
}

type Route = {
    network: string,
    asset: string
}

export default NetworkFormField