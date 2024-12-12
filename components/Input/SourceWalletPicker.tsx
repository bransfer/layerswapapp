import { useFormikContext } from "formik";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import useWallet from "../../hooks/useWallet";
import shortenAddress from "../utils/ShortenAddress";
import { ChevronDown } from "lucide-react";
import Balance from "./dynamic/Balance";
import { useSwapDataState, useSwapDataUpdate } from "../../context/swap";
import VaulDrawer, { WalletFooterPortal } from "../modal/vaulModal";
import { Wallet } from "../../Models/WalletProvider";
import WalletIcon from "../icons/WalletIcon";
import SubmitButton from "../buttons/submitButton";
import { useConnectModal } from "../WalletModal";
import WalletsList from "../Wallet/WalletsList";

const Component: FC = () => {
    const [openModal, setOpenModal] = useState<boolean>(false)

    const {
        values,
        setFieldValue
    } = useFormikContext<SwapFormValues>();

    const { setSelectedSourceAccount } = useSwapDataUpdate()
    const { selectedSourceAccount } = useSwapDataState()
    const walletNetwork = values.fromExchange ? undefined : values.from
    const source_token = values.fromCurrency
    const destination_address = values.destination_address
    const { provider } = useWallet(walletNetwork, 'withdrawal')
    const availableWallets = provider?.connectedWallets?.filter(w => !w.isNotAvailable) || []

    const selectedWallet = selectedSourceAccount?.wallet
    //TODO: sort by active wallet
    const defaultWallet = walletNetwork && availableWallets?.find(w => !w.isNotAvailable)
    const source_addsress = selectedSourceAccount?.address

    useEffect(() => {
        if (!source_addsress && defaultWallet && values.depositMethod !== 'deposit_address') {
            setSelectedSourceAccount({
                wallet: defaultWallet,
                address: defaultWallet.address
            })
        }
    }, [defaultWallet?.address, source_addsress, values.depositMethod, destination_address])

    useEffect(() => {
        if (values.depositMethod === 'deposit_address' || !defaultWallet?.address || (selectedSourceAccount && !availableWallets.some(w => w?.addresses?.some(a => a === selectedSourceAccount.address)))) {
            setSelectedSourceAccount(undefined)
        }
    }, [values.depositMethod, defaultWallet?.address, availableWallets.length])



    const handleWalletChange = () => {
        setOpenModal(true)
    }

    const handleSelectWallet = (wallet?: Wallet | undefined, address?: string | undefined) => {
        if (wallet && address) {
            setSelectedSourceAccount({
                wallet,
                address
            })
            setFieldValue('depositMethod', 'wallet')
        }
        else {
            setSelectedSourceAccount(undefined)
            setFieldValue('depositMethod', 'deposit_address')
        }
        setOpenModal(false)
    }

    if (!walletNetwork || !source_token)
        return <></>

    return <>
        {
            values.depositMethod === 'deposit_address' ?
                <div className="flex items-center space-x-2 text-sm leading-4">
                    <div onClick={handleWalletChange} className="rounded-md bg-secondary-500 flex space-x-1 items-center py-0.5 pl-2 pr-1 cursor-pointer">
                        <div className="text-secondary-text">
                            Deposit address
                        </div>
                        <div className="w-5 h-5 items-center flex">
                            <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        </div>
                    </div>
                </div>
                :
                <div className="rounded-lg bg-secondary-800 pl-2 flex items-center space-x-2 text-sm leading-4">
                    {
                        selectedWallet && selectedSourceAccount?.address && <>
                            <div><Balance values={values} direction="from" /></div>
                            <div onClick={handleWalletChange} className="rounded-lg bg-secondary-500 flex space-x-1 items-center py-0.5 pl-2 pr-1 cursor-pointer">
                                <div className="inline-flex items-center relative p-0.5">
                                    <selectedWallet.icon className="w-5 h-5" />
                                </div>
                                <div className="text-primary-text">
                                    {shortenAddress(selectedSourceAccount.address)}
                                </div>
                                <div className="w-5 h-5 items-center flex">
                                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                                </div>
                            </div>
                        </>
                    }
                </div>
        }
        <VaulDrawer
            show={openModal}
            setShow={setOpenModal}
            header={`Send from`}
            modalId="connectedWallets"
        >
            <VaulDrawer.Snap id="item-1" className="space-y-3 pb-3">
                <WalletsList
                    provider={provider}
                    wallets={availableWallets}
                    onSelect={handleSelectWallet}
                    token={source_token}
                    network={walletNetwork}
                    selectable
                />
                {
                    values.from?.deposit_methods.includes('deposit_address') &&
                    <div onClick={() => handleSelectWallet()} className="underline text-base text-center text-secondary-text cursor-pointer">
                        Continue without a wallet
                    </div>
                }
            </VaulDrawer.Snap >
        </VaulDrawer>
    </>
}

