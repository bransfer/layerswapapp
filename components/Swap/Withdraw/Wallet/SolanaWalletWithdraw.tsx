import { FC, useCallback, useState } from 'react'
import toast from 'react-hot-toast';
import { BackendTransactionStatus } from '../../../../lib/layerSwapApiClient';
import { Transaction, Connection } from '@solana/web3.js';
import useWallet from '../../../../hooks/useWallet';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { SignerWalletAdapterProps } from '@solana/wallet-adapter-base';
import { useSwapTransactionStore } from '../../../../stores/swapTransactionStore';
import WalletIcon from '../../../icons/WalletIcon';
import { WithdrawPageProps } from './WalletTransferContent';
import { ButtonWrapper, ConnectWalletButton } from './WalletTransfer/buttons';

const SolanaWalletWithdrawStep: FC<WithdrawPageProps> = ({ network, callData, swapId }) => {
    const [loading, setLoading] = useState(false);
    const { getWithdrawalProvider } = useWallet()
    const { setSwapTransaction } = useSwapTransactionStore();

    const provider = getWithdrawalProvider(network!);
    const wallet = provider?.getConnectedWallet(network);
    const { publicKey: walletPublicKey, signTransaction } = useSolanaWallet();
    const solanaNode = network?.node_url

    const handleTransfer = useCallback(async () => {

        if (!signTransaction || !callData || !swapId) return

        setLoading(true)
        try {
            const connection = new Connection(
                `${solanaNode}`,
                "confirmed"
            );

            const arrayBufferCallData = Uint8Array.from(atob(callData), c => c.charCodeAt(0))

            const transaction = Transaction.from(arrayBufferCallData)
            const signature = await configureAndSendCurrentTransaction(
                transaction,
                connection,
                signTransaction
            );

            if (signature) {
                setSwapTransaction(swapId, BackendTransactionStatus.Pending, signature);
            }

        }
        catch (e) {
            if (e?.message) {
                toast(e.message)
                return
            }
        }
        finally {
            setLoading(false)
        }
    }, [swapId, callData, walletPublicKey, signTransaction])

    if (!wallet) {
        return <ConnectWalletButton />
    } 

    return (
        <div className="w-full space-y-5 flex flex-col justify-between h-full text-primary-text">
            {
                wallet &&
                <ButtonWrapper isDisabled={!!loading} isSubmitting={!!loading} onClick={handleTransfer} icon={<WalletIcon className="stroke-2 w-6 h-6" aria-hidden="true" />} >
                    Send from wallet
                </ButtonWrapper>
            }
        </div>
    )
}

export default SolanaWalletWithdrawStep;

export const configureAndSendCurrentTransaction = async (
    transaction: Transaction,
    connection: Connection,
    signTransaction: SignerWalletAdapterProps['signTransaction']
) => {
    const blockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockHash.blockhash;
    transaction.lastValidBlockHeight = blockHash.lastValidBlockHeight;

    const signed = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    const res = await connection.confirmTransaction({
        blockhash: transaction.recentBlockhash,
        lastValidBlockHeight: transaction.lastValidBlockHeight,
        signature
    });

    if (res.value.err) {
        throw new Error(res.value.err.toString())
    }

    return signature;
};