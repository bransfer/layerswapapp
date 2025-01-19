import { useFormikContext } from "formik";
import { forwardRef, useCallback, useEffect } from "react";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import { SelectMenuItem } from "../Select/Shared/Props/selectMenuItem";
import useSWR from 'swr'
import { ApiResponse } from "../../Models/ApiResponse";
import LayerSwapApiClient from "../../lib/layerSwapApiClient";
import shortenAddress from "../utils/ShortenAddress";
import Link from "next/link";
import CommandSelectWrapper from "../Select/Command/CommandSelectWrapper";
import { NetworkWithTokens, RouteNetwork } from "../../Models/Network";
import { ExchangeNetwork } from "../../Models/Exchange";
import { isValidAddress } from "../../lib/address/validator";
import TransferCEX from "./TransferCEX";
import Image from 'next/image'
import Address from "./Address";
import { Partner } from "../../Models/Partner";
import { ExtendedAddress } from "./Address/AddressPicker/AddressWithIcon";
import { ChevronRight, PlusIcon } from "lucide-react";
import AddressIcon from "../AddressIcon";

type SwapDirection = "from" | "to";
type Props = {
    direction: SwapDirection,
    partner: Partner | undefined
}

const CEXNetworkFormField = forwardRef(function CEXNetworkFormField({ direction, partner }: Props, ref: any) {
    const {
        values,
        setFieldValue,
    } = useFormikContext<SwapFormValues>();
    const name = direction

    const {
        from,
        to,
        fromCurrency,
        toCurrency,
        fromExchange,
        toExchange,
        currencyGroup,
    } = values

    const apiClient = new LayerSwapApiClient()

    const routesEndpoint = `/${direction === "from" ? `exchange_source_networks?destination_token_group=${currencyGroup?.symbol}&include_unmatched=true` : `exchange_destination_networks?source_token_group=${currencyGroup?.symbol}&include_unmatched=true`}`

    const { data: routes, isLoading: isRoutesLoading } = useSWR<ApiResponse<RouteNetwork[]>>(`${routesEndpoint}`, apiClient.fetcher, { keepPreviousData: true })
    const routesData = routes?.data

    const exchangeNetworksEndpoint =
        ((fromExchange && to && toCurrency) || (toExchange && from && fromCurrency))
        && (`/${direction === 'from' ?
            `exchange_withdrawal_networks?source_exchange=${fromExchange?.name}&&source_token_group=${currencyGroup?.symbol}&destination_network=${to?.name}&destination_token=${toCurrency?.symbol}`
            : `exchange_deposit_networks?destination_exchange=${toExchange?.name}&destination_token_group=${currencyGroup?.symbol}&source_network=${from?.name}&source_token=${fromCurrency?.symbol}`}`)
    const { data: historicalNetworks, isLoading: isHistoricalNetworsLoading, error } = useSWR<ApiResponse<ExchangeNetwork[]>>(exchangeNetworksEndpoint, apiClient.fetcher, { keepPreviousData: true })

    const network = (direction === 'from' ? from : to)
    const currency = (direction === 'from' ? fromCurrency : toCurrency)
    const menuItems = (!error || undefined) && historicalNetworks?.data && routesData
        && GenerateMenuItems(historicalNetworks.data, routes?.data)
            .filter(item => routes?.data?.find(l =>
                l.name === item.baseObject.network.name));

    const handleSelect = useCallback((item: SelectMenuItem<ExchangeNetwork>) => {
        if (!item) return
        setFieldValue(name, item.baseObject.network, true)
        setFieldValue(`${name}Currency`, { ...item.baseObject.token, status: "active" }, false)
    }, [name, routes])

    const formValue = (direction === 'from' ? from : to)
    const routeUnavailable = currencyGroup?.status === 'not_found' || toCurrency?.status === 'not_found' || fromCurrency?.status === 'not_found'

    //TODO set default currency & reset currency if not available
    const value = menuItems?.find(item =>
        item.baseObject.token.symbol ===
        (direction === 'from' ? fromCurrency : toCurrency)?.symbol
        && item.baseObject.network.name === formValue?.name)
    //Setting default value
    useEffect(() => {
        if (!menuItems) return
        if (menuItems.length == 0) {
            setFieldValue(`${name}Currency`, null, true)
            setFieldValue('currencyGroup', null, true)
            return
        }
        else if (value || !formValue) return
    }, [routesData, historicalNetworks])

    useEffect(() => {
        if (!currencyGroup) return
        if (!menuItems) return
        if (menuItems.length == 0) {
            setFieldValue(`${direction === 'to' ? 'from' : 'to'}Currency`, null, true)
            return
        }
        else if (value) return
    }, [currencyGroup])

    const valueDetails = <>
        <div className="flex">{network?.display_name}</div>
        <div className="text-primary-text-placeholder inline-flex items-center justify-self-end gap-1">
            ({currency?.symbol})
        </div>
    </>

    const networkDetails = <div>
        <TransferCEX direction={direction} />
    </div>

    const header = direction === 'from' ? 'Withdrawal network' : 'Deposit details'


    return (<div className="p-2 rounded-lg bg-secondary-700 border border-secondary-500 space-y-2">
        <label htmlFor={name} className="font-semibold flex justify-between text-secondary-text text-xs">
            <div className="flex space-x-1">
                <span>{header}</span>
            </div>
            {
                currency?.contract && isValidAddress(currency.contract, network) && network &&
                <div className="justify-self-end space-x-1">
                    <span>Contract:</span>
                    <Link target="_blank" href={network.account_explorer_template?.replace("{0}", currency.contract)} className="underline text-primary-buttonTextColor hover:no-underline w-fit">
                        {shortenAddress(currency?.contract)}
                    </Link>
                </div>
            }
        </label>
        <CommandSelectWrapper
            disabled={(value && !value?.isAvailable) || isRoutesLoading || routeUnavailable}
            valueGrouper={groupByType}
            placeholder="Network"
            setValue={handleSelect}
            value={value}
            values={menuItems!}
            searchHint=''
            isLoading={isRoutesLoading || isHistoricalNetworsLoading}
            modalHeight="80%"
            valueDetails={valueDetails}
            modalContent={networkDetails}
            key={value?.id}
            header={header}
        />
        {
            direction === "to" && to &&
            <div className="flex items-center col-span-6">
                <Address partner={partner} >{
                    ({ destination, disabled, addressItem, connectedWallet, partner }) => <>
                        {
                            addressItem ? <>
                                <AddressButton addressItem={addressItem} network={network} disabled={disabled} />
                            </>
                                : <div className=" justify-center w-full pl-3 pr-2 py-2 bg-secondary-600 items-center flex font-light space-x-2 mx-auto rounded-lg focus-peer:ring-primary focus-peer:border-secondary-400 focus-peer:border focus-peer:ring-1 focus:outline-none disabled:cursor-not-allowed relative grow h-12 ">
                                    <PlusIcon className="stroke-1" /> <span>Destination Address</span>
                                </div>
                        }
                    </>
                }</Address>
            </div>
        }
    </div>)
})

