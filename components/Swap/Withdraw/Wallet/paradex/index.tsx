import { FC, useState } from 'react'
import useWallet from '../../../../../hooks/useWallet';
import { WithdrawPageProps } from '../WalletTransferContent';
import { useSettingsState } from '../../../../../context/settings';
import KnownInternalNames from '../../../../../lib/knownIds';
import Evm from './Evm';
import Starknet from './Starknet';
import { useWalletStore } from '../../../../../stores/walletStore';
import VaulDrawer from '../../../../modal/vaulModal';
import WalletsList from '../../../../Wallet/WalletsList';
import { useSwapDataState, useSwapDataUpdate } from '../../../../../context/swap';
import { Wallet } from '../../../../../Models/WalletProvider';

const ParadexWalletWithdraw: FC<WithdrawPageProps> = ({ amount, token, callData, swapId }) => {

    const { networks } = useSettingsState();
    const l1Network = networks.find(n => n.name === KnownInternalNames.Networks.EthereumMainnet || n.name === KnownInternalNames.Networks.EthereumSepolia);
    const starknet = networks.find(n => n.name === KnownInternalNames.Networks.StarkNetMainnet || n.name === KnownInternalNames.Networks.StarkNetGoerli || n.name === KnownInternalNames.Networks.StarkNetSepolia);
    const selectedProvider = useWalletStore((state) => state.selectedProveder)

    const { provider: evmProvider } = useWallet(l1Network, 'withdrawal')
    const { provider: starknetProvider } = useWallet(starknet, 'withdrawal')

    const evmWallet = evmProvider?.activeWallet
    const starknetWallet = starknetProvider?.activeWallet

    if (selectedProvider === evmProvider?.name && evmWallet) {
        return <Evm amount={amount} callData={callData} token={token} swapId={swapId} />
    }
    if (selectedProvider === starknetProvider?.name && starknetWallet) {
        return <Starknet amount={amount} callData={callData} token={token} swapId={swapId} />
    }

    return <ConnectWalletModal />
}
const ConnectWalletModal = () => {
    const [openModal, setOpenModal] = useState<boolean>(false)
    const { swapResponse } = useSwapDataState()
    const { source_network, source_token } = swapResponse?.swap || {}
    const { provider } = useWallet(source_network, 'withdrawal')
    const availableWallets = provider?.connectedWallets?.filter(w => !w.isNotAvailable) || []

    const { setSelectedSourceAccount } = useSwapDataUpdate()

    const handleSelectWallet = (wallet?: Wallet | undefined, address?: string | undefined) => {
        if (wallet && address) {
            setSelectedSourceAccount({
                wallet,
                address
            })
        }
        else {
            setSelectedSourceAccount(undefined)
        }
        setOpenModal(false)
    }

    return <>
        <VaulDrawer
            show={openModal}
            setShow={setOpenModal}
            header={`Connect wallet`}
            modalId="connectedWallets"
        >
            <VaulDrawer.Snap id="item-1" className="space-y-3 pb-3">
                {source_token && source_network &&
                    <WalletsList
                        provider={provider}
                        wallets={availableWallets}
                        onSelect={handleSelectWallet}
                        token={source_token}
                        network={source_network}
                        selectable
                    />}
            </VaulDrawer.Snap >
        </VaulDrawer>
    </>
}

export default ParadexWalletWithdraw;