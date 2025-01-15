import { FC, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react';
import { resolveWalletConnectorIcon } from '../../lib/wallets/utils/resolveWalletIcon';
import { LoaderCircle, Loader, RotateCw, CircleX } from 'lucide-react';
import { Wallet } from '../../Models/WalletProvider';
import { ModalWalletProvider } from '.';
import CopyButton from '../buttons/copyButton';

export type WalletsListProps = {
    modalWalletProvider: ModalWalletProvider;
    setSelectedProvider: (value: ModalWalletProvider | undefined) => void;
    selectedProvider: ModalWalletProvider | undefined;
    onFinish: (connectedWallet: Wallet | undefined) => void;
};

const ConnectorsList: FC<WalletsListProps> = ({ modalWalletProvider, onFinish, setSelectedProvider, selectedProvider }) => {

    if (modalWalletProvider?.availableWalletsForConnect) {
        return <ConnectList
            modalWalletProvider={modalWalletProvider}
            onFinish={onFinish}
            setSelectedProvider={setSelectedProvider}
            selectedProvider={selectedProvider}
        />
    }
    else {
        return <div className='h-40 w-full flex flex-col justify-center items-center'>
            <div className='flex items-center gap-2'>
                <Loader className='h-6 w-6 animate-spin' />
                <p><span>Connecting</span> <span>{modalWalletProvider?.name}</span></p>
            </div>
        </div>
    }
}


const ConnectList: FC<WalletsListProps> = ({ modalWalletProvider: provider, onFinish, setSelectedProvider, selectedProvider }) => {
    const [connectionError, setConnectionError] = useState<string>('');
    const [currentConnector, setCurrentConnector] = useState<any>(null);

    const connect = async (connector: any) => {
        try {
            setConnectionError('');
            setCurrentConnector(connector);
            setSelectedProvider({ ...provider, connector: { name: connector.name } });

            const result = provider?.connectConnector && await provider.connectConnector({ connector });

            setSelectedProvider(undefined);
            onFinish(result);
        } catch (e) {
            setConnectionError(e.message)
            setSelectedProvider({ ...provider, connector: undefined });
        }
    };

    const selectedWallet = currentConnector || provider?.availableWalletsForConnect?.find((wallet) => wallet.name === selectedProvider?.connector?.name);
    const ProviderIcon = resolveWalletConnectorIcon({ connector: selectedProvider?.id, iconUrl: selectedWallet?.icon });

    if (selectedProvider?.connector?.qr) return <div className="flex flex-col justify-start space-y-2">
        <div className='w-full flex flex-col justify-center items-center pt-2'>
            <QRCodeSVG
                className="rounded-lg"
                value={selectedProvider?.connector?.qr}
                includeMargin={true}
                size={350}
                level={"H"}
                imageSettings={
                    selectedProvider.connector.iconUrl
                        ? {
                            src: selectedProvider.connector.iconUrl,
                            x: undefined,
                            y: undefined,
                            height: 50,
                            width: 50,
                            excavate: true,
                        }
                        : undefined
                }
            />
            <div className='bg-secondary text-secondary-text px-14 py-1.5 rounded-md mt-3 flex items-center'>
                <CopyButton toCopy={selectedProvider?.connector?.qr}>Copy QR URL</CopyButton>
            </div>
        </div>
    </div>

    return (
        <div className="flex flex-col gap-1 w-full overflow-y-auto styled-scroll">
            {(selectedWallet || connectionError) ? (
                <div className="w-full flex items-center justify-center p-6">
                    <div className="flex flex-col gap-3 items-center font-semibold">
                        {selectedWallet && (
                            <>
                                <ProviderIcon className="w-9 h-9 p-0.5 rounded-md bg-secondary-800" />
                                <p className='text-xs'>Opening {selectedWallet?.name}...</p>
                                <span className="text-base font-medium py-1">Confirm connection in the extension</span>
                                <LoaderCircle className='h-4 w-4 animate-spin' />
                            </>
                        )}
                        {connectionError &&
                            <p className="flex items-center text-sm">
                                <CircleX className="w-5 h-5 stroke-primary-500 mr-0.5 flex-shrink-0" />
                                {connectionError}
                            </p>
                        }
                        <button
                            type="button"
                            className="flex gap-1.5 items-center justify-between bg-[rgba(228,37,117,0.12)] text-[#e42575] px-4 py-2 border-none rounded-lg cursor-pointer text-sm font-medium leading-4 transition-transform duration-125 ease-in-out hover:scale-105"
                            onClick={() => connect(currentConnector)}
                        >
                            <RotateCw className='h-4 w-4' />
                            <span>Reconnect</span>
                        </button>
                    </div>
                </div>
            ) : (
                provider?.availableWalletsForConnect?.sort((a, b) => (a.type === 'injected' ? 0 : a.order || 100) - (b.type === 'injected' ? 0 : b.order || 100))?.map((connector, index) => {
                    const connectorName = connector?.name;
                    const connectorId = connector?.id;

                    const Icon = resolveWalletConnectorIcon({ connector: connectorId, iconUrl: connector.icon });

                    return (
                        <div key={index}>
                            <button
                                type="button"
                                disabled={!!provider.connector}
                                className="w-full flex items-center justify-between hover:bg-secondary-500 transition-colors duration-200 rounded-xl px-2 py-2"
                                onClick={() => connect(connector)}
                            >
                                <div className="flex gap-3 items-center font-semibold">
                                    <Icon className="w-9 h-9 p-0.5 rounded-md bg-secondary-800" />
                                    <div className="flex flex-col items-start">
                                        <p>{connectorName}</p>
                                        {
                                            connector.type === 'injected' &&
                                            <p className="text-xs text-secondary-text font-medium">Installed</p>
                                        }
                                    </div>
                                </div>
                            </button>
                        </div>
                    );
                })
            )
            }
        </div>
    )
}


export default ConnectorsList