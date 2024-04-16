import { Formik, FormikProps } from "formik";
import { useCallback, useRef, useState } from "react";
import { useSettingsState } from "../../../context/settings";
import { SwapFormValues } from "../../DTOs/SwapFormValues";
import { useSwapDataState, useSwapDataUpdate } from "../../../context/swap";
import React from "react";
import ConnectNetwork from "../../ConnectNetwork";
import toast from "react-hot-toast";
import MainStepValidation from "../../../lib/mainStepValidator";
import { generateSwapInitialValues, generateSwapInitialValuesFromSwap } from "../../../lib/generateSwapInitialValues";
import LayerSwapApiClient from "../../../lib/layerSwapApiClient";
import Modal from "../../modal/modal";
import SwapForm from "./Form";
import { NextRouter, useRouter } from "next/router";
import useSWR from "swr";
import { ApiResponse } from "../../../Models/ApiResponse";
import { Partner } from "../../../Models/Partner";
import { UserType, useAuthDataUpdate } from "../../../context/authContext";
import { ApiError, LSAPIKnownErrorCode } from "../../../Models/ApiError";
import { resolvePersistantQueryParams } from "../../../helpers/querryHelper";
import { useQueryState } from "../../../context/query";
import TokenService from "../../../lib/TokenService";
import LayerSwapAuthApiClient from "../../../lib/userAuthApiClient";
import StatusIcon from "../../SwapHistory/StatusIcons";
import Image from 'next/image';
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useFee } from "../../../context/feeContext";
import ResizablePanel from "../../ResizablePanel";
import useWallet from "../../../hooks/useWallet";
import CountdownTimer from "../../utils/countdownTImer";
import { SwapStatus } from "../../../Models/SwapStatus";

type NetworkToConnect = {
    DisplayName: string;
    AppURL: string;
}
const SwapDetails = dynamic(() => import(".."), {
    loading: () => <div className="w-full h-[450px]">
        <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
                <div className="h-32 bg-secondary-700 rounded-lg"></div>
                <div className="h-40 bg-secondary-700 rounded-lg"></div>
                <div className="h-12 bg-secondary-700 rounded-lg"></div>
            </div>
        </div>
    </div>
})

export default function Form() {
    const formikRef = useRef<FormikProps<SwapFormValues>>(null);
    const [showConnectNetworkModal, setShowConnectNetworkModal] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [networkToConnect, setNetworkToConnect] = useState<NetworkToConnect>();
    const router = useRouter();
    const { updateAuthData, setUserType } = useAuthDataUpdate()
    const { getWithdrawalProvider } = useWallet()

    const settings = useSettingsState();
    const query = useQueryState()
    const { createSwap, setSwapId } = useSwapDataUpdate()

    const layerswapApiClient = new LayerSwapApiClient()
    const { data: partnerData } = useSWR<ApiResponse<Partner>>(query?.appName && `/apps?name=${query?.appName}`, layerswapApiClient.fetcher)
    const partner = query?.appName && partnerData?.data?.client_id?.toLowerCase() === (query?.appName as string)?.toLowerCase() ? partnerData?.data : undefined

    const { swapResponse } = useSwapDataState()
    const { swap } = swapResponse || {}
    const { minAllowedAmount, maxAllowedAmount, updatePolling: pollFee } = useFee()

    const handleSubmit = useCallback(async (values: SwapFormValues) => {
        try {
            const accessToken = TokenService.getAuthData()?.access_token
            if (!accessToken) {
                try {
                    var apiClient = new LayerSwapAuthApiClient();
                    const res = await apiClient.guestConnectAsync()
                    updateAuthData(res)
                    setUserType(UserType.GuestUser)
                }
                catch (error) {
                    toast.error(error.response?.data?.error || error.message)
                    return;
                }
            }
            const provider = values.from && getWithdrawalProvider(values.from)
            const wallet = provider?.getConnectedWallet()

            const swapId = await createSwap(values, wallet?.address, query, partner);
            setSwapId(swapId)
            pollFee(false)
            setSwapPath(swapId, router)
            setShowSwapModal(true)
        }
        catch (error) {
            const data: ApiError = error?.response?.data?.error
            if (data?.code === LSAPIKnownErrorCode.BLACKLISTED_ADDRESS) {
                toast.error("You can't transfer to that address. Please double check.")
            }
            else if (data?.code === LSAPIKnownErrorCode.INVALID_ADDRESS_ERROR) {
                toast.error(`Enter a valid ${values.to?.display_name} address`)
            }
            else if (data?.code === LSAPIKnownErrorCode.UNACTIVATED_ADDRESS_ERROR && values.to) {
                setNetworkToConnect({
                    DisplayName: values.to.display_name,
                    AppURL: data.message
                })
                setShowConnectNetworkModal(true);
            } else if (data.code === LSAPIKnownErrorCode.NETWORK_CURRENCY_DAILY_LIMIT_REACHED) {
                const time = data.metadata.RemainingLimitPeriod?.split(':');
                const hours = Number(time[0])
                const minutes = Number(time[1])
                const remainingTime = `${hours > 0 ? `${hours.toFixed()} ${(hours > 1 ? 'hours' : 'hour')}` : ''} ${minutes > 0 ? `${minutes.toFixed()} ${(minutes > 1 ? 'minutes' : 'minute')}` : ''}`

                if (minAllowedAmount && data.metadata.AvailableTransactionAmount > minAllowedAmount) {
                    toast.error(`Daily limit of ${values.fromCurrency?.symbol} transfers from ${values.from?.display_name} is reached. Please try sending up to ${data.metadata.AvailableTransactionAmount} ${values.fromCurrency?.symbol} or retry in ${remainingTime}.`)
                } else {
                    toast.error(`Daily limit of ${values.fromCurrency?.symbol} transfers from ${values.from?.display_name} is reached. Please retry in ${remainingTime}.`)
                }
            }
            else {
                toast.error(data.message || error.message)
            }
        }
    }, [createSwap, query, partner, router, updateAuthData, setUserType, swap, getWithdrawalProvider])

    const destAddress: string = query?.destAddress as string;

    const isPartnerAddress = partner && destAddress;

    const isPartnerWallet = isPartnerAddress && partner?.is_wallet;

    const initialValues: SwapFormValues = swapResponse ? generateSwapInitialValuesFromSwap(swapResponse, settings)
        : generateSwapInitialValues(settings, query)

    const handleShowSwapModal = useCallback((value: boolean) => {
        pollFee(!value)
        setShowSwapModal(value)
        value && swap?.id ? setSwapPath(swap?.id, router) : removeSwapPath(router)
    }, [router, swap])

    return <>
        <div className="rounded-r-lg cursor-pointer absolute z-10 md:mt-3 border-l-0">
            <AnimatePresence mode='wait'>
                {
                    swap &&
                    !showSwapModal &&
                    <PendingSwap key="pendingSwap" onClick={() => handleShowSwapModal(true)} />
                }
            </AnimatePresence>
        </div>
        <Modal
            height="fit"
            show={showConnectNetworkModal}
            setShow={setShowConnectNetworkModal}
            header={`${networkToConnect?.DisplayName} connect`}
            modalId="showNetwork"
        >
            {networkToConnect && <ConnectNetwork NetworkDisplayName={networkToConnect?.DisplayName} AppURL={networkToConnect?.AppURL} />}
        </Modal>
        <Modal
            height='fit'
            show={showSwapModal}
            setShow={handleShowSwapModal}
            header={`Complete the swap`}
            modalId="showSwap"
        >
            <ResizablePanel>
                <SwapDetails type="contained" />
                <CountdownTimer avgTime={"00:00:45.5917270"} timestamp={"2024-04-16T16:49:33+00:00"} swapId={swap?.id} swapStatus={SwapStatus.UserTransferPending} />
            </ResizablePanel>
        </Modal>
        <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validateOnMount={true}
            validate={MainStepValidation({ minAllowedAmount, maxAllowedAmount })}
            onSubmit={handleSubmit}
        >
            <SwapForm isPartnerWallet={!!isPartnerWallet} partner={partner} />
        </Formik>
    </>
}

