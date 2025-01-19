import { WalletIcon } from 'lucide-react';
import { FC, useCallback, useState } from 'react'
import useWallet from '../../../../../hooks/useWallet';
import { WithdrawPageProps } from '../WalletTransferContent';
import * as Paradex from "./lib";
import { useSettingsState } from '../../../../../context/settings';
import KnownInternalNames from '../../../../../lib/knownIds';
import { useSwapTransactionStore } from '../../../../../stores/swapTransactionStore';
import { BackendTransactionStatus } from '../../../../../lib/layerSwapApiClient';
import toast from 'react-hot-toast';
import SubmitButton from '../../../../buttons/submitButton';

const StarknetComponent: FC<WithdrawPageProps> = ({ amount, token, callData, swapId }) => {

    const [loading, setLoading] = useState(false)

    const { networks } = useSettingsState();
    const starknet = networks.find(n => n.name === KnownInternalNames.Networks.StarkNetMainnet || n.name === KnownInternalNames.Networks.StarkNetGoerli || n.name === KnownInternalNames.Networks.StarkNetSepolia);

    const { setSwapTransaction } = useSwapTransactionStore();

    const { provider } = useWallet(starknet, 'withdrawal')
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

            if (amount == undefined && !amount)
                throw Error("No amount")

            try {
                const config = await Paradex.Config.fetchConfig(process.env.NEXT_PUBLIC_API_VERSION === "sandbox" ? 'testnet' : 'prod'); ///TODO: check environemnt may be mainnet

                const paraclearProvider = new Paradex.ParaclearProvider.DefaultProvider(config);

                const snAccount = wallet?.metadata?.starknetAccount

                if (!snAccount) {
                    throw Error("Starknet account not found")
                }

                const paradexAccount = await Paradex.Account.fromStarknetAccount({
                    provider: paraclearProvider,
                    config,
                    account: snAccount,
                });

                const parsedCallData = JSON.parse(callData || "")

                const res = await paradexAccount.execute(parsedCallData, undefined, { maxFee: '1000000000000000' });

                if (res.transaction_hash) {
                    setSwapTransaction(swapId, BackendTransactionStatus.Pending, res.transaction_hash);
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
    }, [wallet?.address, swapId, starknet, token, callData, amount])


    return (
        <div className="w-full space-y-5 flex flex-col justify-between h-full text-secondary-text">
            {
                wallet &&
                <div className="flex flex-row
                    text-primary-text text-base space-x-2">
                    <SubmitButton
                        isDisabled={!!(loading || !callData)}
                        isSubmitting={!!(loading)}
                        onClick={handleTransfer}
                        icon={<WalletIcon className="h-5 w-5 ml-2" aria-hidden="true" />} >
                        Send from Starknet wallet
                    </SubmitButton>
                </div>
            }
        </div >
    )
}
export default StarknetComponent;