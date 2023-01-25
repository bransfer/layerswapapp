import { Form, FormikErrors, useField, useFormikContext } from "formik";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import Image from 'next/image';
import SwapButton from "../../../buttons/swapButton";
import React from "react";
import AddressInput from "../../../Input/AddressInput";
import { classNames } from "../../../utils/classNames";
import SwapOptionsToggle from "../../../SwapOptionsToggle";
import { ConnectedFocusError } from "../../../../lib/external/ConnectedFocusError";
import SelectNetwork from "../../../Select/SelectNetwork";
import AmountField from "../../../Input/Amount";
import LayerSwapApiClient, { SwapType, UserExchangesData } from "../../../../lib/layerSwapApiClient";
import { SwapFormValues } from "../../../DTOs/SwapFormValues";
import { Partner } from "../../../../Models/Partner";
import Widget from "../../Widget";
import AmountAndFeeDetails from "../../../DisclosureComponents/amountAndFeeDetailsComponent";
import SlideOver from "../../../SlideOver";
import OfframpAccountConnectStep from "../../../OfframpAccountConnect";
import KnownInternalNames from "../../../../lib/knownIds";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { KnownwErrorCode } from "../../../../Models/ApiError";
import { useSwapDataState, useSwapDataUpdate } from "../../../../context/swap";
import ConnectApiKeyExchange from "../../../connectApiKeyExchange";
import SpinIcon from "../../../icons/spinIcon";

type Props = {
    isPartnerWallet: boolean,
    partner?: Partner,
    lockAddress: boolean,
    resource_storage_url: string,
    loading: boolean
}
const SwapForm: FC<Props> = ({ partner, isPartnerWallet, lockAddress, resource_storage_url, loading }) => {

    const {
        values,
        errors, isValid, isSubmitting, setFieldValue
    } = useFormikContext<SwapFormValues>();


    const [openExchangeConnect, setOpenExchangeConnect] = useState(false)
    const [exchangeAccount, setExchangeAccount] = useState<UserExchangesData>()
    const partnerImage = partner?.internal_name ? `${resource_storage_url}/layerswap/partners/${partner?.internal_name}.png` : null
    const router = useRouter();
    const [loadingDepositAddress, setLoadingDepositAddress] = useState(false)
    const { setDepositeAddressIsfromAccount } = useSwapDataUpdate()
    const { depositeAddressIsfromAccount } = useSwapDataState()

    const closeExchangeConnect = (open) => {
        setLoadingDepositAddress(open)
        setOpenExchangeConnect(open)
    }

    const handleSetExchangeDepositAddress = useCallback(async () => {
        setLoadingDepositAddress(true)
        const layerswapApiClient = new LayerSwapApiClient(router)
        try {
            const exchange_account = await layerswapApiClient.GetExchangeAccount(values.from?.baseObject.internal_name, 0)
            setExchangeAccount(exchange_account.data)
            const deposit_address = await layerswapApiClient.GetExchangeDepositAddress(values.from?.baseObject.internal_name, values?.currency?.baseObject?.asset)
            setFieldValue("destination_address", deposit_address.data)
            setDepositeAddressIsfromAccount(true)
            setLoadingDepositAddress(false)
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
        if (!values.from || !values.currency)
            return
        setLoadingDepositAddress(true)
        try {
            const layerswapApiClient = new LayerSwapApiClient(router)
            const deposit_address = await layerswapApiClient.GetExchangeDepositAddress(values.from?.baseObject?.internal_name, values?.currency?.baseObject?.asset)
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
    }, [values.currency])

    const exchangeRef = useRef(values.from?.id);

    useEffect(() => {
        if (exchangeRef.current && exchangeRef.current !== values?.from?.id) {
            setFieldValue("destination_address", '')
            setDepositeAddressIsfromAccount(false)
        }
        exchangeRef.current = values?.from?.id
    }, [values.from])

    return <>
        <Form className="h-full" >
            <SlideOver imperativeOpener={[openExchangeConnect, closeExchangeConnect]} place='inStep'>
                {(close) => (
                    (values?.swapType === SwapType.OffRamp && values?.to?.baseObject.authorization_flow) === "o_auth2" ?
                        <OfframpAccountConnectStep OnSuccess={async () => { await handleExchangeConnected(); close() }} />
                        : <ConnectApiKeyExchange exchange={values.swapType === SwapType.OnRamp && values?.from?.baseObject} onSuccess={async () => { handleExchangeConnected(); close() }} slideOverPlace='inStep' />
                )}
            </SlideOver>
            <Widget>
                {loading ?
                    <div className="w-full h-full flex items-center"><SpinIcon className="animate-spin h-8 w-8 grow" /></div>
                    : <Widget.Content>
                        <SwapOptionsToggle />
                        <div className='flex-col md:flex-row flex justify-between w-full md:space-x-4 space-y-4 md:space-y-0 mb-3.5 leading-4'>
                            <div className="flex flex-col w-full">
                                <SelectNetwork direction="from" label="From" placeholder="From"/>
                            </div>
                            <div className="flex flex-col w-full">
                                <SelectNetwork direction="to" label="To" placeholder="To"/>
                            </div>
                        </div>
                        <div className="mb-6 leading-4">
                            <AmountField />
                        </div>
                        {
                            values.swapType === SwapType.OnRamp &&
                            <div className="w-full mb-3.5 leading-4">
                                <label htmlFor="destination_address" className="block font-normal text-primary-text text-sm">
                                    {`To ${values?.to?.name || ''} address`}
                                    {isPartnerWallet && <span className='truncate text-sm text-indigo-200'>({partner?.display_name})</span>}
                                </label>
                                <div className="relative rounded-md shadow-sm mt-1.5">
                                    {isPartnerWallet &&
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {
                                                partnerImage &&
                                                <Image alt="Partner logo" className='rounded-md object-contain' src={partnerImage} width="24" height="24"></Image>
                                            }
                                        </div>
                                    }
                                    <div>
                                        <AddressInput
                                            hideLabel={true}
                                            exchangeAccount={exchangeAccount}
                                            onSetExchangeDepoisteAddress={handleSetExchangeDepositAddress}
                                            loading={loadingDepositAddress}
                                            disabled={lockAddress || (!values.to || !values.from) || loadingDepositAddress}
                                            name={"destination_address"}
                                            className={classNames(isPartnerWallet ? 'pl-11' : '', 'disabled:cursor-not-allowed h-12 leading-4 focus:ring-primary focus:border-primary block font-semibold w-full bg-darkblue-700 border-darkblue-500 border rounded-lg placeholder-gray-400 truncate')}
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                        {
                            values.swapType === SwapType.OffRamp &&
                            <div className="w-full mb-3.5 leading-4">
                                <div className="relative rounded-md shadow-sm mt-1.5">
                                    <div>
                                        <AddressInput
                                            exchangeAccount={exchangeAccount}
                                            onSetExchangeDepoisteAddress={handleSetExchangeDepositAddress}
                                            loading={loadingDepositAddress}
                                            disabled={(!values.to || !values.from) || loadingDepositAddress || depositeAddressIsfromAccount}
                                            name={"destination_address"}
                                            className={classNames('disabled:cursor-not-allowed h-12 leading-4 focus:ring-primary focus:border-primary block font-semibold w-full bg-darkblue-700 rounded-lg placeholder-gray-400 truncate')}
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                        <div className="w-full">
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
        </Form >
    </>
}

function displayErrorsOrSubmit(errors: FormikErrors<SwapFormValues>, swapType: SwapType): string {
    return errors.from?.toString() || errors.to?.toString() || errors.amount || errors.destination_address || "Swap now"
}

export default SwapForm