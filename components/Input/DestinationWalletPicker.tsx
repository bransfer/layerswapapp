import shortenAddress from "../utils/ShortenAddress";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { AddressGroup, AddressItem, AddressTriggerProps } from "./Address/AddressPicker";
import { Partner } from "../../Models/Partner";
import AddressIcon from "../AddressIcon";
import { Wallet } from "../../Models/WalletProvider";


const Component = (props: AddressTriggerProps) => {
    const { addressItem, connectedWallet, partner } = props
    return <>
        {
            addressItem &&
            <div className="flex items-center space-x-2 text-sm leading-4">
                {<>
                    <div className="rounded-lg bg-secondary-500 flex space-x-1 items-center py-0.5 pl-2 pr-1 cursor-pointer">
                        <div className="inline-flex items-center relative p-0.5">
                            <ResolvedIcon addressItem={addressItem} partner={partner} wallet={connectedWallet} />
                        </div>
                        <div className="text-primary-text">
                            {shortenAddress(addressItem.address)}
                        </div>
                        <div className="w-5 h-5 items-center flex">
                            <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        </div>
                    </div>
                </>
                }
            </div >
        }   
    </>
}
type AdderssIconprops = {
    addressItem: AddressItem,
    wallet: Wallet | undefined,
    partner: Partner | undefined
}
const ResolvedIcon = (props: AdderssIconprops) => {
    const { addressItem, wallet, partner } = props
    if (partner?.is_wallet && addressItem.group === AddressGroup.FromQuery) {
        return <div className="rounded-lg bg-secondary-700 pl-2 flex items-center space-x-2 text-sm leading-4">
            {
                partner?.logo &&
                <Image
                    alt="Partner logo"
                    className='rounded-md object-contain'
                    src={partner.logo}
                    width="20"
                    height="20"
                />
            }
        </div>
    }
    else if (addressItem.group === AddressGroup.ConnectedWallet && wallet) {
        return <wallet.icon className="w-5 h-5" />
    }
    else {
        return <AddressIcon className="h-5 w-5 p-0.5" address={addressItem.address} size={20} />
    }
}

export default Component