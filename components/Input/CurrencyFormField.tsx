import { useFormikContext } from "formik";
import { FC, useCallback, useEffect, useState } from "react";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import { SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import CurrencySettings from "../../lib/CurrencySettings";
import { SortingByAvailability } from "../../lib/sorting";
import { useBalancesState } from "../../context/balances";
import { truncateDecimals } from "../utils/RoundDecimals";
import { useQueryState } from "../../context/query";
import { Network, NetworkWithTokens, RouteNetwork, RouteToken } from "../../Models/Network";
import LayerSwapApiClient from "../../lib/layerSwapApiClient";
import useSWR from "swr";
import { ApiResponse } from "../../Models/ApiResponse";
import { Balance } from "../../Models/Balance";
import dynamic from "next/dynamic";
import { QueryParams } from "../../Models/QueryParams";
import { ApiError, LSAPIKnownErrorCode } from "../../Models/ApiError";
import CommandSelectWrapper from "../Select/Command/CommandSelectWrapper";
import Image from 'next/image'

const BalanceComponent = dynamic(() => import("./dynamic/Balance"), {
    loading: () => <></>,
});

const CurrencyFormField: FC<{ direction: string }> = ({ direction }) => {
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();

    const { to, fromCurrency, toCurrency, from, currencyGroup, toExchange, fromExchange } = values
    const name = direction === 'from' ? 'fromCurrency' : 'toCurrency';
    const query = useQueryState()
    const { balances } = useBalancesState()
    const [walletAddress, setWalletAddress] = useState<string>()

    const apiClient = new LayerSwapApiClient()
    const include_unmatched = 'true'

    const sourceRouteParams = new URLSearchParams({
        include_unmatched,
        ...(toExchange && currencyGroup ?
            {
                destination_token_group: currencyGroup.symbol
            }
            : {
                ...(to && toCurrency &&
                {
                    destination_network: to.name,
                    destination_token: toCurrency?.symbol
                })
            })
    });

    const destinationRouteParams = new URLSearchParams({
        include_unmatched,
        ...(fromExchange && currencyGroup ?
            {
                source_token_group: currencyGroup.symbol
            }
            : {
                ...(from && fromCurrency &&
                {
                    source_network: from.name,
                    source_token: fromCurrency?.symbol
                }
                )
            })
    });

    const sourceRoutesURL = toExchange && currencyGroup ? `/exchange_source_networks?${sourceRouteParams}` : `/sources?${sourceRouteParams}`
    const destinationRoutesURL = fromExchange && currencyGroup ? `/exchange_destination_networks?${destinationRouteParams}` : `/destinations?${destinationRouteParams}`

    const { data: sourceRoutes,
        error: sourceRoutesError,
        isLoading: sourceRoutesLoading
    } = useSWR<ApiResponse<RouteNetwork[]>>(sourceRoutesURL, apiClient.fetcher, { keepPreviousData: true })

    const {
        data: destinationRoutes,
        error: destRoutesError,
        isLoading: destRoutesLoading
    } = useSWR<ApiResponse<RouteNetwork[]>>(destinationRoutesURL, apiClient.fetcher, { keepPreviousData: true })

    const isLoading = sourceRoutesLoading || destRoutesLoading

    const currencies = direction === 'from' ? sourceRoutes?.data?.map(route =>
        route.tokens.map(asset => ({ ...asset, network_display_name: route.display_name, network: route.name }))).flat()
        :
        destinationRoutes?.data?.map(route =>
            route.tokens.map(asset => ({ ...asset, network_display_name: route.display_name, network: route.name }))).flat();

    const currencyMenuItems = GenerateCurrencyMenuItems(
        currencies!,
        values,
        direction,
        balances,
        query,
        (direction === 'from' ? sourceRoutesError : destRoutesError)?.response?.data?.error
    )
    const currencyAsset = direction === 'from' ? fromCurrency?.symbol : toCurrency?.symbol;
    const currencyNetwork = currencies?.find(c => c.symbol === currencyAsset && c.network === from?.name)?.network

    useEffect(() => {
        if (direction !== "to") return

        let currencyIsAvailable = (fromCurrency || toCurrency) && currencyMenuItems?.some(c => c?.baseObject.symbol === currencyAsset)

        if (currencyIsAvailable) return

        const default_currency = currencyMenuItems?.find(c =>
            c.baseObject?.symbol?.toUpperCase() === (query?.toAsset)?.toUpperCase())
            || currencyMenuItems?.[0]

        const selected_currency = currencyMenuItems?.find(c =>
            c.baseObject?.symbol?.toUpperCase() === fromCurrency?.symbol?.toUpperCase())

        if (selected_currency && destinationRoutes?.data?.find(r => r.name === to?.name)?.tokens?.some(r => r.symbol === selected_currency.name && r.status === 'active')) {
            setFieldValue(name, selected_currency.baseObject)
        }
        else if (default_currency) {
            setFieldValue(name, default_currency.baseObject)
        }
    }, [to, query])


    useEffect(() => {
        if (direction !== "from") return

        let currencyIsAvailable = (fromCurrency || toCurrency) && currencyMenuItems?.some(c => c?.baseObject.symbol === currencyAsset)

        if (currencyIsAvailable) return
        debugger
        const default_currency = currencyMenuItems?.find(c =>
            c.baseObject?.symbol?.toUpperCase() === (query?.fromAsset)?.toUpperCase())
            || currencyMenuItems?.[0]

        const selected_currency = currencyMenuItems?.find(c =>
            c.baseObject?.symbol?.toUpperCase() === toCurrency?.symbol?.toUpperCase())

        if (selected_currency
            && sourceRoutes?.data
                ?.find(r => r.name === from?.name)?.tokens
                ?.some(r => r.symbol === selected_currency.name && r.status === 'active')) {
            setFieldValue(name, selected_currency.baseObject)
        }
        else if (default_currency) {
            setFieldValue(name, default_currency.baseObject)
        }
    }, [from, query])

    useEffect(() => {
        if (name === "toCurrency" && toCurrency) {
            if (destinationRoutes?.data
                && !!destinationRoutes?.data
                    ?.find(r => r.name === to?.name)?.tokens
                    ?.some(r => r.symbol === toCurrency?.symbol && r.status === 'route_not_found')) {
                setFieldValue(name, null)
            }
        }
    }, [fromCurrency, currencyGroup, name, to, destinationRoutes, destRoutesError,])

    useEffect(() => {
        if (name === "fromCurrency" && fromCurrency) {
            if (sourceRoutes?.data
                && !!sourceRoutes?.data
                    ?.find(r => r.name === from?.name)?.tokens
                    ?.find(r => r.symbol === fromCurrency?.symbol && r.status === 'route_not_found')) {
                setFieldValue(name, null)
            }
        }
    }, [toCurrency, currencyGroup, name, from, sourceRoutes, sourceRoutesError])

    const value = currencyMenuItems?.find(x => x.baseObject.symbol == currencyAsset && x.baseObject.network === currencyNetwork);

    const handleSelect = useCallback((item: SelectMenuItem<RouteToken>) => {
        setFieldValue(name, item.baseObject, true)
    }, [name, direction, toCurrency, fromCurrency, from, to])

    const valueDetails = <div>
        {value
            ?
            <span className="block font-medium text-primary-text flex-auto items-center">
                {value?.name}
            </span>
            :
            <span className="block font-medium text-primary-text-placeholder flex-auto items-center">
                Asset
            </span>}
    </div>

    return (
        <div className="relative">
            <BalanceComponent values={values} direction={direction} onLoad={(v) => setWalletAddress(v)} />
            <CommandSelectWrapper
                disabled={(value && !value?.isAvailable?.value) || isLoading}
                valueGrouper={groupByType}
                placeholder="Asset"
                setValue={handleSelect}
                value={value}
                values={currencyMenuItems}
                searchHint='Search'
                isLoading={isLoading}
                valueDetails={valueDetails}
            />
        </div>
    )
};

export function groupByType(values: SelectMenuItem<NetworkWithTokens>[]) {
    return [{ name: "", items: values }];
}

function GenerateCurrencyMenuItems(
    currencies: RouteToken[],
    values: SwapFormValues,
    direction?: string,
    balances?: { [address: string]: Balance[]; },
    query?: QueryParams,
    error?: ApiError
): SelectMenuItem<RouteToken>[] {
    const { to, from } = values
    const lockAsset = direction === 'from' ? query?.lockFromAsset
        : query?.lockToAsset

    let currencyIsAvailable = (currency: RouteToken) => {
        if (lockAsset) {
            return { value: false, disabledReason: CurrencyDisabledReason.LockAssetIsTrue }
        }
        else if (currency?.status !== "active" || error?.code === LSAPIKnownErrorCode.ROUTE_NOT_FOUND_ERROR) {
            if (query?.lockAsset || query?.lockFromAsset || query?.lockToAsset) {
                return { value: false, disabledReason: CurrencyDisabledReason.InvalidRoute }
            }
            return { value: true, disabledReason: CurrencyDisabledReason.InvalidRoute }
        }
        else {
            return { value: true, disabledReason: null }
        }
    }

    return currencies?.map(c => {
        const currency = c
        const displayName = currency.symbol;
        //const balance = balances?.find(b => b?.token === c?.symbol && (direction === 'from' ? from : to)?.name === b.network)
        //const formatted_balance_amount = balance ? Number(truncateDecimals(balance?.amount, c.precision)) : ''

        const DisplayNameComponent = <div>
            {displayName}
            <span className="text-primary-text-muted text-xs block">
                {c.network_display_name}
            </span>
        </div>

        const NetworkImage = <div>
            {c.logo && <div className="absolute w-2.5 -right-1 -bottom-1">
                <Image
                    src={c.logo}
                    alt="Project Logo"
                    height="40"
                    width="40"
                    loading="eager"
                    className="rounded-md object-contain" />
            </div>
            }
        </div>

        const res: SelectMenuItem<RouteToken> = {
            baseObject: c,
            id: `${c?.symbol?.toLowerCase()}_${c?.network_display_name?.toLowerCase()}`,
            name: displayName || "-",
            menuItemLabel: DisplayNameComponent,
            menuItemImage: NetworkImage,
            order: CurrencySettings.KnownSettings[c.symbol]?.Order ?? 5,
            imgSrc: c.logo,
            isAvailable: currencyIsAvailable(c),
            //details: `${formatted_balance_amount}`,
        };

        return res
    }).sort(SortingByAvailability);
}

export enum CurrencyDisabledReason {
    LockAssetIsTrue = '',
    InsufficientLiquidity = 'Temporarily disabled. Please check later.',
    InvalidRoute = 'InvalidRoute'
}

export default CurrencyFormField