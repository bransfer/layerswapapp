import { FC, useCallback, useEffect, useState } from 'react'
import { useSwapDataState, useSwapDataUpdate } from '../../../context/swap';
import WalletIcon from '../../icons/WalletIcon';
import useWallet from '../../../hooks/useWallet';
import { useBalancesState } from '../../../context/balances';
import useBalance from '../../../hooks/useBalance';
import AddressWithIcon from '../../Input/Address/AddressPicker/AddressWithIcon';
import { AddressGroup } from '../../Input/Address/AddressPicker';
import { ChevronDown } from 'lucide-react';
import { truncateDecimals } from '../../utils/RoundDecimals';
import { useSwitchAccount } from 'wagmi';
import { Wallet } from '../../../stores/walletStore';
import { WalletsList } from '../../Input/SourceWalletPicker';
import VaulDrawer from '../../modal/vaulModal';

const WalletTransferContent: FC = () => {
    const { swapResponse, selectedSourceAccount } = useSwapDataState()
    const { setSelectedSourceAccount } = useSwapDataUpdate()
    const { swap } = swapResponse || {}
    const { source_token, source_network } = swap || {}
    const { provider, wallets } = useWallet(source_network, 'withdrawal')
    const all_wallets = provider?.connectedWallets
    const { balances, isBalanceLoading } = useBalancesState()
    const { fetchBalance, fetchGas } = useBalance()
    const { switchAccount, connectors } = useSwitchAccount()
    const [openModal, setOpenModal] = useState(false)

    const changeWallet = useCallback(async (wallet: Wallet, address: string) => {
        const connector = connectors?.find(c => c.name === wallet.connector)
        if (!connector) return
        switchAccount({ connector })
        setSelectedSourceAccount({ wallet, address })
        setOpenModal(false)
    }, [provider, connectors])

    useEffect(() => {
        if (source_network && source_token) {
            all_wallets?.forEach(wallet => {
                wallet.addresses.forEach(address => {
                    fetchBalance(source_network, source_token, address);
                })
            })
        }
    }, [source_network, source_token, all_wallets?.length])

    const selectedWallet = selectedSourceAccount?.wallet
    const activeWallet = source_network ? provider?.activeWallet : wallets[0]
    const walletBalance = balances[selectedSourceAccount?.address || '']?.find(b => b?.network === source_network?.name && b?.token === source_token?.symbol)
    const walletBalanceAmount = walletBalance?.amount && truncateDecimals(walletBalance?.amount, source_token?.precision)

    useEffect(() => {
        if (!selectedSourceAccount && activeWallet) {
            setSelectedSourceAccount({
                wallet: activeWallet,
                address: activeWallet.address
            })
        }
    }, [activeWallet, setSelectedSourceAccount])

    useEffect(() => {
        selectedSourceAccount?.address && source_network && source_token && fetchGas(source_network, source_token, selectedSourceAccount.address)
    }, [source_network, source_token, selectedSourceAccount?.address])

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
                    <ChevronDown className="h-4 w-4" />
                </div>
            }
        </div>
        {
            source_network &&
            source_token &&
            <VaulDrawer
                show={openModal}
                setShow={setOpenModal}
                header={`Send from`}
                modalId="connectedWallets"
            >
                <VaulDrawer.Snap id='item-1'>
                    <WalletsList network={source_network} token={source_token} purpose={'autofil'} onSelect={changeWallet} />
                </VaulDrawer.Snap>
            </VaulDrawer>
        }
    </>
}

export default WalletTransferContent