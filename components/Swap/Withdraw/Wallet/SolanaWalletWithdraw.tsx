import { FC, useCallback, useState } from 'react'
import { BackendTransactionStatus } from '../../../../lib/layerSwapApiClient';
import { Transaction, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import useWallet from '../../../../hooks/useWallet';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { SignerWalletAdapterProps } from '@solana/wallet-adapter-base';
import { useSwapTransactionStore } from '../../../../stores/swapTransactionStore';
import WalletIcon from '../../../icons/WalletIcon';
import { WithdrawPageProps } from './WalletTransferContent';
import { ButtonWrapper, ConnectWalletButton } from './WalletTransfer/buttons';
import useSWRBalance from '../../../../lib/balances/useSWRBalance';
import { useSettingsState } from '../../../../context/settings';
import WalletMessage from '../messages/Message';
import TransactionMessages from '../messages/TransactionMessages';
import { datadogRum } from '@datadog/browser-rum';

const SolanaWalletWithdrawStep: FC<WithdrawPageProps> = ({ network, callData, swapId, token, amount }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>()
    const [insufficientTokens, setInsufficientTokens] = useState<string[]>([])

    const { provider } = useWallet(network, 'withdrawal');
    const { setSwapTransaction } = useSwapTransactionStore();

    const wallet = provider?.activeWallet
    const { wallet: solanaWallet, signTransaction } = useSolanaWallet();
    const walletPublicKey = solanaWallet?.adapter.publicKey
    const solanaNode = network?.node_url
    const networkName = network?.name

    const { networks } = useSettingsState()
    const networkWithTokens = networks.find(n => n.name === networkName)
    const { balance } = useSWRBalance(wallet?.address, networkWithTokens)

    const handleTransfer = useCallback(async () => {
        setLoading(true)
        setError(undefined)
        try {

            if (!signTransaction || !callData || !swapId) throw new Error('Missing data')

            const connection = new Connection(
                `${solanaNode}`,
                "confirmed"
            );

            const arrayBufferCallData = Uint8Array.from(atob(callData), c => c.charCodeAt(0))
            const transaction = Transaction.from(arrayBufferCallData)

            const feeInLamports = await transaction.getEstimatedFee(connection)
            const feeInSol = feeInLamports / LAMPORTS_PER_SOL


            const nativeTokenBalance = balance?.find(b => b.token == network?.token?.symbol)
            const tokenbalanceData = balance?.find(b => b.token == token?.symbol)
            const tokenBalanceAmount = tokenbalanceData?.amount
            const nativeTokenBalanceAmount = nativeTokenBalance?.amount

            const insufficientTokensArr: string[] = []

            if (network?.token && (Number(nativeTokenBalanceAmount) < feeInSol || isNaN(Number(nativeTokenBalanceAmount)))) {
                insufficientTokensArr.push(network.token?.symbol);
            }
            if (network?.token?.symbol !== token?.symbol && amount && token?.symbol && Number(tokenBalanceAmount) < amount) {
                insufficientTokensArr.push(token?.symbol);
            }
            setInsufficientTokens(insufficientTokensArr)
            
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
                if (e?.logs?.some(m => m?.includes('insufficient funds')) || e.message.includes('Attempt to debit an account')) setError('insufficientFunds')
                else setError(e.message)
                return
            }
        }
        finally {
            setLoading(false)
        }
    }, [swapId, callData, walletPublicKey, signTransaction, network])

    if (!wallet || !walletPublicKey) {
        return <ConnectWalletButton />
    } 

    return (
        <div className="w-full space-y-3 flex flex-col justify-between h-full text-primary-text">
            <TransactionMessage
                error={error}
                isLoading={loading}
                insufficientTokens={insufficientTokens}
            />
            {
                wallet && !loading &&
                <ButtonWrapper isDisabled={!!loading} isSubmitting={!!loading} onClick={handleTransfer} icon={<WalletIcon className="stroke-2 w-6 h-6" aria-hidden="true" />} >
                    {error ? 'Try again' : 'Send from wallet'}
                </ButtonWrapper>
            }
        </div>
    )
}

const TransactionMessage: FC<{ isLoading: boolean, error: string | undefined, insufficientTokens: string[] }> = ({ isLoading, error, insufficientTokens }) => {
    if (isLoading) {
        return <TransactionMessages.ConfirmTransactionMessage />
    }
    else if (error === "insufficientFunds") {
        return <WalletMessage
            status="error"
            header='Insufficient funds'
            details={`The balance of ${insufficientTokens?.join(" and ")} in the connected wallet is not enough`} />
    }
    else if (error === "User rejected the request.") {
        return <TransactionMessages.TransactionRejectedMessage />
    }
    else if (error) {
        const swapWithdrawalError = new Error(error);
        swapWithdrawalError.name = `SwapWithdrawalError`;
        swapWithdrawalError.cause = error;
        datadogRum.addError(swapWithdrawalError);

        return <TransactionMessages.UexpectedErrorMessage message={error} />
    }
    else return <></>
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
