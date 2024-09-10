import { Form, FormikErrors, useFormikContext } from "formik";
import { FC, useCallback, useEffect, useState } from "react";
import SwapButton from "../../buttons/swapButton";
import React from "react";
import NetworkFormField from "../../Input/NetworkFormField";
import LayerSwapApiClient from "../../../lib/layerSwapApiClient";
import { SwapFormValues } from "../../DTOs/SwapFormValues";
import { Partner } from "../../../Models/Partner";
import { isValidAddress } from "../../../lib/address/validator";
import useSWR from "swr";
import { ApiResponse } from "../../../Models/ApiResponse";
import { motion, useCycle } from "framer-motion";
import { ArrowUpDown, Loader2, Plus } from 'lucide-react'
import { Widget } from "../../Widget/Index";
import { classNames } from "../../utils/classNames";
import GasDetails from "../../gasDetails";
import { useQueryState } from "../../../context/query";
import FeeDetailsComponent from "../../FeeDetails";
import { useFee } from "../../../context/feeContext";
import AmountField from "../../Input/Amount"
import dynamic from "next/dynamic";
import { Balance, Gas } from "../../../Models/Balance";
import ResizablePanel from "../../ResizablePanel";
import CEXNetworkFormField from "../../Input/CEXNetworkFormField";
import { RouteNetwork } from "../../../Models/Network";
import { resolveRoutesURLForSelectedToken } from "../../../helpers/routes";
import ValidationError from "../../validationError";
import { ImtblPassportProvider } from "../../ImtblPassportProvider";
import Modal from "../../modal/modal";
import useWallet from "../../../hooks/useWallet";
import shortenAddress from "../../utils/ShortenAddress";
import ConnectButton from "../../buttons/connectButton";
import { useValidationContext } from "../../../context/validationErrorContext";

type Props = {
    partner?: Partner,
}

const ReserveGasNote = dynamic(() => import("../../ReserveGasNote"), {
    loading: () => <></>,
});

const Address = dynamic(() => import("../../Input/Address"), {
    loading: () => <></>,
});


