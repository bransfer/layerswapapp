import { useRouter } from "next/router";
import { FC, useCallback } from "react";
import { useFormWizardaUpdate } from "../../context/formWizardProvider";
import { AuthStep, SwapCreateStep } from "../../Models/Wizard";
import CodeStep from "./Steps/CodeStep";
import EmailStep from "./Steps/EmailStep";
import Wizard from "./Wizard";
import WizardItem from "./WizardItem";


const AuthWizard: FC = () => {
    const { goToStep } = useFormWizardaUpdate()
    const router = useRouter();
    const { redirect } = router.query;

    const CodeOnNext = useCallback(async () => {
        await router.push(redirect?.toString() || '/')
    }, [redirect]);
    const GoBackToEmailStep = useCallback(() => goToStep(AuthStep.Email, "back"), [])
    const GoToCodeStep = useCallback(() => goToStep(AuthStep.Code), [])

    return (
        <Wizard>
            <WizardItem StepName={SwapCreateStep.Email}>
                <EmailStep OnNext={GoToCodeStep} />
            </WizardItem>
            <WizardItem StepName={SwapCreateStep.Code} GoBack={GoBackToEmailStep}>
                <CodeStep OnNext={CodeOnNext} />
            </WizardItem>
        </Wizard>
    )
}

export default AuthWizard;