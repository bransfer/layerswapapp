import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BackendTransactionStatus, TransactionStatus } from '../lib/layerSwapApiClient';
import { Commit } from '../Models/PHTLC';

type SwapTransaction = {
    hash: string;
    status: BackendTransactionStatus | TransactionStatus;
    failReason?: string;
    timestamp: number;
};

type SwapTransactionStore = {
    swapTransactions: Record<string, SwapTransaction>;
    setSwapTransaction: (Id: string, status: BackendTransactionStatus | TransactionStatus, txHash: string, failReason?: string) => void;
    removeSwapTransaction: (Id: string) => void;
};

type SwapDepositHintClickedStore = {
    swapTransactions: Record<string, boolean>;
    setSwapDepositHintClicked: (Id: string) => void;
};


export const useSwapTransactionStore = create(
    persist<SwapTransactionStore>(
        (set) => ({
            swapTransactions: {},
            setSwapTransaction: (Id, status, txHash, failReason) => {
                set((state) => {
                    const txForSwap = {
                        ...state.swapTransactions,
                        [Id]: {
                            hash: txHash,
                            status: status,
                            failReason: failReason,
                            timestamp: Date.now()
                        }
                    };
                    return { swapTransactions: txForSwap };
                });
            },
            removeSwapTransaction: (id) => {
                set((state) => {
                    const { [id]: deletedTransaction, ...remainingTransactions } = state.swapTransactions;
                    return { swapTransactions: remainingTransactions };
                });
            },
        }),
        {
            name: 'swapTransactions',
            storage: createJSONStorage(() => localStorage),
        }
    ),
)

export const useSwapDepositHintClicked = create(
    persist<SwapDepositHintClickedStore>(
        (set, get) => ({
            swapTransactions: {},
            setSwapDepositHintClicked: (Id) => {
                set((state) => {
                    const txForSwap = {
                        ...state.swapTransactions,
                        [Id]: true
                    };
                    return { swapTransactions: txForSwap };
                });
            },
        }),
        {
            name: 'swapDepositHintClicked',
            storage: createJSONStorage(() => sessionStorage),
        }
    ),
)

type PHTLCStore = {
    commits: Record<string, Commit>;
    setCommit: (Id: string, data: Commit) => void;
};

export const usePHTLCStore = create(
    persist<PHTLCStore>(
        (set, get) => ({
            commits: {},
            setCommit: (Id, data: Commit) => {
                set((state) => {
                    return { ...state, [Id]: data };
                });
            },
        }),
        {
            name: 'PHTLC_Commits',
            storage: createJSONStorage(() => localStorage),
        }
    ),
)