const SwapForm: FC<Props> = ({ partner }) => {
    const {
        values,
        setValues,
        errors, isValid, isSubmitting, setFieldValue
    } = useFormikContext<SwapFormValues>();
    const {
        to: destination,
        fromCurrency,
        toCurrency,
        from: source,
        fromExchange,
        toExchange,
        currencyGroup,
        source_wallet,
        without_source_wallet
    } = values
    const [showConnectWalletModal, setShowConnectWalletModal] = useState(false);
    const { minAllowedAmount, valuesChanger } = useFee()
    const toAsset = values.toCurrency
    const fromAsset = values.fromCurrency

    const { validationMessage } = useValidationContext();

    const layerswapApiClient = new LayerSwapApiClient()
    const query = useQueryState();
    let valuesSwapperDisabled = false;

    const actionDisplayName = query?.actionButtonText || "Swap now"

    useEffect(() => {
        valuesChanger(values)
    }, [values])

    useEffect(() => {
        if (!source || !toAsset || !toAsset.refuel) {
            setFieldValue('refuel', false, true)
        }
    }, [toAsset, destination, source, fromAsset, currencyGroup])

    useEffect(() => {
        (async () => {
            (await import("../../Input/Address")).default
        })()
    }, [destination])

    useEffect(() => {
        if (values.refuel && minAllowedAmount && (Number(values.amount) < minAllowedAmount)) {
            setFieldValue('amount', minAllowedAmount)
        }
    }, [values.refuel, destination, minAllowedAmount])

    const [animate, cycle] = useCycle(
        { rotate: 0 },
        { rotate: 180 }
    );

    const sourceRoutesEndpoint = (source || destination) ? resolveRoutesURLForSelectedToken({ direction: 'from', network: source?.name, token: fromCurrency?.symbol, includes: { unavailable: true, unmatched: true } }) : null
    const destinationRoutesEndpoint = (source || destination) ? resolveRoutesURLForSelectedToken({ direction: 'to', network: destination?.name, token: toCurrency?.symbol, includes: { unavailable: true, unmatched: true } }) : null

    const { data: sourceRoutes, isLoading: sourceLoading } = useSWR<ApiResponse<RouteNetwork[]>>(sourceRoutesEndpoint, layerswapApiClient.fetcher, { keepPreviousData: true })
    const { data: destinationRoutes, isLoading: destinationLoading } = useSWR<ApiResponse<RouteNetwork[]>>(destinationRoutesEndpoint, layerswapApiClient.fetcher, { keepPreviousData: true })

    const sourceCanBeSwapped = !source ? true : (destinationRoutes?.data?.some(l => l.name === source?.name && l.tokens.some(t => t.symbol === fromCurrency?.symbol && t.status === 'active')) ?? false)
    const destinationCanBeSwapped = !destination ? true : (sourceRoutes?.data?.some(l => l.name === destination?.name && l.tokens.some(t => t.symbol === toCurrency?.symbol && t.status === 'active')) ?? false)

    if (query.lockTo || query.lockFrom || query.hideTo || query.hideFrom) {
        valuesSwapperDisabled = true;
    }
    if (!sourceCanBeSwapped || !destinationCanBeSwapped) {
        valuesSwapperDisabled = true;
    } else if (!source && !destination) {
        valuesSwapperDisabled = true;
    }

    const valuesSwapper = useCallback(() => {
        const newFrom = sourceRoutes?.data?.find(l => l.name === destination?.name)
        const newTo = destinationRoutes?.data?.find(l => l.name === source?.name)
        const newFromToken = newFrom?.tokens.find(t => t.symbol === toCurrency?.symbol)
        const newToToken = newTo?.tokens.find(t => t.symbol === fromCurrency?.symbol)
        setValues({ ...values, from: newFrom, to: newTo, fromCurrency: newFromToken, toCurrency: newToToken, toExchange: values.fromExchange, fromExchange: values.toExchange }, true)
    }, [values, sourceRoutes, destinationRoutes])

    const hideAddress = query?.hideAddress
        && query?.to
        && query?.destAddress
        && (query?.lockTo || query?.hideTo)
        && isValidAddress(query?.destAddress as string, destination)

    const handleReserveGas = useCallback((walletBalance: Balance, networkGas: Gas) => {
        if (walletBalance && networkGas)
            setFieldValue('amount', walletBalance?.amount - networkGas?.gas)
    }, [values.amount])

    const shoouldConnectWallet = !values.without_source_wallet && !values.source_wallet
    const { wallets } = useWallet()



    useEffect(() => {


        setFieldValue('source_wallet', {})

    }, [])



    return <ImtblPassportProvider from={source} to={destination}>
        <>
            <Widget className="sm:min-h-[504px]">
                <Modal
                    height='80%'
                    show={showConnectWalletModal}
                    setShow={setShowConnectWalletModal}
                    header={`Connect wallet`}
                    modalId="connectwallet"
                >
                    <ResizablePanel>
                        <Wallets />
                    </ResizablePanel>
                </Modal>
                <Form className={`h-full ${(isSubmitting) ? 'pointer-events-none' : 'pointer-events-auto'}`} >
                    <Widget.Content>
                        <div className='flex-col relative flex justify-between w-full space-y-0.5 mb-3.5 leading-4'>
                            {!(query?.hideFrom && values?.from) && <div className="flex flex-col w-full">
                                <NetworkFormField direction="from" label="From" className="rounded-t-lg pb-5" />
                            </div>}
                            {!query?.hideFrom && !query?.hideTo &&
                                <button
                                    type="button"
                                    aria-label="Reverse the source and destination"
                                    disabled={valuesSwapperDisabled || sourceLoading || destinationLoading}
                                    onClick={valuesSwapper}
                                    className={`${sourceLoading || destinationLoading ? "" : "hover:text-primary"} absolute right-[calc(50%-16px)] top-[86px] z-10 border-2 border-secondary-900 bg-secondary-900 rounded-full disabled:cursor-not-allowed disabled:text-secondary-text duration-200 transition disabled:pointer-events-none`}>
                                    <motion.div
                                        animate={animate}
                                        transition={{ duration: 0.3 }}
                                        onTap={() => !valuesSwapperDisabled && cycle()}
                                    >
                                        {sourceLoading || destinationLoading ?
                                            <Loader2 className="opacity-50 w-7 h-auto p-1 bg-secondary-900 border-2 border-secondary-500 rounded-full disabled:opacity-30 animate-spin" />
                                            :
                                            <ArrowUpDown className={classNames(valuesSwapperDisabled && 'opacity-50', "w-7 h-auto p-1 bg-secondary-900 border-2 border-secondary-500 rounded-full disabled:opacity-30")} />
                                        }
                                    </motion.div>
                                </button>}
                            {!(query?.hideTo && values?.to) && <div className="flex flex-col w-full">
                                <NetworkFormField direction="to" label="To" className="rounded-b-lg" />
                            </div>}
                        </div>
                        {
                            (((fromExchange && destination) || (toExchange && source)) && currencyGroup) ?
                                <div className="mb-6 leading-4">
                                    <ResizablePanel>
                                        <CEXNetworkFormField direction={fromExchange ? 'from' : 'to'} />
                                    </ResizablePanel>
                                </div>
                                : <></>
                        }
                        <div className="mb-6 leading-4">
                            <AmountField />
                        </div>
                        {
                            !hideAddress ?
                                <Address partner={partner} />
                                : <></>
                        }
                        <div className="w-full">
                            {validationMessage ?
                                <ValidationError />
                                :
                                <FeeDetailsComponent values={values} />
                            }
                            {
                                values.amount &&
                                <ReserveGasNote onSubmit={(walletBalance, networkGas) => handleReserveGas(walletBalance, networkGas)} />
                            }
                        </div>
                    </Widget.Content>
                    <Widget.Footer>
                        {
                            shoouldConnectWallet ?
                                <SwapButton
                                    className="plausible-event-name=Swap+initiated"
                                    type='button'
                                    isDisabled={false}
                                    isSubmitting={isSubmitting}
                                    onClick={() => { setShowConnectWalletModal(true) }}
                                >
                                    Connect Wallet
                                </SwapButton>
                                :
                                <SwapButton
                                    className="plausible-event-name=Swap+initiated"
                                    type='submit'
                                    isDisabled={!isValid}
                                    isSubmitting={isSubmitting}>
                                    {ActionText(errors, actionDisplayName)}
                                </SwapButton>
                        }

                    </Widget.Footer>
                </Form>
            </Widget>
            {
                process.env.NEXT_PUBLIC_SHOW_GAS_DETAILS === 'true'
                && values.from
                && values.fromCurrency &&
                <GasDetails network={values.from.name} currency={values.fromCurrency.symbol} />
            }
        </>
    </ImtblPassportProvider>
}

