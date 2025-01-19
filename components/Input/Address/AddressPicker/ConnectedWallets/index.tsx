
import { ChevronDown, Plus, RefreshCw } from "lucide-react";
import { Network } from "../../../../../Models/Network";
import { FC, useState } from "react";
import ResizablePanel from "../../../../ResizablePanel";
import { Wallet, WalletProvider } from "../../../../../Models/WalletProvider";
import WalletIcon from "../../../../icons/WalletIcon";
import { WalletItem } from "../../../../Wallet/WalletsList";

type Props = {
    provider: WalletProvider,
    wallets: Wallet[],
    onClick: (wallet: Wallet, address: string,) => void,
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
        const result = await provider.connectWallet()
        if (onConnect && result) onConnect(result)
        setIsLoading(false)
    }

    //TODO: should check for real compatibility, in the future network can have wallets from multiple providers
    const notCompatibleWallets = wallets.filter(wallet => wallet.providerName !== provider.name || wallet.isNotAvailable)
    return <div className="space-y-2">
        {
            connectedWallets && connectedWallets?.length > 0 &&
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between w-full">
                    <div className="text-sm font-medium text-secondary-text flex items-center space-x-1">
                        <WalletIcon className="h-4 w-4 stroke-2" aria-hidden="true" />
                        <p className="text-sm font-medium text-secondary-text"><span>Connected</span> <span>{connectedWallets.length > 1 ? 'Wallets' : 'Wallet'}</span></p>
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
                        return <WalletItem
                            key={`${index}${wallet.providerName}`}
                            wallet={wallet}
                            selectable
                            network={destination}
                            onWalletSelect={onClick}
                            selectedAddress={destination_address}
                        />
                    })
                }
            </div>
        }


        {
            notCompatibleWallets.length > 0 &&
            (notCompatibleWallets.length > 1 ? (
                <ResizablePanel>
                    <div className="flex flex-col gap-2 pl-2">
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
                                            <div key={wallet.address} className="inline-flex items-center relative">
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
                                <div key={`${index}${wallet.address}`} className="group/addressItem w-full rounded-md hover:!bg-secondary-700 transition duration-200 opacity-50 cursor-not-allowed">
                                    <WalletItem
                                        wallet={wallet}
                                        selectable={true}
                                        network={destination}
                                        selectedAddress={undefined}
                                    />
                                </div>
                            ))}
                    </div>
                </ResizablePanel>
            ) : (
                <div
                    className="relative group/notCompatible w-full rounded-md transition duration-200 opacity-50 cursor-not-allowed"
                >
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-max px-2 py-0.5 text-secondary-text font-medium text-sm rounded-md transition-opacity duration-200 bg-secondary-500 group-hover/notCompatible:opacity-100 opacity-0 max-w-[150px] break-words sm:max-w-none sm:whitespace-nowrap z-20">
                        Not compatible with {destination.display_name}
                    </div>
                    <div className="w-full z-10">
                        <WalletItem
                            wallet={notCompatibleWallets[0]}
                            selectable={true}
                            network={destination}
                            selectedAddress={undefined}
                        />
                    </div>
                </div>
            ))
        }

    </div>
}

export default ConnectedWallets;