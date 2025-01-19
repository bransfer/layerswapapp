import { ArrowLeft } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useFormWizardaUpdate, useFormWizardState } from '../context/formWizardProvider';
import { AuthStep } from '../Models/Wizard';
import CodeStep from './Wizard/Steps/CodeStep';
import EmailStep from './Wizard/Steps/EmailStep';
import Wizard from './Wizard/Wizard';
import WizardItem from './Wizard/WizardItem';

type Props = {
    onLogin?: () => void
}

function GuestCard({ onLogin }: Props) {
    const { goToStep } = useFormWizardaUpdate()
    const { goBack, noToolBar } = useFormWizardState()

    const CodeOnNext = async () => {
        toast.success("You are successfully logged in.")
        onLogin && onLogin()
    };
    const GoBackToEmailStep = () => goToStep(AuthStep.Email, "back")
    const GoToCodeStep = () => goToStep(AuthStep.Code)

    return (
        <div>
            <Wizard wizardId='guestCard'>
                <WizardItem StepName={AuthStep.Email} fitHeight>
                    <div className={noToolBar ? `p-6 border border-secondary-500 rounded-md` : "pt-6"}>
                        <EmailStep OnNext={GoToCodeStep} disclosureLogin />
                    </div>
                </WizardItem>
                <WizardItem StepName={AuthStep.Code} GoBack={GoBackToEmailStep} fitHeight>
                    <div className={noToolBar ? `p-6 border border-secondary-500 rounded-md` : "pt-6"}>
                        {
                            goBack &&
                            <button type='button' onClick={goBack} className="justify-self-start text-xs text-secondary-text flex items-center hover:text-secondary-text/70 cursor-pointer space-x-1" style={{ visibility: false ? 'hidden' : 'visible' }}>
                                <ArrowLeft className='h-3' />
                                <span>Edit email</span>
                            </button>
                        }
                        <CodeStep OnNext={CodeOnNext} disclosureLogin />
                    </div>
                </WizardItem>
            </Wizard>
        </div>
    );
}

export default GuestCard;