import { FC } from "react";
import { useFormikContext } from "formik";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import { useFee } from "../../context/feeContext";

const DetailedEstimates: FC = () => {

    const { values } = useFormikContext<SwapFormValues>();
    const { fromCurrency } = values;
    const { fee, isFeeLoading } = useFee()

    const parsedFee = fee && parseFloat(Number(fee.walletFee).toFixed(fromCurrency?.precision))
    const currencyName = fromCurrency?.display_asset || fromCurrency?.asset || " "

    return <div className="flex justify-between w-full items-center">
        <div className="flex items-baseline w-full justify-between gap-1">
            <label className="inline-flex items-center text-left text-primary-text-placeholder">
                Fee
            </label>
            <div className="text-right">
                {isFeeLoading ? <div className='h-[10px] w-10 inline-flex bg-gray-500 rounded-sm animate-pulse' /> : <span>{parsedFee || '-'}</span>} <span>{currencyName}</span>
            </div>
        </div>
    </div>
}

export default DetailedEstimates