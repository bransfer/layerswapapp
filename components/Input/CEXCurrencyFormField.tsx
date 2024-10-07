import { useFormikContext } from "formik";
import { FC, useCallback, useEffect } from "react";
import { SwapDirection, SwapFormValues } from "../DTOs/SwapFormValues";
import { SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import { ResolveCEXCurrencyOrder } from "../../lib/sorting";
import { useQueryState } from "../../context/query";
import CommandSelectWrapper from "../Select/Command/CommandSelectWrapper";
import { Exchange, ExchangeToken } from "../../Models/Exchange";
import { resolveExchangesURLForSelectedToken } from "../../helpers/routes";
import { ApiResponse } from "../../Models/ApiResponse";
import useSWR from "swr";
import LayerSwapApiClient from "../../lib/layerSwapApiClient";
import ResolveRouteIcon from "./RouteIcon";
import { Network } from "../../Models/Network";
import { SelectMenuItemGroup } from "../Select/Command/commandSelect";
import Image from 'next/image'

const GROUP_ORDERS = { "Popular": 1, "Fiat": 3, "Networks": 4, "Exchanges": 5, "Other": 10, "Unavailable": 20 };
export function groupByType(values: SelectMenuItem<Network>[]) {
    let groups: SelectMenuItemGroup[] = [];
    values.forEach((v) => {
        let group = groups.find(x => x.name == v.group) || new SelectMenuItemGroup({ name: v.group, items: [] });
        group.items.push(v);
        if (!groups.find(x => x.name == v.group)) {
            groups.push(group);
        }
    });

    groups.sort((a, b) => {
        return (GROUP_ORDERS[a.name] || GROUP_ORDERS.Other) - (GROUP_ORDERS[b.name] || GROUP_ORDERS.Other);
    });

    return groups;
}

const CurrencyGroupFormField: FC<{ direction: SwapDirection }> = ({ direction }) => {
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();
    const { to, fromCurrency, toCurrency, from, currencyGroup, toExchange, fromExchange } = values

    const name = 'currencyGroup'
    const query = useQueryState()
    const exchange = direction === 'from' ? fromExchange : toExchange
    const exchangeRoutesURL = resolveExchangesURLForSelectedToken(direction, values)
    const apiClient = new LayerSwapApiClient()
    const {
        data: exchanges,
        error
    } = useSWR<ApiResponse<Exchange[]>>(`${exchangeRoutesURL}`, apiClient.fetcher, { keepPreviousData: true })

    const availableAssetGroups = exchanges?.data?.find(e => e.name === exchange?.name)?.token_groups

    const isLocked = direction === 'from' ? query?.lockFromAsset : query?.lockToAsset
    const asset = direction === 'from' ? query?.fromAsset : query?.toAsset
    const lockedCurrency = isLocked
        ? availableAssetGroups?.find(a => a.symbol.toUpperCase() === (asset)?.toUpperCase())
        : undefined

    const filteredCurrencies = lockedCurrency ? [lockedCurrency] : availableAssetGroups

    const currencyMenuItems = GenerateCurrencyMenuItems(
        filteredCurrencies!,
        direction,
        lockedCurrency
    )
    
    const value = currencyMenuItems?.find(x => x.id == currencyGroup?.symbol);

    useEffect(() => {
        if (value) return
        if (currencyMenuItems?.[0])
            setFieldValue(name, currencyMenuItems?.[0]?.baseObject)
        return () => { setFieldValue(name, null) }
    }, [])

    useEffect(() => {
        const value = availableAssetGroups?.find(r => r.symbol === currencyGroup?.symbol)
        if (!value) return
        setFieldValue(name, value)
    }, [fromCurrency, toCurrency, availableAssetGroups])

    const handleSelect = useCallback((item: SelectMenuItem<ExchangeToken>) => {
        setFieldValue(name, item.baseObject, true)
    }, [name, direction, toCurrency, fromCurrency, from, to])

    return <CommandSelectWrapper
        disabled={!value?.isAvailable}
        valueGrouper={groupByType}
        placeholder="Asset"
        setValue={handleSelect}
        value={value}
        values={currencyMenuItems}
        searchHint='Search'
    />;
}

export function GenerateCurrencyMenuItems(
    currencies: ExchangeToken[],
    direction: string,
    lockedCurrency?: ExchangeToken | undefined,
): SelectMenuItem<ExchangeToken>[] {

    return currencies?.map(c => {
        const currency = c
        const displayName = lockedCurrency?.symbol ?? currency.symbol;

        const isAvailable = (lockedCurrency || (c?.status !== "active" && c.status !== "not_found")) ? false : true;

        const routeNotFound = c.status === "not_found"

        const logo = <div className="flex-shrink-0 h-6 w-6 relative">
            {c.logo && (
                <Image
                    src={c.logo}
                    alt="Project Logo"
                    height="40"
                    width="40"
                    loading="eager"
                    className="rounded-md object-contain"
                />
            )}
        </div>

        const res: SelectMenuItem<ExchangeToken> = {
            baseObject: c,
            id: c.symbol,
            name: displayName || "-",
            order: ResolveCEXCurrencyOrder(c),
            imgSrc: c.logo,
            isAvailable: isAvailable,
            leftIcon: ResolveRouteIcon({ direction, isAvailable, routeNotFound, type: 'token' }),
            logo
        };
        return res
    });
}

export default CurrencyGroupFormField
