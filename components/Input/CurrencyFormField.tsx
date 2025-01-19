import { useFormikContext } from "formik";
import { FC, useCallback, useEffect } from "react";
import { SwapDirection, SwapFormValues } from "../DTOs/SwapFormValues";
import { SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import PopoverSelectWrapper from "../Select/Popover/PopoverSelectWrapper";
import { ResolveCurrencyOrder, SortAscending } from "../../lib/sorting";
import { truncateDecimals } from "../utils/RoundDecimals";
import { useQueryState } from "../../context/query";
import { RouteNetwork, RouteToken } from "../../Models/Network";
import LayerSwapApiClient from "../../lib/layerSwapApiClient";
import useSWR from "swr";
import { ApiResponse } from "../../Models/ApiResponse";
import { Balance } from "../../Models/Balance";
import { QueryParams } from "../../Models/QueryParams";
import { ApiError, LSAPIKnownErrorCode } from "../../Models/ApiError";
import { resolveNetworkRoutesURL } from "../../helpers/routes";
import { ONE_WEEK } from "./NetworkFormField";
import RouteIcon from "./RouteIcon";
import { useSwapDataState } from "../../context/swap";
import useSWRBalance from "../../lib/balances/useSWRBalance";
import { useSettingsState } from "../../context/settings";

const CurrencyFormField: FC<{ direction: SwapDirection }> = ({ direction }) => {
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();

    const { from, to, fromCurrency, toCurrency, fromExchange, toExchange, destination_address, currencyGroup } = values
    const name = direction === 'from' ? 'fromCurrency' : 'toCurrency';
    const query = useQueryState()
    const { selectedSourceAccount } = useSwapDataState()
    const { destinationRoutes, sourceRoutes } = useSettingsState();

    const address = direction === 'from' ? (selectedSourceAccount?.address) : (destination_address)

    const { balance } = useSWRBalance(address, direction === 'from' ? from : to)

    const networkRoutesURL = resolveNetworkRoutesURL(direction, values)

    const apiClient = new LayerSwapApiClient()
    const {
        data: routes,
        isLoading,
        error
    } = useSWR<ApiResponse<RouteNetwork[]>>(networkRoutesURL, apiClient.fetcher, { keepPreviousData: true, dedupingInterval: 10000 })

    const currencies = direction === 'from' ? routes?.data?.find(r => r.name === from?.name)?.tokens : routes?.data?.find(r => r.name === to?.name)?.tokens;
    const currencyMenuItems = GenerateCurrencyMenuItems(
        currencies!,
        values,
        direction,
        balance || [],
        query,
        error
    )
    const currencyAsset = direction === 'from' ? fromCurrency?.symbol : toCurrency?.symbol;
    const value = currencyMenuItems?.find(x => x.id == currencyAsset);

    useEffect(() => {
        if (direction !== "to") return

        let currencyIsAvailable = (fromCurrency || toCurrency) && currencyMenuItems?.some(c => c?.baseObject.symbol === currencyAsset)

        if (currencyIsAvailable) return

        const assetFromQuery = currencyMenuItems?.find(c =>
            c.baseObject?.symbol?.toUpperCase() === (query?.toAsset)?.toUpperCase())

        const isLocked = query?.lockToAsset

        const default_currency = assetFromQuery || (!isLocked && currencyMenuItems?.[0])

        const selected_currency = currencyMenuItems?.find(c =>
            c.baseObject?.symbol?.toUpperCase() === fromCurrency?.symbol?.toUpperCase())
        if (selected_currency && routes?.data?.find(r => r.name === to?.name)?.tokens?.some(r => r.symbol === selected_currency.name && r.status === 'active')) {
            setFieldValue(name, selected_currency.baseObject, true)
        }
        else if (default_currency) {
            setFieldValue(name, default_currency.baseObject, true)
        }
    }, [to, query, routes])


    useEffect(() => {
        if (direction !== "from") return

        let currencyIsAvailable = (fromCurrency || toCurrency) && currencyMenuItems?.some(c => c?.baseObject.symbol === currencyAsset)

        if (currencyIsAvailable) return

        const assetFromQuery = currencyMenuItems?.find(c =>
            c.baseObject?.symbol?.toUpperCase() === (query?.fromAsset)?.toUpperCase())

        const isLocked = query?.lockFromAsset

        const default_currency = assetFromQuery || (!isLocked && currencyMenuItems?.[0])

        const selected_currency = currencyMenuItems?.find(c =>
            c.baseObject?.symbol?.toUpperCase() === toCurrency?.symbol?.toUpperCase())

        if (selected_currency
            && routes?.data
                ?.find(r => r.name === from?.name)?.tokens
                ?.some(r => r.symbol === selected_currency.name && r.status === 'active')) {
            setFieldValue(name, selected_currency.baseObject, true)
        }
        else if (default_currency) {
            setFieldValue(name, default_currency.baseObject, true)
        }
    }, [from, query, routes])

    useEffect(() => {
        if (name === "toCurrency" && toCurrency && !isLoading && routes) {
            const value = routes.data?.find(r => r.name === to?.name)?.tokens?.find(r => r.symbol === toCurrency?.symbol)
            if (!value) return

            setFieldValue(name, value)
        }
    }, [fromCurrency, currencyGroup, name, to, routes, error, isLoading])

    useEffect(() => {
        if (name === "fromCurrency" && fromCurrency && !isLoading && routes) {
            const value = routes.data?.find(r => r.name === from?.name)?.tokens?.find(r => r.symbol === fromCurrency?.symbol)
            if (!value) return

            setFieldValue(name, value)
        }
    }, [toCurrency, currencyGroup, name, from, routes, error, isLoading])

    const handleSelect = useCallback((item: SelectMenuItem<RouteToken>) => {
        setFieldValue(name, item.baseObject, true)
    }, [name, direction, toCurrency, fromCurrency, from, to])

    const isLocked = direction === 'from' ? query?.lockFromAsset
        : query?.lockToAsset

    return (
        <div className="relative">
            <PopoverSelectWrapper
                placeholder="Asset"
                values={currencyMenuItems}
                value={value}
                setValue={handleSelect}
                disabled={isLoading || isLocked}
            />
        </div>
    )
};

function GenerateCurrencyMenuItems(
    currencies: RouteToken[],
    values: SwapFormValues,
    direction: string,
    balances?: Balance[],
    query?: QueryParams,
    error?: ApiError
): SelectMenuItem<RouteToken>[] {
    const { to, from } = values

    return currencies?.map(c => {
        const currency = c
        const displayName = currency.symbol;
        const balance = balances?.find(b => b?.token === c?.symbol && (direction === 'from' ? from : to)?.name === b.network)
        const formatted_balance_amount = balance ? Number(truncateDecimals(balance?.amount, c.precision)) : ''
        const isNewlyListed = new Date(c?.listing_date)?.getTime() >= new Date().getTime() - ONE_WEEK;

        const currencyIsAvailable = (currency?.status === "active" && error?.code !== LSAPIKnownErrorCode.ROUTE_NOT_FOUND_ERROR) ||
            !((direction === 'from' ? query?.lockFromAsset : query?.lockToAsset) || query?.lockAsset || currency.status === 'inactive')

        const routeNotFound = (currency?.status !== "active" || error?.code === LSAPIKnownErrorCode.ROUTE_NOT_FOUND_ERROR);

        const badge = isNewlyListed ? (
            <span className="bg-secondary-50 px-1 rounded text-xs flex items-center">New</span>
        ) : undefined;

        const details = <p className="text-primary-text-muted">
            {formatted_balance_amount}
        </p>

        const res: SelectMenuItem<RouteToken> = {
            baseObject: c,
            id: c.symbol,
            name: displayName || "-",
            order: ResolveCurrencyOrder(c, isNewlyListed),
            imgSrc: c.logo,
            isAvailable: currencyIsAvailable,
            badge,
            details,
            leftIcon: <RouteIcon direction={direction} isAvailable={currencyIsAvailable} routeNotFound={!!routeNotFound} type="token" />
        };

        return res
    }).sort(SortAscending);
}

export default CurrencyFormField