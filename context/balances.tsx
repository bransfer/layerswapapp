import React, { FC, useState } from 'react'
import { Balance, Gas } from '../Models/Balance';

export const BalancesStateContext = React.createContext<BalancesState | null>(null);
export const BalancesStateUpdateContext = React.createContext<BalancesStateUpdate | null>(null);

export type BalancesState = {
    balances: { [address: string]: Balance[] },
    gases: { [network: string]: Gas[] },
    isGasLoading: boolean,
    isBalanceLoading: boolean,
}

export type BalancesStateUpdate = {
    setIsBalanceLoading: (value: boolean) => void,
    setAllBalances: React.Dispatch<React.SetStateAction<{
        [address: string]: Balance[];
    }>>;
    setIsGasLoading: (value: boolean) => void,
    setAllGases: React.Dispatch<React.SetStateAction<{
        [network: string]: Gas[];
    }>>,
}

type Props = {
    children?: JSX.Element | JSX.Element[];
}

export const BalancesDataProvider: FC<Props> = ({ children }) => {
    const [allBalances, setAllBalances] = useState<{ [address: string]: Balance[] }>({})
    const [allGases, setAllGases] = useState<{ [network: string]: Gas[] }>({})
    const [isGasLoading, setIsGasLoading] = useState<boolean>(false)
    const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false)

    const balances = allBalances
    const gases = allGases

    return (
        <BalancesStateContext.Provider value={{
            balances,
            gases,
            isBalanceLoading,
            isGasLoading
        }}>
            <BalancesStateUpdateContext.Provider value={{
                setAllBalances,
                setIsBalanceLoading,
                setAllGases,
                setIsGasLoading,
            }}>
                {children}
            </BalancesStateUpdateContext.Provider>
        </BalancesStateContext.Provider >
    );
}

export function useBalancesState() {
    const data = React.useContext<BalancesState | null>(BalancesStateContext);
    if (!data) {
        throw new Error('useBalancesState must be used within a BalancesStateContext');
    }
    return data;
}

export function useBalancesUpdate() {
    const updateFns = React.useContext<BalancesStateUpdate | null>(BalancesStateUpdateContext);

    if (!updateFns) {
        throw new Error('useBalancesUpdate must be used within a BalancesStateUpdateContext');
    }

    return updateFns;
}

