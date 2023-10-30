import { AccountInterface } from 'starknet';
import { create } from 'zustand'
import { Layer } from '../Models/Layer';
import { persist } from 'zustand/middleware';

interface WalletState {
    connectedWallets: Wallet[];
    connectWallet: (wallet: Wallet) => void;
    disconnectWallet: (network: Layer) => void;
}

export type Wallet = {
    address: string | `0x${string}`;
    network: Layer,
    icon?: string;
    connector?: string;
    metadata?: {
        starknetAccount?: AccountInterface
    }
}

export const useWalletStore = create<WalletState>()(persist((set) => ({
    connectedWallets: [],
    connectWallet: (wallet) => set((state) => ({
        connectedWallets: [
            ...state.connectedWallets.filter(w => w.network.internal_name !== wallet.network.internal_name),
            wallet
        ]
    })),
    disconnectWallet: (network) => set((state) => ({
        connectedWallets: state.connectedWallets.filter(w => w.network.internal_name !== network.internal_name)
    }))
}),
    {
        name: 'connected-wallets'
    }
))