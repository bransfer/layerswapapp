import { useFormikContext } from "formik";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { useSettingsState } from "../../context/settings";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import { SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import useSWR from 'swr'
import { ApiResponse } from "../../Models/ApiResponse";
import LayerSwapApiClient from "../../lib/layerSwapApiClient";
import Image from "next/image";
import { AssetGroup } from "./CEXCurrencyFormField";
import { isValidAddress } from "../../lib/addressValidator";
import shortenAddress from "../utils/ShortenAddress";
import Link from "next/link";
import { SortingByOrder } from "../../lib/sorting";
import { Check, ChevronRight, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";

type SwapDirection = "from" | "to";
type Props = {
    direction: SwapDirection,
}

const CEXNetworkFormField = forwardRef(function CEXNetworkFormField({ direction }: Props, ref: any) {
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();
    const name = direction
    const [showModal, setShowModal] = useState(false)

    const {
        from,
        to,
        fromCurrency,
        toCurrency,
        fromExchange,
        toExchange,
        currencyGroup
    } = values

    const { layers, resolveImgSrc } = useSettingsState();
    const filterWith = direction === "from" ? to : from
    const filterWithAsset = direction === "from" ? toCurrency?.asset : fromCurrency?.asset

    const apiClient = new LayerSwapApiClient()
    const version = LayerSwapApiClient.apiVersion

    const destinationRouteParams = new URLSearchParams({
        version,
        ...(filterWith && filterWithAsset
            ? (
                {
                    [direction === 'to'
                        ? 'source_network'
                        : 'destination_network']
                        : filterWith.internal_name,
                    [direction === 'to'
                        ? 'source_asset'
                        : 'destination_asset']
                        : filterWithAsset
                }) : {}),
    });

    const routesEndpoint = `/routes/${direction === "from" ? "sources" : "destinations"}?${destinationRouteParams.toString()}`

    const { data: routes } = useSWR<ApiResponse<{
        network: string,
        asset: string
    }[]>>(routesEndpoint, apiClient.fetcher)
    const routesData = routes?.data

    const historicalNetworksEndpoint =
        (fromExchange || toExchange)
        && (`/exchanges/${direction === 'from'
            ? `historical_sources?source_exchange=${fromExchange?.internal_name}`
            :
            `historical_destinations?destination_exchange=${toExchange?.internal_name}`}&version=${version}`)

    const { data: historicalNetworks } = useSWR<ApiResponse<{
        network: string,
        asset: string
    }[]>>(historicalNetworksEndpoint, apiClient.fetcher)
    const menuItems = routesData
        && historicalNetworks
        && GenerateMenuItems(routesData, historicalNetworks?.data, currencyGroup)
            .filter(item => layers.find(l =>
                l.internal_name === item.baseObject.network));

    const handleSelect = useCallback((item: SelectMenuItem<{ network: string, asset: string }>) => {
        if (!item) return
        const layer = layers.find(l => l.internal_name === item.baseObject.network)
        const currency = layer?.assets.find(a => a.asset === item.baseObject.asset)
        setFieldValue(name, layer, true)
        setFieldValue(`${name}Currency`, currency, true)
        setShowModal(false)
    }, [name])

    //TODO set default currency & reset currency if not available
    const value = menuItems?.find(item =>
        item.baseObject.asset ===
        (direction === 'from' ? fromCurrency : toCurrency)?.asset
        && item.baseObject.network === (direction === 'from' ? from : to)
            ?.internal_name)

    //Setting default value
    useEffect(() => {
        if (!menuItems) return
        if (menuItems.length == 0) {
            setFieldValue(name, null, true)
            setFieldValue(`${name}Currency`, null, true)
            setFieldValue('currencyGroup', null, true)
            return
        }
        else if (value) return
        const item = menuItems[0]
        handleSelect(item)
    }, [routesData, historicalNetworks])

    useEffect(() => {
        if (!currencyGroup) return
        if (!menuItems) return
        if (menuItems.length == 0) {
            setFieldValue(`${direction === 'to' ? 'from' : 'to'}Currency`, null, true)
            return
        }
        else if (value) return
        const item = menuItems[0]
        handleSelect(item)
    }, [currencyGroup])

    if (!menuItems) return

    const network = (direction === 'from' ? from : to)
    const currency = (direction === 'from' ? fromCurrency : toCurrency)

    return (<div className=" flex justify-between items-center w-full">
        <label htmlFor={name} className="block text-secondary-text">
            {direction === 'from' ? 'Transfer via' : 'Receive in'}
        </label>
        <Popover open={showModal} onOpenChange={() => setShowModal(!showModal)}>
            <div>
                <PopoverTrigger className="w-fit border-none !text-primary-text !h-fit !p-0">
                    <div className="flex items-center gap-1">
                        <div className="mt-1">
                            <div className="inline-flex items-center gap-1 w-full">
                                <div className="flex-shrink-0 h-5 w-5 relative">
                                    <Image
                                        src={resolveImgSrc(network)}
                                        alt="Network Logo"
                                        height="40"
                                        width="40"
                                        loading="eager"
                                        className="rounded-md object-contain" />
                                </div>
                                <p>{network?.display_name}</p>
                            </div>
                        </div>
                        <div className="inline-flex items-center justify-self-end gap-1 text-secondary-text">
                            ({currency?.asset})
                        </div>
                        <ChevronRight className="h-4 w-4 text-primary-text" />
                    </div>
                </PopoverTrigger>
                {
                    currency?.contract_address && isValidAddress(currency.contract_address, network) && network &&
                    <div className="flex items-center justify-end">
                        <Link target="_blank" href={network.account_explorer_template?.replace("{0}", currency.contract_address)} className="text-xs text-secondary-text underline hover:no-underline leading-3 w-fit">
                            {shortenAddress(currency?.contract_address)}
                        </Link>
                    </div>
                }
            </div>
            <PopoverContent className="w-fit">
                <div className="max-w-xs m-2">
                    <div className="!text-primary-text font-medium pb-2">Networks</div>
                    <div className="rounded-md bg-secondary-600 p-4 ">
                        <div className="flex text-secondary-text">
                            <div className="flex-shrink-0">
                                <Info className="h-4 w-4 mt-0.5" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <div className="text-sm">
                                    {
                                        direction === 'from' ?
                                            <p>Please note that you should initiate the withdrawal from your exchange account via the selected network. In case of transferring via another network, your assets may be lost.</p>
                                            :
                                            <p>Please note that funds will be sent to your exchange account via the selected network. Before transferring, double check that the exchange supports the network/asset pair.</p>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[200px] styled-scroll">
                    {
                        menuItems.sort((a, b) => a.order - b.order)?.map((route, index) => {
                            const network = layers.find(l => l.internal_name === route.baseObject.network)
                            const currency = network?.assets.find(a => a.asset === route.baseObject.asset)

                            return (
                                <div key={index} onClick={() => handleSelect(route)} className={`flex items-center w-full p-2 hover:bg-secondary-700 cursor-pointer`}>
                                    {
                                        value === route &&
                                        <Check className="h-4 w-4 mr-2" />
                                    }
                                    <div className="flex-shrink-0 h-6 w-6 relative">
                                        {<Image
                                            src={resolveImgSrc(network)}
                                            alt="Project Logo"
                                            height="40"
                                            width="40"
                                            loading="eager"
                                            className="rounded-md object-contain" />}
                                    </div>
                                    <div className="ml-2 flex items-center gap-3 justify-between w-full">
                                        <p className='text-md font-medium'>
                                            {network?.display_name}
                                        </p>
                                        <p className="text-primary-text-muted">
                                            ({currency?.asset})
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </PopoverContent>
        </Popover>
    </div>)
})

function GenerateMenuItems(
    items: { network: string, asset: string }[],
    historicalNetworks: { network: string, asset: string }[] | undefined,
    currencyGroup: AssetGroup | undefined
): SelectMenuItem<{ network: string, asset: string }>[] {
    const menuItems = items
        .filter(i => currencyGroup?.values?.some(v => v.asset == i.asset && v.network == i.network))
        .map((e, index) => {
            const indexOf = Number(historicalNetworks
                ?.indexOf(historicalNetworks
                    .find(n => n.asset === e.asset && n.network === e.network)
                    || { network: '', asset: '' }))

            const item: SelectMenuItem<{ network: string, asset: string }> = {
                baseObject: e,
                id: index.toString(),
                name: e.network,
                order: indexOf > -1 ? indexOf : 100,
                imgSrc: '',
                isAvailable: { value: true, disabledReason: null },
                type: 'cex',
            }
            return item;
        }).sort(SortingByOrder)
    const res = menuItems
    return res
}

export default CEXNetworkFormField