import { FC } from 'react'
import { QRCodeSVG } from 'qrcode.react';
import { resolveWalletConnectorIcon } from '../../lib/wallets/utils/resolveWalletIcon';
import { Loader } from 'lucide-react';
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

    const connect = async (connector: any) => {
        try {
            setSelectedProvider({ ...provider, connector: { name: connector.name } })

            const result = provider?.connectConnector && await provider.connectConnector({ connector })

            setSelectedProvider(undefined)
            onFinish(result)
        } catch (e) {
            console.log(e)
            setSelectedProvider({ ...provider, connector: undefined })
            onFinish(undefined)
        }
    }

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
            {
                provider?.availableWalletsForConnect?.sort((a, b) => (a.type === 'injected' ? 0 : a.order || 100) - (b.type === 'injected' ? 0 : b.order || 100))?.map((connector, index) => {
                    const connectorName = connector?.name
                    const connectorId = connector?.id

                    const Icon = resolveWalletConnectorIcon({ connector: connectorId, iconUrl: connector.icon })
                    const isLoading = provider.connector?.name === connectorName

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
                                    <div className='flex flex-col items-start'>
                                        <p>{connectorName}</p>
                                        {
                                            connector.type === 'injected' &&
                                            <p className='text-xs text-secondary-text font-medium'>Installed</p>
                                        }
                                    </div>
                                </div>
                                <div className='inline-flex items-center gap-2'>
                                    {
                                        isLoading &&
                                        <Loader className='h-4 w-4 animate-spin' />
                                    }
                                </div>
                            </button>
                        </div>
                    )
                })
            }
        </div>
    )
}


export default ConnectorsList