import { Formik, FormikProps } from "formik";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { useAuthDataUpdate } from "../../../context/authContext";
import { resolvePersistantQueryParams } from "../../../helpers/querryHelper";
import { useQueryState } from "../../../context/query";
import StatusIcon from "../../SwapHistory/StatusIcons";
import Image from 'next/image';
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useFee } from "../../../context/feeContext";
import ResizablePanel from "../../ResizablePanel";
import useWallet from "../../../hooks/useWallet";
import { DepositMethodProvider } from "../../../context/depositMethodContext";
import { dynamicWithRetries } from "../../../lib/dynamicWithRetries";
import AddressNoteModal from "../../Input/Address/AddressNote";
import { addressFormat } from "../../../lib/address/formatter";
import { useAddressesStore } from "../../../stores/addressesStore";
import { AddressGroup } from "../../Input/Address/AddressPicker";
import EthPhtlcAbi from "../../../lib/abis/atomic/ETHEREUM_PHTLC.json"
import ArbPhtlcAbi from "../../../lib/abis/atomic/ARBITRUM_PHTLC.json"
import { AssetLock } from "../../../Models/PHTLC";
import AtmoicChat from '../AtomicChat'

type NetworkToConnect = {
    DisplayName: string;
    AppURL: string;
}
const SwapDetails = dynamicWithRetries(() => import(".."),
    <div className="w-full h-[450px]">
        <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
                <div className="h-32 bg-secondary-700 rounded-lg"></div>
                <div className="h-40 bg-secondary-700 rounded-lg"></div>
                <div className="h-12 bg-secondary-700 rounded-lg"></div>
            </div>
        </div>
    </div>
)