const textMotion = {
    rest: {
        color: "grey",
        x: 0,
        transition: {
            duration: 0.4,
            type: "tween",
            ease: "easeIn"
        }
    },
    hover: {
        color: "blue",
        x: 30,
        transition: {
            duration: 0.4,
            type: "tween",
            ease: "easeOut"
        }
    }
};

const PendingSwap = ({ onClick }: { onClick: () => void }) => {
    const { swapResponse } = useSwapDataState()
    const { swap } = swapResponse || {}
    const {
        destination_exchange,
        source_exchange,
        source_network,
        destination_network
    } = swap || {}

    const settings = useSettingsState()

    if (!swap)
        return <></>

    return <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
    >
        <motion.div
            onClick={onClick}
            initial="rest" whileHover="hover" animate="rest"
            className="relative bg-secondary-600 rounded-r-lg">
            <motion.div
                variants={textMotion}
                className="flex items-center bg-secondary-600 rounded-r-lg">
                <div className="text-primary-text flex px-3 p-2 items-center space-x-2">
                    <span className="flex items-center">
                        {swap && <StatusIcon swap={swap} short={true} />}
                    </span>
                    <div className="flex-shrink-0 h-5 w-5 relative">
                        {source_exchange ? <Image
                            src={source_exchange.logo}
                            alt="From Logo"
                            height="60"
                            width="60"
                            className="rounded-md object-contain"
                        /> : source_network ?
                            <Image
                                src={source_network.logo}
                                alt="From Logo"
                                height="60"
                                width="60"
                                className="rounded-md object-contain"
                            /> : null
                        }
                    </div>
                    <ChevronRight className="block h-4 w-4 mx-1" />
                    <div className="flex-shrink-0 h-5 w-5 relative block">
                        {destination_exchange ? <Image
                            src={destination_exchange.logo}
                            alt="To Logo"
                            height="60"
                            width="60"
                            className="rounded-md object-contain"
                        /> : destination_network ?
                            <Image
                                src={destination_network.logo}
                                alt="To Logo"
                                height="60"
                                width="60"
                                className="rounded-md object-contain"
                            /> : null
                        }
                    </div>
                </div>

            </motion.div>
        </motion.div>
    </motion.div>
}

const setSwapPath = (swapId: string, router: NextRouter) => {
    const basePath = router?.basePath || ""
    var swapURL = window.location.protocol + "//"
        + window.location.host + `${basePath}/swap/${swapId}`;
    const params = resolvePersistantQueryParams(router.query)
    if (params && Object.keys(params).length) {
        const search = new URLSearchParams(params as any);
        if (search)
            swapURL += `?${search}`
    }
    window.history.pushState({ ...window.history.state, as: swapURL, url: swapURL }, '', swapURL);
}

const removeSwapPath = (router: NextRouter) => {
    const basePath = router?.basePath || ""
    let homeURL = window.location.protocol + "//"
        + window.location.host + basePath

    const params = resolvePersistantQueryParams(router.query)
    if (params && Object.keys(params).length) {
        const search = new URLSearchParams(params as any);
        if (search)
            homeURL += `?${search}`
    }
    window.history.replaceState({ ...window.history.state, as: homeURL, url: homeURL }, '', homeURL);
}