import { FC, useCallback, useState } from 'react'
import SubmitButton from '../../../buttons/submitButton';
import toast from 'react-hot-toast';
import useWallet from '../../../../hooks/useWallet';
import { useSwapTransactionStore } from '../../../../stores/swapTransactionStore';
import WalletIcon from '../../../icons/WalletIcon';
import { WithdrawPageProps } from './WalletTransferContent';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, JettonMaster, beginCell, toNano } from '@ton/ton'
import { Token } from '../../../../Models/Network';
import { BackendTransactionStatus } from '../../../../lib/layerSwapApiClient';
import tonClient from '../../../../lib/wallets/ton/client';
import { ConnectWalletButton } from './WalletTransfer/buttons';
import WalletMessage from '../messages/Message';

const TonWalletWithdrawStep: FC<WithdrawPageProps> = ({ amount, depositAddress, network, token, swapId, callData }) => {
    const [loading, setLoading] = useState(false);
    const { provider } = useWallet(network, 'withdrawal');
    const { setSwapTransaction } = useSwapTransactionStore();
    const [tonConnectUI] = useTonConnectUI();
    const [transactionErrorMessage, setTransactionErrorMessage] = useState<string | undefined>(undefined)

    const wallet = provider?.activeWallet

    const handleConnect = useCallback(async () => {
        setLoading(true)
        setTransactionErrorMessage(undefined)
        try {
            await provider?.connectWallet()
        }
        catch (e) {
            toast(e.message)
        }
        finally {
            setLoading(false)
        }
    }, [provider])

    const handleTransfer = useCallback(async () => {
        setLoading(true)
        setTransactionErrorMessage(undefined)
        if (!swapId || !depositAddress || !token || !wallet?.address || !callData || amount === undefined) {
            setLoading(false)
            return toast('Something went wrong, please try again.')
        }

        try {

            const transaction = await transactionBuilder(amount, token, depositAddress, wallet?.address, callData)
            const res = await tonConnectUI.sendTransaction(transaction)

            if (res) {
                setSwapTransaction(swapId, BackendTransactionStatus.Pending, res.boc);
            }

        }
        catch (e) {
            if (e?.message.includes('Reject request')) {
                setTransactionErrorMessage('Transaction rejected')
            }
            else if (e?.message.includes('Transaction was not sent')) {
                setTransactionErrorMessage('Transaction was not sent')
            }
            else if (e?.message) {
                toast.error(`Something went wrong. Error: ${e.message}`)
            }
        }
        finally {
            setLoading(false)
        }
    }, [swapId, depositAddress, network, token, amount, callData])

    if (!wallet) {
        return <ConnectWalletButton isDisabled={loading} isSubmitting={loading} onClick={handleConnect} />
    }

    return (
        <div className="w-full space-y-5 flex flex-col justify-between h-full text-primary-text">
            <div className='space-y-4'>
                {
                    transactionErrorMessage && wallet &&
                    <WalletMessage status='error' header={transactionErrorMessage} details='Something went wrong' />
                }
                {
                    wallet &&
                    <SubmitButton isDisabled={!!loading} isSubmitting={!!loading} onClick={handleTransfer} icon={<WalletIcon className="stroke-2 w-6 h-6" aria-hidden="true" />} >
                        Send from wallet
                    </SubmitButton>
                }
            </div>
        </div>
    )
}

const transactionBuilder = async (amount: number, token: Token, depositAddress: string, sourceAddress: string, callData: string) => {
    const parsedCallData = JSON.parse(callData)

    if (token.contract) {
        const destinationAddress = Address.parse(depositAddress);
        const userAddress = Address.parse(sourceAddress)

        const forwardPayload = beginCell()
            .storeUint(0, 32) // 0 opcode means we have a comment
            .storeStringTail(parsedCallData.comment)
            .endCell();

        const body = beginCell()
            .storeUint(0x0f8a7ea5, 32) // opcode for jetton transfer
            .storeUint(0, 64) // query id
            .storeCoins(parsedCallData.amount) // jetton amount
            .storeAddress(destinationAddress) // TON wallet destination address
            .storeAddress(destinationAddress) // response excess destination
            .storeBit(0) // no custom payload
            .storeCoins(toNano('0.00002')) // forward amount (if >0, will send notification message)
            .storeBit(1) // we store forwardPayload as a reference
            .storeRef(forwardPayload)
            .endCell();

        const jettonMasterAddress = Address.parse(token.contract!)
        const jettonMaster = tonClient.open(JettonMaster.create(jettonMasterAddress))
        const jettonAddress = await jettonMaster.getWalletAddress(userAddress)

        const tx = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
                {
                    address: jettonAddress.toString(), // sender jetton wallet
                    amount: toNano('0.045').toString(), // for commission fees, excess will be returned
                    payload: body.toBoc().toString("base64") // payload with jetton transfer and comment body
                }
            ]
        }
        return tx
    } else {
        const body = beginCell()
            .storeUint(0, 32) // write 32 zero bits to indicate that a text comment will follow
            .storeStringTail(parsedCallData.comment) // write our text comment
            .endCell();

        const tx = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
                {
                    address: depositAddress,
                    amount: toNano(amount).toString(),
                    payload: body.toBoc().toString("base64") // payload with comment in body
                }
            ]
        }
        return tx
    }
}


export default TonWalletWithdrawStep;