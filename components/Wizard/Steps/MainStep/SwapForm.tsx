import { Form, FormikErrors, useFormikContext } from "formik";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import Image from 'next/image';
import SwapButton from "../../../buttons/swapButton";
import React from "react";
import SwapOptionsToggle from "../../../SwapOptionsToggle";
import SelectNetwork from "../../../Select/SelectNetwork";
import AmountField from "../../../Input/Amount";
import LayerSwapApiClient, { AddressBookItem, SwapType, UserExchangesData } from "../../../../lib/layerSwapApiClient";
import { SwapFormValues } from "../../../DTOs/SwapFormValues";
import { Partner } from "../../../../Models/Partner";
import Widget from "../../Widget";
import AmountAndFeeDetails from "../../../DisclosureComponents/amountAndFeeDetailsComponent";
import SlideOver from "../../../SlideOver";
import OfframpAccountConnectStep from "../../../OfframpAccountConnect";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { KnownwErrorCode } from "../../../../Models/ApiError";
import { useSwapDataState, useSwapDataUpdate } from "../../../../context/swap";
import ConnectApiKeyExchange from "../../../connectApiKeyExchange";
import SpinIcon from "../../../icons/spinIcon";
import { useQueryState } from "../../../../context/query";
import { useSettingsState } from "../../../../context/settings";
import { isValidAddress } from "../../../../lib/addressValidator";
import { CalculateMinAllowedAmount } from "../../../../lib/fees";
import Address from "../../../Input/Address";
import NetworkSettings from "../../../../lib/NetworkSettings";
import shortenAddress from "../../../utils/ShortenAddress";
import useSWR from "swr";
import { ApiResponse } from "../../../../Models/ApiResponse";
import { motion } from "framer-motion";
import AvatarGroup from "../../../AvatarGroup";
import RefuelIcon from "../../../icons/RefuelIcon";
import ClickTooltip from "../../../Tooltips/ClickTooltip";
import ToggleButton from "../../../buttons/toggleButton";

