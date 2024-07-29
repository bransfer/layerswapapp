import { Context, useCallback, createContext, useContext, useState } from 'react'
import { useInterval } from '../hooks/useInterval';
import { useRouter } from 'next/router';
import { useSettingsState } from './settings';
import { AssetLock, Commit } from '../Models/PHTLC';
import useWallet from '../hooks/useWallet';
import { Network, Token } from '../Models/Network';

const AtomicStateContext = createContext<DataContextType | null>(null);


type DataContextType = {
    source_network?: Network,
    destination_network?: Network,
    source_asset?: Token,
    destination_asset?: Token,
    address?: string,
    amount?: number,
    commitId?: string,
    committment?: Commit,
    destinationLock?: AssetLock,
    hashLock?: string,
    userLocked?: boolean,
    sourceLock?: AssetLock,
    onCommit: (commitId: string) => void;
    setCommitment: (commitment: Commit) => void;
    setDestinationLock: (data: AssetLock) => void;
    setSourceLock: (data: AssetLock) => void;
    setHashLock: (data: string) => void;
    setUserLocked: (locked: boolean) => void,
}
type AtomicProviderProps = {
    address: string;
    amount: string;
    destination: string;
    destination_asset: string;
    source: string;
    source_asseet: string;
    children: JSX.Element | JSX.Element[]
}
export function AtomicProvider(props: AtomicProviderProps) {
    const router = useRouter()
    const {
        address,
        amount,
        destination,
        destination_asset,
        source,
        source_asseet,
        children
    } = props

    const [commitId, setCommitId] = useState<string | undefined>(router.query.commitId as string | undefined)
    const { networks } = useSettingsState()
    const [commitment, setCommitment] = useState<Commit | undefined>(undefined)
    const [destinationLock, setDestinationLock] = useState<AssetLock | undefined>(undefined)
    const [sourceLock, setSourceLock] = useState<AssetLock | undefined>(undefined)

    const [hashLock, setHashLock] = useState<string | undefined>(undefined)
    const [userLocked, setUserLocked] = useState<boolean>(false)


    const source_network = networks.find(n => n.name.toUpperCase() === (source as string).toUpperCase())
    const destination_network = networks.find(n => n.name.toUpperCase() === (destination as string).toUpperCase())
    const source_token = source_network?.tokens.find(t => t.symbol === source_asseet)
    const destination_token = destination_network?.tokens.find(t => t.symbol === destination_asset)

    const handleCommited = (commitId: string) => {
        setCommitId(commitId)
        router.push({
            pathname: router.pathname,
            query: { ...router.query, commitId }
        }, undefined, { shallow: true })
    }

    return (
        <AtomicStateContext.Provider value={{
            source_network,
            onCommit: handleCommited,
            setCommitment,
            source_asset: source_token,
            destination_asset: destination_token,
            address: address as string,
            amount: amount ? Number(amount) : undefined,
            destination_network,
            commitId,
            committment: commitment,
            destinationLock,
            hashLock,
            userLocked,
            sourceLock,
            setDestinationLock,
            setHashLock,
            setSourceLock,
            setUserLocked
        }}>
            {children}
        </AtomicStateContext.Provider>
    )
}

export function useAtomicState() {
    const data = useContext<DataContextType>(AtomicStateContext as Context<DataContextType>);

    if (data === undefined) {
        throw new Error('useAtomicState must be used within a MenuStateProvider');
    }

    return data;
}

