import { useRouter } from "next/router";
import { FC, useCallback } from "react";
import { useFormWizardaUpdate } from "../../context/formWizardProvider";
import { TimerProvider } from "../../context/timerContext";
import { AuthStep, SwapCreateStep } from "../../Models/Wizard";
import { TrackEvent } from "../../pages/_document";
import CodeStep from "./Steps/CodeStep";
import EmailStep from "./Steps/EmailStep";
import Wizard from "./Wizard";
import WizardItem from "./WizardItem";
import { resolvePersistantQueryParams } from "../../helpers/querryHelper";
import { ParsedUrlQuery } from "querystring";


const AuthWizard: FC = () => {
    const { goToStep } = useFormWizardaUpdate()
    const router = useRouter();

    const CodeOnNext = useCallback(async () => {
        await router.push({
            pathname: "/",
            query: router.query
        })
        plausible(TrackEvent.SignedIn)
    }, []);

    const GoBackToEmailStep = useCallback(() => goToStep(AuthStep.Email, "back"), [])
    const GoToCodeStep = useCallback(() => goToStep(AuthStep.Code), [])

    const handleGoBack = useCallback(() => {
        router.back()
    }, [router])

    return (
        <TimerProvider>
            <Wizard wizardId="auth">
                <WizardItem StepName={SwapCreateStep.Email} GoBack={handleGoBack} className="pb-6">
                    <EmailStep OnNext={GoToCodeStep} />
                </WizardItem>
                <WizardItem StepName={SwapCreateStep.Code} GoBack={GoBackToEmailStep} className="pb-6">
                    <CodeStep OnNext={CodeOnNext} />
                </WizardItem>
            </Wizard>
        </TimerProvider>
    )
}

function resolveRedirectUrl(pathname: string | undefined, query: ParsedUrlQuery) {

    if (!pathname) return '/'

    const pathnameArray = pathname && pathname.split('/') || []

    if (pathname?.startsWith('swap'))
        return {
            pathname: '/swap/[swapId]',
            query: { ...resolvePersistantQueryParams(query), swapId: encodeURIComponent(pathnameArray[1]) }
        }
    if (pathname?.startsWith('campaigns'))
        return {
            pathname: '/campaigns/[campaign]',
            query: { ...resolvePersistantQueryParams(query), campaign: encodeURIComponent(pathnameArray[1]) }
        }
    else return { pathname: encodeURIComponent(pathname), query: { ...resolvePersistantQueryParams(query) } }
}

export default AuthWizard;