type Props = {
    isPartnerWallet: boolean,
    partner?: Partner,
    resource_storage_url: string,
    loading: boolean
}
const SwapForm: FC<Props> = ({ partner, isPartnerWallet, resource_storage_url, loading }) => {

    const {
        values,
        errors, isValid, isSubmitting, setFieldValue
    } = useFormikContext<SwapFormValues>();
    const { swapType, to } = values
    const settings = useSettingsState();

    const layerswapApiClient = new LayerSwapApiClient()
    const address_book_endpoint = `/address_book/recent`
    const { data: address_book, mutate, isValidating } = useSWR<ApiResponse<AddressBookItem[]>>(address_book_endpoint, layerswapApiClient.fetcher)

    const [openExchangeConnect, setOpenExchangeConnect] = useState(false)
    const [openAddressModal, setOpenAddressModal] = useState(false)
    const [exchangeAccount, setExchangeAccount] = useState<UserExchangesData>()
    const minAllowedAmount = CalculateMinAllowedAmount(values, settings.networks, settings.currencies);
    const partnerImage = partner?.internal_name ? `${resource_storage_url}/layerswap/partners/${partner?.internal_name}.png` : null
    const router = useRouter();
    const [loadingDepositAddress, setLoadingDepositAddress] = useState(false)
    const { setDepositeAddressIsfromAccount } = useSwapDataUpdate()
    const { depositeAddressIsfromAccount } = useSwapDataState()
    const query = useQueryState();

    const lockAddress =
        (values.destination_address && values.to)
        && isValidAddress(values.destination_address, values.to?.baseObject)
        && ((query.lockAddress && (query.addressSource !== "imxMarketplace" || settings.validSignatureisPresent)));

    const closeExchangeConnect = (open) => {
        setLoadingDepositAddress(open)
        setOpenExchangeConnect(open)
    }

    const handleConfirmToggleChange = (value: boolean) => {
        setFieldValue('refuel', value)
    }

    const handleSetExchangeDepositAddress = useCallback(async () => {
        setLoadingDepositAddress(true)
        const layerswapApiClient = new LayerSwapApiClient(router)
        try {
            const exchange_account = await layerswapApiClient.GetExchangeAccount(to?.baseObject.internal_name, 0)
            setExchangeAccount(exchange_account.data)
            const deposit_address = await layerswapApiClient.GetExchangeDepositAddress(to?.baseObject.internal_name, values?.currency?.baseObject?.asset)
            setFieldValue("destination_address", deposit_address.data)
            setDepositeAddressIsfromAccount(true)
            setLoadingDepositAddress(false)
            setOpenAddressModal(false)
        }
        catch (e) {
            if (e?.response?.data?.error?.code === KnownwErrorCode.NOT_FOUND || e?.response?.data?.error?.code === KnownwErrorCode.INVALID_CREDENTIALS)
                setOpenExchangeConnect(true)
            else {
                toast(e?.response?.data?.error?.message || e.message)
                setLoadingDepositAddress(false)
            }
        }
    }, [values])

    const depositeAddressIsfromAccountRef = useRef(depositeAddressIsfromAccount);

    useEffect(() => {
        depositeAddressIsfromAccountRef.current = depositeAddressIsfromAccount
        return () => depositeAddressIsfromAccountRef.current = null
    }, [depositeAddressIsfromAccount])

    const handleExchangeConnected = useCallback(async () => {
        if (!to || !values.currency)
            return
        setLoadingDepositAddress(true)
        try {
            const layerswapApiClient = new LayerSwapApiClient(router)
            const deposit_address = await layerswapApiClient.GetExchangeDepositAddress(to?.baseObject?.internal_name, values?.currency?.baseObject?.asset)
            setFieldValue("destination_address", deposit_address.data)
            setDepositeAddressIsfromAccount(true)
        }
        catch (e) {
            toast(e?.response?.data?.error?.message || e.message)
        }
        setLoadingDepositAddress(false)
    }, [values])

    useEffect(() => {
        if (depositeAddressIsfromAccountRef.current)
            handleExchangeConnected()
        if (swapType !== SwapType.OffRamp && !values?.to?.baseObject?.currencies.find(c => c.asset === values?.currency?.baseObject?.asset)?.is_refuel_enabled) {
            handleConfirmToggleChange(false)
        }
    }, [values.currency])

    useEffect(() => {
        if (swapType !== SwapType.OffRamp && values.refuel && values.amount && Number(values.amount) < minAllowedAmount) {
            setFieldValue('amount', minAllowedAmount)
        }
    }, [values.refuel])

    const exchangeRef = useRef(to?.id);

    useEffect(() => {
        if (swapType === SwapType.OffRamp && exchangeRef.current && exchangeRef.current !== to?.id) {
            setFieldValue("destination_address", '')
            setDepositeAddressIsfromAccount(false)
        }
        exchangeRef.current = to?.id
    }, [to])

    useEffect(() => {
        if (swapType !== SwapType.OffRamp && values.refuel && Number(values.amount) < minAllowedAmount) {
            setFieldValue('amount', minAllowedAmount)
        }
    }, [values.refuel])

    const destination_native_currency = swapType !== SwapType.OffRamp && to?.baseObject?.native_currency
    return <>
        <Form className="h-full" >

            <Widget>
                {loading ?
                    <div className="w-full h-full flex items-center"><SpinIcon className="animate-spin h-8 w-8 grow" /></div>
                    : <Widget.Content>
                        <SwapOptionsToggle />
                        <div className='flex-col md:flex-row flex justify-between w-full md:space-x-4 space-y-4 md:space-y-0 mb-3.5 leading-4'>
                            <div className="flex flex-col w-full">
                                <SelectNetwork direction="from" label="From" />
                            </div>
                            <div className="flex flex-col w-full">
                                <SelectNetwork direction="to" label="To" />
                            </div>
                        </div>
                        <div className="mb-6 leading-4">
                            <AmountField />
                        </div>
                        <div className="w-full mb-3.5 leading-4">
                            <label htmlFor="destination_address" className="block font-normal text-primary-text text-sm">
                                {`To ${values?.to?.name || ''} address`}
                            </label>
                            <SlideOver
                                header={`To ${values?.to?.name || ''} address`}
                                modalHeight="large"
                                opener={(open => <AddressButton
                                    disabled={!values.to || !values.from}
                                    isPartnerWallet={isPartnerWallet}
                                    openAddressModal={open}
                                    partnerImage={partnerImage}
                                    values={values} />)}
                                place='inStep'>
                                {(close, animaionCompleted) => (<Address
                                    close={close}
                                    canFocus={animaionCompleted}
                                    onSetExchangeDepoisteAddress={handleSetExchangeDepositAddress}
                                    exchangeAccount={exchangeAccount}
                                    loading={loadingDepositAddress}
                                    disabled={lockAddress || (!values.to || !values.from) || loadingDepositAddress}
                                    name={"destination_address"}
                                    partnerImage={partnerImage}
                                    isPartnerWallet={isPartnerWallet}
                                    partner={partner}
                                    address_book={address_book?.data}
                                />)}
                            </SlideOver>
                        </div>
                        <div className="w-full">
                            {
                                values?.swapType !== SwapType.OffRamp && values?.to?.baseObject.currencies.find(c => c.asset === values?.currency?.name)?.is_refuel_enabled &&
                                <div className="flex items-center justify-between px-3.5 py-3 bg-darkblue-700 border border-darkblue-500 rounded-lg mb-4">
                                    <div className="flex items-center space-x-2">
                                        <RefuelIcon className='h-8 w-8 text-primary' />
                                        <div>
                                            <p className="font-medium flex items-center">
                                                <span>Need gas?</span>
                                                <ClickTooltip text={`You will get a small amount of ${destination_native_currency} that you can use to pay for gas fees.`} />
                                            </p>
                                            <p className="font-light text-xs">
                                                Get <span className="font-semibold">{destination_native_currency}</span> to pay fees in {values.to.baseObject.display_name}
                                            </p>
                                        </div>
                                    </div>
                                    <ToggleButton name="refuel" value={values?.refuel} onChange={handleConfirmToggleChange} />
                                </div>
                            }
                            <AmountAndFeeDetails values={values} />
                        </div>
                    </Widget.Content>
                }
                <Widget.Footer>
                    <SwapButton className="plausible-event-name=Swap+initiated" type='submit' isDisabled={!isValid || loading} isSubmitting={isSubmitting || loading}>
                        {displayErrorsOrSubmit(errors, values.swapType)}
                    </SwapButton>
                </Widget.Footer>
            </Widget>
            {swapType === SwapType.OffRamp &&
                <SlideOver imperativeOpener={[openExchangeConnect, closeExchangeConnect]} place='inStep'>
                    {(close) => (
                        (values?.to?.baseObject.authorization_flow) === "o_auth2" ?
                            <OfframpAccountConnectStep OnSuccess={async () => { await handleExchangeConnected(); close() }} />
                            : <ConnectApiKeyExchange exchange={to?.baseObject} onSuccess={async () => { handleExchangeConnected(); close() }} slideOverPlace='inStep' />
                    )}
                </SlideOver>}
        </Form >
    </>
}

function displayErrorsOrSubmit(errors: FormikErrors<SwapFormValues>, swapType: SwapType): string {
    return errors.from?.toString() || errors.to?.toString() || errors.amount || errors.destination_address || "Swap now"
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
    return <button type="button" disabled={disabled} onClick={openAddressModal} className="flex rounded-lg space-x-3 items-center cursor-pointer shadow-sm mt-1.5 bg-darkblue-700 border-darkblue-500 border disabled:cursor-not-allowed h-12 leading-4 focus:ring-primary focus:border-primary font-semibold w-full placeholder-gray-400 px-3.5 py-3">
        {isPartnerWallet && values.swapType !== SwapType.OffRamp &&
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
                (NetworkSettings.KnownSettings[values?.to?.baseObject?.internal_name]?.AddressPlaceholder ?? "0x123...ab56c")}
        </div>
    </button>
}

export default SwapForm