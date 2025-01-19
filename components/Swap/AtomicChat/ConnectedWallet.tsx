import { FC, useCallback, useEffect, useState } from "react";
import useWallet from "../../../hooks/useWallet";
import { truncateDecimals } from "../../utils/RoundDecimals";
import AddressWithIcon from "../../Input/Address/AddressPicker/AddressWithIcon";
import { AddressGroup } from "../../Input/Address/AddressPicker";
import { ChevronRight, RefreshCw } from "lucide-react";
import { Wallet } from "../../../Models/WalletProvider";
import useSWRBalance from "../../../lib/balances/useSWRBalance";
import VaulDrawer from "../../modal/vaulModal";
import WalletsList from "../../Wallet/WalletsList";
import { useAtomicState } from "../../../context/atomicContext";
import { useSettingsState } from "../../../context/settings";
import { useSwapDataState, useSwapDataUpdate } from "../../../context/swap";

const Component: FC = () => {
    const { source_asset, source_network, commitId } = useAtomicState()
    const { selectedSourceAccount } = useSwapDataState()
    const { setSelectedSourceAccount } = useSwapDataUpdate()
    const { provider } = useWallet(source_network, 'withdrawal')
    const { networks } = useSettingsState()
    const sourceNetworkWithTokens = networks.find(n => n.name === source_network?.name)
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


    const { balance, isBalanceLoading } = useSWRBalance(selectedWallet?.address, sourceNetworkWithTokens)

    const walletBalance = source_network && balance?.find(b => b?.network === source_network?.name && b?.token === source_asset?.symbol)
    const walletBalanceAmount = walletBalance?.amount && truncateDecimals(walletBalance?.amount, source_asset?.precision)

    return (
        !commitId &&
        <>
            <div className="grid content-end">
                {
                    selectedWallet &&
                    source_network &&
                    <div onClick={() => setOpenModal(true)} className="cursor-pointer group/addressItem flex rounded-lg justify-between space-x-3 items-center mt-1.5 text-primary-text bg-secondary-700 disabled:cursor-not-allowed h-12 leading-4 font-medium w-full px-3 py-7">
                        <AddressWithIcon
                            addressItem={{ address: selectedSourceAccount?.address || '', group: AddressGroup.ConnectedWallet }}
                            connectedWallet={selectedWallet}
                            network={source_network}
                            balance={(walletBalanceAmount !== undefined && source_asset) ? { amount: walletBalanceAmount, symbol: source_asset?.symbol, isLoading: isBalanceLoading } : undefined}
                        />
                        <ChevronRight className="h-4 w-4" />
                    </div>
                }
            </div>
            {
                source_network &&
                source_asset &&
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
                            token={source_asset}
                            onSelect={changeWallet}
                            selectable
                            wallets={provider.connectedWallets}
                            provider={provider}
                        />
                    </VaulDrawer.Snap>
                </VaulDrawer>
            }
        </>)
}
export default Component;