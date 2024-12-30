import { FC, useCallback, useState } from 'react'
import toast from 'react-hot-toast';
import { BackendTransactionStatus } from '../../../../lib/layerSwapApiClient';
import useWallet from '../../../../hooks/useWallet';
import { useSwapTransactionStore } from '../../../../stores/swapTransactionStore';
import WalletIcon from '../../../icons/WalletIcon';
import { WithdrawPageProps } from './WalletTransferContent';
import { ButtonWrapper, ChangeNetworkMessage, ConnectWalletButton } from './WalletTransfer/buttons';
import {
    useWallet as useFuelWallet,
    useChain,
    useSelectNetwork
} from '@fuels/react';
import { bn, Contract, Provider } from 'fuels';
import WatchdogAbi from '../../../../lib/abis/WatchdogFuelContract.json';

const FuelWalletWithdrawStep: FC<WithdrawPageProps> = ({ network, callData, swapId, sequenceNumber, depositAddress, amount, token }) => {
    const [loading, setLoading] = useState(false);
    const { setSwapTransaction } = useSwapTransactionStore()

    const { provider } = useWallet(network, 'withdrawal');
    const { wallet: fuelWallet } = useFuelWallet()
    const { chain } = useChain()
    const wallet = provider?.activeWallet
    const networkChainId = Number(network?.chain_id) ?? undefined

    const handleTransfer = useCallback(async () => {
        try {
            setLoading(true)

            if (!fuelWallet) throw Error("Fuel wallet not connected")
            if (!callData) throw Error("Call data not found")
            if (!network) throw Error("Network not found")
            if (!depositAddress) throw Error("Deposit address not found")
            if (!network.metadata.watchdog_contract) throw Error("Watchdog contract not found")
            if (!amount) throw Error("Amount not found")
            if (!token?.contract) throw Error("Token contract not found")

            const provider = await Provider.create(network?.node_url);
            const contract = new Contract(network.metadata?.watchdog_contract, WatchdogAbi, provider);

            const data = await contract.functions
                .watch(sequenceNumber)
                .addTransfer({
                    destination: depositAddress as string,
                    amount: bn.parseUnits(amount.toString()),
                    assetId: token?.contract,
                }).getTransactionRequest();

            const transactionResponse = await fuelWallet.sendTransaction(data)

            if (swapId && transactionResponse) setSwapTransaction(swapId, BackendTransactionStatus.Completed, transactionResponse.id)

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
    }, [swapId, callData, fuelWallet])

    if (!wallet) {
        return <ConnectWalletButton />
    }
    else if (network?.chain_id && Number(chain?.consensusParameters.chainId) && networkChainId !== Number(chain?.consensusParameters.chainId)) {
        return <ChangeNetworkButton
            chainId={networkChainId}
            network={network.display_name}
        />
    }
    return (
        <div className="w-full space-y-5 flex flex-col justify-between h-full text-primary-text">
            {
                wallet &&
                <ButtonWrapper isDisabled={!!loading || !fuelWallet} isSubmitting={!!loading || !fuelWallet} onClick={handleTransfer} icon={<WalletIcon className="stroke-2 w-6 h-6" aria-hidden="true" />} >
                    Send from wallet
                </ButtonWrapper>
            }
        </div>
    )
}

const ChangeNetworkButton: FC<{ chainId: number, network: string }> = ({ chainId, network }) => {
    const { selectNetwork, error, isPending, isError } = useSelectNetwork();

    const clickHandler = useCallback(() => {
        return selectNetwork({ chainId })
    }, [selectNetwork, chainId])

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

export default FuelWalletWithdrawStep;