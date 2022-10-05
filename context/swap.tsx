import React, { useCallback, useEffect, useState } from 'react'
import { SwapFormValues } from '../components/DTOs/SwapFormValues';
import LayerSwapApiClient, { SwapItemResponse, SwapType } from '../lib/layerSwapApiClient';
import { useAuthDataUpdate } from './authContext';
import TokenService from '../lib/TokenService';
import { ApiError, KnownwErrorCode } from '../Models/ApiError';
import { SwapStatus } from '../Models/SwapStatus';

const SwapDataStateContext = React.createContext<SwapData>({ codeRequested: false, swap: undefined, swapFormData: undefined });
const SwapDataUpdateContext = React.createContext<UpdateInterface | null>(null);

type UpdateInterface = {
    updateSwapFormData: (value: React.SetStateAction<SwapFormValues>) => void,
    createAndProcessSwap: (TwoFACode?: string) => Promise<string>,
    //TODO this is stupid need to clean data in confirm step or even do not store it
    clearSwap: () => void,
    processPayment: (swap: SwapItemResponse, twoFactorCode?: string) => void,
    getSwap: (id: string) => Promise<SwapItemResponse>;
    setCodeRequested(codeSubmitted: boolean): void;

}

type SwapData = {
    codeRequested: boolean,
    swapFormData?: SwapFormValues,
    swap?: SwapItemResponse
}

export function SwapDataProvider({ children }) {
    const [swapFormData, setSwapFormData] = React.useState<SwapFormValues>();
    const [swap, setSwap] = useState<SwapItemResponse>()
    const [codeRequested, setCodeRequested] = React.useState<boolean>(false)

    const { getAuthData } = useAuthDataUpdate();

    const createSwap = useCallback(async (formData: SwapFormValues, access_token: string) => {
        if (!formData)
            throw new Error("No swap data")

        const { network, currency, exchange } = formData

        if (!network || !currency || !exchange)
            throw new Error("Form data is missing")
        const layerswapApiClient = new LayerSwapApiClient()

        try {
            const swap = await layerswapApiClient.createSwap({
                amount: Number(formData.amount),
                exchange: exchange?.id,
                network: network.id,
                asset: currency.baseObject.asset,
                destination_address: formData.destination_address,
                type: formData.swapType === SwapType.OnRamp ? 0 : 1 /// TODO create map for sap types
            }, access_token)

            if (swap?.error) {
                throw new Error(swap?.error?.message)
            }

            const swapId = swap.data.swap_id;
            const swapDetails = await layerswapApiClient.getSwapDetails(swapId, access_token)
            setSwap(swapDetails)
            return swapDetails;
        }
        catch (e) {
            const errorData: ApiError = e?.response?.data?.error
            console.log(errorData)
            if (errorData?.code !== KnownwErrorCode.EXISTING_SWAP)
                throw e

            const pendingSwaps = await layerswapApiClient.getPendingSwaps(access_token)
            const swapToCancel = pendingSwaps.data.find(s => exchange.baseObject.currencies.some(ec => ec.id === s.exchange_currency_id))
            if (!swapToCancel)
                throw new Error("Trying to cancel swap. Pending swap not found")
            await layerswapApiClient.CancelSwap(swapToCancel.id, access_token)
            return await createSwap(formData, access_token)
        }
    }, [])

    const processPayment = useCallback(async (swap: SwapItemResponse, twoFactorCode?: string) => {
        const authData = getAuthData()
        if (!authData?.access_token)
            throw new Error("Not authenticated")
        const layerswapApiClient = new LayerSwapApiClient()
        const prcoessPaymentReponse = await layerswapApiClient.ProcessPayment(swap.data.id, authData.access_token, twoFactorCode)
        if (prcoessPaymentReponse.error)
            throw new Error(prcoessPaymentReponse.error)
        const swapDetails = await layerswapApiClient.getSwapDetails(swap.data.id, authData.access_token)
        setSwap(swapDetails)
    }, [getAuthData])

    const getSwap = useCallback(async (id) => {
        const authData = TokenService.getAuthData();
        if (!authData?.access_token)
            throw new Error("Not authenticated")
        const layerswapApiClient = new LayerSwapApiClient()
        const swapDetails = await layerswapApiClient.getSwapDetails(id, authData?.access_token)
        setSwap(swapDetails)
        return swapDetails
    }, [])

    const createAndProcessSwap = useCallback(async (TwoFACode?: string) => {
        const authData = TokenService.getAuthData();
        if (!authData?.access_token)
            throw new Error("Not authenticated")

        const _swap = swap?.data?.id ? await getSwap(swap.data.id) : await createSwap(swapFormData, authData?.access_token)
        if (_swap?.data?.status === SwapStatus.Created)
            await processPayment(_swap, TwoFACode)
        ///TODO grdon code please refactor
        else if (_swap?.data?.status === SwapStatus.Cancelled) {
            const newSwap = await createSwap(swapFormData, authData?.access_token)
            await processPayment(newSwap, TwoFACode)
            return newSwap.data.id
        }

        return _swap.data.id
    }, [swap, swapFormData])

    const updateFns: UpdateInterface = {
        clearSwap: () => { setSwap(undefined), setCodeRequested(false) },
        updateSwapFormData: setSwapFormData,
        createAndProcessSwap: createAndProcessSwap,
        getSwap: getSwap,
        processPayment: processPayment,
        setCodeRequested: setCodeRequested,
    };

    return (
        <SwapDataStateContext.Provider value={{ swapFormData, swap, codeRequested }}>
            <SwapDataUpdateContext.Provider value={updateFns}>
                {children}
            </SwapDataUpdateContext.Provider>
        </SwapDataStateContext.Provider>
    );
}

export function useSwapDataState() {
    const data = React.useContext(SwapDataStateContext);

    if (data === undefined) {
        throw new Error('swapData must be used within a SwapDataProvider');
    }
    return data;
}

export function useSwapDataUpdate() {
    const updateFns = React.useContext<UpdateInterface>(SwapDataUpdateContext);

    if (updateFns === undefined) {
        throw new Error('useSwapDataUpdate must be used within a SwapDataProvider');
    }

    return updateFns;
}