import type { WalletError } from '@tronweb3/tronwallet-abstract-adapter';
import { WalletDisconnectedError, WalletNotFoundError } from '@tronweb3/tronwallet-abstract-adapter';
import { toast } from 'react-hot-toast';
import { useMemo } from 'react';
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import {
    BitKeepAdapter,
    OkxWalletAdapter,
    TokenPocketAdapter,
    TronLinkAdapter,
} from '../../lib/wallets/tron/connectors'

export default function TronProvider({ children }: { children: React.ReactNode }) {
    function onError(e: WalletError) {
        if (e instanceof WalletNotFoundError) {
            toast.error(e.message);
        } else if (e instanceof WalletDisconnectedError) {
            toast.error(e.message);
        } else toast.error(e.message);
    }
    const adapters = useMemo(() => {
        return [
            new TronLinkAdapter(),
            new TokenPocketAdapter(),
            new OkxWalletAdapter(),
            new BitKeepAdapter(),
        ]
    }, [])

    return (
        <WalletProvider onError={onError} adapters={adapters} disableAutoConnectOnLoad={true} autoConnect={false}>
            {children}
        </WalletProvider>
    );
}