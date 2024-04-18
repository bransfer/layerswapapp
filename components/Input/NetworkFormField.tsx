import { useFormikContext } from "formik";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { useSettingsState } from "../../context/settings";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import { SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import CommandSelectWrapper from "../Select/Command/CommandSelectWrapper";
import ExchangeSettings from "../../lib/ExchangeSettings";
import { SortingByAvailability } from "../../lib/sorting"
import { LayerDisabledReason } from "../Select/Popover/PopoverSelect";
import NetworkSettings from "../../lib/NetworkSettings";
import { SelectMenuItemGroup } from "../Select/Command/commandSelect";
import { useQueryState } from "../../context/query";
import CurrencyFormField from "./CurrencyFormField";
import useSWR from 'swr'
import { ApiResponse } from "../../Models/ApiResponse";
import LayerSwapApiClient from "../../lib/layerSwapApiClient";
import { Network, RouteNetwork } from "../../Models/Network";
import { Exchange } from "../../Models/Exchange";
import CurrencyGroupFormField from "./CEXCurrencyFormField";
import { QueryParams } from "../../Models/QueryParams";
import { Info } from "lucide-react";

type SwapDirection = "from" | "to";
type Props = {
    direction: SwapDirection,
    label: string,
    className?: string,
}
export type LayerIsAvailable = {
    value: boolean;
    disabledReason: LayerDisabledReason;
} | {
    value: boolean;
    disabledReason: null;
}
const GROUP_ORDERS = { "Popular": 1, "New": 2, "Fiat": 3, "Networks": 4, "Exchanges": 5, "Other": 10, "Unavailable": 20 };
const getGroupName = (value: RouteNetwork | Exchange, type: 'cex' | 'network', layerIsAvailable?: LayerIsAvailable) => {
    if (NetworkSettings.KnownSettings[value.name]?.isFeatured && layerIsAvailable?.disabledReason !== LayerDisabledReason.InvalidRoute) {
        return "Popular";
    }
    else if (new Date(value.metadata?.listing_date).getTime() >= (new Date().getTime() - 2629800000)) {
        return "New";
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

    const { from, to, fromCurrency, toCurrency, fromExchange, toExchange, currencyGroup } = values
    const query = useQueryState()
    const { lockFrom, lockTo } = query

    const { exchanges, destinationRoutes, sourceRoutes } = useSettingsState();
    let placeholder = "";
    let searchHint = "";
    let menuItems: (SelectMenuItem<RouteNetwork | Exchange> & { isExchange: boolean })[];

    const filterWith = direction === "from" ? to : from
    const filterWithAsset = direction === "from" ? toCurrency?.symbol : fromCurrency?.symbol

    const filterWithExchange = direction === 'from' ? toExchange : fromExchange

    const apiClient = new LayerSwapApiClient()
    const include_unmatched = 'true'

    const exchangeParams = new URLSearchParams({
        include_unmatched,
        ...(currencyGroup ?
            (currencyGroup ? {
                [direction === 'to' ? 'source_token_group' : 'destination_token_group']: currencyGroup.symbol
            } : {})
            :
            (filterWithAsset && filterWith ? {
                [direction === 'to' ? 'source_network' : 'destination_network']: filterWith.name,
                [direction === 'to' ? 'source_token' : 'destination_token']: filterWithAsset,
            } : {})
        )
    });


    const networkParams = new URLSearchParams({
        include_unmatched,
        ...(filterWith && filterWithAsset ?
            {
                [direction === 'to' ? 'source_network' : 'destination_network']: filterWith?.name,
                [direction === 'to' ? 'source_token' : 'destination_token']: filterWithAsset,
            }
            : {}
        )
    });

    const params = (filterWithExchange && currencyGroup) ? exchangeParams : networkParams
    const sourceRoutesURL = filterWithExchange && currencyGroup ? `/exchange_source_networks?${params.toString()}` : `/sources?${params.toString()}`
    const destinationRoutesURL = filterWithExchange && currencyGroup ? `/exchange_destination_networks?${params.toString()}` : `/destinations?${params.toString()}`
    const routesEndpoint = direction === "from" ? sourceRoutesURL : destinationRoutesURL

    const {
        data: routes,
        isLoading,
        error
    } = useSWR<ApiResponse<RouteNetwork[]>>(`${routesEndpoint}`, apiClient.fetcher, { keepPreviousData: true })

    const [routesData, setRoutesData] = useState<RouteNetwork[] | undefined>(direction === 'from' ? sourceRoutes : destinationRoutes)

    useEffect(() => {
        if (!isLoading && routes?.data) setRoutesData(routes.data)
        // else if (!isLoading && !routes?.data) setRoutesData(undefined)
    }, [routes])

    if (direction === "from") {
        placeholder = "Source";
        searchHint = "Swap from";
        menuItems = GenerateMenuItems(routesData, toExchange ? [] : exchanges, direction, !!(from && lockFrom), query);
    }
    else {
        placeholder = "Destination";
        searchHint = "Swap to";
        menuItems = GenerateMenuItems(routesData, fromExchange ? [] : exchanges, direction, !!(to && lockTo), query);
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

    return (<div className={`p-3 bg-secondary-700 border border-secondary-500 ${className}`}>
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

function groupByType(values: SelectMenuItem<Network>[]) {
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

function GenerateMenuItems(routes: RouteNetwork[] | undefined, exchanges: Exchange[], direction: SwapDirection, lock: boolean, query: QueryParams): (SelectMenuItem<RouteNetwork | Exchange> & { isExchange: boolean })[] {

    let layerIsAvailable = (route: RouteNetwork) => {
        if (lock) {
            return { value: false, disabledReason: LayerDisabledReason.LockNetworkIsTrue }
        }
        else if (!route.tokens?.some(r => r.status === 'active')) {
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

    const mappedLayers = routes?.map(l => {
        let orderProp: keyof NetworkSettings | keyof ExchangeSettings = direction == 'from' ? 'OrderInSource' : 'OrderInDestination';
        const order = NetworkSettings.KnownSettings[l.name]?.[orderProp]
        const res: SelectMenuItem<RouteNetwork> & { isExchange: boolean } = {
            baseObject: l,
            id: l.name,
            name: l.display_name,
            order: order || 100,
            imgSrc: l.logo,
            isAvailable: layerIsAvailable(l),
            group: getGroupName(l, 'network', layerIsAvailable(l)),
            isExchange: false,
        }
        return res;
    }).sort(SortingByAvailability) || [];

    const mappedExchanges = exchanges.map(e => {
        let orderProp: keyof ExchangeSettings = direction == 'from' ? 'OrderInSource' : 'OrderInDestination';
        const order = ExchangeSettings.KnownSettings[e.name]?.[orderProp]
        const res: SelectMenuItem<Exchange> & { isExchange: boolean } = {
            baseObject: e,
            id: e.name,
            name: e.display_name,
            order: order || 100,
            imgSrc: e.logo,
            isAvailable: exchangeIsAvailable(e),
            group: getGroupName(e, 'cex'),
            isExchange: true,
        }
        return res;
    }).sort(SortingByAvailability);

    const items = [...mappedExchanges, ...mappedLayers]
    return items
}

export default NetworkFormField