import Image from 'next/image';
import { FeeData, useLoopringTokens } from './hooks';
import { ISelectMenuItem } from '../../../../Select/Shared/Props/selectMenuItem';
import formatAmount from '../../../../../lib/formatAmount';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../../../../shadcn/select';
import { UserBalanceInfo } from '../../../../../lib/loopring/defs';

export const ActivationTokenPicker = ({ availableBalances, defaultValue, onChange, feeData }: { availableBalances: UserBalanceInfo[] | undefined, defaultValue: UserBalanceInfo | undefined, feeData: FeeData | undefined, onChange: (v: string | undefined) => void }) => {
    const { tokens } = useLoopringTokens()

    const resource_storage_url = process.env.NEXT_PUBLIC_RESOURCE_STORAGE_URL;
    const activationCurrencyValues: ISelectMenuItem[]
        = tokens && availableBalances?.map(b => {
            const loopringToken = tokens?.find(t => t.tokenId === b.tokenId)
            const symbol: string = loopringToken?.symbol || "-"
            const decimals = loopringToken?.decimals
            const details = <p className="text-primary-text-muted">
                {decimals ? `${formatAmount(b.total, decimals)}` : ''}
            </p>
            return {
                id: symbol,
                name: symbol,
                isAvailable: true,
                type: 'currency',
                imgSrc: `${resource_storage_url}layerswap/currencies/${symbol.toLowerCase()}.png`,
                baseObject: symbol,
                details,
                order: 0,
            }
        }) || []

    const [selectedValue, setSelectedValue] = useState<string>(activationCurrencyValues?.[0]?.name)

    const handleChange = (v: string) => {
        onChange(v)
        setSelectedValue(v)
    }


    useEffect(() => {
        if (!selectedValue && defaultValue && tokens) {
            const loopringToken = tokens?.find(t => t.tokenId === defaultValue.tokenId)
            if (loopringToken)
                handleChange(loopringToken?.symbol)
        }
    }, [defaultValue, tokens])

    const loopringToken = tokens?.find(t => t.symbol === selectedValue)

    const decimals = loopringToken?.decimals
    const selectedTokenFee = feeData?.fees?.find(f => f.token === selectedValue)?.fee
    const formattedFee = selectedTokenFee && decimals && formatAmount(selectedTokenFee, decimals)

    return <p className="break-allspace-x-1 flex mt-4 w-full justify-end items-center text-sm text-secondary-text">
        <span className='font-base sm:inline hidden'>One time activation fee</span>
        <span className='text-primary-text text-sm sm:text-base flex items-center'>
            <span className=' text-secondary-text text-sm ml-1'>
                {
                    activationCurrencyValues.length > 0 ? <Select onValueChange={handleChange} value={selectedValue} >
                        <SelectTrigger className="w-fit border-none !text-primary-text !font-semibold !h-fit !p-0">
                            <SelectValue>
                                <span className='space-x-1'><span>{formattedFee}</span><span>{selectedValue}</span></span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Fee token</SelectLabel>
                                {activationCurrencyValues?.map(cv => (
                                    <SelectItem key={cv.name} value={cv.name}>
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-5 w-5 relative">
                                                {
                                                    cv &&
                                                    <Image
                                                        src={cv.imgSrc}
                                                        alt="From Logo"
                                                        height="60"
                                                        width="60"
                                                        className="rounded-md object-contain"
                                                    />
                                                }
                                            </div>
                                            <div className="mx-1 block"><span className='text-primary-text'>{cv.name}</span> <span>{cv.menuItemDetails}</span></div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                        : <></>
                }
            </span>
        </span>
    </p>
}
