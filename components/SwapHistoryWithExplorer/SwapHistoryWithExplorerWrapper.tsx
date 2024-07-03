import { FC } from "react";
import { useAuthState, UserType } from "../../context/authContext";
import { FormWizardProvider } from "../../context/formWizardProvider";
import { TimerProvider } from "../../context/timerContext";
import { AuthStep } from "../../Models/Wizard";
import GuestCard from "../guestCard";
import SwapHistoryWithExplorer from ".";

const SwapHistoryWithExplorerWrapper: FC = () => {
    const { userType } = useAuthState()

    return (
        <div className="">
            <SwapHistoryWithExplorer />
            {
                userType && userType != UserType.AuthenticatedUser &&
                <FormWizardProvider initialStep={AuthStep.Email} initialLoading={false} hideMenu>
                    <TimerProvider>
                        <GuestCard />
                    </TimerProvider>
                </FormWizardProvider>
            }
        </div>
    )
};

export default SwapHistoryWithExplorerWrapper;