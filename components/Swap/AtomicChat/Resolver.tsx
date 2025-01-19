import { FC } from "react";
import { UserCommitAction, UserLockAction, UserRefundAction } from "./Actions/UserActions";
import { CommitStatus, useAtomicState } from "../../../context/atomicContext";
import { LpLockingAssets } from "./Actions/LpLock";
import { RedeemAction } from "./Actions/Redeem";
import ActionStatus from "./Actions/Status/ActionStatus";
import SubmitButton from "../../buttons/submitButton";
import TimelockTimer from "./Timer";
import shortenAddress from "../../utils/ShortenAddress";
import LoaderIcon from "../../icons/LoaderIcon";
import LockFilledCircleIcon from "../../icons/LockFilledCircleIcon";
import CheckedIcon from "../../icons/CheckedIcon";
import LockIcon from "../../icons/LockIcon";
import Link from "next/link";

const RequestStep: FC = () => {
    const { sourceDetails, commitId, commitTxId, source_network, commitFromApi } = useAtomicState()

    const lpLockTx = commitFromApi?.transactions.find(t => t.type === 'lock')

    const commtting = (commitId && !sourceDetails) ? true : false;
    const commited = (sourceDetails || lpLockTx) ? true : false;

    const title = commited ? "Requested" : "Request"
    const description = commitTxId ? <p><span>Transaction ID:</span> <a target="_blank" className="underline hover:no-underline" href={source_network?.transaction_explorer_template.replace('{0}', commitTxId)}>{shortenAddress(commitTxId)}</a></p> : <>Initiates a swap process with the solver</>
    return <Step
        step={1}
        title={title}
        description={description}
        active={true}
        completed={commited}
        loading={commtting && !commited}
    />

}

const SignAndConfirmStep: FC = () => {
    const { sourceDetails, destinationDetails, source_network, destination_network, commitFromApi, commitStatus } = useAtomicState()

    const lpLockTx = commitFromApi?.transactions.find(t => t.type === 'lock')
    const lpRedeemTransaction = commitFromApi?.transactions.find(t => t.type === 'redeem' && t.network === destination_network?.name)
    const addLockSigTx = commitFromApi?.transactions.find(t => t.type === 'addlocksig')
    const commited = (sourceDetails || lpLockTx) ? true : false;

    const assetsLocked = !!(sourceDetails?.hashlock && destinationDetails?.hashlock) || commitStatus === CommitStatus.AssetsLocked || commitStatus === CommitStatus.RedeemCompleted;
    const loading = commitStatus === CommitStatus.UserLocked

    const title = assetsLocked ? "Signed & Confirmed" : "Sign & Confirm"
    const description = (assetsLocked)
        ? <div className="inline-flex gap-3">
            {
                lpLockTx && destination_network &&
                <div className="inline-flex gap-1">
                    <p>Solver:</p> <Link className="underline hover:no-underline" target="_blank" href={destination_network?.transaction_explorer_template.replace('{0}', lpLockTx?.hash)}>{shortenAddress(lpLockTx.hash)}</Link>
                </div>
            }
            {
                addLockSigTx && source_network &&
                <div className="inline-flex gap-1">
                    <p>You:</p> <Link className="underline hover:no-underline" target="_blank" href={source_network?.transaction_explorer_template.replace('{0}', addLockSigTx?.hash)}>{shortenAddress(addLockSigTx.hash)}</Link>
                </div>
            }
        </div>
        : <>Initiates a swap process with the solver</>

    const completed = !!(sourceDetails?.hashlock && destinationDetails?.hashlock) || !!lpRedeemTransaction?.hash || commitStatus === CommitStatus.RedeemCompleted || commitStatus === CommitStatus.AssetsLocked

    return <Step
        step={2}
        title={title}
        description={description}
        active={commited}
        completed={completed}
        loading={loading}
    >
        <SolverStatus />
    </Step>
}

const SolverStatus: FC = () => {
    const { commitId, sourceDetails, destinationDetails, commitFromApi, destination_network, commitStatus } = useAtomicState()

    const lpLockTx = commitFromApi?.transactions.find(t => t.type === 'lock')

    const commited = commitId ? true : false;
    const lpLockDetected = destinationDetails?.hashlock ? true : false;

    if (sourceDetails?.hashlock && destinationDetails?.hashlock || !commited || !(commitStatus == CommitStatus.LpLockDetected || commitStatus == CommitStatus.Commited))
        return null
    //TODO: add the timer
    if (lpLockDetected) {
        if (destinationDetails?.fetchedByLightClient) {
            return <div className="px-1 pt-3 w-full">
                <div className="text-xs text-primary-text-placeholder">
                    <div className="flex w-full justify-between items-center">
                        <p className="text-primary-text text-base">Solver locked assets</p>
                        <div className="text-xs font-medium text-green-500 flex items-center gap-1">
                            <p>Light Client</p>
                            <LockIcon className="h-4 w-4 text-green-500" />
                        </div>
                    </div>
                    {
                        lpLockTx && destination_network &&
                        <div>
                            <span>ID:</span> <a target="_blank" href={destination_network.transaction_explorer_template.replace('{0}', lpLockTx.hash)} className="underline hover:no-underline">{shortenAddress(lpLockTx.hash)}</a>
                        </div>
                    }
                </div>
            </div>
        }

        return <div className="pl-1 inline-flex items-center gap-4 pt-3 w-full">
            <LockFilledCircleIcon className="h-7 w-7" />

            <div className="text-xs text-primary-text-placeholder">
                <span className="text-primary-text text-base">Solver locked assets</span>
                {
                    lpLockTx && destination_network &&
                    <>
                        <span className="text-primary-text text-base ml-1">-</span> <span>Transaction ID:</span> <a target="_blank" href={destination_network.transaction_explorer_template.replace('{0}', lpLockTx.hash)} className="underline hover:no-underline">{shortenAddress(lpLockTx.hash)}</a>
                    </>
                }
            </div>
        </div>
    }

    return <div className="p-1 mt-2 w-full">
        <p className="p-1">Solver is locking assets</p>
        <div className="loader-line" />
    </div>
}


