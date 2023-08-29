import { Form, FormikErrors, useFormikContext } from "formik";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import Image from 'next/image';
import SwapButton from "../../buttons/swapButton";
import React from "react";
import NetworkFormField from "../../Input/NetworkFormField";
import AmountField from "../../Input/Amount";
import LayerSwapApiClient, { AddressBookItem, UserExchangesData } from "../../../lib/layerSwapApiClient";
import { SwapFormValues } from "../../DTOs/SwapFormValues";
import { Partner } from "../../../Models/Partner";
import AmountAndFeeDetails from "../../DisclosureComponents/amountAndFeeDetailsComponent";
import Modal from "../../modal/modal";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useSwapDataState, useSwapDataUpdate } from "../../../context/swap";
import { useQueryState } from "../../../context/query";
import { useSettingsState } from "../../../context/settings";
import { isValidAddress } from "../../../lib/addressValidator";
import { CalculateMinAllowedAmount } from "../../../lib/fees";
import Address from "../../Input/Address";
import shortenAddress from "../../utils/ShortenAddress";
import useSWR from "swr";
import { ApiResponse } from "../../../Models/ApiResponse";
import { motion, useCycle } from "framer-motion";
import ClickTooltip from "../../Tooltips/ClickTooltip";
import ToggleButton from "../../buttons/toggleButton";
import { ArrowUpDown, Fuel } from 'lucide-react'
import { useAuthState } from "../../../context/authContext";
import WarningMessage from "../../WarningMessage";
import { FilterDestinationLayers, FilterSourceLayers, GetDefaultNetwork, GetNetworkCurrency } from "../../../helpers/settingsHelper";
import KnownInternalNames from "../../../lib/knownIds";
import { Widget } from "../../Widget/Index";
import { classNames } from "../../utils/classNames";
import { useWalletState, useWalletUpdate } from "../../../context/wallet";
import { useAccount } from "wagmi";
import { truncateDecimals } from "../../utils/RoundDecimals";

type Props = {
    isPartnerWallet: boolean,
    partner?: Partner,
    loading: boolean
}

