import { useFormikContext } from "formik";
import { FC, useCallback, useEffect } from "react";
import { SwapDirection, SwapFormValues } from "../DTOs/SwapFormValues";
import { SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import { ResolveCEXCurrencyOrder } from "../../lib/sorting";
import { useQueryState } from "../../context/query";
import CommandSelectWrapper from "../Select/Command/CommandSelectWrapper";
import { groupByType } from "./CurrencyFormField";
import { Exchange, ExchangeToken } from "../../Models/Exchange";
import { resolveExchangesURLForSelectedToken } from "../../helpers/routes";
import { ApiResponse } from "../../Models/ApiResponse";
import useSWR from "swr";
import LayerSwapApiClient from "../../lib/layerSwapApiClient";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip";
import { CircleAlert, RouteOff } from "lucide-react";

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

    const lockAsset = direction === 'from' ? query?.lockFromAsset : query?.lockToAsset
    const asset = direction === 'from' ? query?.fromAsset : query?.toAsset
    const lockedCurrency = lockAsset
        ? availableAssetGroups?.find(a => a.symbol.toUpperCase() === (asset)?.toUpperCase())
        : undefined

    const filteredCurrencies = lockedCurrency ? [lockedCurrency] : availableAssetGroups

    const currencyMenuItems = GenerateCurrencyMenuItems(
        filteredCurrencies!,
        lockedCurrency,
        direction
    )

    const value = currencyMenuItems?.find(x => x.id == currencyGroup?.symbol);

    useEffect(() => {
        if (value) return
        setFieldValue(name, currencyMenuItems?.[0]?.baseObject)
    }, [])

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
    lockedCurrency?: ExchangeToken | undefined,
    direction?: string
): SelectMenuItem<ExchangeToken>[] {

    return currencies?.map(c => {
        const currency = c
        const displayName = lockedCurrency?.symbol ?? currency.symbol;

        const isAvailable = (lockedCurrency || (c?.status !== "active" && c.status !== "not_found")) ? false : true;
        const details = c.status === 'inactive' ?
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild >
                    <div className="absolute -left-0.5 top-1 z-50">
                        <CircleAlert className="!w-3 text-primary-text-placeholder hover:text-primary-text" />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-72">
                        Transfers ${direction} this token are not available at the moment. Please try later.
                    </p>
                </TooltipContent>
            </Tooltip> : undefined

        const icon = c.status === "not_found" ? (
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild >
                    <div className="absolute -left-0.5 top-1 z-50">
                        <RouteOff className="!w-3 text-primary-text-placeholder hover:text-primary-text" />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-72">
                        Route unavailable
                    </p>
                </TooltipContent>
            </Tooltip>
        ) : undefined;

        const res: SelectMenuItem<ExchangeToken> = {
            baseObject: c,
            id: c.symbol,
            name: displayName || "-",
            order: ResolveCEXCurrencyOrder(c),
            imgSrc: c.logo,
            isAvailable: isAvailable,
            details,
            icon
        };
        return res
    });
}

export default CurrencyGroupFormField
