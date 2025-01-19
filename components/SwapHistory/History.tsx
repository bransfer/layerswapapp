import LayerSwapApiClient, { SwapResponse } from "../../lib/layerSwapApiClient"
import { ApiResponse, EmptyApiResponse } from "../../Models/ApiResponse"
import { ChevronDown, Plus, RefreshCw } from 'lucide-react'
import { FC, useCallback, useMemo, useState } from "react"
import HistorySummary from "./HistorySummary";
import useSWRInfinite from 'swr/infinite'
import useWallet from "../../hooks/useWallet"
import Link from "next/link"
import Snippet, { HistoryItemSceleton } from "./Snippet"
import { groupBy } from "../utils/groupBy"
import { useAuthState, UserType } from "../../context/authContext"
import ConnectButton from "../buttons/connectButton"
import { FormWizardProvider } from "../../context/formWizardProvider"
import { TimerProvider } from "../../context/timerContext"
import GuestCard from "../guestCard"
import { AuthStep } from "../../Models/Wizard"
import React from "react"
import { useVirtualizer } from '@tanstack/react-virtual'
import SwapDetails from "./SwapDetailsComponent"
import { addressFormat } from "../../lib/address/formatter";
import { useSettingsState } from "../../context/settings";
import VaulDrawer from "../modal/vaulModal";

const PAGE_SIZE = 20
type ListProps = {
    statuses?: string | number;
    refreshing?: boolean;
    onNewTransferClick?: () => void
}

type Status = "Completed" | "PendingWithdrawal" | "PendingDeposit"

const getSwapsKey = () => (index: number, statuses: Status[], addresses?: string[]) => {
    const addressesParams = addresses?.map(a => `&addresses=${a}`).join('') || ''
    const statusesParams = statuses.map(s => `&statuses=${s}`).join('') || ''
    return `/internal/swaps?page=${index + 1}${statusesParams}${addressesParams}`
}

type Swap = SwapResponse & { type: 'user' | 'explorer' }

