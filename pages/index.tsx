import Layout from '../components/layout'
import { InferGetServerSidePropsType } from 'next'
import Swap from '../components/swapComponent'
import { getServerSideProps } from '../helpers/getSettings'
import { SWRConfig, mutate } from 'swr'
import { SwapStatus } from '../Models/SwapStatus'
import { useEffect } from 'react'
import LayerSwapApiClient from '../lib/layerSwapApiClient'
import { resolveExchangesURLForSelectedToken, resolveRoutesURLForSelectedToken } from '../helpers/routes'

export default function Home({ settings, themeData, apiKey }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  LayerSwapApiClient.apiKey = apiKey

  const sourceRoutesDeafultKey = resolveRoutesURLForSelectedToken({ direction: 'from', network: undefined, token: undefined, includes: { unmatched: true, unavailable: true } })
  const destinationRoutesDefaultKey = resolveRoutesURLForSelectedToken({ direction: 'to', network: undefined, token: undefined, includes: { unmatched: true, unavailable: true } })

  const sourceExchangesDeafaultkey = resolveExchangesURLForSelectedToken("from", {})
  const destinationExchangesDeafaultkey = resolveExchangesURLForSelectedToken("to", {})

  return (
    <SWRConfig value={{
      use: [updatePendingCount],
      fallback: {
        [sourceRoutesDeafultKey]: { data: settings.sourceRoutes, error: null },
        [destinationRoutesDefaultKey]: { data: settings.destinationRoutes, error: null },
        [sourceExchangesDeafaultkey]: { data: settings.sourceExchanges, error: null },
        [destinationExchangesDeafaultkey]: { data: settings.destinationExchanges, error: null },
      }
    }}>
      <Layout settings={settings} themeData={themeData}>
        <Swap />
      </Layout>
    </SWRConfig>
  )
}

const swapsStatuses: { [key: string]: SwapStatus } = {}

function updatePendingCount(useSWRNext) {
  return (key, fetcher, config) => {
    const swr = useSWRNext(key, fetcher, config)
    useEffect(() => {
      const swapKeyPattern = /^\/swaps\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/;
      // Update ref if data is not undefined.
      const swap = swr.data?.data
      if (swapKeyPattern.test(key) && swap) {
        const status = swap.status
        if (swapsStatuses[swap.id] !== status) {
          mutate('/internal/swaps/count')
        }
        swapsStatuses[swap.id] = status
      }
    }, [swr.data, key])

    return useSWRNext(key, fetcher, config)
  }
}

export { getServerSideProps };