const SwapForm: FC<Props> = ({ partner, isPartnerWallet, loading }) => {

    const {
        values,
        setValues,
        errors, isValid, isSubmitting, setFieldValue
    } = useFormikContext<SwapFormValues>();

    const { to: destination } = values
    const settings = useSettingsState();
    const source = values.from
    const asset = values.currency?.asset
    const { authData } = useAuthState()
    const { getBalance, getGas } = useWalletUpdate()
    const { balances, gases } = useWalletState()
    const { address } = useAccount()
    const layerswapApiClient = new LayerSwapApiClient()
    const address_book_endpoint = authData?.access_token ? `/address_book/recent` : null
    const { data: address_book } = useSWR<ApiResponse<AddressBookItem[]>>(address_book_endpoint, layerswapApiClient.fetcher, { dedupingInterval: 60000 })

    const minAllowedAmount = CalculateMinAllowedAmount(values, settings.networks, settings.currencies);
    const partnerImage = partner?.organization_name ? settings.resolveImgSrc(partner) : null
    const router = useRouter();
    const { setDepositeAddressIsfromAccount, setAddressConfirmed } = useSwapDataUpdate()
    const { depositeAddressIsfromAccount } = useSwapDataState()
    const query = useQueryState();
    const [valuesSwapperDisabled, setValuesSwapperDisabled] = useState(false)
    const [showAddressModal, setShowAddressModal] = useState(false);
    const lockAddress =
        (values.destination_address && values.to)
        && isValidAddress(values.destination_address, values.to)
        && (((query.lockAddress || query.hideAddress) && (query.addressSource !== "imxMarketplace" || settings.validSignatureisPresent)));

    const actionDisplayName = query?.actionButtonText || "Swap now"

    const handleConfirmToggleChange = (value: boolean) => {
        setFieldValue('refuel', value)
    }

    const depositeAddressIsfromAccountRef = useRef(depositeAddressIsfromAccount);

    useEffect(() => {
        depositeAddressIsfromAccountRef.current = depositeAddressIsfromAccount
        return () => depositeAddressIsfromAccountRef.current = null
    }, [depositeAddressIsfromAccount])

    const handleExchangeConnected = useCallback(async () => {
        if (!destination || !values.currency)
            return
        try {
            const layerswapApiClient = new LayerSwapApiClient(router)
            const deposit_address = await layerswapApiClient.GetExchangeDepositAddress(destination?.internal_name, values?.currency?.asset)
            setFieldValue("destination_address", deposit_address.data)
            setDepositeAddressIsfromAccount(true)
        }
        catch (e) {
            toast(e?.response?.data?.error?.message || e.message)
        }
    }, [values])

    useEffect(() => {
        if (depositeAddressIsfromAccountRef.current)
            handleExchangeConnected()
        if (!destination?.isExchange && !GetNetworkCurrency(source, asset)?.is_refuel_enabled) {
            handleConfirmToggleChange(false)
        }
    }, [asset, destination])

    useEffect(() => {
        setAddressConfirmed(false)
    }, [source])

    useEffect(() => {
        if (!destination?.isExchange && values.refuel && values.amount && Number(values.amount) < minAllowedAmount) {
            setFieldValue('amount', minAllowedAmount)
        }
    }, [values.refuel, destination])

    const previouslySelectedDestination = useRef(destination);

    //If destination changed to exchange, remove destination_address
    useEffect(() => {
        if ((previouslySelectedDestination.current && destination?.isExchange != previouslySelectedDestination.current?.isExchange
            || (destination?.isExchange && previouslySelectedDestination.current?.isExchange && destination?.internal_name != previouslySelectedDestination.current?.internal_name)
            || destination && !isValidAddress(values.destination_address, destination)) && !lockAddress) {
            setFieldValue("destination_address", '')
            setDepositeAddressIsfromAccount(false)
        }
        previouslySelectedDestination.current = destination
    }, [destination])

    useEffect(() => {
        if (!destination?.isExchange && values.refuel && Number(values.amount) < minAllowedAmount) {
            setFieldValue('amount', minAllowedAmount)
        }
    }, [values.refuel, destination])

    const valuesSwapper = useCallback(() => {
        setValues({ ...values, from: values.to, to: values.from }, true)
    }, [values])

    const [animate, cycle] = useCycle(
        { rotate: 0 },
        { rotate: 180 }
    );

    const lockedCurrency = query?.lockAsset ? settings.currencies?.find(c => c?.asset?.toUpperCase() === asset?.toUpperCase()) : null

    useEffect(() => {

        const filteredSourceLayers = FilterSourceLayers(settings.layers, source, lockedCurrency);
        const filteredDestinationLayers = FilterDestinationLayers(settings.layers, destination, lockedCurrency);

        const sourceCanBeSwapped = filteredDestinationLayers.some(l => l.internal_name === source?.internal_name)
        const destinationCanBeSwapped = filteredSourceLayers.some(l => l.internal_name === destination?.internal_name)

        if (query.lockTo || query.lockFrom || query.hideTo || query.hideFrom) {
            setValuesSwapperDisabled(true)
            return;
        }
        if (!(sourceCanBeSwapped || destinationCanBeSwapped)) {
            setValuesSwapperDisabled(true)
            return;
        }
        setValuesSwapperDisabled(false)

    }, [source, destination, query, settings, lockedCurrency])

    useEffect(() => {
        getBalance(values.from)
    }, [values.from, values.destination_address, address])

    const contract_address = values.from?.assets?.find(a => a.asset === values?.currency?.asset)?.contract_address
    const walletBalance = balances?.find(b => b?.network === values?.from?.internal_name && b?.token === values?.currency?.asset)
    const networkGas = gases?.[values.from?.internal_name]?.find(g => g.token === values?.currency?.asset)?.gas

    useEffect(() => {
        if (walletBalance)
            getGas(values.from, values.currency)
    }, [contract_address, values.currency, address, walletBalance])

    const destinationNetwork = GetDefaultNetwork(destination, values?.currency?.asset)
    const destination_native_currency = !destination?.isExchange && destinationNetwork?.native_currency

    const averageTimeString = (values?.to?.isExchange === true ?
        values?.to?.assets.find(a => a?.asset === values?.currency?.asset && a?.is_default)?.network.average_completion_time
        : values?.to?.average_completion_time)
        || ''
    const parts = averageTimeString?.split(":");
    const averageTimeInMinutes = parts && parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10) + parseInt(parts[2]) / 60

    const hideAddress = query?.hideAddress
        && query?.to
        && query?.destAddress
        && (query?.lockTo || query?.hideTo)
        && isValidAddress(query?.destAddress, destination)

    const handleReserveGas = useCallback(() => {
        setFieldValue('amount', walletBalance.amount - networkGas)
    }, [values.amount, walletBalance])

    return <Form className={`h-full ${(loading || isSubmitting) ? 'pointer-events-none' : 'pointer-events-auto'}`} >
        <Widget className="sm:min-h-[504px]">
            <Widget.Content>
                <div className='flex-col relative flex justify-between w-full space-y-4 mb-3.5 leading-4'>
                    {!(query?.hideFrom && values?.from) && <div className="flex flex-col w-full">
                        <NetworkFormField direction="from" label="From" />
                    </div>}
                    {!query?.hideFrom && !query?.hideTo && <button type="button" disabled={valuesSwapperDisabled} onClick={valuesSwapper} className='absolute right-[calc(50%-16px)] top-[74px] z-10 border-4 border-secondary-900 bg-secondary-900 rounded-full disabled:cursor-not-allowed hover:text-primary disabled:text-primary-text duration-200 transition'>
                        <motion.div
                            animate={animate}
                            transition={{ duration: 0.3 }}
                            onTap={() => !valuesSwapperDisabled && cycle()}
                        >
                            <ArrowUpDown className={classNames(valuesSwapperDisabled && 'opacity-50', "w-8 h-auto p-1 bg-secondary-900 border-2 border-secondary-500 rounded-full disabled:opacity-30")} />
                        </motion.div>
                    </button>}
                    {!(query?.hideTo && values?.to) && <div className="flex flex-col w-full">
                        <NetworkFormField direction="to" label="To" />
                    </div>}
                </div>
                <div className="mb-6 leading-4">
                    <AmountField />
                </div>
                {
                    !hideAddress &&
                    <div className="w-full mb-3.5 leading-4">
                        <label htmlFor="destination_address" className="block font-semibold text-primary-text text-sm">
                            {`To ${values?.to?.display_name || ''} address`}
                        </label>
                        <AddressButton
                            disabled={!values.to || !values.from}
                            isPartnerWallet={isPartnerWallet}
                            openAddressModal={() => setShowAddressModal(true)}
                            partnerImage={partnerImage}

                            values={values} />
                        <Modal
                            header={`To ${values?.to?.display_name || ''} address`}
                            height="fit"
                            show={showAddressModal} setShow={setShowAddressModal}
                            className="min-h-[70%]"
                        >
                            <Address
                                close={() => setShowAddressModal(false)}
                                disabled={lockAddress || (!values.to || !values.from)}
                                name={"destination_address"}
                                partnerImage={partnerImage}
                                isPartnerWallet={isPartnerWallet}
                                partner={partner}
                                address_book={address_book?.data}
                            />
                        </Modal>
                    </div>
                }
                <div className="w-full">
                    {
                        !destination?.isExchange && GetNetworkCurrency(destination, asset)?.is_refuel_enabled && !query?.hideRefuel &&
                        <div className="flex items-center justify-between px-3.5 py-3 bg-secondary-700 border border-secondary-500 rounded-lg mb-4">
                            <div className="flex items-center space-x-2">
                                <Fuel className='h-8 w-8 text-primary' />
                                <div>
                                    <p className="font-medium flex items-center">
                                        <span>Need gas?</span>
                                        <ClickTooltip text={`You will get a small amount of ${destination_native_currency} that you can use to pay for gas fees.`} />
                                    </p>
                                    <p className="font-light text-xs">
                                        Get <span className="font-semibold">{destination_native_currency}</span> to pay fees in {values.to?.display_name}
                                    </p>
                                </div>
                            </div>
                            <ToggleButton name="refuel" value={values?.refuel} onChange={handleConfirmToggleChange} />
                        </div>
                    }
                    <AmountAndFeeDetails values={values} />
                    {
                        //TODO refactor
                        GetNetworkCurrency(destination, asset)?.status == 'insufficient_liquidity' &&
                        <WarningMessage messageType="warning" className="mt-4">
                            <span className="font-normal">We're experiencing delays for transfers of {values?.currency?.asset} to {values?.to?.display_name}. Estimated arrival time can take up to 2 hours.</span>
                        </WarningMessage>
                    }
                    {
                        GetNetworkCurrency(destination, asset)?.status !== 'insufficient_liquidity' && destination?.internal_name === KnownInternalNames.Networks.StarkNetMainnet && averageTimeInMinutes > 30 &&
                        <WarningMessage messageType="warning" className="mt-4">
                            <span className="font-normal">{destination?.display_name} network congestion. Transactions can take up to 1 hour.</span>
                        </WarningMessage>
                    }
                </div>
            </Widget.Content>
            <Widget.Footer>
                <SwapButton
                    className="plausible-event-name=Swap+initiated"
                    type='submit'
                    isDisabled={!isValid || loading}
                    isSubmitting={isSubmitting || loading}>
                    {ActionText(errors, actionDisplayName)}
                </SwapButton>
            </Widget.Footer>
        </Widget>
    </Form >
}