const HistoryList: FC<ListProps> = ({ onNewTransferClick }) => {
    const { networks } = useSettingsState()
    const [openSwapDetailsModal, setOpenSwapDetailsModal] = useState(false)
    const [showAll, setShowAll] = useState(false)
    const { wallets } = useWallet()
    const { userId } = useAuthState()
    const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null)

    const addresses = wallets.map(w => {
        const network = networks.find(n => n.chain_id == w.chainId)
        return addressFormat(w.address, network || null)
    })

    const handleopenSwapDetails = (swap: Swap) => {
        setSelectedSwap(swap)
        setOpenSwapDetailsModal(true)
    }
    const getKey = useMemo(() => getSwapsKey(), [])
    const apiClient = new LayerSwapApiClient()

    const { data: pendingSwapPages, size: pendingSwapsSize, setSize: setPendingSwapsSize, isLoading: pendingSwapsLoading, isValidating: pendingSwapsValidating, mutate: mutatePendingSwaps } =
        useSWRInfinite<ApiResponse<Swap[]>>(
            (index) => getKey(index, ["PendingDeposit"], addresses),
            apiClient.fetcher,
            { revalidateAll: false }
        )
    const getCompletedSSwapsKey = useCallback((index) => getKey(index, ["Completed", "PendingWithdrawal"], addresses), [addresses])
    const { data: userSwapPages, size, setSize, isLoading: userSwapsLoading, isValidating, mutate } =
        useSWRInfinite<ApiResponse<Swap[]>>(
            getCompletedSSwapsKey,
            apiClient.fetcher,
            { revalidateAll: false, revalidateFirstPage: false, dedupingInterval: 3000 }
        )

    const handleSWapDetailsShow = (show: boolean) => {
        setOpenSwapDetailsModal(show)
    }

    const userSwaps = (!(userSwapPages?.[0] instanceof EmptyApiResponse) && userSwapPages?.map(p => {
        p.data?.forEach(s => {
            s.type = 'user'
        })
        return p?.data
    }).flat(1)) || []

    const userSwapsisEmpty = !userSwapsLoading && userSwaps.length === 0

    const isReachingEnd =
        userSwapsisEmpty || (userSwapPages && Number(userSwapPages[userSwapPages.length - 1]?.data?.length) < PAGE_SIZE);

    const handleLoadMore = async () => {
        await setSize(size + 1)
    }
    const handleLoadMorePendingSwaps = async () => {
        await setPendingSwapsSize(pendingSwapsSize + 1)
    }

    const parentRef = React.useRef(null)

    const grouppedSwaps = Object
        .entries(
            groupBy(
                userSwaps as Swap[], ({ swap }) => new Date(swap.created_date).toLocaleDateString()
            ))
        .map(([key, values]) => ({ key, values }))

    const pendingSwaps = pendingSwapPages?.map(p => p?.data).flat(1) || []

    const pendingSwapsisEmpty = !pendingSwapsLoading && pendingSwaps.length === 0
    const pendingHaveMorepages = (pendingSwapPages && Number(pendingSwapPages[pendingSwapPages.length - 1]?.data?.length) == PAGE_SIZE);

    const flattenedSwaps = grouppedSwaps?.flatMap(g => {
        return [g.key, ...g.values]
    })

    const list = [...(showAll ? pendingSwaps : (pendingSwaps.slice(0, 1))), ...flattenedSwaps]

    const rowVirtualizer = useVirtualizer({
        count: (list?.length || 0),
        getScrollElement: () => window.document.getElementById('virtualListContainer'),
        estimateSize: () => 35,
    })

    const items = rowVirtualizer.getVirtualItems()
    if ((userSwapsLoading && !(Number(userSwaps?.length) > 0))) return <Snippet />
    if (!wallets.length && !userId) return <ConnectOrSignIn onLogin={() => { mutate(); mutatePendingSwaps(); }} />
    if (!list.length) return <BlankHistory onNewTransferClick={onNewTransferClick} onLogin={() => { mutate(); mutatePendingSwaps(); }} />

    return (
        <div className="relative">
            <div
                ref={parentRef}
            >
                <div
                    style={{
                        height: rowVirtualizer.getTotalSize(),
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${items[0]?.start ? (items[0]?.start - 0) : 0}px)`,
                        }}
                    >
                        {items.map((virtualRow) => {
                            const data = list?.[virtualRow.index]
                            if (typeof data === 'string') {
                                return (
                                    <div
                                        key={virtualRow.key}
                                        data-index={virtualRow.index}
                                        ref={rowVirtualizer.measureElement}
                                    >
                                        <div className="w-full pb-1">
                                            {
                                                data !== 'Pending' &&
                                                <p className="text-sm text-secondary-text font-normal pl-2">
                                                    {resolveDate(data)}
                                                </p>
                                            }
                                        </div>
                                    </div>
                                )
                            }

                            const swap = data
                            if (!swap) return <></>

                            const collapsablePendingSwap = pendingSwaps.length > 1 && virtualRow.index === 0
                            const collapsedPendingSwap = !showAll && collapsablePendingSwap

                            return (<div
                                key={virtualRow.key}
                                data-index={virtualRow.index}
                                ref={rowVirtualizer.measureElement}
                            >
                                {collapsablePendingSwap &&
                                    <div className="w-full flex justify-end pb-2">
                                        <button type="button" onClick={() => setShowAll(!showAll)} className='flex items-center gap-1 text-xs font-normal text-secondary-text hover:text-primary-text pr-2 '>
                                            <p className="select-none">See all incomplete swaps</p>
                                            <ChevronDown className={`${showAll && 'rotate-180'} transition-transform duation-200 w-4 h-4`} />
                                        </button>
                                    </div>
                                }
                                <div onClick={() => handleopenSwapDetails(swap)}>
                                    <div className="pb-3">
                                        <HistorySummary swapResponse={swap} wallets={wallets} />
                                        {collapsedPendingSwap &&
                                            <div className="z-0 h-6 -top-4 opacity-65 shadow-lg relative bg-secondary-700 p-3 w-[95%] mx-auto font-normal space-y-3 hover:bg-secondary-600 rounded-xl overflow-hidden cursor-pointer" />}
                                    </div>
                                </div>
                                {
                                    pendingHaveMorepages && virtualRow.index === pendingSwaps.length - 1 &&
                                    <button
                                        disabled={pendingSwapsLoading || pendingSwapsValidating}
                                        type="button"
                                        onClick={handleLoadMorePendingSwaps}
                                        className="text-primary inline-flex gap-1 items-center justify-center disabled:opacity-80 m-auto w-full"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${(pendingSwapsLoading || pendingSwapsValidating) && 'animate-spin'}`} />
                                        <span>Load more pending swaps</span>
                                    </button>
                                }
                                {
                                    virtualRow.index === list.length - 1 && !isReachingEnd &&
                                    <button
                                        disabled={isReachingEnd || userSwapsLoading || isValidating}
                                        type="button"
                                        onClick={handleLoadMore}
                                        className="text-primary inline-flex gap-1 items-center justify-center disabled:opacity-80 m-auto w-full"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${(userSwapsLoading || isValidating) && 'animate-spin'}`} />
                                        <span>Load more</span>
                                    </button>
                                }
                            </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <VaulDrawer
                show={openSwapDetailsModal}
                setShow={handleSWapDetailsShow}
                header='Swap details'
                modalId="swapDetails"
            >
                {
                    selectedSwap &&
                    <SwapDetails swapResponse={selectedSwap} />
                }
            </VaulDrawer>
        </div>
    )
}

type BlankHistoryProps = {
    onNewTransferClick?: () => void,
    onLogin: () => void
}

const BlankHistory = ({ onNewTransferClick, onLogin }: BlankHistoryProps) => {

    return <div className="w-full h-full min-h-[inherit] flex flex-col justify-between items-center space-y-10">
        <div />
        <div className="w-full h-full flex flex-col justify-center items-center ">
            <HistoryItemSceleton className="scale-[.63] w-full shadow-lg mr-7" />
            <HistoryItemSceleton className="scale-[.63] -mt-12 shadow-card ml-7 w-full" />
            <div className="mt-2 text-center space-y-2">
                <h1 className="text-secondary-text text-[28px] font-bold tracking-wide" >
                    No Transfer History
                </h1>
                <p className="max-w-xs text-center text-primary-text-muted text-base font-normal mx-auto">
                    Transfers you make with this wallet/account will appear here after excution.
                </p>
            </div>
            <Link onClick={onNewTransferClick} href={"/"} className="mt-10 flex items-center gap-2 text-base text-secondary-text font-normal bg-secondary-500 hover:bg-secondary-600 py-2 px-3 rounded-lg">
                <Plus className="w-4 h-4" />
                <p>New Transfer</p>
            </Link>

        </div>
        <div className="w-full">
            <SignIn onLogin={onLogin} />
        </div>
    </div>

}

const ConnectOrSignIn = ({ onLogin }: SignInProps) => {

    return <div className="w-full h-full flex flex-col justify-between items-center space-y-10">
        <div className="flex flex-col items-center justify-center text-center w-full h-full">
            <HistoryItemSceleton className="scale-[.63] w-full shadow-lg mr-7" />
            <HistoryItemSceleton className="scale-[.63] -mt-12 shadow-card ml-7 w-full" />
            <div className="mt-4 text-center space-y-3">
                <h1 className="text-secondary-text text-[28px] font-bold tracking-wide" >
                    Connect wallet or sign in
                </h1>
                <p className="max-w-xs text-center text-primary-text-muted text-base font-normal mx-auto">
                    In order to see your transfer history you need to connect your wallet or Sign in with your email.
                </p>
            </div>
        </div>
        <div className="flex flex-col items-center w-full space-y-3">
            <ConnectButton className="w-full">
                <div className="w-full py-2.5 px-3 text-xl font-semibold bg-primary-text-placeholder hover:opacity-90 duration-200 active:opacity-80 transition-opacity rounded-lg text-secondary-950">
                    <div className="text-center text-xl font-semibold">Connect Wallet</div>
                </div>
            </ConnectButton>
            <div className="w-full overflow-hidden">
                <SignIn onLogin={onLogin} />
            </div>
        </div>
    </div>
}
type SignInProps = {
    onLogin: () => void
}
const SignIn = ({ onLogin }: SignInProps) => {

    const { userType } = useAuthState()
    const [showGuestCard, setShowGuestCard] = useState(false)

    if (!(userType && userType != UserType.AuthenticatedUser)) return null

    return <FormWizardProvider initialStep={AuthStep.Email} initialLoading={false} hideMenu noToolBar>
        <TimerProvider>
            {
                showGuestCard ?
                    <div className="animate-fade-in">
                        <GuestCard onLogin={onLogin} />
                    </div>
                    :
                    <button type="button" onClick={() => setShowGuestCard(true)} className="text-secondary-text w-fit mx-auto flex justify-center mt-2 underline hover:no-underline">
                        <span>Sign in with your email</span>
                    </button>
            }
        </TimerProvider>
    </FormWizardProvider>

}

function resolveDate(dateInput) {
    // Get the current date
    const today = new Date();

    // Calculate the difference in time between the input date and today
    const inputDate = new Date(dateInput);
    const timeDiff = today.getTime() - inputDate.getTime();

    // Convert the time difference from milliseconds to days
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    // Resolve the output based on the difference in days
    switch (dayDiff) {
        case 0:
            return "Today";
        case 1:
            return "Yesterday";
        case 2:
            return "2 days ago";
        case 3:
            return "3 days ago";
        case 4:
            return "4 days ago";
        case 5:
            return "5 days ago";
        case 6:
            return "6 days ago";
        default:
            // If the date is more than 6 days ago, return it in DD/MM/YYYY format
            return dateInput;
    }
}

export default HistoryList