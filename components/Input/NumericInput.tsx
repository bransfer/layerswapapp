import { useField, useFormikContext } from "formik";
import { ChangeEvent, FC, forwardRef } from "react";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import { classNames } from '../utils/classNames'

type Input = {
    label?: JSX.Element | JSX.Element[]
    pattern?: string;
    disabled?: boolean;
    placeholder: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    precision?: number;
    step?: number;
    name: string;
    className?: string;
    children?: JSX.Element | JSX.Element[] | null;
    ref?: any;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

// Use with Formik
const NumericInput: FC<Input> = forwardRef<HTMLInputElement, Input>(
    function NumericInput({ label, pattern, disabled, placeholder, min, max, minLength, maxLength, precision, step, name, className, children, onChange, onFocus, onBlur }, ref) {
        const { handleChange } = useFormikContext<SwapFormValues>();
        const [field] = useField(name)

        return <div>
            {label &&
                <label htmlFor={name} className="block font-semibold text-secondary-text text-sm mb-1.5 w-full">
                    {label}
                </label>
            }
            <div className="flex relative w-full">
                <input
                    {...field}
                    pattern={pattern ? pattern : "^[0-9]*[.,]?[0-9]*$"}
                    inputMode="decimal"
                    autoComplete="off"
                    disabled={disabled}
                    placeholder={placeholder}
                    autoCorrect="off"
                    min={min}
                    max={max}
                    minLength={minLength}
                    maxLength={maxLength}
                    onInput={(event: React.ChangeEvent<HTMLInputElement>) => { replaceComma(event); limitDecimalPlaces(event, precision) }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    type="text"
                    step={step}
                    name={name}
                    id={name}
                    ref={ref}
                    className={classNames(
                        'disabled:cursor-not-allowed h-12 leading-4 shadow-sm border-transparent placeholder:text-primary-text-placeholder bg-secondary-700 focus:ring-transparent focus:border-primary block min-w-0 rounded-componentRoundness font-semibold border',
                        className
                    )}
                    onChange={onChange ? onChange : e => {
                        /^[0-9]*[.,]?[0-9]*$/.test(e.target.value) && handleChange(e);
                    }}
                />
                {<>{children}</>}
            </div>
        </div>;
    });

function limitDecimalPlaces(e, count) {
    if (e.target.value.indexOf('.') == -1) { return; }
    if ((e.target.value.length - e.target.value.indexOf('.')) > count) {
        e.target.value = ParseFloat(e.target.value, count);
    }
}

function ParseFloat(str, val) {
    str = str.toString();
    str = str.slice(0, (str.indexOf(".")) + val + 1);
    return Number(str);
}

function replaceComma(e) {
    var val = e.target.value;
    if (val.match(/\,/)) {
        val = val.replace(/\,/g, '.');
        e.target.value = val;
    }
}

export default NumericInput