function ActionText(errors: FormikErrors<SwapFormValues>, actionDisplayName: string): string {
    return errors.from?.toString()
        || errors.to?.toString()
        || errors.amount
        || errors.destination_address
        || (actionDisplayName)
}

const TruncatedAdrress = ({ address }: { address: string }) => {
    return <div className="tracking-wider text-white">{shortenAddress(address)}</div>
}

type AddressButtonProps = {
    openAddressModal: () => void;
    isPartnerWallet: boolean;
    values: SwapFormValues;
    partnerImage: string;
    disabled: boolean;
}
const AddressButton: FC<AddressButtonProps> = ({ openAddressModal, isPartnerWallet, values, partnerImage, disabled }) => {
    const destination = values?.to
    return <button type="button" disabled={disabled} onClick={openAddressModal} className="flex rounded-lg space-x-3 items-center cursor-pointer shadow-sm mt-1.5 text-primary-text-placeholder bg-secondary-700 border-secondary-500 border disabled:cursor-not-allowed h-12 leading-4 focus:ring-primary focus:border-primary font-semibold w-full px-3.5 py-3">
        {isPartnerWallet && !destination?.isExchange &&
            <div className="shrink-0 flex items-center pointer-events-none">
                {
                    partnerImage &&
                    <Image alt="Partner logo" className='rounded-md object-contain' src={partnerImage} width="24" height="24"></Image>
                }
            </div>
        }
        <div className="truncate">
            {values.destination_address ?
                <TruncatedAdrress address={values.destination_address} />
                :
                "Enter your address here"
            }
        </div>
    </button>
}



export default SwapForm
