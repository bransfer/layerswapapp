import { Form, FormikErrors, useFormikContext } from "formik";
import { FC, useCallback, useEffect } from "react";
import SwapButton from "../../buttons/swapButton";
import React from "react";
import NetworkFormField from "../../Input/NetworkFormField";
import LayerSwapApiClient from "../../../lib/layerSwapApiClient";
import { SwapFormValues } from "../../DTOs/SwapFormValues";
import { Partner } from "../../../Models/Partner";
import useSWR from "swr";
import { ApiResponse } from "../../../Models/ApiResponse";
import { motion, useCycle } from "framer-motion";
import { ArrowUpDown, Loader2 } from 'lucide-react'
import { Widget } from "../../Widget/Index";
import { classNames } from "../../utils/classNames";
import { useQueryState } from "../../../context/query";
import FeeDetailsComponent from "../../FeeDetails";
import { useFee } from "../../../context/feeContext";
import AmountField from "../../Input/Amount"
import dynamic from "next/dynamic";
import { Balance } from "../../../Models/Balance";
import ResizablePanel from "../../ResizablePanel";
import CEXNetworkFormField from "../../Input/CEXNetworkFormField";
import { RouteNetwork } from "../../../Models/Network";
import { resolveExchangesURLForSelectedToken } from "../../../helpers/routes";
import ValidationError from "../../validationError";
import { Exchange, ExchangeToken } from "../../../Models/Exchange";
import { resolveRoutesURLForSelectedToken } from "../../../helpers/routes";
import { useValidationContext } from "../../../context/validationErrorContext";
import { FormSourceWalletButton } from "../../Input/SourceWalletPicker";
import { useSwapDataState, useSwapDataUpdate } from "../../../context/swap";
import useWallet from "../../../hooks/useWallet";
import { useSettingsState } from "../../../context/settings";

type Props = {
    partner?: Partner,
}

