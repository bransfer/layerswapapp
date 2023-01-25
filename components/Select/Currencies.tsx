import { Field, useFormikContext } from "formik";
import { FC, useCallback, useEffect } from "react";
import { useSettingsState } from "../../context/settings";
import { SwapType } from "../../lib/layerSwapApiClient";
import { SortingByOrder } from "../../lib/sorting";
import { Currency } from "../../Models/Currency";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import returnBySwapType from "../utils/returnBySwapType";
import Select from "./Select";
import { SelectMenuItem } from "./selectMenuItem";

const CurrenciesField: FC = () => {
    const {
        values: { to, currency, from, swapType },
        setFieldValue,
    } = useFormikContext<SwapFormValues>();

    const name = "currency"
    const { discovery: { resource_storage_url }, currencies, exchanges } = useSettingsState();

    const currencyIsAvilable = useCallback((c: Currency) => from && to && returnBySwapType(swapType, from, to)?.baseObject.currencies.some(ec => ec.asset === c.asset && ec.status === "active" && (swapType === SwapType.OffRamp ?
        ec.is_withdrawal_enabled : ec.is_deposit_enabled)) && returnBySwapType(swapType, to, from).baseObject.currencies.some(nc => nc.asset === c.asset && nc.status === "active" && (swapType === SwapType.OffRamp ?
            nc.is_deposit_enabled : nc.is_withdrawal_enabled)), [from, to, swapType])

    const mapCurranceToMenuItem = (c: Currency): SelectMenuItem<Currency> => ({
        baseObject: c,
        id: c.asset,
        name: c.asset,
        order: 0, // TODO implement in settings
        imgSrc: `${resource_storage_url}/layerswap/currencies/${c.asset.toLowerCase()}.png`,
        isAvailable: true,
        isDefault: false,
    })

    const currencyMenuItems: SelectMenuItem<Currency>[] = returnBySwapType(swapType, to, from) ? currencies
        .filter(currencyIsAvilable)
        .map(mapCurranceToMenuItem).sort(SortingByOrder)
        : []

    useEffect(() => {
        if (!from || !to) return;
        if (currency && currencyIsAvilable(currency.baseObject)) return

        const default_currency = currencies.filter(currencyIsAvilable)?.map(mapCurranceToMenuItem)?.sort(SortingByOrder)?.[0]

        if (default_currency) {
            setFieldValue(name, default_currency)
        }
        else if (currency) {
            setFieldValue(name, null)
        }

    }, [from, to, currencies, exchanges, currency])

    return (<>
        <Field disabled={!currencyMenuItems?.length} name={name} values={currencyMenuItems} value={currency} as={Select} setFieldValue={setFieldValue} smallDropdown={true} />
    </>)
};
export default CurrenciesField