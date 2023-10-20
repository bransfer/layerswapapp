import { Link, ArrowLeftRight } from 'lucide-react';
import { FC, useCallback, useState } from 'react'
import SubmitButton from '../../../buttons/submitButton';
import { useSwapDataState } from '../../../../context/swap';
import toast from 'react-hot-toast';
import { useSettingsState } from '../../../../context/settings';
import { useWalletState, useWalletUpdate } from '../../../../context/wallet';
import { useAccount } from 'wagmi';
import { LoopringAPI } from '../../../../lib/loopring/LoopringAPI';
import { connectProvides, } from "@loopring-web/web3-provider";
import { ConnectorNames } from '@loopring-web/loopring-sdk';
import Web3 from 'web3'
import { ConnectWalletButton } from './WalletTransfer/buttons';
import * as lp from "@loopring-web/loopring-sdk";
import { signatureKeyPairMock } from '../../../../lib/loopring/helpers';
import { useEthersProvider, useEthersSigner } from '../../../../lib/toViem/ethers';
import { useWeb3Signer } from '../../../../lib/toViem/toWeb3'

type Props = {
    depositAddress: string,
    amount: number
}

const LoopringWalletWithdraw: FC<Props> = ({ depositAddress, amount }) => {
    const [loading, setLoading] = useState(false);
    const [transferDone, setTransferDone] = useState<boolean>();
    const { lprAccount } = useWalletState();
    const { swap } = useSwapDataState();
    const { networks } = useSettingsState();
    const { isConnected, address: fromAddress } = useAccount();

    const { setLprAccount } = useWalletUpdate();

    const web3 = useWeb3Signer();
    const { source_network: source_network_internal_name } = swap;
    const source_network = networks.find(n => n.internal_name === source_network_internal_name);
    const token = networks.find(n => swap.source_network == n.internal_name).currencies.find(c => c.asset == swap.source_network_asset);

    const handleConnect = useCallback(async () => {
        setLoading(true)
        try {
            const account = await LoopringAPI.exchangeAPI.getAccount({
                owner: fromAddress,
            })

            const response = await LoopringAPI.userAPI.unLockAccount(
                {
                    keyPair: {
                        web3: web3,
                        address: account.accInfo.owner,
                        keySeed: account.accInfo.keySeed,
                        walletType: ConnectorNames.MetaMask,
                        chainId: 1,
                        accountId: Number(account.accInfo.accountId),
                        isMobile: false,
                    },
                    request: {
                        accountId: account.accInfo.accountId,
                    },
                },
                account.accInfo.publicKey
            );

            const res = await connectProvides.MetaMask({ chainId: 1 })
            setLprAccount(account.accInfo.owner)
        }
        catch (e) {
            toast(e.message)
        }
        setLoading(false)
    }, [source_network])

    const handleTransfer = useCallback(async () => {
        setLoading(true)
        try {
            debugger
            const exchangeApi: lp.ExchangeAPI = new lp.ExchangeAPI({ chainId: 1 });
            const { exchangeInfo } = await exchangeApi.getExchangeInfo();

            const { accInfo } = await LoopringAPI.exchangeAPI.getAccount({
                owner: fromAddress,
            });

            if (!accInfo) {
                return { errorMsg: "AccountInfo Does not exists", result: null };
            }

            if (accInfo.keySeed == "") {
                return { errorMsg: "AccountInfo Does not contain keyseed. Might need to Reset Loopring L2 Keypair", result: null };
            }

            const eddsaKey = await signatureKeyPairMock(accInfo, web3, fromAddress);
            const { apiKey } = await LoopringAPI.userAPI.getUserApiKey(
                {
                    accountId: accInfo.accountId,
                },
                eddsaKey.sk
            );

            const storageId = await LoopringAPI.userAPI.getNextStorageId(
                {
                    accountId: accInfo.accountId,
                    sellTokenId: Number(token.contract_address),
                },
                apiKey
            );

            const fee = await LoopringAPI.userAPI.getOffchainFeeAmt({
                accountId: accInfo.accountId,
                requestType: lp.OffchainFeeReqType.TRANSFER,
            }, apiKey);

            const transferResult = await LoopringAPI.userAPI.submitInternalTransfer({
                request: {
                    exchange: exchangeInfo.exchangeAddress,
                    payerAddr: accInfo.owner,
                    payerId: accInfo.accountId,
                    payeeAddr: swap.destination_address,
                    payeeId: 0,
                    storageId: storageId.offchainId,
                    token: {
                        tokenId: token.contract_address,
                        volume: swap.requested_amount.toString(),
                    },
                    maxFee: {
                        tokenId: token.contract_address,
                        volume: fee.fees[token.asset].fee ?? "9400000000000000000",
                    },
                    validUntil: Math.round(Date.now() / 1000) + 30 * 86400,
                },
                web3,
                chainId: 1,
                walletType: ConnectorNames.MetaMask,
                apiKey: apiKey,
                eddsaKey: eddsaKey.sk
            });
        }
        catch (e) {
            if (e?.message)
                toast(e.message)
        }
        setLoading(false)
    }, [lprAccount, swap, source_network])

    if (!isConnected) {
        return <ConnectWalletButton />
    }

    return (
        <>
            <div className="w-full space-y-5 flex flex-col justify-between h-full text-secondary-text">
                <div className='space-y-4'>
                    {
                        !lprAccount &&
                        <SubmitButton isDisabled={loading} isSubmitting={loading} onClick={handleConnect} icon={<Link className="h-5 w-5 ml-2" aria-hidden="true" />} >
                            Connect
                        </SubmitButton>
                    }
                    {
                        lprAccount &&
                        <SubmitButton isDisabled={loading || transferDone} isSubmitting={loading || transferDone} onClick={handleTransfer} icon={<ArrowLeftRight className="h-5 w-5 ml-2" aria-hidden="true" />} >
                            Transfer
                        </SubmitButton>
                    }
                </div>
            </div>
        </>
    )
}


export default LoopringWalletWithdraw;