const ReserveGasNote = dynamic(() => import("../../ReserveGasNote"), {
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
    } = values

    const { selectedSourceAccount } = useSwapDataState()
    const { setSelectedSourceAccount } = useSwapDataUpdate()
    const { providers, wallets } = useWallet()
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
        if (values.refuel && minAllowedAmount && (Number(values.amount) < minAllowedAmount)) {
            setFieldValue('amount', minAllowedAmount)
        }
    }, [values.refuel, destination, minAllowedAmount])

    const [animate, cycle] = useCycle(
        { rotate: 0 },
        { rotate: 180 }
    );
    const { sourceExchanges: cachedSourceExchanges, destinationExchanges: cachedDestinationExchanges, destinationRoutes: cachedDestinationRoutes, sourceRoutes: cachedSourceRoutes } = useSettingsState();

    const sourceRoutesEndpoint = resolveRoutesURLForSelectedToken({ direction: 'from', network: source?.name, token: fromCurrency?.symbol, includes: { unavailable: true, unmatched: true } })
    const destinationRoutesEndpoint = resolveRoutesURLForSelectedToken({ direction: 'to', network: destination?.name, token: toCurrency?.symbol, includes: { unavailable: true, unmatched: true } })
    const exchangeRoutesURL = resolveExchangesURLForSelectedToken(fromExchange ? 'from' : 'to', values)

    const { data: sourceRoutes, isLoading: sourceLoading } = useSWR<ApiResponse<RouteNetwork[]>>(sourceRoutesEndpoint, layerswapApiClient.fetcher, { keepPreviousData: true, dedupingInterval: 10000 })
    const { data: destinationRoutes, isLoading: destinationLoading } = useSWR<ApiResponse<RouteNetwork[]>>(destinationRoutesEndpoint, layerswapApiClient.fetcher, { keepPreviousData: true, dedupingInterval: 10000 })
    const { data: sourceExchanges, isLoading: sourceExchnagesDataLoading } = useSWR<ApiResponse<Exchange[]>>(exchangeRoutesURL, layerswapApiClient.fetcher, { keepPreviousData: true, fallbackData: { data: cachedSourceExchanges }, dedupingInterval: 10000 })
    const { data: destinationExchanges, isLoading: destinationExchnagesDataLoading } = useSWR<ApiResponse<Exchange[]>>(exchangeRoutesURL, layerswapApiClient.fetcher, { keepPreviousData: true, fallbackData: { data: cachedDestinationExchanges }, dedupingInterval: 10000 })

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
        let newFromExchange: Exchange | undefined
        let newToExchange: Exchange | undefined
        let newFromExchangeToken: ExchangeToken | undefined
        let newToExchangeToken: ExchangeToken | undefined

        if (toExchange) {
            newFromExchange = sourceExchanges?.data?.find(e => e.name === toExchange?.name)
            newFromExchangeToken = newFromExchange?.token_groups.find(t => t.symbol === fromCurrency?.symbol)
        }
        if (fromExchange) {
            newToExchange = destinationExchanges?.data?.find(e => e.name === fromExchange?.name)
            newToExchangeToken = newToExchange?.token_groups.find(t => t.symbol === toCurrency?.symbol)
        }

        const newFrom = sourceRoutes?.data?.find(l => l.name === destination?.name)
        const newTo = destinationRoutes?.data?.find(l => l.name === source?.name)
        const newFromToken = newFrom?.tokens.find(t => t.symbol === toCurrency?.symbol)
        const newToToken = newTo?.tokens.find(t => t.symbol === fromCurrency?.symbol)

        const destinationProvider = (destination && !toExchange)
            ? providers.find(p => p.autofillSupportedNetworks?.includes(destination?.name) && p.connectedWallets?.some(w => !w.isNotAvailable && w.addresses.some(a => a.toLowerCase() === values.destination_address?.toLowerCase())))
            : undefined

        const newDestinationProvider = (newTo && !toExchange) ? providers.find(p => p.autofillSupportedNetworks?.includes(newTo.name) && p.connectedWallets?.some(w => !w.isNotAvailable && w.addresses.some(a => a.toLowerCase() === selectedSourceAccount?.address.toLowerCase())))
            : undefined
        const oldDestinationWallet = newDestinationProvider?.connectedWallets?.find(w => w.autofillSupportedNetworks?.some(n => n.toLowerCase() === newTo?.name.toLowerCase()) && w.addresses.some(a => a.toLowerCase() === values.destination_address?.toLowerCase()))
        const oldDestinationWalletIsNotCompatible = destinationProvider && (destinationProvider?.name !== newDestinationProvider?.name || !(newTo && oldDestinationWallet?.autofillSupportedNetworks?.some(n => n.toLowerCase() === newTo?.name.toLowerCase())))
        const destinationWalletIsAvailable = newTo ? newDestinationProvider?.connectedWallets?.some(w => w.autofillSupportedNetworks?.some(n => n.toLowerCase() === newTo.name.toLowerCase()) && w.addresses.some(a => a.toLowerCase() === selectedSourceAccount?.address.toLowerCase())) : undefined
        const oldSourceWalletIsNotCompatible = destinationProvider && (selectedSourceAccount?.wallet.providerName !== destinationProvider?.name || !(newFrom && selectedSourceAccount?.wallet.withdrawalSupportedNetworks?.some(n => n.toLowerCase() === newFrom.name.toLowerCase())))

        const changeDestinationAddress = newTo && (oldDestinationWalletIsNotCompatible || oldSourceWalletIsNotCompatible) && destinationWalletIsAvailable

        const newVales: SwapFormValues = {
            ...values,
            from: newFrom,
            to: newTo,
            fromCurrency: newFromToken,
            toCurrency: newToToken,
            toExchange: newToExchange,
            fromExchange: newFromExchange,
            currencyGroup: (fromExchange || toExchange) ? (fromExchange ? newToExchangeToken : newFromExchangeToken) : undefined,
            destination_address: (toExchange || fromExchange) ? undefined : values.destination_address,
            depositMethod: undefined
        }

        if (changeDestinationAddress) {
            newVales.destination_address = selectedSourceAccount?.address
        }

        setValues(newVales, true);

        const changeSourceAddress = newFrom && values.depositMethod === 'wallet' && destinationProvider && (oldSourceWalletIsNotCompatible || changeDestinationAddress)
        if (changeSourceAddress && values.destination_address) {
            const sourceAvailableWallet = destinationProvider?.connectedWallets?.find(w => w.withdrawalSupportedNetworks?.some(n => n.toLowerCase() === newFrom.name.toLowerCase()) && w.addresses.some(a => a.toLowerCase() === values.destination_address?.toLowerCase()))
            if (sourceAvailableWallet) {
                setSelectedSourceAccount({
                    wallet: sourceAvailableWallet,
                    address: values.destination_address
                })
            }
            else {
                setSelectedSourceAccount(undefined)
            }

        }
    }, [values, sourceRoutes, destinationRoutes, sourceCanBeSwapped, destinationExchanges, selectedSourceAccount])

    const handleReserveGas = useCallback((walletBalance: Balance, networkGas: number) => {
        if (walletBalance && networkGas)
            setFieldValue('amount', walletBalance?.amount - networkGas)
    }, [values.amount])

    const sourceWalletNetwork = values.fromExchange ? undefined : values.from
    const shoouldConnectWallet = (sourceWalletNetwork && values.depositMethod !== 'deposit_address' && !selectedSourceAccount) || (!values.from && !values.fromExchange && !wallets.length && values.depositMethod !== 'deposit_address')

    return <Widget className="sm:min-h-[450px] h-full">
        <Form className={`h-full grow flex flex-col justify-between ${(isSubmitting) ? 'pointer-events-none' : 'pointer-events-auto'}`} >
            <Widget.Content>
                <div className='flex-col relative flex justify-between gap-1.5 w-full mb-3.5 leading-4 bg-secondary-700 rounded-xl'>
                    {!(query?.hideFrom && values?.from) && <div className="flex flex-col w-full">
                        <NetworkFormField direction="from" label="From" className="rounded-t-lg pt-2.5" partner={partner} />
                    </div>}
                    {!query?.hideFrom && !query?.hideTo &&
                        <button
                            type="button"
                            aria-label="Reverse the source and destination"
                            disabled={valuesSwapperDisabled || sourceLoading || destinationLoading || destinationExchnagesDataLoading || sourceExchnagesDataLoading}
                            onClick={valuesSwapper}
                            className={`${sourceLoading || destinationLoading || destinationExchnagesDataLoading || sourceExchnagesDataLoading ? "" : "hover:text-primary"} absolute right-[calc(50%-16px)] top-[122px] z-10 border-2 border-secondary-700 bg-secondary-600 rounded-lg disabled:cursor-not-allowed disabled:text-secondary-text duration-200 transition disabled:pointer-events-none`}>
                            <motion.div
                                animate={animate}
                                transition={{ duration: 0.3 }}
                                onTap={() => !valuesSwapperDisabled && cycle()}
                            >
                                {sourceLoading || destinationLoading || destinationExchnagesDataLoading || sourceExchnagesDataLoading ?
                                    <Loader2 className="opacity-50 w-7 h-auto p-1 bg-secondary-500 rounded-lg disabled:opacity-30 animate-spin" />
                                    :
                                    <ArrowUpDown className={classNames(valuesSwapperDisabled && 'opacity-50', "w-7 h-auto p-1 bg-secondary-500 rounded-lg disabled:opacity-30")} />
                                }
                            </motion.div>
                        </button>}
                    {!(query?.hideTo && values?.to) && <div className="flex flex-col w-full">
                        <NetworkFormField direction="to" label="To" className="rounded-b-lg" partner={partner} />
                    </div>}
                </div>
                {
                    (((fromExchange && destination) || (toExchange && source)) && currencyGroup) ?
                        <div className="mb-6 leading-4">
                            <ResizablePanel>
                                <CEXNetworkFormField direction={fromExchange ? 'from' : 'to'} partner={partner} />
                            </ResizablePanel>
                        </div>
                        : <></>
                }
                <div className="mb-6 leading-4">
                    <AmountField />
                </div>
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
                        <FormSourceWalletButton />
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