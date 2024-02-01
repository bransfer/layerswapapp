import { ISelectMenuItem } from '../Shared/Props/selectMenuItem'
import {
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandWrapper
} from '../../shadcn/command'
import React, { useCallback } from "react";
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import SelectItem from '../Shared/SelectItem';
import { SelectProps } from '../Shared/Props/SelectProps'
import Modal from '../../modal/modal';
import { Info } from 'lucide-react';
import SpinIcon from '../../icons/spinIcon';
import { LayerDisabledReason } from '../Popover/PopoverSelect';
import { useSettingsState } from '../../../context/settings';

export interface CommandSelectProps extends SelectProps {
    show: boolean;
    setShow: (value: boolean) => void;
    searchHint: string;
    valueGrouper: (values: ISelectMenuItem[]) => SelectMenuItemGroup[];
    isLoading: boolean;
}

export class SelectMenuItemGroup {
    constructor(init?: Partial<SelectMenuItemGroup>) {
        Object.assign(this, init);
    }

    name: string;
    items: ISelectMenuItem[];
}

export default function CommandSelect({ values, value, setValue, show, setShow, searchHint, valueGrouper, isLoading }: CommandSelectProps) {
    const { isDesktop } = useWindowDimensions();
    let groups: SelectMenuItemGroup[] = valueGrouper(values);
    const handleSelectValue = useCallback((item: ISelectMenuItem) => {
        setValue(item)
        setShow(false)
    }, [setValue])
    return (
        <Modal height='full' show={show} setShow={setShow} modalId='comandSelect'>
            {show ?
                <CommandWrapper>
                    <CommandInput autoFocus={isDesktop} placeholder={searchHint} />
                    {
                        value?.isAvailable.disabledReason === LayerDisabledReason.LockNetworkIsTrue &&
                        <div className='text-xs text-left text-secondary-text mb-2'>
                            <Info className='h-3 w-3 inline-block mb-0.5' /><span>&nbsp;You&apos;re accessing Layerswap from a partner&apos;s page. In case you want to transact with other networks, please open layerswap.io in a separate tab.</span>
                        </div>
                    }
                    {!isLoading ?
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            {groups.filter(g => g.items?.length > 0).map((group) => {
                                return (
                                    <CommandGroup key={group.name} heading={group.name}>
                                        {group.items.map(item =>
                                            <CommandItem disabled={!item.isAvailable.value} value={item.name} key={item.id} onSelect={() => handleSelectValue(item)}>
                                                <SelectItem item={item} />
                                            </CommandItem>)
                                        }
                                    </CommandGroup>)
                            })}
                        </CommandList>
                        :
                        <div className='flex justify-center h-full items-center'>
                            <SpinIcon className="animate-spin h-5 w-5" />
                        </div>
                    }
                </CommandWrapper>
                : <></>
            }
        </Modal>
    )
}