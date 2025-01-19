import { Context, FC, createContext, useContext, useState } from 'react';

type DepositMethodState = {
    showModal: boolean;
    canRedirect: boolean;
    setShowModal: (value: boolean) => void;
    redirect: (value: boolean) => void;
}

export const DepositMethodContext = createContext<DepositMethodState | undefined>(undefined);

type Props = {
    children?: JSX.Element | JSX.Element[];
    onRedirect?: () => void;
    canRedirect?: boolean;
}

function timeout(delay: number) {
    return new Promise(res => setTimeout(res, delay));
}

export const DepositMethodProvider: FC<Props> = ({ children, onRedirect, canRedirect = false }) => {
    const [showModal, setShowModal] = useState(false);

    const redirect = async (value: boolean) => {
        onRedirect && onRedirect()
        await timeout(330);
        setShowModal(value);
    }

    const contextValue: DepositMethodState = {
        showModal,
        canRedirect,
        setShowModal,
        redirect
    };

    return (
        <DepositMethodContext.Provider value={contextValue}>
            {children}
        </DepositMethodContext.Provider>
    );
};

export function useDepositMethod() {
    const data = useContext(DepositMethodContext as Context<DepositMethodState>);

    if (data === null) {
        throw new Error('useDepositMethod must be used within a DepositMethodProvider');
    }

    return data;
}