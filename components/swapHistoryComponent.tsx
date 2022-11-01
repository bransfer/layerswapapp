import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import LayerSwapApiClient, { SwapListResponse, SwapItem, SwapType } from "../lib/layerSwapApiClient"
import TokenService from "../lib/TokenService"
import SpinIcon from "./icons/spinIcon"
import { ChevronRightIcon, ExternalLinkIcon, RefreshIcon, XIcon } from '@heroicons/react/outline';
import SwapDetails from "./swapDetailsComponent"
import LayerswapMenu from "./LayerswapMenu"
import { useSettingsState } from "../context/settings"
import Image from 'next/image'
import { useAuthState } from "../context/authContext"
import shortenAddress from "./utils/ShortenAddress"
import { classNames } from "./utils/classNames"
import SubmitButton from "./buttons/submitButton"
import CopyButton from "./buttons/copyButton"
import { SwapHistoryComponentSceleton } from "./Sceletons"
import GoHomeButton from "./utils/GoHome"
import StatusIcon from "./StatusIcons"
import Modal from "./modalComponent"
import HoverTooltip from "./Tooltips/HoverTooltip"
import toast from "react-hot-toast"
import { SwapStatus } from "../Models/SwapStatus"
import { useSwapDataUpdate } from "../context/swap"

