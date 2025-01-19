import React, { Context, FC } from "react";
import Modal, { ModalProps } from "../components/modal/modal";
import SubmitButton from "../components/buttons/submitButton";
import SecondaryButton from "../components/buttons/secondaryButton";


interface AsyncModalProps extends ModalProps {
    onConfirm: () => void;
    onDismiss: () => void;
    content: React.ReactNode;
    submitText?: string;
    dismissText?: string;
};


const AsyncModal: FC<AsyncModalProps> = ({ onConfirm, onDismiss, content, submitText, dismissText, ...props }) => {
    return (
        <Modal onClose={onDismiss} {...props}>
            <div className="flex flex-col items-center gap-6 mt-2">
                {content}
                <div className="h-full w-full space-y-3">
                    <SubmitButton type="button" onClick={onConfirm}>
                        {submitText ?? 'Confirm'}
                    </SubmitButton>
                    <SecondaryButton className="w-full h-full py-3 !text-base" onClick={onDismiss}>
                        {dismissText ?? 'Cancel'}
                    </SecondaryButton>
                </div>
            </div>
        </Modal>
    );
};

type AsyncModalContextType = {
    openDialog: ({ content, actionCallback, submitText, dismissText }: { content: React.ReactNode, actionCallback: (value: boolean) => void, submitText?: string, dismissText?: string }) => void;
};

const AsyncModalContext = React.createContext<AsyncModalContextType | null>(null);

const AsyncModalProvider = ({ children }) => {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [dialogConfig, setDialogConfig] = React.useState<{ content: React.ReactNode, actionCallback: any, submitText?: string, dismissText?: string, } | undefined>(undefined);

    const openDialog = ({ content, actionCallback, submitText, dismissText }) => {
        setDialogOpen(true);
        setDialogConfig({ content, actionCallback, submitText, dismissText });
    };

    const resetDialog = () => {
        setDialogOpen(false);
        setDialogConfig(undefined);
    };

    const onConfirm = () => {
        resetDialog();
        dialogConfig?.actionCallback(true);
    };

    const onDismiss = () => {
        resetDialog();
        dialogConfig?.actionCallback(false);
    };

    return (
        <AsyncModalContext.Provider value={{ openDialog }}>
            <AsyncModal
                show={dialogOpen}
                setShow={setDialogOpen}
                onConfirm={onConfirm}
                onDismiss={onDismiss}
                content={dialogConfig?.content}
                submitText={dialogConfig?.submitText}
                dismissText={dialogConfig?.dismissText}
                modalId="asyncModal"
                height="fit"
            />
            {children}
        </AsyncModalContext.Provider>
    );
};

const useAsyncModal = () => {

    const context = React.useContext<AsyncModalContextType>(AsyncModalContext as Context<AsyncModalContextType>);

    if (context === undefined) {
        throw new Error('useAsyncModal must be used within a AsyncModalProvider');
    }

    const getConfirmation = ({ content, dismissText, submitText }: { content: React.ReactNode, submitText?: string, dismissText?: string }) =>
        new Promise((res) => {
            context.openDialog({ content, actionCallback: res, submitText, dismissText });
        });

    return { getConfirmation };
};

export default AsyncModal;
export { AsyncModalProvider, useAsyncModal };
