import { Plus, Power } from "lucide-react";
import AddressIcon from "../AddressIcon";
import { Wallet, WalletProvider } from "../../Models/WalletProvider";
import { FC, HTMLAttributes } from "react";
import { ExtendedAddress } from "../Input/Address/AddressPicker/AddressWithIcon";
import { clsx } from 'clsx';
import { useConnectModal } from "../WalletModal";
import { Network, Token } from "../../Models/Network";
import { useSwapDataState } from "../../context/swap";
import FilledCheck from "../icons/FilledCheck";
import { truncateDecimals } from "../utils/RoundDecimals";
import useSWRBalance from "../../lib/balances/useSWRBalance";
import { useSettingsState } from "../../context/settings";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip";
import Image from 'next/image'

type Props = ({
    selectable?: false;
    wallets: Wallet[];
    token?: Token;
    network?: Network;
    provider?: WalletProvider | undefined;
    onSelect?: (wallet: Wallet, address: string) => void;
} | {
    selectable?: true;
    wallets: Wallet[];
    token: Token;
    network: Network;
    provider: WalletProvider | undefined;
    onSelect: (wallet: Wallet, address: string) => void;
})

const WalletsList: FC<Props> = (props) => {

    const { wallets, token, network, provider, selectable, onSelect } = props

    const { connect } = useConnectModal()

    const connectWallet = async () => {
        const result = await connect(provider)

        if (result && onSelect && result.withdrawalSupportedNetworks?.some(n => n === network?.name)) {
            onSelect(result, result.address)
        }

    }

    const { selectedSourceAccount } = useSwapDataState()

    return (
        <div className="space-y-3">
            <button type='button' onClick={connectWallet} className="w-full flex justify-center p-2 bg-secondary-700 rounded-md hover:bg-secondary-600">
                <div className="flex items-center text-secondary-text gap-1 px-3 py-1">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">
                        Connect new wallet
                    </span>
                </div>
            </button>
            <div className="flex flex-col justify-start space-y-3">
                {
                    wallets.map((wallet, index) => <WalletItem
                        key={`${index}${wallet.providerName}`}
                        wallet={wallet}
                        selectable={selectable}
                        token={token}
                        network={network}
                        onWalletSelect={onSelect}
                        selectedAddress={selectedSourceAccount?.address}
                    />)
                }
            </div>
        </div >
    )
}

type WalletItemProps = {
    wallet: Wallet,
    selectable?: boolean,
    token?: Token;
    network?: Network;
    selectedAddress: string | undefined;
    onWalletSelect?: (wallet: Wallet, address: string) => void;
}
export const WalletItem: FC<HTMLAttributes<HTMLDivElement> & WalletItemProps> = ({ selectable, wallet, network, onWalletSelect, token, selectedAddress, ...props }) => {
    const { networks } = useSettingsState()
    const networkWithTokens = networks.find(n => n.name === network?.name)

    const { balance, isBalanceLoading } = useSWRBalance(wallet.address, networkWithTokens)

    const walletBalance = balance?.find(b => b?.token === token?.symbol)

    const isSelected = selectable && (wallet.addresses.length == 1 && wallet.address == selectedAddress)
    const walletBalanceAmount = walletBalance?.amount && truncateDecimals(walletBalance?.amount, token?.precision)

    return (
        <div {...props} className="rounded-md outline-none text-primary-tex">
            <div
                onClick={() => (selectable && wallet.addresses.length == 1 && onWalletSelect) && onWalletSelect(wallet, wallet.address)}
                className={clsx('w-full relative items-center justify-between gap-2 flex rounded-lg outline-none bg-secondary-700 text-primary-text p-3 group/addressItem', {
                    'hover:bg-secondary-600 cursor-pointer': selectable && wallet.addresses.length == 1,
                    'bg-secondary-800 py-2': wallet.addresses.length > 1
                })}>

                <div className="flex space-x-2 items-center grow">
                    {
                        wallet &&
                        <div className="inline-flex items-center relative">
                            <wallet.icon
                                className={clsx('w-9 h-9 p-0.5 rounded-md bg-secondary-800', {
                                    '!w-6 !h-6': wallet.addresses.length > 1,
                                })}
                            />
                            {
                                wallet?.networkIcon && <div className="h-5 w-5 absolute -right-1 -bottom-1">
                                    <Image
                                        src={wallet?.networkIcon || ''}
                                        alt="Wallet default network icon"
                                        height="40"
                                        width="40"
                                        loading="eager"
                                        className="object-contain rounded-md border-2 border-secondary-800" />
                                </div>
                            }

                        </div>
                    }

                    {
                        wallet.addresses.length > 1 ?
                            <div>
                                <span className="text-sm">{wallet.displayName}</span>
                            </div>
                            :
                            <div className="w-full inline-flex items-center justify-between grow">
                                <div>
                                    {
                                        !wallet.isLoading && wallet.address &&
                                        <ExtendedAddress
                                            address={wallet.address}
                                            network={network}
                                            addressClassNames="font-normal text-sm"
                                            onDisconnect={() => wallet && wallet.disconnect()}
                                        />
                                    }
                                    <p className="text-xs text-secondary-text">
                                        {wallet.displayName}
                                    </p>
                                </div>
                                {
                                    walletBalanceAmount !== undefined && token &&
                                    <span className="text-sm flex space-x-2 justif-end">
                                        {
                                            walletBalanceAmount != undefined && !isNaN(walletBalanceAmount) ?
                                                <div className="text-right text-secondary-text font-normal text-sm">
                                                    {
                                                        isBalanceLoading ?
                                                            <div className='h-[14px] w-20 inline-flex bg-gray-500 rounded-sm animate-pulse' />
                                                            :
                                                            <>
                                                                <span>{walletBalanceAmount}</span> <span>{token?.symbol}</span>
                                                            </>
                                                    }
                                                </div>
                                                :
                                                <></>
                                        }
                                    </span>
                                }
                            </div>
                    }
                </div>
                {
                    !selectable &&
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button type="button" onClick={wallet.disconnect} className="text-xs text-secondary-text hover:text-primary-text rounded-full p-1.5 bg-secondary-900 hover:bg-secondary-950 transition-colors duration-200 ">
                                <Power className="h-3.5 w-3.5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Disconnect</p>
                        </TooltipContent>
                    </Tooltip>
                }
                {
                    isSelected &&
                    <div className="flex h-6 items-center px-1">
                        <FilledCheck />
                    </div>
                }
            </div>
            {
                wallet.addresses.length > 1 &&
                <div className='w-full grow py-1 mt-1 bg-secondary-700 rounded-lg' >
                    {
                        wallet.addresses.map((address, index) => <NestedWalletAddress
                            key={index}
                            address={address}
                            selectable={selectable}
                            wallet={wallet}
                            network={network}
                            onWalletSelect={onWalletSelect}
                            selectedAddress={selectedAddress}
                            token={token}
                        />)
                    }
                </div>
            }
        </div>
    )
}

