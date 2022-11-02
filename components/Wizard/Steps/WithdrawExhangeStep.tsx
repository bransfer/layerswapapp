import { FC, useCallback, useEffect, useState } from 'react'
import { useSwapDataState, useSwapDataUpdate } from '../../../context/swap';
import SubmitButton from '../../buttons/submitButton';
import { useFormWizardaUpdate } from '../../../context/formWizardProvider';
import { SwapWithdrawalStep } from '../../../Models/Wizard';
import { useRouter } from 'next/router';
import { useSettingsState } from '../../../context/settings';
import Image from 'next/image'
import ExchangeSettings from '../../../lib/ExchangeSettings';
import { useIntercom } from 'react-use-intercom';
import { useAuthState } from '../../../context/authContext';
import BackgroundField from '../../backgroundField';
import WarningMessage from '../../WarningMessage';
import { GetSwapStatusStep } from '../../utils/SwapStatus';
import GoHomeButton from '../../utils/GoHome';
import { CheckIcon, HomeIcon, ChatIcon } from '@heroicons/react/solid';
import TokenService from '../../../lib/TokenService';
import { parseJwt } from '../../../lib/jwtParser';

const WithdrawExchangeStep: FC = () => {
    const [transferDone, setTransferDone] = useState(false)
    const { data } = useSettingsState()
    const { swap } = useSwapDataState()
    const { setInterval } = useSwapDataUpdate()

    useEffect(() => {
        setInterval(2000)
        return () => setInterval(0)
    }, [])

    const { exchanges, discovery: { resource_storage_url } } = data
    const { goToStep } = useFormWizardaUpdate<SwapWithdrawalStep>()
    const router = useRouter();
    const { swapId } = router.query;
    const { email } = useAuthState()
    const access_token = TokenService.getAuthData()?.access_token
    const { sub } = parseJwt(access_token) || {}
    const { boot, show, update } = useIntercom()
    const updateWithProps = () => update({ email: email, customAttributes: { swapId: swapId, userId: sub } })

    const swapStatusStep = GetSwapStatusStep(swap)

    useEffect(() => {
        if (swapStatusStep && swapStatusStep !== SwapWithdrawalStep.Withdrawal)
            goToStep(swapStatusStep)
    }, [swapStatusStep])

    const handleConfirm = useCallback(async () => {
        setTransferDone(true)
    }, [])

    const exchange = exchanges?.find(e => e.currencies.some(ec => ec.id === swap?.data?.exchange_currency_id))
    const currency = exchange?.currencies?.find(c => c.id === swap?.data?.exchange_currency_id)
    const exchange_name = exchange?.display_name || ' '
    const exchange_internal_name = exchange?.internal_name
    const exchange_logo_url = exchange?.logo

    return (
        <>
            <div className="w-full flex space-y-5 flex-col justify-between h-full text-primary-text">
                <div className='space-y-4'>
                    <div className="flex items-center">
                        <h3 className="block text-lg font-medium text-white leading-6 text-left">
                            Go to
                            {
                                exchange_logo_url &&
                                <div className="inline-block ml-2 mr-1" style={{ position: "relative", top: '6px' }}>
                                    <div className="flex-shrink-0 h-6 w-6 relative">
                                        <Image
                                            src={`${resource_storage_url}${exchange_logo_url}`}
                                            alt="Exchange Logo"
                                            height="40"
                                            width="40"
                                            loading="eager"
                                            priority
                                            layout="responsive"
                                            className="rounded-md object-contain"
                                        />
                                    </div>
                                </div>
                            }
                            <span className='mr-1'>
                                {exchange_name}
                            </span> and do a withdrawal to the provided address
                        </h3>
                    </div>
                    {
                        swap?.data?.additonal_data?.note &&
                        <WarningMessage>
                            <p className='font-semibold text-sm text-darkblue-700'>
                                Please fill the "Remarks" field and make sure the "Internal transfer" checkbox is checked, that's required for a successful transfer.
                            </p>
                        </WarningMessage>
                    }
                    {
                        ExchangeSettings.KnownSettings[exchange_internal_name]?.WithdrawalWarningMessage &&
                        <div className='flex-col w-full rounded-md bg-darkblue-600 shadow-lg p-2'>
                            <div className='flex items-center'>
                                <div className='mr-2 p-2 rounded-lg bg-darkblue-800'>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className='font-normal text-sm text-white'>
                                    {ExchangeSettings.KnownSettings[exchange_internal_name]?.WithdrawalWarningMessage}
                                </p>
                            </div>
                        </div>
                    }
                    <div className={`mb-6 grid grid-cols-1 gap-5 `}>
                        <BackgroundField isCopiable={true} isQRable={true} toCopy={swap?.data?.additonal_data?.deposit_address} header={'Address'}>
                            <p className='break-all'>
                                {swap?.data?.additonal_data?.deposit_address}
                            </p>
                        </BackgroundField>
                        <BackgroundField header={'Network'}>
                            <p>
                                {swap?.data?.additonal_data?.chain_display_name}
                            </p>
                        </BackgroundField>
                        <div className='flex space-x-4'>
                            <BackgroundField isCopiable={true} toCopy={swap?.data?.requested_amount} header={'Amount'}>
                                <p>
                                    {swap?.data?.requested_amount}
                                </p>
                            </BackgroundField>
                            <BackgroundField header={'Asset'}>
                                <p>
                                    {currency?.asset}
                                </p>
                            </BackgroundField>
                        </div>
                        {
                            swap?.data?.additonal_data?.note &&
                            <>
                                <BackgroundField isCopiable={true} toCopy={swap?.data?.additonal_data?.note} header={'Remarks'}>
                                    <p className='break-all'>
                                        {swap?.data?.additonal_data?.note}
                                    </p>
                                </BackgroundField>
                            </>
                        }
                        {
                            ExchangeSettings.KnownSettings[exchange_internal_name]?.WithdrawalWarningMessage &&
                            <WarningMessage>
                                <p className='font-normal text-sm text-darkblue-700'>
                                    {ExchangeSettings.KnownSettings[exchange_internal_name]?.WithdrawalWarningMessage}
                                </p>
                            </WarningMessage>
                        }
                    </div>
                </div>
                {
                    transferDone ?
                        <div>
                            <div className='flex place-content-center mb-6 mt-3'>
                                <div className='relative'>
                                    <div className='absolute top-1 left-1 w-10 h-10 opacity-40 bg bg-primary rounded-full animate-ping'></div>
                                    <div className='absolute top-2 left-2 w-8 h-8 opacity-40 bg bg-primary rounded-full animate-ping'></div>
                                    <div className='relative top-0 left-0 w-12 h-12 scale-75 bg bg-primary-800 rounded-full'></div>
                                </div>
                            </div>
                            <div className="flex text-center place-content-center">
                                <label className="block text-lg font-semibold leading-6 text-primary-text">Waiting for you to do a withdrawal from the exchange</label>
                            </div>
                            <div className='mt-6 space-y-2'>
                                <SubmitButton onClick={() => {
                                    boot();
                                    show();
                                    updateWithProps()
                                }} isDisabled={false} isSubmitting={false} buttonStyle='outline' icon={<ChatIcon className="h-5 w-5 ml-2" aria-hidden="true" />}>
                                    Contact support
                                </SubmitButton>
                                <GoHomeButton>
                                    <SubmitButton isDisabled={false} isSubmitting={false} buttonStyle='outline' icon={<HomeIcon className="h-5 w-5 ml-2" aria-hidden="true" />}>
                                        Do another swap
                                    </SubmitButton>
                                </GoHomeButton>
                            </div>
                        </div>

                        :
                        <div className="text-white text-base space-y-2">
                            <SubmitButton isDisabled={false} isSubmitting={false} onClick={handleConfirm} icon={<CheckIcon className="h-5 w-5 ml-2" aria-hidden="true" />} >
                                I Did The Transfer
                            </SubmitButton>
                            <GoHomeButton>
                                <SubmitButton isDisabled={false} isSubmitting={false} buttonStyle='outline' icon={<HomeIcon className="h-5 w-5 ml-2" aria-hidden="true" />}>
                                    Will do it later
                                </SubmitButton>
                            </GoHomeButton>
                        </div>
                }
            </div>
        </>
    )
}

export default WithdrawExchangeStep;