export const FormSourceWalletButton: FC = () => {
    const [openModal, setOpenModal] = useState<boolean>(false)
    const {
        values,
        setFieldValue
    } = useFormikContext<SwapFormValues>();

    const { setSelectedSourceAccount } = useSwapDataUpdate()

    const [mountWalletPortal, setMounWalletPortal] = useState<boolean>(false)

    const walletNetwork = values.fromExchange ? undefined : values.from

    const { provider } = useWallet(walletNetwork, 'withdrawal')
    const { isWalletModalOpen, cancel } = useConnectModal()

    const handleWalletChange = () => {
        setOpenModal(true)
    }

    const handleSelectWallet = (wallet?: Wallet, address?: string) => {
        if (wallet && address) {
            setSelectedSourceAccount({
                wallet,
                address
            })
            setFieldValue('depositMethod', 'wallet')
        }
        else {
            setSelectedSourceAccount(undefined)
            setFieldValue('depositMethod', 'deposit_address')
        }
        cancel()
        setOpenModal(false)
    }

    const connect = async () => {
        setMounWalletPortal(true)
        const result = await provider?.connectWallet({ chain: walletNetwork?.chain_id || walletNetwork?.name })

        if (result) {
            handleSelectWallet(result, result.address)
        }
        setMounWalletPortal(false)
    }
    const availableWallets = provider?.connectedWallets?.filter(w => !w.isNotAvailable) || []
    if (!availableWallets.length && walletNetwork) {
        return <>
            <Connect connectFn={connect} />
            {
                mountWalletPortal && values.from?.deposit_methods.includes('deposit_address') && values.depositMethod !== 'deposit_address' &&
                <WalletFooterPortal isWalletModalOpen={isWalletModalOpen}>
                    <div onClick={() => handleSelectWallet()} className="underline text-base text-center text-secondary-text cursor-pointer pt-3">
                        Continue without a wallet
                    </div>
                </WalletFooterPortal>
            }
        </>

    }
    else if (availableWallets.length > 0 && walletNetwork && values.fromCurrency) {
        return <>
            <button type="button" className="w-full" onClick={handleWalletChange}>
                <Connect />
            </button>
            <VaulDrawer
                show={openModal}
                setShow={setOpenModal}
                header={`Send from`}
                modalId="connectedWallets"
            >
                <VaulDrawer.Snap id="item-1" className="space-y-3 pb-3">
                    <WalletsList
                        provider={provider}
                        wallets={availableWallets}
                        onSelect={handleSelectWallet}
                        token={values.fromCurrency}
                        network={walletNetwork}
                        selectable
                    />
                </VaulDrawer.Snap>
            </VaulDrawer >
            {
                mountWalletPortal && values.from?.deposit_methods.includes('deposit_address') && values.depositMethod !== 'deposit_address' &&
                <WalletFooterPortal isWalletModalOpen={isWalletModalOpen}>
                    <div onClick={() => handleSelectWallet()} className="underline text-base text-center text-secondary-text cursor-pointer pt-3">
                        Continue without a wallet
                    </div>
                </WalletFooterPortal>
            }
        </>
    }
    return <>
        <Connect setMountWalletPortal={setMounWalletPortal} />
        {
            mountWalletPortal &&
            <WalletFooterPortal isWalletModalOpen={isWalletModalOpen}>
                <div onClick={() => handleSelectWallet()} className="underline text-base text-center text-secondary-text cursor-pointer pt-3">
                    Continue without a wallet
                </div>
            </WalletFooterPortal>
        }
    </>
}

const Connect: FC<{ connectFn?: () => Promise<Wallet | undefined | void>; setMountWalletPortal?: Dispatch<SetStateAction<boolean>> }> = ({ connectFn, setMountWalletPortal }) => {
    const { connect } = useConnectModal()

    const connectWallet = async () => {
        setMountWalletPortal && setMountWalletPortal(true)
        await connect()
        setMountWalletPortal && setMountWalletPortal(false)
    }

    return <SubmitButton onClick={() => connectFn ? connectFn() : connectWallet()} type="button" icon={<WalletIcon className="h-6 w-6" strokeWidth={2} />} >
        Connect a wallet
    </SubmitButton>
}

export default Component