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
import SpinIcon from '../../icons/spinIcon';
import { LeafletHeight } from '../../modal/leaflet';
import VaulDrawer from '../../modal/vaul';

export interface CommandSelectProps extends SelectProps {
    show: boolean;
    setShow: (value: boolean) => void;
    searchHint: string;
    valueGrouper: (values: ISelectMenuItem[]) => SelectMenuItemGroup[];
    isLoading: boolean;
    modalHeight?: LeafletHeight;
    modalContent?: React.ReactNode;
    header?: string;
}

export class SelectMenuItemGroup {
    constructor(init?: Partial<SelectMenuItemGroup>) {
        Object.assign(this, init);
    }

    name: string;
    items: ISelectMenuItem[];
}

export default function CommandSelect({ values, setValue, show, setShow, searchHint, valueGrouper, isLoading, modalHeight = 'full', modalContent, header }: CommandSelectProps) {
    const { isDesktop } = useWindowDimensions();

    let groups: SelectMenuItemGroup[] = valueGrouper(values);
    const handleSelectValue = useCallback((item: ISelectMenuItem) => {
        setValue(item);
        setShow(false);
    }, [setValue, setShow]);

    const callbackRef = useCallback(inputElement => {
        setTimeout(() => {
            if (inputElement && isDesktop) {
                inputElement.focus();
            }
        }, 250)
    }, []);

    return (
        <CommandWrapper>
            <VaulDrawer
                header={
                    header
                        ? <div className="absolute top-4 left-8 text-lg text-secondary-text font-semibold">
                            <div>{header}</div>
                        </div>
                        : <></>
                }
                show={show}
                setShow={setShow}
                modalId='comandSelect'
                snapPointsCount={2}
            >
                {
                    searchHint &&
                    <CommandInput
                        ref={callbackRef}
                        placeholder={searchHint}
                    />
                }

                {modalContent}
                {
                    !isLoading
                        ? <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            {groups.filter(g => g.items?.length > 0).map((group) => {
                                return (
                                    <CommandGroup key={group.name} heading={group.name}>
                                        {group.items.map(item => {
                                            return (
                                                <CommandItem value={item.id} key={item.id} onSelect={() => handleSelectValue(item)}>
                                                    <SelectItem item={item} />
                                                </CommandItem>
                                            )
                                        })
                                        }
                                    </CommandGroup>)
                            })}
                        </CommandList>
                        : <div className='flex justify-center h-full items-center'>
                            <SpinIcon className="animate-spin h-5 w-5" />
                        </div>
                }

            </VaulDrawer>
        </CommandWrapper>
    )
}