import { MenuIcon, ChevronLeft } from "lucide-react";
import { FC, useState } from "react";
import Modal from "../../components/modal/modal";
import IconButton from "../buttons/iconButton";
import HistoryWizard from "./WizardComponents/History";
import { FormWizardProvider, useFormWizardaUpdate, useFormWizardState } from "../../context/formWizardProvider";
import { MenuStep } from "../../Models/Wizard";
import MenuList from "./MenuList";
import Wizard from "../Wizard/Wizard";
import WizardItem from "../Wizard/WizardItem";
import { NextRouter, useRouter } from "next/router";
import { resolvePersistantQueryParams } from "../../helpers/querryHelper";
import dynamic from "next/dynamic"

const WalletsHeader = dynamic(() => import("../ConnectedWallets").then((comp) => comp.WalletsHeader), { loading: () => <></> })

const Comp = () => {
    const router = useRouter();

    const { goBack, currentStepName } = useFormWizardState()
    const { goToStep } = useFormWizardaUpdate()

    const [openTopModal, setOpenTopModal] = useState(false);

    const handleModalOpenStateChange = (value: boolean) => {
        setOpenTopModal(value)
        if (value === false) {
            goToStep(MenuStep.Menu)
            clearMenuPath(router)
        }
    }

    const handleGoToStep = (step: MenuStep, path: string) => {
        goToStep(step)
        setMenuPath(path, router)
    }

    return <>
        <div className="text-secondary-text cursor-pointer relative">
            {
                <>
                    <IconButton onClick={() => setOpenTopModal(true)} icon={
                        <MenuIcon strokeWidth="2" />
                    }>
                    </IconButton>
                    <Modal
                        modalId="menuModal"
                        show={openTopModal}
                        setShow={handleModalOpenStateChange}
                        header={
                            <div className="inline-flex items-center">
                                {
                                    goBack &&
                                    <div className="-ml-2">
                                        <IconButton onClick={goBack} icon={
                                            <ChevronLeft strokeWidth="2" />
                                        }>
                                        </IconButton>
                                    </div>
                                }
                                <h2>{currentStepName as string}</h2>
                            </div>
                        }
                        walletComp={<WalletsHeader />}
                    >
                        <Wizard wizardId='menuWizard' >
                            <WizardItem StepName={MenuStep.Menu}>
                                <MenuList goToStep={handleGoToStep} />
                            </WizardItem>
                            <HistoryWizard setModalOpenState={setOpenTopModal} />
                        </Wizard>
                    </Modal>
                </>
            }
        </div >
    </>
}

const LayerswapMenu: FC = () => {
    return (
        <FormWizardProvider noToolBar hideMenu initialStep={MenuStep.Menu}>
            <Comp />
        </FormWizardProvider>
    )
}

//TODO: move URI handling to wizard provider
export const setMenuPath = (path: string, router: NextRouter) => {
    const basePath = router?.basePath || ""
    var finalURI = window.location.protocol + "//"
        + window.location.host + `${basePath}${path}`;
    const params = resolvePersistantQueryParams(router.query)
    if (params && Object.keys(params).length) {
        const search = new URLSearchParams(params as any);
        if (search)
            finalURI += `?${search}`
    }
    window.history.pushState({ ...window.history.state, as: router.asPath, url: finalURI }, '', finalURI);
}

export const clearMenuPath = (router: NextRouter) => {
    const basePath = router?.basePath || ""
    let finalURI = window.location.protocol + "//"
        + window.location.host + basePath + router.asPath;

    window.history.replaceState({ ...window.history.state, as: router.asPath, url: finalURI }, '', finalURI);
}

export default LayerswapMenu