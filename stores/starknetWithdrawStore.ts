import { create } from 'zustand';
import { StarknetWindowObject } from 'starknetkit';

interface WalletState {
    connectedWallets: Wallet[];
    openStarknetModal: boolean;
    connectWallet: (wallet: Wallet) => void;
    disconnectWallet: (providerName: string) => void;
    setOpenStarknetModal: (isOpen: boolean) => void;
}

export type Wallet = {
    address: string | `0x${string}`;
    providerName: string;
    icon: (props: any) => React.JSX.Element;
    connector?: string;
    metadata?: {
        starknetAccount?: StarknetWindowObject;
    };
    chainId?: string | number;
};

export const useStarknetStore = create<WalletState>((set) => ({
    connectedWallets: [],
    openStarknetModal: false,
    connectWallet: (wallet) =>
        set((state) => ({
            connectedWallets: [
                ...state.connectedWallets.filter((w) => w.providerName !== wallet.providerName),
                wallet,
            ],
        })),
    disconnectWallet: (providerName) =>
        set((state) => ({
            connectedWallets: state.connectedWallets.filter((w) => w.providerName !== providerName),
        })),
    setOpenStarknetModal: (isOpen) => set({ openStarknetModal: isOpen }),
}));