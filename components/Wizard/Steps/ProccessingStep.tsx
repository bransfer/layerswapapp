import { useRouter } from 'next/router';
import { FC } from 'react'
import { useFormWizardaUpdate, useFormWizardState } from '../../../context/formWizardProvider';
import { useSwapDataState, useSwapDataUpdate } from '../../../context/swap';
import { useInterval } from '../../../hooks/useInterval';
import TokenService from '../../../lib/TokenService';
import { SwapStatus } from '../../../Models/SwapStatus';
import { SwapWizardSteps } from '../../../Models/Wizard';

const ProccessingStep: FC<{ current: boolean }> = ({ current }) => {

    // const { prevStep, nextStep, goToStep } = useWizardState();
    const { swap } = useSwapDataState()
    const { payment } = swap?.data || {}
    const { currentStep } = useFormWizardState<SwapWizardSteps>()

    const { goToStep } = useFormWizardaUpdate<SwapWizardSteps>()
    const router = useRouter();
    const { swapId } = router.query;
    const { getSwap } = useSwapDataUpdate()

    useInterval(async () => {
        if (currentStep === "Processing") {
            const authData = TokenService.getAuthData();
            if (!authData) {
                await goToStep("Email")
                return;
            }
            const swap = await getSwap(swapId.toString())
            const { payment } = swap?.data || {}
            const swapStatus = swap?.data?.status;
            const paymentStatus = payment?.status
            if (swapStatus == SwapStatus.Completed)
                await goToStep("Success")
            else if (swapStatus == SwapStatus.Failed || paymentStatus == 'closed')
                await goToStep("Failed")
        }
    }, [currentStep, swapId], 2000)

    return (
        <>
            <div className="w-full px-3 md:px-8 py-12 grid grid-flow-row">
                <div className='flex place-content-center mt-20 mb-16 md:mb-8'>
                    <div className='relative'>
                        <div className='absolute top-1 left-1 w-10 h-10 opacity-40 bg bg-primary rounded-full animate-ping'></div>
                        <div className='absolute top-2 left-2 w-8 h-8 opacity-40 bg bg-primary rounded-full animate-ping'></div>
                        <div className='relative top-0 left-0 w-12 h-12 scale-75 bg bg-primary-800 rounded-full'></div>
                    </div>
                </div>
                <div className="flex text-center place-content-center mt-1 md:mt-1">
                    <label className="block text-lg font-lighter leading-6 text-primary-text">Exchange transaction processed.</label>
                </div>
                {
                    payment?.status == "completed" && <div className="flex text-center place-content-center mt-1 md:mt-1">
                        <label className="block text-lg font-lighter leading-6 text-primary-text"> Awaiting for blockchain transaction. </label>
                    </div>
                }
            </div>

        </>
    )
}

export default ProccessingStep;