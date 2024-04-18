import { useFormikContext } from "formik";
import { FC, useCallback, useEffect } from "react";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import { SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import CurrencySettings from "../../lib/CurrencySettings";
import { SortingByAvailability } from "../../lib/sorting";
import { useQueryState } from "../../context/query";
import { ApiResponse } from "../../Models/ApiResponse";
import useSWR from "swr";
import LayerSwapApiClient from "../../lib/layerSwapApiClient";
import CommandSelectWrapper from "../Select/Command/CommandSelectWrapper";
import { groupByType } from "./CurrencyFormField";
import { RouteNetwork } from "../../Models/Network";
import { ExchangeToken } from "../../Models/Exchange";

const CurrencyGroupFormField: FC<{ direction: string }> = ({ direction }) => {
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();
    const { to, fromCurrency, toCurrency, from, currencyGroup, toExchange, fromExchange } = values

    const name = 'currencyGroup'
    const query = useQueryState()

    const availableAssetGroups = (direction === 'from' ? fromExchange?.token_groups : toExchange?.token_groups)

    const lockAsset = direction === 'from' ? query?.lockFromAsset : query?.lockToAsset
    const asset = direction === 'from' ? query?.fromAsset : query?.toAsset
    const lockedCurrency = lockAsset
        ? availableAssetGroups?.find(a => a.symbol.toUpperCase() === (asset)?.toUpperCase())
        : undefined

    const apiClient = new LayerSwapApiClient()
    const include_unmatched = 'true'

    const sourceRouteParams = new URLSearchParams({
        include_unmatched,
        ...(toExchange && currencyGroup ?
            {
                destination_token_group: currencyGroup?.symbol
            }
            : {})
    });

    const destinationRouteParams = new URLSearchParams({
        include_unmatched,
        ...(fromExchange && currencyGroup ?
            {
                source_token_group: currencyGroup?.symbol
            }
            : {}
        )
    });

    const sourceRoutesURL = toExchange && currencyGroup ? `/exchange_source_networks?${sourceRouteParams}` : null
    const destinationRoutesURL = fromExchange && currencyGroup ? `/exchange_destination_networks?${destinationRouteParams}` : null

    const {
        data: sourceRoutes,
    } = useSWR<ApiResponse<RouteNetwork[]>>(sourceRoutesURL, apiClient.fetcher, { keepPreviousData: true })

    const {
        data: destinationRoutes,
    } = useSWR<ApiResponse<RouteNetwork[]>>(destinationRoutesURL, apiClient.fetcher, { keepPreviousData: true })

    const filteredCurrencies = lockedCurrency ? [lockedCurrency] : availableAssetGroups
    const isLoading = sourceRoutesLoading || destRoutesLoading

    const currencyMenuItems = GenerateCurrencyMenuItems(
        filteredCurrencies!,
        values,
        direction === "to" ? sourceRoutes?.data : destinationRoutes?.data,
        lockedCurrency,
    )

    const value = currencyMenuItems?.find(x => x.id == currencyGroup?.symbol);

    useEffect(() => {
        if (value) return
        setFieldValue(name, currencyMenuItems?.[0]?.baseObject)
    }, [])

    const handleSelect = useCallback((item: SelectMenuItem<ExchangeToken>) => {
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


    return <CommandSelectWrapper
        disabled={!value?.isAvailable?.value || isLoading}
        valueGrouper={groupByType}
        placeholder="Asset"
        setValue={handleSelect}
        value={value}
        values={currencyMenuItems}
        searchHint='Search'
        isLoading={isLoading}
        valueDetails={valueDetails}
    />;
}

export function GenerateCurrencyMenuItems(
    currencies: ExchangeToken[],
    values: SwapFormValues,
    routes?: RouteNetwork[],
    lockedCurrency?: ExchangeToken | undefined
): SelectMenuItem<ExchangeToken>[] {
    const { fromExchange, toExchange } = values
    let currencyIsAvailable = (currency: ExchangeToken) => {
        if (lockedCurrency) {
            return { value: false, disabledReason: CurrencyDisabledReason.LockAssetIsTrue }
        }
        else if ((fromExchange || toExchange) && !routes?.some(r => r?.tokens?.some(t => t?.symbol === currency.symbol && t.status !== 'route_not_found'))) {
            return { value: true, disabledReason: CurrencyDisabledReason.InvalidRoute }
        }
        else {
            return { value: true, disabledReason: null }
        }
    }

    return currencies?.map(c => {
        const currency = c
        const displayName = lockedCurrency?.symbol ?? currency.symbol;

        const res: SelectMenuItem<ExchangeToken> = {
            baseObject: c,
            id: c.symbol,
            name: displayName || "-",
            order: CurrencySettings.KnownSettings[c.symbol]?.Order ?? 5,
            imgSrc: c.logo,
            isAvailable: currencyIsAvailable(c),
        };
        return res
    }).sort(SortingByAvailability);
}

export enum CurrencyDisabledReason {
    LockAssetIsTrue = '',
    InsufficientLiquidity = 'Temporarily disabled. Please check later.',
    InvalidRoute = 'InvalidRoute'
}

export default CurrencyGroupFormField