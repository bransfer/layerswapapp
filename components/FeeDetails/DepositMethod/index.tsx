import { useFormikContext } from "formik";
import React, { FC, useCallback, useEffect, useRef } from "react";
import { SwapFormValues } from "../../DTOs/SwapFormValues";
import { Network } from "../../../Models/Network";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import WalletIcon from "../../icons/WalletIcon";
import { AlignLeft, ChevronDown } from "lucide-react"
import { motion } from "framer-motion";
import { useDepositMethod } from "../../../context/depositMethodContext";
import { useQueryState } from "../../../context/query";
import KnownInternalNames from "../../../lib/knownIds";
import { useSwapDataUpdate } from "../../../context/swap";

const variants = {
    open: { rotate: 180 },
    closed: { rotate: 0 },
}

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


const DepositMethodComponent: FC = () => {
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();
    const { setShowModal, showModal } = useDepositMethod()
    const { depositMethod: defaultDepositMethod, hideDepositMethod, appName } = useQueryState()
    const { from, depositMethod, fromExchange } = values
    const name = 'depositMethod'

    const menuItems = from && GenerateDepositMethodMenuItems(from, depositMethods, appName)

    const defaultMethod = menuItems?.find(i => i.id === defaultDepositMethod)
    const menuItemsRef = useRef<DepositMethod[] | undefined>()
    menuItemsRef.current = menuItems

    useEffect(() => {
        const first = menuItemsRef.current?.[0]?.id
        if (fromExchange) {
            setFieldValue(name, 'deposit_address', true)
            return
        }
        else if (defaultMethod) {
            setFieldValue(name, defaultMethod?.id, true)
            return
        }
        else if (!(menuItems?.find(i => i.id === depositMethod))) {
            setFieldValue(name, first, true)
            return
        }
    }, [from, appName, fromExchange])


    const handleSelect = useCallback((item: string) => {
        setFieldValue(name, item, true)
        setShowModal(false)
    }, [name, depositMethod, menuItems])

    const selectedMethod = menuItems?.find(i => i.id === depositMethod)?.display_name

    const hasOptions = Number(menuItems?.length) > 1 && !fromExchange

    if (!hasOptions || (defaultMethod && hideDepositMethod))
        return null

    return (
        <div className="relative w-full mb-1">
            <Popover open={showModal} onOpenChange={setShowModal}>
                <PopoverTrigger className="font-semibold text-secondary-text text-xs flex items-center space-x-1 p-2">
                    <span> Transfer via </span> <span>{selectedMethod?.toLowerCase()}</span> <motion.div
                        animate={showModal ? "open" : "closed"}
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

function GenerateDepositMethodMenuItems(network: Network, depositMethods: DepositMethod[], appName?: string): DepositMethod[] {

    const sourceIsArbitrumOne = network.name?.toUpperCase() === KnownInternalNames.Networks.ArbitrumMainnet?.toUpperCase()
        || network.name === KnownInternalNames.Networks.ArbitrumGoerli?.toUpperCase()
    const sourceIsSynquoteArbitrumOne = appName === "ea7df14a1597407f9f755f05e25bab42" && sourceIsArbitrumOne
    if (sourceIsSynquoteArbitrumOne) {
        return depositMethods.filter(m => m.id === 'deposit_address')
    }

    return depositMethods.filter(m => network?.deposit_methods?.some(dm => dm === m.id))
}

export default DepositMethodComponent