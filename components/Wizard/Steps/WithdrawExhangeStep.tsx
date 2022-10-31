import { FC, useCallback, useEffect, useState } from 'react'
import { useSwapDataState, useSwapDataUpdate } from '../../../context/swap';
import SubmitButton from '../../buttons/submitButton';
import { useFormWizardaUpdate, useFormWizardState } from '../../../context/formWizardProvider';
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
import { useEffectOnce } from 'react-use';

const WithdrawExchangeStep: FC = () => {
    const [transferDone, setTransferDone] = useState(false)
    const { data } = useSettingsState()
    const { swap } = useSwapDataState()
    const { setInterval } = useSwapDataUpdate()

    useEffectOnce(() => {
        setInterval(2000)
        return () => setInterval(0)
    })

    const { exchanges, discovery: { resource_storage_url } } = data
    const { goToStep } = useFormWizardaUpdate<SwapWithdrawalStep>()
    const router = useRouter();
    const { swapId } = router.query;
    const { email } = useAuthState()
    const { boot, show, update } = useIntercom()
    const updateWithProps = () => update({ email: email, customAttributes: { swapId: swapId } })

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
                                <WarningMessage>
                                    <p className='font-normal text-sm text-darkblue-700'>
                                        Please fill the "Remarks" field and make sure the "Internal transfer" checkbox is checked, that's required for a successful transfer.
                                    </p>
                                </WarningMessage>
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
                            <div className='flex place-content-center mb-16 mt-3 md:mb-8'>
                                <div className='relative'>
                                    <div className='absolute top-1 left-1 w-10 h-10 opacity-40 bg bg-primary rounded-full animate-ping'></div>
                                    <div className='absolute top-2 left-2 w-8 h-8 opacity-40 bg bg-primary rounded-full animate-ping'></div>
                                    <div className='relative top-0 left-0 w-12 h-12 scale-75 bg bg-primary-800 rounded-full'></div>
                                </div>
                            </div>
                            <div className="flex text-center place-content-center mt-1 md:mt-1">
                                <label className="block text-lg font-lighter leading-6 text-primary-text">Waiting for a transaction from the exchange</label>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    boot();
                                    show();
                                    updateWithProps()
                                }}
                                className="mt-3 text-center w-full disabled:text-primary-600 text-primary relative flex justify-center border-0 font-semibold rounded-md focus:outline-none transform hover:-translate-y-0.5 transition duration-400 ease-in-out"
                            >
                                Need help?
                            </button>
                        </div>

                        :
                        <div className="text-white text-base">
                            <SubmitButton isDisabled={false} isSubmitting={false} onClick={handleConfirm} >
                                I Did The Transfer
                            </SubmitButton>
                        </div>
                }
            </div>
        </>
    )
}

export default WithdrawExchangeStep;