const AddressButton = ({ addressItem, network, disabled }) => {

    return <div className="justify-between w-full pl-3 pr-2 py-2 bg-secondary-600 items-center flex font-light space-x-2 mx-auto rounded-lg focus-peer:ring-primary focus-peer:border-secondary-400 focus-peer:border focus-peer:ring-1 focus:outline-none disabled:cursor-not-allowed relative grow h-12 ">
        <div className="flex items-center gap-3">
            <div className='flex text-primary-text items-center justify-center rounded-md h-6 overflow-hidden w-6'>
                <AddressIcon className="scale-150 h-3 w-3" address={addressItem.address} size={36} />
            </div>
            <ExtendedAddress address={addressItem.address} network={network} />
        </div>
        <span className="ml-3 justify-self-end right-0 flex items-center pr-2 pointer-events-none  text-primary-text">
            {!disabled && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
        </span>
    </div>
}


function GenerateMenuItems(
    historicalNetworks: ExchangeNetwork[],
    routes: NetworkWithTokens[] | undefined,
): SelectMenuItem<ExchangeNetwork>[] {
    const menuItems = historicalNetworks.map((e, index) => {

        const network = routes?.find(l => l.name == e.network.name);
        const displayName = <div className="flex flex-col space-x-1">
            <p className="pl-1 text-primary-text text-base">{network?.display_name}</p>
            <div className="flex items-center space-x-1">
                <div className="w-4 h-4">
                    <Image
                        src={e.token.logo}
                        alt="Project Logo"
                        height="20"
                        width="20"
                        loading="eager"
                        className="rounded-full object-contain" />
                </div>
                <p className="text-secondary-text text-xs">
                    {e.token.symbol}
                    {e.token.contract && network && (
                        <>
                            {' - '}
                            <Link
                                target="_blank"
                                href={network.account_explorer_template.replace("{0}", e.token.contract)}
                                className="underline text-secondary-text hover:no-underline w-fit"
                            >
                                {shortenAddress(e.token.contract)}
                            </Link>
                        </>
                    )}
                </p>
            </div>
        </div>

        const item: SelectMenuItem<ExchangeNetwork> = {
            baseObject: e,
            id: `${e.network.name}-${e.token.symbol}`,
            name: network?.display_name || '',
            displayName,
            order: 1,
            imgSrc: network?.logo || '',
            isAvailable: true
        }

        return item;
    })
    return menuItems
}

export default CEXNetworkFormField

export function groupByType(values: SelectMenuItem<NetworkWithTokens>[]) {
    return [{ name: "", items: values }];
}