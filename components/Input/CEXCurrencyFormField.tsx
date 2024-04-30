import { useFormikContext } from "formik";
import { FC, useCallback, useEffect } from "react";
import { SwapDirection, SwapFormValues } from "../DTOs/SwapFormValues";
import { SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import CurrencySettings from "../../lib/CurrencySettings";
import { SortingByAvailability } from "../../lib/sorting";
import { useQueryState } from "../../context/query";
import CommandSelectWrapper from "../Select/Command/CommandSelectWrapper";
import { groupByType } from "./CurrencyFormField";
import { Exchange, ExchangeToken } from "../../Models/Exchange";
import { resolveExchangesURLForSelectedToken } from "../../helpers/routes";
import { ApiResponse } from "../../Models/ApiResponse";
import useSWR from "swr";
import LayerSwapApiClient from "../../lib/layerSwapApiClient";

const CurrencyGroupFormField: FC<{ direction: SwapDirection }> = ({ direction }) => {
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();
    const { to, fromCurrency, toCurrency, from, currencyGroup, toExchange, fromExchange } = values

    const name = 'currencyGroup'
    const query = useQueryState()
    const exchange = direction === 'from' ? fromExchange : toExchange
    const network = direction === 'from' ? to : from

    const exchangeRoutesURL = resolveExchangesURLForSelectedToken(direction, values)
    const apiClient = new LayerSwapApiClient()
    const {
        data: exchanges,
        error
    } = useSWR<ApiResponse<Exchange[]>>(`${exchangeRoutesURL}`, apiClient.fetcher, { keepPreviousData: true })

    const availableAssetGroups = exchanges?.data?.find(e => e.name === exchange?.name)?.token_groups

    const lockAsset = direction === 'from' ? query?.lockFromAsset : query?.lockToAsset
    const asset = direction === 'from' ? query?.fromAsset : query?.toAsset
    const lockedCurrency = lockAsset
        ? availableAssetGroups?.find(a => a.symbol.toUpperCase() === (asset)?.toUpperCase())
        : undefined

    const filteredCurrencies = lockedCurrency ? [lockedCurrency] : availableAssetGroups

    const currencyMenuItems = GenerateCurrencyMenuItems(
        filteredCurrencies!,
        values,
        lockedCurrency,
    )

    const value = currencyMenuItems?.find(x => x.id == currencyGroup?.symbol);

    useEffect(() => {
        if (exchanges?.data
            && !!exchanges?.data
                ?.find(r => r.name === exchange?.name)?.token_groups
                ?.find(r => r.symbol === currencyGroup?.symbol && r.status === 'route_not_found')) {
            setFieldValue(name, null)
        }
    }, [toCurrency, fromCurrency, name, network, exchanges, error])

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
        disabled={!value?.isAvailable?.value}
        valueGrouper={groupByType}
        placeholder="Asset"
        setValue={handleSelect}
        value={value}
        values={currencyMenuItems}
        searchHint='Search'
        isLoading={false}
        valueDetails={valueDetails}
    />;
}

export function GenerateCurrencyMenuItems(
    currencies: ExchangeToken[],
    values: SwapFormValues,
    lockedCurrency?: ExchangeToken | undefined
): SelectMenuItem<ExchangeToken>[] {

    return currencies?.map(c => {
        const currency = c
        const displayName = lockedCurrency?.symbol ?? currency.symbol;

        let currencyIsAvailable = (currency: ExchangeToken) => {
            if (lockedCurrency) {
                return { value: false, disabledReason: CurrencyDisabledReason.LockAssetIsTrue }
            }
            else if (currency?.status !== "active") {
                return { value: true, disabledReason: CurrencyDisabledReason.InvalidRoute }
            }
            else {
                return { value: true, disabledReason: null }
            }
        }

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