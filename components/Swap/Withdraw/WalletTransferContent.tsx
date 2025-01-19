import { FC, useState, useEffect } from 'react'
import { useSwapDataState, useSwapDataUpdate } from '../../../context/swap';
import WalletIcon from '../../icons/WalletIcon';
import useWallet from '../../../hooks/useWallet';
import AddressWithIcon from '../../Input/Address/AddressPicker/AddressWithIcon';
import { AddressGroup } from '../../Input/Address/AddressPicker';
import { ChevronRight } from 'lucide-react';
import { truncateDecimals } from '../../utils/RoundDecimals';
import VaulDrawer from '../../modal/vaulModal';
import { Wallet } from '../../../Models/WalletProvider';
import useSWRBalance from '../../../lib/balances/useSWRBalance';
import { useSettingsState } from '../../../context/settings';
import WalletsList from '../../Wallet/WalletsList';

const WalletTransferContent: FC = () => {
    const { networks } = useSettingsState()
    const { swapResponse, selectedSourceAccount } = useSwapDataState()
    const { setSelectedSourceAccount } = useSwapDataUpdate()
    const { swap } = swapResponse || {}
    const { source_token, source_network: swap_source_network } = swap || {}
    const source_network = swap_source_network && networks.find(n => n.name === swap_source_network?.name)
    const { provider } = useWallet(source_network, 'withdrawal')

    const [openModal, setOpenModal] = useState(false)

    const changeWallet = async (wallet: Wallet, address: string) => {
        provider?.switchAccount && provider.switchAccount(wallet, address)
        setSelectedSourceAccount({ wallet, address })
        setOpenModal(false)
    }

    const selectedWallet = selectedSourceAccount?.wallet
    const activeWallet = provider?.activeWallet

    useEffect(() => {
        if (!selectedSourceAccount && activeWallet) {
            setSelectedSourceAccount({
                wallet: activeWallet,
                address: activeWallet.address
            })
        } else if (selectedSourceAccount && activeWallet && !activeWallet.addresses.some(a => a.toLowerCase() === selectedSourceAccount.address.toLowerCase())) {
            const selectedWalletIsConnected = provider.connectedWallets?.some(w => w.addresses.some(a => a.toLowerCase() === selectedSourceAccount.address.toLowerCase()))
            if (selectedWalletIsConnected) {
                provider.switchAccount && provider.switchAccount(selectedSourceAccount.wallet, selectedSourceAccount.address)
            }
            else {
                setSelectedSourceAccount(undefined)
            }
        }
    }, [activeWallet?.address, setSelectedSourceAccount, provider, selectedSourceAccount?.address])


    const { balance, isBalanceLoading } = useSWRBalance(selectedSourceAccount?.address, source_network)

    const walletBalance = source_network && balance?.find(b => b?.network === source_network?.name && b?.token === source_token?.symbol)
    const walletBalanceAmount = walletBalance?.amount && truncateDecimals(walletBalance?.amount, source_token?.precision)

    let accountAddress: string | undefined = ""
    if (swap?.source_exchange) {
        accountAddress = swap.exchange_account_name || ""
    }
    else if (selectedSourceAccount) {
        accountAddress = selectedSourceAccount.address || "";
    }

    if (!accountAddress || (swap?.source_exchange && !swap.exchange_account_connected)) {
        return <>
            <div className='flex justify-center'>
                <WalletIcon className='w-12 text-secondary-800/70' />
            </div>
        </>
    }

    return <>
        <div className="grid content-end">
            {
                selectedWallet &&
                source_network &&
                <div onClick={() => setOpenModal(true)} className="cursor-pointer group/addressItem flex rounded-lg justify-between space-x-3 items-center shadow-sm mt-1.5 text-primary-text bg-secondary-700 border-secondary-500 border disabled:cursor-not-allowed h-12 leading-4 font-medium w-full px-3 py-7">
                    <AddressWithIcon
                        addressItem={{ address: accountAddress, group: AddressGroup.ConnectedWallet }}
                        connectedWallet={selectedWallet}
                        network={source_network}
                        balance={(walletBalanceAmount !== undefined && source_token) ? { amount: walletBalanceAmount, symbol: source_token?.symbol, isLoading: isBalanceLoading } : undefined}
                    />
                    <ChevronRight className="h-4 w-4" />
                </div>
            }
        </div>
        {
            source_network &&
            source_token &&
            provider &&
            provider.connectedWallets &&
            <VaulDrawer
                show={openModal}
                setShow={setOpenModal}
                header={`Send from`}
                modalId="connectedWallets"
            >
                <VaulDrawer.Snap id='item-1'>
                    <WalletsList
                        network={source_network}
                        token={source_token}
                        onSelect={changeWallet}
                        selectable
                        wallets={provider.connectedWallets}
                        provider={provider}
                    />
                </VaulDrawer.Snap>
            </VaulDrawer>
        }
    </>
}

export default WalletTransferContent