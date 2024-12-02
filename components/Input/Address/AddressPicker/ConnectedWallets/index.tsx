
import { ChevronDown, Plus, RefreshCw } from "lucide-react";
import { addressFormat } from "../../../../../lib/address/formatter";
import { Network } from "../../../../../Models/Network";
import FilledCheck from "../../../../icons/FilledCheck";
import AddressWithIcon from "../AddressWithIcon";
import { FC, useState } from "react";
import { AddressGroup } from "..";
import ResizablePanel from "../../../../ResizablePanel";
import { Wallet, WalletProvider } from "../../../../../Models/WalletProvider";
import WalletIcon from "../../../../icons/WalletIcon";

type Props = {
    provider: WalletProvider,
    wallets: Wallet[],
    onClick: (address: string, wallet: Wallet) => void,
    onConnect?: (wallet: Wallet) => void,
    destination: Network,
    destination_address?: string | undefined
}

const ConnectedWallets: FC<Props> = ({ provider, wallets, onClick, onConnect, destination, destination_address }) => {

    const [isLoading, setIsLoading] = useState(false)
    const [showIncompatibleWallets, setShowIncompatibleWallets] = useState(false)
    const connectedWallets = provider.connectedWallets?.filter(wallet => !wallet.isNotAvailable)

    const connect = async () => {
        setIsLoading(true)
        const result = await provider.connectWallet({ chain: destination.chain_id })
        if (onConnect && result) onConnect(result)
        setIsLoading(false)
    }

    const notCompatibleWallets = wallets.filter(wallet => wallet.providerName !== provider.name || wallet.isNotAvailable)
    console.log('connectedWallets', notCompatibleWallets)
    return <>
        {
            connectedWallets && connectedWallets?.length > 0 &&
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between w-full">
                    <div className="text-sm font-medium text-secondary-text flex items-center space-x-1">
                        <WalletIcon className="h-4 w-4 stroke-2" aria-hidden="true" />
                        <p>Connected Wallet</p>
                    </div>
                    <button
                        type="button"
                        onClick={connect}
                        disabled={isLoading}
                        className="text-secondary-text hover:text-primary-text text-xs rounded-lg flex items-center gap-1.5 transition-colors duration-200"
                    >
                        {
                            isLoading ?
                                <RefreshCw className="h-3 w-auto animate-spin" />
                                :
                                <Plus className="h-3 w-auto" />
                        }
                        <p>Connect new</p>
                    </button>
                </div>
                {
                    connectedWallets.map((wallet, index) => {
                        return <span key={index}>
                            {
                                wallet.addresses?.map((address) => {
                                    const addressItem = {
                                        address: address,
                                        group: AddressGroup.ConnectedWallet,
                                    }

                                    return <div key={address} className="flex flex-col gap-2">
                                        <button type="button" onClick={() => onClick(address, wallet)} className={`group/addressItem w-full px-3 py-3 rounded-md hover:!bg-secondary-700 transition duration-200 ${address && addressFormat(address, destination!) === addressFormat(destination_address!, destination!) && 'bg-secondary-800'}`}>
                                            <div className={`flex items-center justify-between w-full`}>
                                                <AddressWithIcon addressItem={addressItem} connectedWallet={wallet} network={destination} />
                                                <div className="flex h-6 items-center px-1">
                                                    {
                                                        addressFormat(address, destination!) === addressFormat(destination_address!, destination!) &&
                                                        <FilledCheck className="text-primary" />
                                                    }
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                })
                            }
                        </span>
                    })
                }
            </div>
        }


        {
            notCompatibleWallets.length > 0 &&
            (notCompatibleWallets.length > 1 ? (
                <ResizablePanel>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setShowIncompatibleWallets(!showIncompatibleWallets)}
                            disabled={isLoading}
                            type="button"
                            className="flex items-center justify-between w-full"
                        >
                            <p className="text-sm font-medium text-secondary-text">
                                <span>Not compatible with</span> <span>{destination.display_name}</span>
                            </p>
                            <div
                                className="text-secondary-text hover:text-primary-text text-xs rounded-lg flex items-center gap-1.5 transition-colors duration-200"
                            >
                                {isLoading ? (
                                    <RefreshCw className="h-3 w-auto animate-spin" />
                                ) : (
                                    <div className="space-x-1 flex">
                                        {notCompatibleWallets?.map((wallet) => (
                                            <div className="inline-flex items-center relative">
                                                <wallet.icon className="w-4 h-4 rounded-sm bg-secondary-800" />
                                            </div>
                                        ))}
                                        <ChevronDown
                                            className={`h-5 w-auto ${showIncompatibleWallets ? 'rotate-180' : ''} transition-all duration-200`}
                                        />
                                    </div>
                                )}
                            </div>
                        </button>
                        {showIncompatibleWallets &&
                            notCompatibleWallets.map((wallet, index) => (
                                <span key={index}>
                                    {wallet.addresses?.map((address) => {
                                        const addressItem = {
                                            address: address,
                                            group: AddressGroup.ConnectedWallet,
                                        };

                                        return (
                                            <div key={address} className="flex flex-col gap-2">
                                                <div className="group/addressItem w-full px-3 py-3 rounded-md hover:!bg-secondary-700 transition duration-200 opacity-50">
                                                    <AddressWithIcon
                                                        addressItem={addressItem}
                                                        connectedWallet={wallet}
                                                        network={destination}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </span>
                            ))}
                    </div>
                </ResizablePanel>
            ) : (
                <div
                    className="relative group/notCompatible w-full px-3 py-3 rounded-md hover:!bg-secondary-700 transition duration-200 opacity-50"
                >
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-max px-2 py-0.5 text-secondary-text font-medium text-sm rounded-md transition-opacity duration-200 bg-secondary-500 opacity-0 group-hover/notCompatible:opacity-100 max-w-[150px] break-words sm:max-w-none sm:whitespace-nowrap">
                        Not compatible with {destination.display_name}
                    </div>
                    {notCompatibleWallets[0].addresses?.map((address) => {
                        const addressItem = {
                            address: address,
                            group: AddressGroup.ConnectedWallet,
                        };

                        return (
                            <AddressWithIcon
                                key={address}
                                addressItem={addressItem}
                                connectedWallet={notCompatibleWallets[0]}
                                network={destination}
                            />
                        );
                    })}
                </div>
            ))
        }


    </>
}

export default ConnectedWallets;