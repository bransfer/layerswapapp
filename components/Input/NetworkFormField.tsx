import { useFormikContext } from "formik";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { useSettingsState } from "../../context/settings";
import { SwapDirection, SwapFormValues } from "../DTOs/SwapFormValues";
import { ISelectMenuItem, SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import CommandSelectWrapper from "../Select/Command/CommandSelectWrapper";
import { ResolveExchangeOrder, ResolveNetworkOrder, SortAscending } from "../../lib/sorting"
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
import { resolveExchangesURLForSelectedToken, resolveNetworkRoutesURL } from "../../helpers/routes";
import RouteIcon from "./RouteIcon";
import SourceWalletPicker from "./SourceWalletPicker";
import DestinationWalletPicker from "./DestinationWalletPicker";
import dynamic from "next/dynamic";
import { Partner } from "../../Models/Partner";
import { PlusIcon } from "lucide-react";

type Props = {
    direction: SwapDirection,
    label: string,
    className?: string,
    partner?: Partner
}
const Address = dynamic(() => import("../Input/Address"), {
    loading: () => <></>,
});

const GROUP_ORDERS = { "Popular": 1, "Fiat": 3, "Networks": 4, "Exchanges": 5, "Other": 10, "Unavailable": 20 };
export const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
const getGroupName = (value: RouteNetwork | Exchange, type: 'cex' | 'network', canShowInPopular?: boolean) => {
    if (NetworkSettings.KnownSettings[value.name]?.isFeatured && canShowInPopular) {
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

const NetworkFormField = forwardRef(function NetworkFormField({ direction, label, className, partner }: Props, ref: any) {
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();
    const name = direction

    const { from, to, fromCurrency, toCurrency, fromExchange, toExchange, destination_address, currencyGroup } = values
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
    } = useSWR<ApiResponse<RouteNetwork[]>>(networkRoutesURL, apiClient.fetcher, { keepPreviousData: true, dedupingInterval: 10000 })

    const [routesData, setRoutesData] = useState<RouteNetwork[] | undefined>(direction === 'from' ? sourceRoutes : destinationRoutes)

    // const exchangeRoutesURL = resolveExchangesURLForSelectedToken(direction, values)
    // const {
    //     data: exchanges,
    //     isLoading: exchnagesDataLoading,
    // } = useSWR<ApiResponse<Exchange[]>>(exchangeRoutesURL, apiClient.fetcher, { keepPreviousData: true, dedupingInterval: 10000, })

    const [exchangesData, setExchangesData] = useState<Exchange[]>([])

    // useEffect(() => {
    //     if (!exchnagesDataLoading && exchanges?.data) setExchangesData(exchanges.data)
    // }, [exchanges])

    useEffect(() => {
        if (!isLoading && routes?.data) setRoutesData(routes.data)
    }, [routes])

    const disableExchanges = process.env.NEXT_PUBLIC_DISABLE_EXCHANGES === 'true'

    if (direction === "from") {
        placeholder = "Source";
        searchHint = "Swap from";
        menuItems = GenerateMenuItems(routesData, toExchange || disableExchanges ? [] : exchangesData, direction, !!(from && lockFrom), query);
    }
    else {
        placeholder = "Destination";
        searchHint = "Swap to";
        menuItems = GenerateMenuItems(routesData, fromExchange || disableExchanges ? [] : exchangesData, direction, !!(to && lockTo), query);
    }

    const value = menuItems.find(x => !x.isExchange ?
        x.id == (direction === "from" ? from : to)?.name :
        x.id == (direction === 'from' ? fromExchange : toExchange)?.name);

    const handleSelect = useCallback((item: SelectMenuItem<RouteNetwork | Exchange> & { isExchange: boolean }) => {
        if (item.baseObject.name === value?.baseObject.name)
            return
        if (item.isExchange) {
            setFieldValue(name, null)
            setFieldValue(`${name}Currency`, null)
            setFieldValue(`${name}Exchange`, item.baseObject, true)
        } else {
            setFieldValue(`${name}Exchange`, null)
            setFieldValue(name, item.baseObject, true)
            const currency = name == "from" ? fromCurrency : toCurrency
            const assetSubstitute = (item.baseObject as RouteNetwork)?.tokens?.find(a => a.symbol === currency?.symbol)
            if (assetSubstitute) {
                setFieldValue(`${name}Currency`, assetSubstitute, true)
            }
        }
    }, [name, value])

    const isLocked = direction === 'from' ? !!lockFrom : !!lockTo

    return (<div className={`${className}`}>
        <div className="flex justify-between items-center px-3 pt-2">
            <label htmlFor={name} className="block font-medium text-secondary-text text-sm pl-1 py-1">
                {label}
            </label>
            {
                direction === "from" ?
                    <SourceWalletPicker />
                    : <>
                        {
                            !value?.isExchange &&
                            <span><Address partner={partner} >{
                                ({ destination, disabled, addressItem, connectedWallet, partner }) => <DestinationWalletPicker destination={destination} disabled={disabled} addressItem={addressItem} connectedWallet={connectedWallet} partner={partner} />
                            }</Address></span> 
                        }
                    </>
            }
        </div>
        <div ref={ref} className="p-3 rounded-xl grid grid-flow-row-dense grid-cols-6 items-center gap-2">
            <div className="col-span-4">
                <CommandSelectWrapper
                    disabled={isLocked || isLoading}
                    valueGrouper={groupByType}
                    placeholder={placeholder}
                    setValue={handleSelect}
                    value={value}
                    values={menuItems}
                    searchHint={searchHint}
                    isLoading={isLoading}
                    direction={direction}
                />
            </div>
            <div className="col-span-2 w-full">
                {
                    value?.isExchange ?
                        <CurrencyGroupFormField direction={name} />
                        :
                        <CurrencyFormField direction={name} />
                }
            </div>
            {
                direction === "to" && !destination_address && !toExchange && to &&
                <div className="flex items-center col-span-6">
                    <Address partner={partner} >{SecondDestinationWalletPicker}</Address>
                </div>
            }
        </div>
    </div >)
});

export const SecondDestinationWalletPicker = () => {
    return <div className=" justify-center w-full pl-3 pr-2 py-2 bg-secondary-600 items-center flex font-light space-x-2 mx-auto rounded-lg focus-peer:ring-primary focus-peer:border-secondary-400 focus-peer:border focus-peer:ring-1 focus:outline-none disabled:cursor-not-allowed relative grow h-12 ">
        <PlusIcon className="stroke-1" /> <span>Destination Address</span>
    </div>
}


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

function GenerateMenuItems(routes: RouteNetwork[] | undefined, exchanges: Exchange[], direction: SwapDirection, lock: boolean, query: QueryParams): (SelectMenuItem<RouteNetwork | Exchange> & { isExchange: boolean })[] {
    const mappedLayers = routes?.map(r => {
        const isNewlyListed = r?.tokens?.every(t => new Date(t?.listing_date)?.getTime() >= new Date().getTime() - ONE_WEEK);
        const badge = isNewlyListed ? (
            <span className="bg-secondary-50 px-1 rounded text-xs flex items-center">New</span>
        ) : undefined;

        const isAvailable = !lock &&
            (
                r.tokens?.some(r => r.status === 'active' || r.status === 'not_found') ||
                !query.lockAsset && !query.lockFromAsset && !query.lockToAsset && !query.lockFrom && !query.lockTo && !query.lockNetwork && !query.lockExchange && r.tokens?.some(r => r.status !== 'inactive')
            );

        const order = ResolveNetworkOrder(r, direction, isNewlyListed)
        const routeNotFound = isAvailable && !r.tokens?.some(r => r.status === 'active');

        const res: SelectMenuItem<RouteNetwork> & { isExchange: boolean } = {
            baseObject: r,
            id: r.name,
            name: r.display_name,
            order,
            imgSrc: r.logo,
            isAvailable: isAvailable,
            group: getGroupName(r, 'network', isAvailable && !routeNotFound),
            isExchange: false,
            badge,
            leftIcon: <RouteIcon direction={direction} isAvailable={isAvailable} routeNotFound={routeNotFound} type="network" />,
        }
        return res;
    }).sort(SortAscending) || [];

    const mappedExchanges = exchanges?.map(e => {
        const res: SelectMenuItem<Exchange> & { isExchange: boolean } = {
            baseObject: e,
            id: e.name,
            name: e.display_name,
            order: ResolveExchangeOrder(e, direction),
            imgSrc: e.logo,
            isAvailable: lock ? false : true,
            group: getGroupName(e, 'cex'),
            isExchange: true,
        }
        return res;
    }).sort(SortAscending) || [];

    const items = [...mappedExchanges, ...mappedLayers]
    return items
}

export default NetworkFormField