export const ResolveMessages: FC<{ timelock: number | undefined, showTimer: boolean, allComplete: boolean }> = ({ timelock, showTimer, allComplete }) => {
    //TODO: add loading steps
    return <div className="space-y-2">
        <div className="flex items-center w-full justify-between text-primary-text-placeholder text-sm">
            {
                !allComplete &&
                <>
                    <p>
                        Follow the steps to complete swap
                    </p>
                    {
                        timelock && showTimer &&
                        <TimelockTimer timelock={timelock} />
                    }
                </>
            }
        </div>
        <div className="space-y-4">
            <RequestStep />
            <SignAndConfirmStep />
        </div>
    </div>
}
const ResolveAction: FC = () => {
    const { sourceDetails, destination_network, error, setError, commitStatus, commitFromApi, refundTxId, source_network } = useAtomicState()
    const lpRedeemTransaction = commitFromApi?.transactions.find(t => t.type === 'redeem' && t.network === destination_network?.name)

    //TODO: remove lp actions just disable the button
    if (error) {
        return <div className="w-full flex flex-col gap-4">
            <div className="flex w-full grow flex-col space-y-2" >
                <ActionStatus
                    status="error"
                    title={<p className="break-all">{error}</p>}
                />
            </div >
            <SubmitButton onClick={() => setError(undefined)}>
                Try again
            </SubmitButton>
        </div>
    }
    if (commitStatus === CommitStatus.RedeemCompleted) {
        return <ActionStatus
            status="success"
            title={
                <div className="flex flex-col space-y-0">
                    <p className="text-base leading-5 font-medium">Transaction Completed</p>
                    {
                        lpRedeemTransaction && destination_network &&
                        <div className="text-sm ">
                            <span>ID:</span>  <Link className="underline hover:no-underline" target="_blank" href={destination_network?.transaction_explorer_template.replace('{0}', lpRedeemTransaction.hash)}>{shortenAddress(lpRedeemTransaction?.hash)}</Link>
                        </div>
                    }
                </div>
            }
        />
    }
    if (commitStatus === CommitStatus.TimelockExpired) {
        if (sourceDetails?.claimed == 2) {
            return <ActionStatus
                status="success"
                title={
                    <div className="flex flex-col space-y-0">
                        <p className="text-base leading-5 font-medium">Refund Completed</p>
                        {
                            refundTxId && source_network &&
                            <div className="text-sm ">
                                <span>ID:</span>  <Link className="underline hover:no-underline" target="_blank" href={source_network?.transaction_explorer_template.replace('{0}', refundTxId)}>{shortenAddress(refundTxId)}</Link>
                            </div>
                        }
                    </div>
                }
            />
        }
        else {
            return <UserRefundAction />
        }
    }
    if (commitStatus === CommitStatus.AssetsLocked) {
        return <RedeemAction />
    }
    if (commitStatus === CommitStatus.LpLockDetected || commitStatus === CommitStatus.UserLocked) {
        return <UserLockAction />
    }
    if (commitStatus === CommitStatus.Commited) {
        return <LpLockingAssets />
    }
    return <UserCommitAction />
}

export const Actions: FC = () => {
    const { destinationDetails, sourceDetails, commitFromApi, destination_network, commitStatus } = useAtomicState()

    const lpRedeemTransaction = commitFromApi?.transactions.find(t => t.type === 'redeem' && t.network === destination_network?.name)

    const allDone = ((sourceDetails?.hashlock && destinationDetails?.claimed == 3) || lpRedeemTransaction?.hash || sourceDetails?.claimed == 2) ? true : false
    const showTimer = !allDone && commitStatus !== CommitStatus.TimelockExpired
    const timelock = sourceDetails?.timelock || sourceDetails?.timelock

    return <div className="space-y-4">
        <ResolveMessages timelock={timelock} showTimer={showTimer} allComplete={allDone} />
        <ResolveAction />
    </div>
}

type StepProps = {
    step: number;
    title: string;
    description: JSX.Element | string;
    children?: JSX.Element | JSX.Element[];
    active: boolean;
    completed?: boolean
    loading?: boolean
}
const Step: FC<StepProps> = ({ step, title, description, active, children, completed, loading }) => {
    return <div className={`flex flex-col w-full bg-secondary-600 rounded-componentRoundness p-2 ${!active ? 'opacity-40' : ''}`}>
        {/* TODO: text colors for none active steps */}
        <div className="flex items-center gap-3">
            <div className="w-10 h-9 text-center content-center bg-secondary-400 rounded-md grow">{step}</div>
            <div className="inline-flex items-center justify-between w-full">
                <div>
                    <div className="text-primary-text text-base leading-5">{title}</div>
                    <div className="text-xs text-primary-text-placeholder">{description}</div>
                </div>
                {
                    completed &&
                    <CheckedIcon className="h-6 w-6 mr-3" />
                }
                {
                    loading &&
                    <LoaderIcon className="animate-reverse-spin h-6 w-6 mr-3" />
                }
            </div>
        </div>
        {children}
    </div>
}