function TransactionsHistory() {
  const [page, setPage] = useState(0)
  const { data } = useSettingsState()
  const { exchanges, networks, discovery: { resource_storage_url } } = data
  const [isLastPage, setIsLastPage] = useState(false)
  const [swaps, setSwaps] = useState<SwapListResponse>()
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const [selectedSwap, setSelectedSwap] = useState<SwapItem | undefined>()
  const [openSwapDetailsModal, setOpenSwapDetailsModal] = useState(false)
  const { email } = useAuthState()
  const { cancelSwap } = useSwapDataUpdate()

  const checkAuth = () => {
    try {
      const authData = TokenService.getAuthData();
      if (!authData) {
        router.push({
          pathname: '/auth',
          query: { redirect: '/transactions' }
        })
        return;
      }
    }
    catch (e) {
      toast(e.message)
    }
  }

  useEffect(() => {
    document.addEventListener(
      'storageChange',
      checkAuth,
      false
    )
    return () => document.removeEventListener('storageChange', () => { })
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const authData = TokenService.getAuthData();
        if (!authData) {
          router.push({
            pathname: '/auth',
            query: { redirect: '/transactions' }
          })
          return;
        }
      }
      catch (e) {
        toast(e.message)
      }
    })()
  }, [swaps])

  useEffect(() => {
    (async () => {
      setIsLastPage(false)
      setLoading(true)
      try {
        const authData = TokenService.getAuthData();
        if (!authData) {
          router.push({
            pathname: '/auth',
            query: { redirect: '/transactions' }
          })
          return;
        }
        const layerswapApiClient = new LayerSwapApiClient(router, '/transactions')
        const swaps = await layerswapApiClient.getSwaps(1)
        setSwaps(swaps)
        setPage(1)
        if (swaps?.data.length < 5)
          setIsLastPage(true)
      }
      catch (e) {
        toast(e.message)
      }
      finally {
        setLoading(false)
      }
    })()
  }, [router.query])


  const handleLoadMore = useCallback(async () => {
    //TODO refactor page change
    const nextPage = page + 1
    try {
      setLoading(true)
      const authData = TokenService.getAuthData();
      if (!authData) {
        router.push('/auth')
        return;
      }
      const layerswapApiClient = new LayerSwapApiClient(router, '/transactions')
      const response = await layerswapApiClient.getSwaps(nextPage)

      setSwaps(old => ({ ...response, data: [...(old?.data ? old?.data : []), ...(response.data ? response.data : [])] }))
      setPage(nextPage)
      if (response?.data.length < 5)
        setIsLastPage(true)
    }
    catch (e) {
      toast(e.message)
    }
    finally {
      setLoading(false)
    }
  }, [page, setSwaps])

  const handleClose = () => {
    setOpenSwapDetailsModal(false)
  }

  const handleopenSwapDetails = (swap: SwapItem) => {
    setSelectedSwap(swap)
    setOpenSwapDetailsModal(true)
  }

  return (
    <div className={`bg-darkblue px-8 md:px-12 shadow-card rounded-lg w-full overflow-hidden relative min-h`}>
      <div className="mt-3 flex items-center justify-between z-20" >
        <div className="hidden md:block">
          <p className="text-2xl mb-1 mt-2 font-bold">Account</p>
          <span className="text-primary-text font-medium">{email}</span>
        </div>
        <div className='mx-auto px-4 overflow-hidden md:hidden'>
          <div className="flex justify-center">
            <GoHomeButton />
          </div>
        </div>
        <LayerswapMenu />
      </div>
      {
        page == 0 && loading ?
          <SwapHistoryComponentSceleton />
          : <>
            {
              swaps?.data.length > 0 ?
                <>
                  <div className="mb-2">
                    <div className="-mx-4 mt-10 sm:-mx-6 md:mx-0 md:rounded-lg">
                      <table className="min-w-full divide-y divide-darkblue-500">
                        <thead className="text-primary-text">
                          <tr>
                            <th
                              scope="col"
                              className="hidden pr-3 py-3.5 text-left text-sm font-semibold  lg:table-cell"
                            >
                              Id
                            </th>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold  sm:pl-6">
                              <div className="hidden lg:block">
                                From
                              </div>
                              <div className="block lg:hidden">
                                From - To / Date
                              </div>
                            </th>
                            <th
                              scope="col"
                              className="hidden px-3 py-3.5 text-left text-sm font-semibold  lg:table-cell"
                            >
                              To
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold  "
                            >
                              Amount
                            </th>
                            <th
                              scope="col"
                              className="hidden px-3 py-3.5 text-left text-sm font-semibold  lg:table-cell"
                            >
                              Transaction
                            </th>
                            <th
                              scope="col"
                              className="hidden px-3 py-3.5 text-left text-sm font-semibold  lg:table-cell"
                            >
                              Status
                            </th>

                            <th
                              scope="col"
                              className="hidden px-3 py-3.5 text-left text-sm font-semibold  lg:table-cell"
                            >
                              Date
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">More</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {swaps?.data.map((swap, index) => {
                            const swapExchange = exchanges?.find(e => e.currencies.some(ec => ec.id === swap?.exchange_currency_id))
                            const swapNetwork = networks?.find(n => n.currencies.some(nc => nc.id === swap?.network_currency_id))
                            const currency = swapExchange.currencies.find(x => x.id == swap?.exchange_currency_id)

                            const { transaction_explorer_template } = swapNetwork

                            const source = swap.type == SwapType.OnRamp ? swapExchange : swapNetwork;
                            const destination = swap.type == SwapType.OnRamp ? swapNetwork : swapExchange;

                            return <tr key={swap.id}>
                              <td
                                className={classNames(
                                  index === 0 ? '' : 'border-t border-darkblue-500',
                                  'hidden pr-3 py-3.5 text-sm text-white lg:table-cell'
                                )}
                              >
                                <div className='inline-flex items-center'>
                                  <CopyButton iconClassName="text-primary-text" toCopy={swap.id}>
                                    {shortenAddress(swap.id)}
                                  </CopyButton>
                                </div>
                              </td>
                              <td
                                className={classNames(
                                  index === 0 ? '' : 'border-t border-darkblue-500',
                                  'relative py-4 pl-4 sm:pl-6 pr-3 text-sm'
                                )}
                              >
                                <div className="text-white ">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-5 w-5 relative">
                                      {
                                        source?.logo &&
                                        <Image
                                          src={`${resource_storage_url}${source?.logo}`}
                                          alt="From Logo"
                                          height="60"
                                          width="60"
                                          layout="responsive"
                                          className="rounded-md object-contain"
                                        />
                                      }
                                    </div>
                                    <div className="mx-1">{source?.display_name}</div>
                                    <div className="flex-shrink-0 h-5 w-5 relative block lg:hidden">
                                      {
                                        destination?.logo &&
                                        <Image
                                          src={`${resource_storage_url}${destination?.logo}`}
                                          alt="To Logo"
                                          height="60"
                                          width="60"
                                          layout="responsive"
                                          className="rounded-md object-contain"
                                        />
                                      }
                                    </div>
                                    <div className="mx-1 block lg:hidden">{destination?.display_name}</div>
                                  </div>
                                </div>
                                <div className="flex items-center mt-1 text-white sm:block lg:hidden">
                                  <span className="block lg:hidden">{(new Date(swap.created_date)).toLocaleString()}</span>
                                </div>
                                {index !== 0 ? <div className="absolute right-0 left-6 -top-px h-px bg-darkblue-500" /> : null}
                                <span className="flex items-center sm:block lg:hidden">
                                  {<StatusIcon status={swap.status} />}
                                  {/* {plan.from} - {plan.to} */}
                                </span>
                              </td>
                              <td
                                className={classNames(
                                  index === 0 ? '' : 'border-t border-darkblue-500',
                                  'hidden px-3 py-3.5 text-sm text-white lg:table-cell'
                                )}
                              >
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-5 w-5 relative">
                                    {
                                      destination?.logo &&
                                      <Image
                                        src={`${resource_storage_url}${destination?.logo}`}
                                        alt="To Logo"
                                        height="60"
                                        width="60"
                                        layout="responsive"
                                        className="rounded-md object-contain"
                                      />
                                    }
                                  </div>
                                  <div className="ml-1">{destination?.display_name}</div>
                                </div>

                              </td>
                              <td
                                className={classNames(
                                  index === 0 ? '' : 'border-t border-darkblue-500',
                                  'md:px-3 py-3.5 text-sm text-white table-cell'
                                )}
                              >
                                <div className="md:flex">
                                  {
                                    swap?.status == 'completed' && swap.received_amount != swap.requested_amount ?
                                      <div className="flex flex-col md:flex-row text-left">
                                        <span className="ml-1 md:ml-0">{swap.received_amount} /</span>
                                        <HoverTooltip text='Amount You Requested' moreClassNames="w-40 text-center">
                                          <span className="underline decoration-dotted hover:no-underline">
                                            {swap.requested_amount}
                                          </span>
                                        </HoverTooltip>
                                      </div>
                                      :
                                      <span>
                                        {swap.requested_amount}
                                      </span>
                                  }
                                  <span className="ml-1">{currency.asset}</span>
                                </div>
                              </td>
                              <td
                                className={classNames(
                                  index === 0 ? '' : 'border-t border-darkblue-500',
                                  'hidden px-3 py-3.5 text-sm text-white lg:table-cell'
                                )}
                              >
                                {swap.transaction_id && swap.type == SwapType.OnRamp ?
                                  <>
                                    <div className="underline hover:no-underline">
                                      <a target={"_blank"} href={transaction_explorer_template.replace("{0}", swap.transaction_id)}>{shortenAddress(swap.transaction_id)}</a>
                                    </div>
                                  </>
                                  : <div>-</div>
                                }
                              </td>
                              <td
                                className={classNames(
                                  index === 0 ? '' : 'border-t border-darkblue-500',
                                  'relative px-3 py-3.5 text-sm text-white hidden lg:table-cell group'
                                )}
                              >
                                {<StatusIcon status={swap.status} />}

                              </td>
                              <td
                                className={classNames(
                                  index === 0 ? '' : 'border-t border-darkblue-500',
                                  'px-3 py-3.5 text-sm text-white  hidden lg:table-cell'
                                )}
                              >
                                {(new Date(swap.created_date)).toLocaleString()}
                              </td>
                              <td
                                className={classNames(
                                  index === 0 ? '' : 'border-t border-transparent',
                                  'relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-medium'
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleopenSwapDetails(swap)}
                                  className="group text-white  relative w-full flex justify-center py-2 px-2 border-0 font-semibold rounded-md transform hover:-translate-y-0.5 transition duration-400 ease-in-out"
                                >
                                  <ChevronRightIcon className="h-5 w-5" />
                                </button>
                                {index !== 0 ? <div className="absolute right-6 left-0 -top-px h-px bg-darkblue-500" /> : null}
                              </td>
                            </tr>
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="text-white text-sm mt-auto mb-4 flex justify-center">
                    {
                      !isLastPage &&
                      <button
                        disabled={isLastPage || loading}
                        type="button"
                        onClick={handleLoadMore}
                        className="group disabled:text-primary-800 text-primary relative flex justify-center py-3 px-4 border-0 font-semibold rounded-md focus:outline-none transform hover:-translate-y-0.5 transition duration-400 ease-in-out"
                      >
                        <span className="flex items-center mr-2">
                          {(!isLastPage && !loading) &&
                            <RefreshIcon className="h-5 w-5" />}
                          {loading ?
                            <SpinIcon className="animate-spin h-5 w-5" />
                            : null}
                        </span>
                        Load more
                      </button>
                    }
                  </div>
                  <Modal onDismiss={handleClose} isOpen={openSwapDetailsModal} title={<p className="text-2xl text-white font-semibold">Swap details</p>} modalSize='medium'>
                    <div>
                      <SwapDetails id={selectedSwap?.id} />
                      {
                        data.networks && selectedSwap?.transaction_id && selectedSwap.type == SwapType.OnRamp &&
                        <div className="text-white text-sm mt-6">
                          <a href={networks?.find(n => n.currencies.some(nc => nc.id === selectedSwap?.network_currency_id)).transaction_explorer_template.replace("{0}", selectedSwap?.transaction_id)}
                            target="_blank"
                            className="shadowed-button cursor-pointer group text-white disabled:text-white-alpha-100 disabled:bg-primary-800 disabled:cursor-not-allowed bg-primary relative w-full flex justify-center py-3 px-4 border-0 font-semibold rounded-md shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition duration-400 ease-in-out">
                            View in Explorer
                            <ExternalLinkIcon className='ml-2 h-5 w-5' />
                          </a>
                        </div>
                      }
                      {
                        selectedSwap?.status == SwapStatus.UserTransferPending &&
                        <div className="text-white text-sm mt-6 space-y-3">
                          <SubmitButton onClick={() => router.push(`/${selectedSwap.id}`)} isDisabled={false} isSubmitting={false}>
                            Complete Swap
                            <ExternalLinkIcon className='ml-2 h-5 w-5' />
                          </SubmitButton>
                          <SubmitButton buttonStyle="outline" onClick={() => {cancelSwap(selectedSwap.id); router.reload()}} isDisabled={false} isSubmitting={false}>
                            Cancel Swap
                            <XIcon className='ml-2 h-5 w-5' />
                          </SubmitButton>
                        </div>
                      }
                    </div>
                  </Modal>
                </>
                : <div className="sm:my-24 sm:mx-60 m-16 pb-20 text-center sm:pb-10">
                  There are no transactions for this account
                </div>
            }
          </>
      }
    </div>
  )
}

export default TransactionsHistory;
