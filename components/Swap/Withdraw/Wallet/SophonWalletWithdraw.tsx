import { ArrowLeftRight } from 'lucide-react';
import { FC, useCallback, useState } from 'react'
import toast from 'react-hot-toast';
import { useSwapTransactionStore } from '../../../../stores/swapTransactionStore';
import { BackendTransactionStatus } from '../../../../lib/layerSwapApiClient';
import { ButtonWrapper, ChangeNetworkButton, ConnectWalletButton } from './WalletTransfer/buttons';
import { useAccount } from 'wagmi';
import useWallet from '../../../../hooks/useWallet';
import { WithdrawPageProps } from './WalletTransferContent';
import { sophon, sophonTestnet } from 'viem/chains';
import { createWalletClient, custom, JsonRpcAccount } from 'viem';
import { eip712WalletActions, getGeneralPaymasterInput } from 'viem/zksync';
import KnownInternalNames from '../../../../lib/knownIds';

const SophonWalletWithdraw: FC<WithdrawPageProps> = ({ amount, depositAddress, network, token, swapId, callData }) => {
    const [loading, setLoading] = useState(false);

    const { setSwapTransaction } = useSwapTransactionStore();
    const { chain: activeChain, connector } = useAccount();

    const networkChainId = Number(network?.chain_id) ?? undefined
    const { provider } = useWallet(network, 'withdrawal')
    const wallet = provider?.activeWallet

    const handleTransfer = useCallback(async () => {

        if (!wallet?.address || !swapId || !depositAddress || !token || amount == undefined || !callData || !network?.metadata.zks_paymaster_contract) return

        try {
            setLoading(true)

            const walletProvider = await connector?.getProvider() as any

            if (!walletProvider) throw new Error('Could not get provider')

            const account = {
                address: wallet?.address,
                type: 'json-rpc'
            } as JsonRpcAccount

            const walletClient = createWalletClient({
                chain: network.name === KnownInternalNames.Networks.SophonSepolia ? sophonTestnet : sophon,
                transport: custom(walletProvider),
                account: account
            }).extend(eip712WalletActions());

            const request = await walletClient.prepareTransactionRequest({
                to: depositAddress,
                data: callData as `0x${string}`,
                paymaster: network?.metadata.zks_paymaster_contract,
                paymasterInput: getGeneralPaymasterInput({ innerInput: "0x" }),
            })

            const signature = await walletClient.signTransaction(request as any)
            const hash = await walletClient.sendRawTransaction({
                serializedTransaction: signature
            })

            if (hash) {
                setSwapTransaction(swapId, BackendTransactionStatus.Pending, hash);
            }
        }
        catch (e) {
            if (e?.message) {
                if (e.name.includes("EstimateGasExecutionError")) return toast("You don't have enough funds")
                toast(e.message)
                return
            }
        }
        finally {
            setLoading(false)
        }
    }, [swapId, depositAddress, token, amount, callData])

    if (!wallet) {
        return <ConnectWalletButton />
    }

    else if (activeChain?.id !== networkChainId && network) {
        return <ChangeNetworkButton
            chainId={networkChainId}
            network={network.display_name}
        />
    }

    return (
        <>
            <ButtonWrapper isDisabled={!!(loading)} isSubmitting={!!loading} onClick={handleTransfer} icon={<ArrowLeftRight className="h-5 w-5 ml-2" aria-hidden="true" />} >
                Send from wallet
            </ButtonWrapper>
        </>
    )
}
export default SophonWalletWithdraw;