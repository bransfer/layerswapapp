import { useFormikContext } from "formik";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { useSettingsState } from "../../context/settings";
import { SwapDirection, SwapFormValues } from "../DTOs/SwapFormValues";
import { ILogoCoordinates, ILogoMetadata, ISelectMenuItem, SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import CommandSelectWrapper from "../Select/Command/CommandSelectWrapper";
import { ResolveExchangeOrder, ResolveNetworkOrder, SortAscending } from "../../lib/sorting"
import NetworkSettings from "../../lib/NetworkSettings";
import { SelectMenuItemGroup } from "../Select/Command/commandSelect";
import { useQueryState } from "../../context/query";
import CurrencyFormField from "./CurrencyFormField";
import useSWR from 'swr'
import { ApiResponse } from "../../Models/ApiResponse";
import LayerSwapApiClient from "../../lib/layerSwapApiClient";
import { RouteNetwork } from "../../Models/Network";
import { Exchange } from "../../Models/Exchange";
import CurrencyGroupFormField from "./CEXCurrencyFormField";
import { QueryParams } from "../../Models/QueryParams";
import { resolveExchangesURLForSelectedToken, resolveNetworkRoutesURL } from "../../helpers/routes";
import RouteIcon from "./RouteIcon";
import AppSettings from "../../lib/AppSettings";
import NetworkLogo from "./NetworkLogo";

type Props = {
    direction: SwapDirection,
    label: string,
    className?: string,
}

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

const NetworkFormField = forwardRef(function NetworkFormField({ direction, label, className }: Props, ref: any) {
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();
    const name = direction

    const { from, to, fromCurrency, toCurrency, fromExchange, toExchange } = values
    const query = useQueryState()
    const { lockFrom, lockTo } = query

    const { sourceExchanges, destinationExchanges, destinationRoutes, sourceRoutes } = useSettingsState();
    let placeholder = "";
    let searchHint = "";
    let menuItems: (SelectMenuItem<RouteNetwork | Exchange> & { isExchange: boolean })[];

    const networkRoutesURL = resolveNetworkRoutesURL(direction, values)
    const apiClient = new LayerSwapApiClient()

    const metadataURL = `${AppSettings.ImageStorage}metadata.json`
    const {
        data: metadata,
        isLoading: metadataLoading,
    } = useSWR<ApiResponse<ILogoMetadata[]> | ILogoMetadata[]>(`${metadataURL}`, apiClient.outboundFetcher, { keepPreviousData: true })

    const [logoMetadata, setLogoMetadata] = useState<ILogoMetadata[]>([])

    const {
        data: routes,
        isLoading,
        error
    } = useSWR<ApiResponse<RouteNetwork[]>>(`${networkRoutesURL}`, apiClient.fetcher, { keepPreviousData: true })

    const [routesData, setRoutesData] = useState<RouteNetwork[] | undefined>(direction === 'from' ? sourceRoutes : destinationRoutes)

    const exchangeRoutesURL = resolveExchangesURLForSelectedToken(direction, values)
    const {
        data: exchanges,
        isLoading: exchnagesDataLoading,
    } = useSWR<ApiResponse<Exchange[]>>(`${exchangeRoutesURL}`, apiClient.fetcher, { keepPreviousData: true })

    const [exchangesData, setExchangesData] = useState<Exchange[]>(direction === 'from' ? sourceExchanges : destinationExchanges)

    useEffect(() => {
        if (!metadataLoading && metadata) setLogoMetadata(metadata as ILogoMetadata[])
    }, [metadata])

    useEffect(() => {
        if (!exchnagesDataLoading && exchanges?.data) setExchangesData(exchanges.data)
    }, [exchanges])

    useEffect(() => {
        if (!isLoading && routes?.data) setRoutesData(routes.data)
    }, [routes])

    const disableExchanges = process.env.NEXT_PUBLIC_DISABLE_EXCHANGES === 'true'

    if (direction === "from") {
        placeholder = "Source";
        searchHint = "Swap from";
        menuItems = GenerateMenuItems(routesData, toExchange || disableExchanges ? [] : exchangesData, direction, !!(from && lockFrom), query, logoMetadata);
    }
    else {
        placeholder = "Destination";
        searchHint = "Swap to";
        menuItems = GenerateMenuItems(routesData, fromExchange || disableExchanges ? [] : exchangesData, direction, !!(to && lockTo), query, logoMetadata);
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

    return (<div className={`p-3 bg-secondary-700 border border-secondary-500 ${className}`}>
        <label htmlFor={name} className="block font-semibold text-secondary-text text-xs">
            {label}
        </label>
        <div ref={ref} className="mt-1.5 grid grid-flow-row-dense grid-cols-8 md:grid-cols-6 items-center pr-2">
            <div className="col-span-5 md:col-span-4">
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

function getLogoCoords(logoMetadata: ILogoMetadata[], url: string): ILogoCoordinates {
    const name = url.split('/').pop();
    const metadata = logoMetadata?.find(l => l.filename === name);
    return {
        x: metadata?.x || 0,
        y: metadata?.y || 0
    }
}

function GenerateMenuItems(routes: RouteNetwork[] | undefined, exchanges: Exchange[], direction: SwapDirection, lock: boolean, query: QueryParams, logoMetadata: ILogoMetadata[]): (SelectMenuItem<RouteNetwork | Exchange> & { isExchange: boolean })[] {
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

        const logoCoords = getLogoCoords(logoMetadata, r.logo)

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
            logo: <NetworkLogo x={logoCoords.x} y={logoCoords.y} />
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