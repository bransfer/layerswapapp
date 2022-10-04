import { ArrowRightIcon, ExternalLinkIcon } from '@heroicons/react/outline';
import { FC, useCallback, useEffect } from 'react'
import { useSettingsState } from '../../../context/settings';
import { useSwapDataState } from '../../../context/swap';
import { SwapType } from '../../../lib/layerSwapApiClient';
import SubmitButton from '../../buttons/submitButton';
import GoHomeButton from '../../utils/GoHome';

const SuccessfulStep: FC = () => {

    const { data } = useSettingsState()
    const { swap } = useSwapDataState()
    const { networks, currencies, discovery: { resource_storage_url } } = data

    const network = networks?.find(n => n.currencies.some(nc => nc.id === swap?.data?.network_currency_id))

    const handleViewInExplorer = useCallback(() => {
        if (!network)
            return
        const { transaction_explorer_template } = network
        window.open(transaction_explorer_template.replace("{0}", swap?.data.transaction_id), '_blank')
    }, [network])

    return (
        <>
            <div className="w-full py-12 grid grid-flow-row">
                <div className='flex place-content-center mb-12 md:mb-4'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="116" height="116" viewBox="0 0 116 116" fill="none">
                        <circle cx="58" cy="58" r="58" fill="#55B585" fillOpacity="0.1" />
                        <circle cx="58" cy="58" r="45" fill="#55B585" fillOpacity="0.3" />
                        <circle cx="58" cy="58" r="30" fill="#55B585" />
                        <path d="M44.5781 57.245L53.7516 66.6843L70.6308 49.3159" stroke="white" strokeWidth="3.15789" strokeLinecap="round" />
                    </svg>
                </div>
                {
                    swap?.data?.type === SwapType.OnRamp ?
                        <div className="flex items-center text-center mb-14 md:mb-6 mx-5 md:mx-24">
                            <span className="block text-lg font-lighter leading-6 text-primary-text">Your swap successfully completed. You can view it in the explorer, or go ahead swap more!</span>
                        </div>
                        :
                        <div className="flex items-center text-center mb-14 md:mb-6 mx-5 md:mx-24">
                            <span className="block text-lg font-lighter leading-6 text-primary-text">Your swap successfully completed. Your assets are on their way to your exchange account.</span>
                        </div>
                }
                {
                    data.networks && swap?.data?.type === SwapType.OnRamp && swap?.data.transaction_id &&
                    <div className="text-white mb-2.5 md:mb-5 md:mt-3 mt-0">
                        <SubmitButton buttonStyle='filled' isDisabled={false} isSubmitting={false} onClick={handleViewInExplorer}>View in Explorer <ExternalLinkIcon className='ml-2 h-5 w-5' /></SubmitButton>
                    </div>
                }
                <div className="w-full justify-center">
                    <GoHomeButton>
                        <SubmitButton buttonStyle='outline' isDisabled={false} isSubmitting={false}>Swap more <ArrowRightIcon className='ml-2 h-5 w-5' /></SubmitButton>
                    </GoHomeButton>
                </div>
            </div>
        </>
    )
}

export default SuccessfulStep;