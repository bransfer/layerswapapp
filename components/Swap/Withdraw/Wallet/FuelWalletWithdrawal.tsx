import { FC, useCallback, useEffect, useState } from 'react'
import { BackendTransactionStatus } from '../../../../lib/layerSwapApiClient';
import useWallet from '../../../../hooks/useWallet';
import { useSwapTransactionStore } from '../../../../stores/swapTransactionStore';
import WalletIcon from '../../../icons/WalletIcon';
import { WithdrawPageProps } from './WalletTransferContent';
import { ButtonWrapper, ChangeNetworkMessage, ConnectWalletButton } from './WalletTransfer/buttons';
import {
    useWallet as useFuelWallet,
    useChain,
    useSelectNetwork,
} from '@fuels/react';
import { useSwapDataState } from '../../../../context/swap';
import { datadogRum } from '@datadog/browser-rum';
import { bn, Contract, Provider } from 'fuels';
import WatchdogAbi from '../../../../lib/abis/FUELWATCHDOG.json';
import TransactionMessages from '../messages/TransactionMessages';

const FuelWalletWithdrawStep: FC<WithdrawPageProps> = ({ network, callData, swapId, amount, depositAddress, sequenceNumber, token }) => {
    const [loading, setLoading] = useState(false);
    const [buttonClicked, setButtonClicked] = useState(false)
    const [error, setError] = useState<string | undefined>()

    const { setSwapTransaction } = useSwapTransactionStore()

    const { provider } = useWallet(network, 'withdrawal');
    const { wallet: fuelWallet } = useFuelWallet()
    const { chain, refetch } = useChain()
    const wallet = provider?.activeWallet
    const networkChainId = Number(network?.chain_id)
    const activeChainId = Number(chain?.consensusParameters.chainId)
    const { selectedSourceAccount } = useSwapDataState()

    useEffect(() => {
        if (provider?.activeWallet && !fuelWallet && selectedSourceAccount) {
            provider?.switchAccount && provider?.switchAccount(selectedSourceAccount?.wallet, selectedSourceAccount?.address)
        }
    }, [selectedSourceAccount, provider?.activeWallet, fuelWallet])

    const handleTransfer = useCallback(async () => {
        setButtonClicked(true)
        setError(undefined)
        try {
            setLoading(true)

            if (!fuelWallet) throw Error("Fuel wallet not connected")
            if (!callData) throw Error("Call data not found")
            if (!network) throw Error("Network not found")
            if (!depositAddress) throw Error("Deposit address not found")
            if (!network.metadata.watchdog_contract) throw Error("Watchdog contract not found")
            if (!amount) throw Error("Amount not found")

            const provider = await Provider.create(network?.node_url);
            const contract = new Contract(network.metadata?.watchdog_contract, WatchdogAbi, provider);

            const scope = contract.functions
                .watch(sequenceNumber)
                .addTransfer({
                    destination: depositAddress as string,
                    amount: bn.parseUnits(amount.toString(), token?.decimals),
                    assetId: token?.contract!,
                })

            const transactionRequest = await scope.getTransactionRequest();

            const txCost = await fuelWallet.getTransactionCost(transactionRequest);

            transactionRequest.gasLimit = txCost.gasUsed;
            transactionRequest.maxFee = txCost.maxFee;
            datadogRum.addAction('fuelTransfer', transactionRequest);

            await fuelWallet.fund(transactionRequest, txCost);

            const transactionResponse = await fuelWallet.sendTransaction(transactionRequest);

            if (swapId && transactionResponse) setSwapTransaction(swapId, BackendTransactionStatus.Completed, transactionResponse.id)

        }
        catch (e) {
            if (e?.message) {
                setError(e.message)
                if (e.message !== "User rejected the transaction!") {
                    const txError = new Error(e.message);
                    txError.name = `SwapWithdrawalError`;
                    txError.cause = e;
                    datadogRum.addError(txError);
                }
                return
            }
        }
        finally {
            setLoading(false)
        }
    }, [swapId, callData, fuelWallet])

    if (!wallet) {
        return <ConnectWalletButton />
    }
    else if (network && activeChainId !== undefined && networkChainId !== activeChainId) {
        return <ChangeNetworkButton
            onChange={refetch}
            chainId={networkChainId}
            network={network.display_name}
        />
    }
    return (
        <div className="w-full space-y-1 flex flex-col justify-between h-full text-primary-text">
            {
                buttonClicked &&
                <TransactionMessage
                    error={error}
                    isLoading={loading}
                />
            }
            {
                !loading &&
                <ButtonWrapper isDisabled={!!loading || !fuelWallet} isSubmitting={!!loading || !fuelWallet} onClick={handleTransfer} icon={<WalletIcon className="stroke-2 w-6 h-6" aria-hidden="true" />} >
                    Send from wallet
                </ButtonWrapper>
            }
        </div>
    )
}

const ChangeNetworkButton: FC<{ chainId: number, network: string, onChange: () => void }> = ({ chainId, network, onChange }) => {
    const { selectNetworkAsync, error, isPending, isError } = useSelectNetwork();

    const clickHandler = useCallback(async () => {
        await selectNetworkAsync({ chainId });
        onChange();
    }, [selectNetworkAsync, chainId])

    return <>
        {
            <ChangeNetworkMessage
                data={{
                    isPending: isPending,
                    isError: isError,
                    error
                }}
                network={network}
            />
        }
        {
            !isPending &&
            <ButtonWrapper
                onClick={clickHandler}
                icon={<WalletIcon className="stroke-2 w-6 h-6" />}
            >
                {
                    error ? <span>Try again</span>
                        : <span>Switch network</span>
                }
            </ButtonWrapper>
        }
    </>
}

const TransactionMessage: FC<{ isLoading: boolean, error: string | undefined }> = ({ isLoading, error }) => {
    if (isLoading) {
        return <TransactionMessages.ConfirmTransactionMessage />
    }
    else if (error === "The account(s) sending the transaction don't have enough funds to cover the transaction.") {
        return <TransactionMessages.InsufficientFundsMessage />
    }
    else if (error === "Request cancelled without user response!" || error === "User rejected the transaction!" || error === "User canceled sending transaction") {
        return <TransactionMessages.TransactionRejectedMessage />
    }
    else if (error) {
        const renderingError = new Error(error);
        renderingError.name = `SwapWithdrawalError`;
        renderingError.cause = error;
        datadogRum.addError(renderingError);

        return <TransactionMessages.UexpectedErrorMessage message={error} />
    }
    else return <></>
}

export default FuelWalletWithdrawStep;