export const NETWORKS_DETAILS = {
    'ETHEREUM_SEPOLIA': {
        abi: EthPhtlcAbi,
        lockDataResolver: (data: any[]): AssetLock => {
            return {
                dstAddress: data[0],
                dstChain: data[1],
                dstAsset: data[2],
                srcAsset: data[3],
                sender: data[4],
                srcReceiver: data[5],
                hashlock: data[6],
                secret: data[7],
                amount: data[8],
                timelock: data[9],
                redeemed: data[10],
                unlocked: data[11],
            }
        }

    },
    'ARBITRUM_SEPOLIA': {
        abi: ArbPhtlcAbi,
        lockDataResolver: (data: any[]): AssetLock => {
            console.log("dest data -----", data)
            return {
                hashlock: data[0],
                secret: data[1],
                amount: data[2],
                timelock: data[3],
                sender: data[4],
                srcReceiver: data[5],
                redeemed: data[6],
                unlocked: data[7],
            }
        }
    },
    'STARKNET_SEPOLIA': {
        contract: '0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90',
        lp: '0x0454aC1A4567D8128CDA1f23de531702E6c9c06476c705dEcC6c5faEF4714623'
    }
}
type AtomicProps = {
    source: string;
    destination: string;
    amount: number;
    address: string;
    source_asseet: string;
    destination_asset: string;
}
export default function Form() {
    const formikRef = useRef<FormikProps<SwapFormValues>>(null);
    const [showConnectNetworkModal, setShowConnectNetworkModal] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [showAddressNoteModal, setShowAddressNoteModal] = useState(false);
    const [isAddressFromQueryConfirmed, setIsAddressFromQueryConfirmed] = useState(false);
    const [networkToConnect, setNetworkToConnect] = useState<NetworkToConnect>();
    const router = useRouter();
    const { updateAuthData, setUserType } = useAuthDataUpdate()
    const { getSourceProvider } = useWallet()
    const addresses = useAddressesStore(state => state.addresses)

    const settings = useSettingsState();
    const query = useQueryState()
    const { createSwap } = useSwapDataUpdate()

    const layerswapApiClient = new LayerSwapApiClient()
    const { data: partnerData } = useSWR<ApiResponse<Partner>>(query?.appName && `/internal/apps?name=${query?.appName}`, layerswapApiClient.fetcher)
    const partner = query?.appName && partnerData?.data?.client_id?.toLowerCase() === (query?.appName as string)?.toLowerCase() ? partnerData?.data : undefined

    const { swapResponse } = useSwapDataState()
    const { swap } = swapResponse || {}
    const { minAllowedAmount, maxAllowedAmount, updatePolling: pollFee, mutateLimits } = useFee()
    const [atomicData, setAtomicData] = useState<AtomicProps | undefined>(undefined)
    const handleSubmit = useCallback(async (values: SwapFormValues) => {

        const { destination_address, to } = values
        if (to &&
            destination_address &&
            (query.destAddress) &&
            (addressFormat(query.destAddress?.toString(), to) === addressFormat(destination_address, to)) &&
            !(addresses.find(a => addressFormat(a.address, to) === addressFormat(destination_address, to) && a.group !== AddressGroup.FromQuery)) && !isAddressFromQueryConfirmed) {

            setShowAddressNoteModal(true)
            return
        }
        try {
            if (!values.amount) {
                throw new Error("No amount specified")
            }
            if (!values.destination_address) {
                throw new Error("Please enter a valid address")
            }
            if (!values.to?.chain_id) {
                throw new Error("No destination chain")
            }
            if (!values.from?.chain_id) {
                throw new Error("No source chain")
            }
            if (!values.fromCurrency) {
                throw new Error("No source asset")
            }
            if (!values.toCurrency) {
                throw new Error("No destination asset")
            }

            const source_provider = values.from && getSourceProvider(values.from)
            const destination_provider = values.from && getSourceProvider(values.from)

            if (!source_provider) {
                throw new Error("No source_provider")
            }
            if (!destination_provider) {
                throw new Error("No destination_provider")
            }

            // const { commitId, hash } = await source_provider.createPreHTLC({
            //     abi: details.abi,
            //     address: values.destination_address,
            //     amount: values.amount,
            //     destinationChain: values.to?.name,
            //     sourceChain: values.from?.name,
            //     destinationAsset: values.toCurrency.symbol,
            //     sourceAsset: values.fromCurrency.symbol,
            //     lpAddress: values.from.metadata.lp_address,
            //     tokenContractAddress: values.fromCurrency.contract,
            //     decimals: values.fromCurrency.decimals,
            //     atomicContrcat: values.from.metadata.htlc_contract as `0x${string}`,
            //     chainId: values.from?.chain_id,
            // })
            // router.push(`/commitment/${commitId}?network=${values.from?.name}`)

            // return await router.push({
            //     pathname: `/atomic`,
            //     query: {
            //         amount: values.amount,
            //         address: values.destination_address,
            //         source: values.from?.name,
            //         destination: values.to?.name,
            //         source_asseet: values.fromCurrency.symbol,
            //         destination_asset: values.toCurrency.symbol,
            //     }
            // }, undefined, { shallow: false })

            setV8Path({
                amount: values.amount,
                address: values.destination_address,
                source: values.from?.name,
                destination: values.to?.name,
                source_asseet: values.fromCurrency.symbol,
                destination_asset: values.toCurrency.symbol,
                router
            })
            
            setAtomicData({
                amount: Number(values.amount),
                address: values.destination_address,
                source: values.from?.name,
                destination: values.to?.name,
                source_asseet: values.fromCurrency.symbol,
                destination_asset: values.toCurrency.symbol,
            })

            setShowSwapModal(true)
        }
        catch (error) {
            console.log(error)
        }
    }, [createSwap, query, partner, router, updateAuthData, setUserType, swap, getSourceProvider])

    const initialValues: SwapFormValues = swapResponse ? generateSwapInitialValuesFromSwap(swapResponse, settings)
        : generateSwapInitialValues(settings, query)

    useEffect(() => {
        formikRef.current?.validateForm();
    }, [minAllowedAmount, maxAllowedAmount]);

    const handleShowSwapModal = useCallback((value: boolean) => {
        pollFee(!value)
        setShowSwapModal(value)
        value && swap?.id ? setSwapPath(swap?.id, router) : removeSwapPath(router)
    }, [router, swap])
    console.log("showSwapModal", showSwapModal)
    return <DepositMethodProvider canRedirect onRedirect={() => handleShowSwapModal(false)}>
        <div className="rounded-r-lg cursor-pointer absolute z-10 md:mt-3 border-l-0">
            <AnimatePresence mode='wait'>
                {
                    atomicData &&
                    !showSwapModal &&
                    <PendingSwap
                        source={atomicData.source}
                        destination={atomicData.destination}
                        amount={atomicData.amount}
                        address={atomicData.address}
                        source_asseet={atomicData.source_asseet}
                        destination_asset={atomicData.destination_asset}
                        key="pendingSwap"
                        onClick={() => handleShowSwapModal(true)}
                    />
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
            {
                networkToConnect &&
                <ConnectNetwork NetworkDisplayName={networkToConnect?.DisplayName} AppURL={networkToConnect?.AppURL} />
            }
        </Modal>
        <Modal
            height='fit'
            show={showSwapModal}
            setShow={handleShowSwapModal}
            header={`Complete the swap`}
            modalId="showSwap"
        >
            <ResizablePanel>
                {
                    atomicData && <AtmoicChat
                        address={atomicData.address}
                        amount={atomicData.amount}
                        destination={atomicData.destination}
                        destination_asset={atomicData.destination_asset}
                        source={atomicData.source}
                        source_asseet={atomicData.source_asseet}
                        type='contained'
                    />
                }

            </ResizablePanel>
        </Modal>
        <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validateOnMount={true}
            validate={MainStepValidation({ minAllowedAmount, maxAllowedAmount })}
            onSubmit={handleSubmit}
        >
            <>
                <SwapForm partner={partner} />
                <AddressNoteModal partner={partner} openModal={showAddressNoteModal} setOpenModal={setShowAddressNoteModal} onConfirm={() => setIsAddressFromQueryConfirmed(true)} />
            </>
        </Formik>
    </DepositMethodProvider>
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
type PendingSwapProps = AtomicProps & {
    onClick: () => void
}
const PendingSwap = (props: PendingSwapProps) => {
    const {
        source,
        destination,
        amount,
        address,
        source_asseet,
        destination_asset,
        onClick
    } = props
    const { networks } = useSettingsState()
    const source_network = networks.find(n => n.name.toUpperCase() === source.toUpperCase())
    const destination_network = networks.find(n => n.name.toUpperCase() === destination.toUpperCase())
    const source_token = source_network?.tokens.find(t => t.symbol === source_asseet)
    const destination_token = destination_network?.tokens.find(t => t.symbol === destination_asset)

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
                    <div className="flex-shrink-0 h-5 w-5 relative">
                        {source_network && <Image
                            src={source_network.logo}
                            alt="From Logo"
                            height="60"
                            width="60"
                            className="rounded-md object-contain"
                        />}
                    </div>
                    <ChevronRight className="block h-4 w-4 mx-1" />
                    <div className="flex-shrink-0 h-5 w-5 relative block">
                        {destination_network && <Image
                            src={destination_network.logo}
                            alt="To Logo"
                            height="60"
                            width="60"
                            className="rounded-md object-contain"
                        />}
                    </div>
                </div>

            </motion.div>
        </motion.div>
    </motion.div>
}

type SetV8PathParams = {
    amount: string,
    address: string,
    source: string,
    destination: string,
    source_asseet: string,
    destination_asset: string,
    router: NextRouter
}

const setV8Path = (params: SetV8PathParams) => {
    const { amount, address, source, destination, source_asseet, destination_asset, router } = params
    const basePath = router?.basePath || ""
    let v8Url = window.location.protocol + "//"
        + window.location.host + `${basePath}/atomic?amount=${amount}&address=${address}&source=${source}&destination=${destination}&source_asseet=${source_asseet}&destination_asset=${destination_asset}`;
    const query_params = resolvePersistantQueryParams(router.query)
    if (query_params && Object.keys(query_params).length) {
        const search = new URLSearchParams(query_params as any);
        if (search)
            v8Url += `?${search}`
    }
    window.history.pushState({ ...window.history.state, as: v8Url, url: v8Url }, '', v8Url);
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