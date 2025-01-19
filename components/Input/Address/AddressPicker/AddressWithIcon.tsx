import { FC, useState } from "react"
import { AddressGroup, AddressItem } from ".";
import AddressIcon from "../../../AddressIcon";
import shortenAddress from "../../../utils/ShortenAddress";
import { History, ExternalLink, Copy, Check, ChevronDown, WalletIcon, Pencil, Link2, Power } from "lucide-react";
import Image from "next/image";
import { Partner } from "../../../../Models/Partner";
import { Network } from "../../../../Models/Network";
import { Popover, PopoverContent, PopoverTrigger } from "../../../shadcn/popover";
import useCopyClipboard from "../../../../hooks/useCopyClipboard";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../shadcn/tooltip";
import { Wallet } from "../../../../Models/WalletProvider";

type Props = {
    addressItem: AddressItem;
    connectedWallet?: Wallet | undefined;
    partner?: Partner;
    network: Network;
    balance?: { amount: number, symbol: string, isLoading: boolean } | undefined;
}

const AddressWithIcon: FC<Props> = ({ addressItem, connectedWallet, partner, network, balance }) => {

    const difference_in_days = addressItem?.date ? Math.round(Math.abs(((new Date()).getTime() - new Date(addressItem.date).getTime()) / (1000 * 3600 * 24))) : undefined
    const maxWalletNameWidth = calculateMaxWidth(String(balance?.amount));

    const descriptions = [
        {
            group: AddressGroup.RecentlyUsed,
            text: (difference_in_days === 0 ?
                <p>Used today</p>
                :
                (difference_in_days && difference_in_days > 1 ?
                    <p><span>Used</span> {difference_in_days} <span>days ago</span></p>
                    : <p>Used yesterday</p>))
            ,
            icon: History
        },
        {
            group: AddressGroup.ManualAdded,
            text: <p>Added Manually</p>,
            icon: Pencil
        },
        {
            group: AddressGroup.ConnectedWallet,
            text: <p className={`${maxWalletNameWidth} text-ellipsis sm:max-w-full text-nowrap overflow-hidden`}>{connectedWallet?.displayName || 'Connected wallet'}</p>,
            icon: connectedWallet?.icon || WalletIcon
        },
        {
            group: AddressGroup.FromQuery,
            text: <p><span>Autofilled</span> <span>{partner ? `by ${partner.display_name}` : 'from URL'}</span></p>,
            icon: Link2
        }
    ]

    const itemDescription = descriptions.find(d => d.group === addressItem.group)

    return (
        <div className="w-full flex items-center justify-between">
            <div className="flex bg-secondary-400 text-primary-text items-center justify-center rounded-md h-8 overflow-hidden w-8">
                {
                    (partner?.is_wallet && addressItem.group === AddressGroup.FromQuery) ? (
                        partner?.logo && (
                            <Image
                                alt="Partner logo"
                                className="rounded-md object-contain"
                                src={partner.logo}
                                width="36"
                                height="36"
                            />
                        )
                    ) : (
                        <AddressIcon className="scale-150 h-9 w-9" address={addressItem.address} size={36} />
                    )
                }
            </div>

            <div className="flex flex-col items-start flex-grow min-w-0 ml-3 text-sm">
                <div className="flex w-full min-w-0">
                    <ExtendedAddress address={addressItem.address} network={network} addressClassNames="font-normal" />
                </div>
                <div className="text-secondary-text w-full min-w-0">
                    <div className="flex items-center gap-1 text-xs">
                        {itemDescription?.icon && (
                            <itemDescription.icon className="rounded flex-shrink-0 h-3.5 w-3.5" />
                        )}
                        {itemDescription?.text}
                    </div>
                </div>
            </div>

            {balance && (
                <div className="flex-shrink-0 text-sm text-secondary-text text-right ml-3">
                    {
                        balance.amount != undefined && !isNaN(balance.amount) ?
                            <div className="text-right text-secondary-text font-normal text-sm">
                                {
                                    balance.isLoading ?
                                        <div className='h-[14px] w-20 inline-flex bg-gray-500 rounded-sm animate-pulse' />
                                        :
                                        <>
                                            <span>{balance.amount}</span> <span>{balance.symbol}</span>
                                        </>
                                }
                            </div>
                            :
                            <></>
                    }
                </div>
            )}
        </div>
    )
}

type ExtendedAddressProps = {
    address: string;
    network?: Network;
    addressClassNames?: string;
    onDisconnect?: () => void;
}

const calculateMaxWidth = (balance: string | undefined) => {
    const symbolCount = balance?.length || 0;

    if (symbolCount <= 6) {
        return '';
    } else if (symbolCount <= 12) {
        return 'max-w-[100px] mr-1';
    } else {
        return 'max-w-[50px]';
    }
};

export const ExtendedAddress: FC<ExtendedAddressProps> = ({ address, network, addressClassNames, onDisconnect }) => {
    const [isCopied, setCopied] = useCopyClipboard()
    const [isPopoverOpen, setPopoverOpen] = useState(false)

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <Popover open={isPopoverOpen} onOpenChange={() => setPopoverOpen(!isPopoverOpen)} >
                <PopoverTrigger asChild>
                    <div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="group-hover/addressItem:underline hover:text-secondary-text transition duration-200 no-underline flex gap-1 items-center cursor-pointer">
                                    <p className={`block text-sm font-medium ${addressClassNames}`}>
                                        {shortenAddress(address)}
                                    </p>
                                    <ChevronDown className="invisible group-hover/addressItem:visible h-4 w-4" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>{address}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-full p-2 flex flex-col gap-1 items-stretch" side="top">
                    <div onClick={(e) => { e.stopPropagation(), setCopied(address) }} className="hover:text-primary-text px-2 py-1.5 hover:bg-secondary-600 rounded transition-all duartion-200 flex items-center justify-between gap-5 w-full">
                        <p>
                            Copy address
                        </p>
                        {
                            isCopied ?
                                <Check className="h-4 w-4" />
                                : <Copy className="w-4 h-4" />
                        }
                    </div>
                    {
                        network &&
                        <Link href={network?.account_explorer_template?.replace('{0}', address)} target="_blank" className="hover:text-primary-text px-2 py-1.5 hover:bg-secondary-600 rounded transition-all duartion-200 flex items-center justify-between gap-5 w-full">
                            <p>
                                Open in explorer
                            </p>
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    }
                    {
                        onDisconnect &&
                        <div onClick={(e) => { e.stopPropagation(), onDisconnect() }} className="hover:text-primary-text px-2 py-1.5 hover:bg-secondary-600 rounded transition-all duartion-200 flex items-center justify-between gap-5 w-full">
                            <p>
                                Disconnect
                            </p>
                            <Power className="w-4 h-4" />
                        </div>
                    }
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default AddressWithIcon