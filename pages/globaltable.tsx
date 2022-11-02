import Head from 'next/head'
import Layout from '../components/layout'
import slug from 'rehype-slug'
import fs from 'fs'
import path from 'path'
import { serialize } from "next-mdx-remote/serialize";
import React, { useCallback } from 'react'
import { MDXRemote } from 'next-mdx-remote'
import imageSize from "rehype-img-size";
import LayerSwapApiClient from '../lib/layerSwapApiClient'
import { CryptoNetwork } from '../Models/CryptoNetwork'
import { Exchange } from '../Models/Exchange'
import NetworkSettings from '../lib/NetworkSettings'
import { useRouter } from 'next/router'
import { ArrowLeftIcon } from '@heroicons/react/solid'

export default function GlobalTable(props) {
    const router = useRouter();

    const handleGoBack = useCallback(() => {
        router.back()
    }, [router])
    
    return (
        <Layout>
            <div className="flex content-center items-center justify-center mb-5 space-y-5 flex-col container mx-auto sm:px-6 lg:px-8 max-w-md md:max-w-3xl">
                <Head>
                    <title>Global Table</title>
                </Head>
                <main>
                    <div className="flex-col justify-center py-4 ">
                        <div className="mt-3 flex items-center justify-between z-20" >
                            <div className="flex ">
                                <button onClick={handleGoBack} className="self-start md:mt-2">
                                    <ArrowLeftIcon className='h-5 w-5 text-primary-text hover:text-darkblue-500 cursor-pointer' />
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-col max-w-sm md:max-w-6xl">
                                <div className="overflow-x-auto ">
                                    <div className="inline-block min-w-full py-2 align-middle">
                                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                            <table className="min-w-full divide-y divide-darkblue-500">
                                                <thead className="bg-darkblue-50">
                                                    <tr className="divide-x divide-darkblue-500">
                                                        <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold sm:pl-6">

                                                        </th>
                                                        {
                                                            props?.networks?.map((n) => (
                                                                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-primary-text">
                                                                    {n.display_name}
                                                                </th>
                                                            ))
                                                        }

                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-darkblue-600 bg-darkblue-300">
                                                    {props?.exchanges.map((e) => (
                                                        <tr key={e.id} className="divide-x divide-darkblue-500">
                                                            <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-semibold text-primary-text sm:pl-6">
                                                                {e.display_name}
                                                            </td>
                                                            {props?.networks?.map((n) => (
                                                                <td className="whitespace-nowrap p-4 text-sm text-white">{e?.currencies.map((currency) => currency.asset).filter(e => n?.currencies.map((c) => c.asset).includes(e)).join(', ')}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    )
}

export async function getStaticProps() {
    var apiClient = new LayerSwapApiClient();
    const response = await apiClient.fetchSettingsAsync()
    var networks: CryptoNetwork[] = [];
    var exchanges: Exchange[] = [];
    networks = response.data.networks.filter(n => n.status !== "inactive");
    exchanges = response.data.exchanges.filter(e => e.status !== "inactive")

    return {
        props: {
            networks,
            exchanges,
        },
    }
}