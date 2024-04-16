import { useFormikContext } from "formik";
import React, { FC, useCallback, useEffect, useState } from "react";
import { SwapFormValues } from "../../DTOs/SwapFormValues";
import { Network } from "../../../Models/Network";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import WalletIcon from "../../icons/WalletIcon";
import { AlignLeft, ChevronDown, ChevronUp } from "lucide-react"
import { motion } from "framer-motion";

const variants = {
    open: { rotate: 180 },
    closed: { rotate: 0 },
}

const DepositMethodComponent: FC = () => {
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();
    const [open, setOpen] = useState<boolean>();

    const { from, depositMethod, fromExchange } = values
    const name = 'depositMethod'

    const depositMethods = [
        {
            id: 'wallet',
            display_name: 'Wallet'
        },
        {
            id: 'deposit_address',
            display_name: 'Deposit address'
        }
    ]

    const menuItems = from && GenerateDepositMethodMenuItems(from, depositMethods)

    useEffect(() => {
        if (!depositMethod || !menuItems?.find(i => i.id === depositMethod))
            setFieldValue(name, (menuItems?.find(i => i.id === 'wallet')?.id || menuItems?.[0]?.id), true)
    }, [menuItems])

    useEffect(() => {
        if (fromExchange) setFieldValue(name, 'deposit_address', true)
    }, [fromExchange])

    const handleSelect = useCallback((item: string) => {
        setFieldValue(name, item, true)
        setOpen(false)
    }, [name, depositMethod, menuItems])

    const selectedMethod = menuItems?.find(i => i.id === depositMethod)?.display_name

    const hasOptions = Number(menuItems?.length) > 1 && !fromExchange

    if (!hasOptions)
        return null

    return (
        <div className="relative w-full mb-1.5">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger className="font-semibold text-secondary-text text-xs flex items-center space-x-1">
                    <span> Transfer via </span> <span>{selectedMethod?.toLowerCase()}</span> <motion.div
                        animate={open ? "open" : "closed"}
                        variants={variants}
                    >
                        <ChevronDown className=" w-4 h-4 " />
                    </motion.div>
                </PopoverTrigger>
                <PopoverContent className=' ml-2 mt-1 text-sm p-2 max-w border-none rounded-xl bg-secondary-800 max-w-72 md:max-w-96' align="start">
                    <DepositMethod
                        onselect={handleSelect}
                        value="wallet"
                        icon={<WalletIcon
                            strokeWidth={2} className="w-6 h-6" />}
                        description="Connect your wallet and transfer instantly"
                        title="Wallet"
                        selectedValue={depositMethod}
                    />
                    <DepositMethod
                        onselect={handleSelect}
                        value="deposit_address"
                        icon={<AlignLeft strokeWidth={2} className="w-6 h-6" />}
                        description="Manually transfer to a Deposit Address generated specifically for you"
                        title="Deposit address"
                        selectedValue={depositMethod}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
};

type DespositMethodItemProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
    selectedValue: string | undefined;
    value: string;
    onselect: (value: string) => void;
}

const DepositMethod: FC<DespositMethodItemProps> = ({
    icon,
    title,
    description,
    selectedValue,
    value,
    onselect
}) => {
    const selected = selectedValue === value
    return (
        <div className={`p-3 ${selected ? 'bg-secondary-500 text-primary-text' : 'text-secondary-text'} flex rounded-lg cursor-pointer`} onClick={() => onselect(value)}>
            <div className="grid grid-cols-9 gap-2 md:gap-0 w-full">
                <div>
                    {icon}
                </div>
                <div className=" col-span-8   flex">
                    <div className="w-full">
                        <div className={`font-semibold text-base`}>
                            {title}
                        </div>
                        <div className="text-secondary-text text-xs">
                            {description}
                        </div>
                    </div>

                    {
                        selected &&
                        <div className="flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    }
                </div>
            </div>

        </div>
    )
}

type DepositMethod = {
    id: string,
    display_name: string
} 

function GenerateDepositMethodMenuItems(network: Network, depositMethods: DepositMethod[]): DepositMethod[] | undefined {

    return network?.deposit_methods?.map(m => ({
        id: m,
        display_name: depositMethods.find(dp => dp.id === m)?.display_name!
    }));

}

export default DepositMethodComponent