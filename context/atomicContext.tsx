import { Context, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router';
import { useSettingsState } from './settings';
import { Commit } from '../Models/PHTLC';
import { Network, Token } from '../Models/Network';
import useSWR from 'swr';
import { ApiResponse } from '../Models/ApiResponse';
import { CommitFromApi } from '../lib/layerSwapApiClient';
import { toHex } from 'viem';
import LightClient from '../lib/lightClient';

export enum CommitStatus {
    Commit = 'commit',
    Commited = 'commited',
    LpLockDetected = 'lpLockDetected',
    UserLocked = 'userLocked',
    AssetsLocked = 'assetsLocked',
    RedeemCompleted = 'redeemCompleted',
    TimelockExpired = 'timelockExpired',
    Refunded = 'refunded',
    ManualClaim = 'manualClaim'
}

const AtomicStateContext = createContext<DataContextType | null>(null);

type DataContextType = {
    source_network?: Network,
    destination_network?: Network,
    source_asset?: Token,
    destination_asset?: Token,
    address?: string,
    amount?: number,
    commitId?: string,
    commitTxId?: string,
    destinationDetails?: Commit & { fetchedByLightClient?: boolean },
    userLocked?: boolean,
    sourceDetails?: Commit,
    error: string | undefined,
    commitFromApi?: CommitFromApi,
    lightClient: LightClient | undefined,
    commitStatus: CommitStatus,
    refundTxId?: string | undefined,
    onCommit: (commitId: string, txId: string) => void;
    setDestinationDetails: (data: Commit & { fetchedByLightClient?: boolean }) => void;
    setSourceDetails: (data: Commit) => void;
    setUserLocked: (locked: boolean) => void,
    setError(error: string | undefined): void
}

export function AtomicProvider({ children }) {
    const router = useRouter()
    const {
        address,
        amount,
        destination,
        destination_asset,
        source,
        source_asset
    } = router.query

    const [lightClient, setLightClient] = useState<LightClient | undefined>(undefined)

    const [commitId, setCommitId] = useState<string | undefined>(router.query.commitId as string | undefined)
    const [commitTxId, setCommitTxId] = useState<string | undefined>(router.query.txId as string | undefined)
    const { networks } = useSettingsState()
    const [sourceDetails, setSourceDetails] = useState<Commit | undefined>(undefined)
    const [destinationDetails, setDestinationDetails] = useState<Commit | undefined>(undefined)

    const [commitFromApi, setCommitFromApi] = useState<CommitFromApi | undefined>(undefined)

    const [userLocked, setUserLocked] = useState<boolean>(false)

    const [isTimelockExpired, setIsTimelockExpired] = useState<boolean>(false)
    const [error, setError] = useState<string | undefined>(undefined)

    const source_network = networks.find(n => n.name.toUpperCase() === (source as string)?.toUpperCase())
    const destination_network = networks.find(n => n.name.toUpperCase() === (destination as string)?.toUpperCase())
    const source_token = source_network?.tokens.find(t => t.symbol === source_asset)
    const destination_token = destination_network?.tokens.find(t => t.symbol === destination_asset)
    const refundTxId = router.query.refundTxId as string | undefined

    const fetcher = (args) => fetch(args).then(res => res.json())
    const url = process.env.NEXT_PUBLIC_LS_API
    const parsedCommitId = commitId ? toHex(BigInt(commitId)) : undefined
    const { data } = useSWR<ApiResponse<CommitFromApi>>((parsedCommitId && commitFromApi?.transactions.length !== 4 && destinationDetails?.claimed !== 3) ? `${url}/api/swap/${parsedCommitId}` : null, fetcher, { refreshInterval: 5000 })

    const commitStatus = useMemo(() => statusResolver({ commitFromApi, sourceDetails, destinationDetails, destination_network, timelockExpired: isTimelockExpired, userLocked }), [commitFromApi, sourceDetails, destinationDetails, destination_network, isTimelockExpired, userLocked])

    useEffect(() => {
        if (data?.data) {
            setCommitFromApi(data.data)
        }
    }, [data])

    useEffect(() => {
        if (destination_network && destination_network.chain_id === '11155111') {
            (async () => {
                const lightClient = new LightClient()
                await lightClient.initProvider({ network: destination_network })
                setLightClient(lightClient)
            })()
        }
    }, [destination_network])


    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (!sourceDetails || isTimelockExpired || (sourceDetails.hashlock && !destinationDetails?.hashlock)) return
        const time = (Number(sourceDetails?.timelock) * 1000) - Date.now()


        if (!sourceDetails.hashlock || (destinationDetails && destinationDetails.claimed == 1)) {
            if (time < 0) {
                setIsTimelockExpired(true)
                return
            }
            timer = setInterval(() => {
                if (!isTimelockExpired) {
                    setIsTimelockExpired(true)
                    clearInterval(timer)
                }
            }, time);

        }

        return () => timer && clearInterval(timer)

    }, [sourceDetails, destinationDetails])

    const handleCommited = (commitId: string, txId: string) => {
        setCommitId(commitId)
        setCommitTxId(txId)
        router.replace({
            pathname: router.pathname,
            query: { ...router.query, commitId, txId }
        }, undefined, { shallow: true })
    }

    return (
        <AtomicStateContext.Provider value={{
            source_network,
            onCommit: handleCommited,
            source_asset: source_token,
            destination_asset: destination_token,
            address: address as string,
            amount: amount ? Number(amount) : undefined,
            destination_network,
            commitId,
            commitTxId,
            sourceDetails,
            destinationDetails,
            userLocked,
            error,
            commitFromApi,
            lightClient,
            commitStatus,
            refundTxId,
            setDestinationDetails,
            setSourceDetails,
            setUserLocked,
            setError
        }}>
            {children}
        </AtomicStateContext.Provider>
    )
}

const statusResolver = ({ commitFromApi, sourceDetails, destinationDetails, destination_network, timelockExpired, userLocked }: { commitFromApi: CommitFromApi | undefined, sourceDetails: Commit | undefined, destinationDetails: Commit | undefined, destination_network: Network | undefined, timelockExpired: boolean, userLocked: boolean }) => {
    const lpRedeemTransaction = commitFromApi?.transactions.find(t => t.type === 'redeem' && t.network === destination_network?.name)
    const userLockTransaction = commitFromApi?.transactions.find(t => t.type === 'addlocksig')

    const commited = sourceDetails ? true : false;
    const lpLockDetected = destinationDetails?.hashlock ? true : false;
    const assetsLocked = ((sourceDetails?.hashlock && destinationDetails?.hashlock) || !!userLockTransaction) ? true : false;
    const redeemCompleted = (destinationDetails?.claimed == 3 ? true : false) || lpRedeemTransaction?.hash;

    if (timelockExpired) return CommitStatus.TimelockExpired
    else if (assetsLocked && sourceDetails?.claimed == 3 && destinationDetails?.claimed != 3) return CommitStatus.ManualClaim
    else if (redeemCompleted) return CommitStatus.RedeemCompleted
    else if (assetsLocked) return CommitStatus.AssetsLocked
    else if (userLocked) return CommitStatus.UserLocked
    else if (lpLockDetected) return CommitStatus.LpLockDetected
    else if (commited) return CommitStatus.Commited
    else return CommitStatus.Commit
}

export function useAtomicState() {
    const data = useContext<DataContextType>(AtomicStateContext as Context<DataContextType>);

    if (data === undefined) {
        throw new Error('useAtomicState must be used within a MenuStateProvider');
    }

    return data;
}