const Wallets = () => {
    const { wallets } = useWallet()
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();

    useEffect(() => {
        console.log(wallets)

    }, [wallets])


    const habndleSelectWallet = useCallback((wallet) => {
        setFieldValue('source_wallet', wallet)
    }, [])

    return <div className="space-y-4">
        <div className="flex flex-col justify-start space-y-2">
            {
                wallets.map((wallet, index) => (
                    <div key={index} className="w-full relative items-center justify-between gap-2 flex rounded-md outline-none bg-secondary-700 text-primary-text p-3 border border-secondary-500 ">
                        <div className="flex space-x-4 items-center">
                            {
                                wallet.connector &&
                                <div className="inline-flex items-center relative">
                                    <wallet.icon className="w-8 h-8 p-0.5 rounded-full bg-secondary-800 border border-secondary-400" />
                                </div>
                            }
                            <p>{wallet.address && shortenAddress(wallet.address)}</p>
                        </div>

                    </div>
                ))
            }
        </div>
        <ConnectButton onClose={() => { }}>
            <div className="text-secondary-text hover:text-secondary-text/80 flex items-center gap-1 justify-end w-fit">
                <Plus className="h-4 w-4" />
                <span className="text-sm">
                    Link a new wallet
                </span>
            </div>
        </ConnectButton>
    </div>
}



function ActionText(errors: FormikErrors<SwapFormValues>, actionDisplayName: string): string {
    return errors.from?.toString()
        || errors.to?.toString()
        || errors.fromCurrency
        || errors.toCurrency
        || errors.currencyGroup
        || errors.amount
        || errors.destination_address
        || (actionDisplayName)
}

export default SwapForm