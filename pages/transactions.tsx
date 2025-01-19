import Layout from '../components/layout'
import { InferGetServerSidePropsType } from 'next'
import { SwapDataProvider } from '../context/swap'
import { getServerSideProps } from '../helpers/getSettings'
import LayerSwapApiClient from '../lib/layerSwapApiClient'
import TransactionsHistory from '../components/SwapHistory'

export default function Transactions({ settings, themeData, apiKey }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  LayerSwapApiClient.apiKey = apiKey
  return (
    <>
      <Layout settings={settings} themeData={themeData}>
        <SwapDataProvider >
          <TransactionsHistory />
        </SwapDataProvider >
      </Layout>
    </>
  )
}

export { getServerSideProps };