type NestedWalletAddressProps = {
    address: string,
    selectable?: boolean,
    token?: Token;
    network?: Network;
    wallet: Wallet,
    onWalletSelect?: (wallet: Wallet, address: string) => void;
    selectedAddress: string | undefined;
}

const NestedWalletAddress: FC<HTMLAttributes<HTMLDivElement> & NestedWalletAddressProps> = ({ selectable, address, network, onWalletSelect, token, wallet, selectedAddress, ...props }) => {
    const { networks } = useSettingsState()
    const networkWithTokens = networks.find(n => n.name === network?.name)
    const { balance, isBalanceLoading } = useSWRBalance(address, networkWithTokens)

    const isNestedSelected = selectable && address == selectedAddress
    const nestedWalletBalance = balance?.find(b => b?.token === token?.symbol)
    const nestedWalletBalanceAmount = nestedWalletBalance?.amount && truncateDecimals(nestedWalletBalance?.amount, token?.precision)

    return (
        <div
            {...props}
            onClick={() => (selectable && onWalletSelect) && onWalletSelect(wallet, address)}
            className={clsx('flex w-full justify-between gap-3 items-center pl-6 pr-4 py-2 group/addressItem', {
                'hover:bg-secondary-600 cursor-pointer': selectable
            })}
        >
            <div className='flex items-center w-fit gap-3' >
                <div className="flex bg-secondary-400  items-center justify-center rounded-md h-8 w-8 overflow-hidden">
                    <AddressIcon
                        className="scale-150 h-8 w-8 p-0.5"
                        address={address}
                        size={32}
                    />
                </div>

                <div>
                    {
                        !wallet.isLoading && address &&
                        <ExtendedAddress
                            address={address}
                            network={network}
                            addressClassNames="font-normal text-sm"
                            onDisconnect={() => wallet && wallet.disconnect()}
                        />
                    }
                </div>
            </div>
            <div className="inline-flex gap-2">
                {
                    nestedWalletBalanceAmount !== undefined && token &&
                    <span className="text-sm flex space-x-2 justif-end">
                        {
                            nestedWalletBalanceAmount != undefined && !isNaN(nestedWalletBalanceAmount) ?
                                <div className="text-right text-secondary-text font-normal text-sm">
                                    {
                                        isBalanceLoading ?
                                            <div className='h-[14px] w-20 inline-flex bg-gray-500 rounded-sm animate-pulse' />
                                            :
                                            <>
                                                <span>{nestedWalletBalanceAmount}</span> <span>{token?.symbol}</span>
                                            </>
                                    }
                                </div>
                                :
                                <></>
                        }
                    </span>
                }
                {
                    isNestedSelected &&
                    <div className="flex h-6 items-center">
                        <FilledCheck />
                    </div>
                }
            </div>
        </div>
    )

}

export default WalletsList