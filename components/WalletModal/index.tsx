import { Context, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react';
import IconButton from '../buttons/iconButton';
import VaulDrawer from '../modal/vaulModal';
import { Wallet, WalletProvider } from '../../Models/WalletProvider';
import ConnectorsList from './ConnectorsList';
import ProvidersList from './ProvidersList';

export type ModalWalletProvider = WalletProvider & {
    connector?: {
        name: string;
        qr?: string;
        iconUrl?: string;
    }
}

type SharedType = { provider?: WalletProvider, connectCallback: (value: Wallet | undefined) => void }

type ConnectModalContextType = {
    connect: ({ provider, connectCallback }: SharedType) => void;
    cancel: () => void;
    selectedProvider: ModalWalletProvider | undefined;
    setSelectedProvider: (value: ModalWalletProvider | undefined) => void;
    isWalletModalOpen?: boolean;
};

const ConnectModalContext = createContext<ConnectModalContextType | null>(null);

export function WalletModalProvider({ children }) {
    const [connectConfig, setConnectConfig] = useState<SharedType | undefined>(undefined);

    const [selectedProvider, setSelectedProvider] = useState<ModalWalletProvider | undefined>(undefined);
    const [open, setOpen] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isPorivderProvidedInitally, setIsPorivderProvidedInitally] = useState(false);

    const connect = async ({ provider, connectCallback }: SharedType) => {
        setIsPorivderProvidedInitally(!!provider)
        if (!provider?.availableWalletsForConnect) {
            await provider?.connectWallet()
        }
        setSelectedProvider(provider);
        setOpen(true)
        setConnectConfig({ provider, connectCallback });
        return;
    }

    const cancel = () => {
        if (connectConfig) {
            connectConfig.connectCallback(undefined);
            setConnectConfig(undefined);
        }
        setOpen(false);
    }

    const onFinish = (connectedWallet?: Wallet | undefined) => {
        if (connectConfig) {
            connectConfig.connectCallback(connectedWallet);
            setConnectConfig(undefined);
        }
        setOpen(false);
    }

    const goBack = useCallback(() => {
        if (selectedProvider?.connector?.qr) {
            setSelectedProvider({ ...selectedProvider, connector: undefined })
            return;
        }
        setSelectedProvider(undefined)
    }, [setSelectedProvider, selectedProvider])

    useEffect(() => {
        if (!open && selectedProvider) {
            setSelectedProvider(undefined)
        }
        setIsWalletModalOpen(open)
    }, [open])

    return (
        <ConnectModalContext.Provider value={{ connect, cancel, selectedProvider, setSelectedProvider, isWalletModalOpen }}>
            {children}
            <VaulDrawer
                show={open}
                setShow={setOpen}
                onClose={onFinish}
                modalId={"connectNewWallet"}
                header={
                    <div className="flex items-center gap-1">
                        {
                            selectedProvider && !isPorivderProvidedInitally &&
                            <div className='-ml-2 mt-0.5'>
                                <IconButton onClick={goBack} icon={
                                    <ChevronLeft className="h-6 w-6" />
                                }>
                                </IconButton>
                            </div>
                        }
                        <p>Connect wallet</p>
                    </div>
                }>
                <VaulDrawer.Snap id='item-1'>
                    {
                        selectedProvider ?
                            <ConnectorsList
                                modalWalletProvider={selectedProvider}
                                onFinish={onFinish}
                                setSelectedProvider={setSelectedProvider}
                                selectedProvider={selectedProvider}
                            />
                            :
                            <ProvidersList
                                onFinish={onFinish}
                            />
                    }
                </VaulDrawer.Snap>
            </VaulDrawer>
        </ConnectModalContext.Provider>
    )
}

export const useConnectModal = () => {

    const context = useContext<ConnectModalContextType>(ConnectModalContext as Context<ConnectModalContextType>);

    if (context === undefined) {
        throw new Error('useConnectModal must be used within a ConnectModalProvider');
    }

    const connect: (provider?: WalletProvider) => Promise<Wallet | undefined> = (provider) =>
        new Promise((res) => {
            context.connect({ provider, connectCallback: res });
        });

    return { ...context, connect };
};