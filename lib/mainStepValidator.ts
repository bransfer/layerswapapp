import { FormikProps, FormikErrors } from "formik";
import { SwapFormValues } from "../components/DTOs/SwapFormValues";
import roundDecimals from "../components/utils/RoundDecimals";
import { LayerSwapSettings } from "../Models/LayerSwapSettings";
import { isValidAddress } from "./addressValidator";

export default function MainStepValidation(formikRef: React.MutableRefObject<FormikProps<SwapFormValues>>, addressRef: any, settings: LayerSwapSettings, amountRef: any): ((values: SwapFormValues) => void | object | Promise<FormikErrors<SwapFormValues>>) & ((values: SwapFormValues) => FormikErrors<SwapFormValues>) {
    return (values:SwapFormValues) => {
        let errors: FormikErrors<SwapFormValues> = {};
        let amount = Number(values.amount?.toString()?.replace(",", "."));
        const minWithdrawalAmount = values?.currency?.baseObject?.exchanges.find(ce => ce.exchange_id === values?.exchange.baseObject.id).min_withdrawal_amount
        const roundedMinWithdrawalAmount = roundDecimals(minWithdrawalAmount, values?.currency?.baseObject.price_in_usdt.toFixed().length)

        if (!values.exchange) {
            errors.amount = 'Select exchange';
        }
        else if (!values.network) {
            errors.amount = 'Select network';
        }
        else if(values.swapType === "onramp"){
            if (!values.destination_address) {
                errors.amount = `Enter ${values?.network?.name} address`;
                if (!formikRef.current.getFieldMeta("destination_address").touched)
                    addressRef?.current?.focus();
            }
            else if (!isValidAddress(values.destination_address, values.network?.baseObject)) {
                errors.amount = `Enter a valid ${values?.network?.name} address`;
                if (!formikRef.current.getFieldMeta("destination_address").touched)
                    addressRef?.current?.focus();
            }
            else if (settings.data.blacklistedAddresses.some(ba => (!ba.network_id || ba.network_id === values.network?.baseObject?.id) && ba.address?.toLocaleLowerCase() === values.destination_address?.toLocaleLowerCase())) {
                errors.amount = `You can not transfer to this address`;
                if (!formikRef.current.getFieldMeta("destination_address").touched)
                    addressRef?.current?.focus();
            }
        }
        else if (!amount) {
            errors.amount = 'Enter an amount';
            if (!formikRef.current.getFieldMeta("amount").touched)
                amountRef?.current?.focus();
        }
        else if (!/^[0-9]*[.,]?[0-9]*$/i.test(amount.toString())) {
            errors.amount = 'Invalid amount';
            if (!formikRef.current.getFieldMeta("amount").touched)
                amountRef?.current?.focus();
        }
        else if (amount < 0) {
            errors.amount = "Can't be negative";
            if (!formikRef.current.getFieldMeta("amount").touched)
                amountRef?.current?.focus();
        }
        else if (amount > values.currency?.baseObject.max_amount) {
            errors.amount = `Max amount is ${values.currency.baseObject.max_amount}`;
            if (!formikRef.current.getFieldMeta("amount").touched)
                amountRef?.current?.focus();
        }
        else if (amount < (minWithdrawalAmount ? roundedMinWithdrawalAmount : values.currency?.baseObject?.min_amount)) {
            errors.amount = `Min amount is ${minWithdrawalAmount ? roundedMinWithdrawalAmount : values.currency?.baseObject.min_amount}`;
            if (!formikRef.current.getFieldMeta("amount").touched)
                amountRef?.current?.focus();
        }

        return errors;
    };
}