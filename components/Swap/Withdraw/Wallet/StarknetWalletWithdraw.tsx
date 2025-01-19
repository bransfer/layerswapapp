import { FC, useCallback, useState } from 'react'
import SubmitButton from '../../../buttons/submitButton';
import toast from 'react-hot-toast';
import { BackendTransactionStatus } from '../../../../lib/layerSwapApiClient';
import { useAuthState } from '../../../../context/authContext';
import useWallet from '../../../../hooks/useWallet';
import { useSwapTransactionStore } from '../../../../stores/swapTransactionStore';
import WalletIcon from '../../../icons/WalletIcon';
import { WithdrawPageProps } from './WalletTransferContent';
import { ConnectWalletButton } from './WalletTransfer/buttons';


const StarknetWalletWithdrawStep: FC<WithdrawPageProps> = ({ network, token, callData, swapId }) => {


    

    const [loading, setLoading] = useState(false)
    const [transferDone, setTransferDone] = useState<boolean>()
    const { provider } = useWallet(network, 'withdrawal')
    const { userId } = useAuthState()
    const { setSwapTransaction } = useSwapTransactionStore();

    const wallet = provider?.activeWallet

    const handleTransfer = useCallback(async () => {
        if (!swapId || !token) {
            return
        }
        setLoading(true)
        try {
            if (!wallet) {
                throw Error("Starknet wallet not connected")
            }

            try {
                const { transaction_hash: transferTxHash } = (await wallet?.metadata?.starknetAccount?.execute(JSON.parse(callData || "")) || {});

                if (transferTxHash) {
                    setSwapTransaction(swapId, BackendTransactionStatus.Completed, transferTxHash);
                    setTransferDone(true)
                }
                else {
                    toast('Transfer failed or terminated')
                }
            }
            catch (e) {
                toast(e.message)
            }
        }
        catch (e) {
            if (e?.message)
                toast(e.message)
        }
        setLoading(false)
    }, [wallet, swapId, network, userId, token, callData])

    if (!wallet) {
        return <ConnectWalletButton />
    }

    return (
        <div className="w-full space-y-5 flex flex-col justify-between h-full text-secondary-text">
            {
                wallet &&
                <div className="flex flex-row
                        text-primary-text text-base space-x-2">
                    <SubmitButton
                        isDisabled={!!(loading || transferDone)}
                        isSubmitting={!!(loading || transferDone)}
                        onClick={handleTransfer}
                        icon={
                            <WalletIcon
                                className="h-6 w-6 stroke-2"
                                aria-hidden="true"
                            />
                        } >
                        Send from wallet
                    </SubmitButton>
                </div>
            }
        </div >
    )
}


export default StarknetWalletWithdrawStep;