import { FC, useCallback } from "react"
import { ArrowLeftRight } from "lucide-react"
import Image from 'next/image';
import { useSwapDataState } from "../../../context/swap";
import KnownInternalNames from "../../../lib/knownIds";
import BackgroundField from "../../backgroundField";
import SubmitButton from "../../buttons/submitButton";
import shortenAddress from "../../utils/ShortenAddress";
import { isValidAddress } from "../../../lib/address/validator";
import { useSwapDepositHintClicked } from "../../../stores/swapTransactionStore";
import { Exchange } from "../../../Models/Exchange";
import Link from "next/link";
import CopyButton from "../../buttons/copyButton";
import useWindowDimensions from "../../../hooks/useWindowDimensions";

const ManualTransfer: FC = () => {
    const { swapResponse, depositActionsResponse } = useSwapDataState()

    const { swap } = swapResponse || {}
    const hintsStore = useSwapDepositHintClicked()
    const hintClicked = hintsStore.swapTransactions[swap?.id || ""]
    const trasnsferACtionData = depositActionsResponse?.find(a => true)

    let generatedDepositAddress = trasnsferACtionData?.to_address

    const handleCloseNote = useCallback(async () => {
        if (swap)
            hintsStore.setSwapDepositHintClicked(swap?.id)
    }, [swap, hintsStore])

    return (
        <div className='rounded-md bg-secondary-700 border border-secondary-500 w-full h-full items-center relative'>
            <div className={!hintClicked ? "absolute w-full h-full flex flex-col items-center px-3 pb-3 text-center" : "hidden"}>
                <div className="flex flex-col items-center justify-center h-full pb-2">
                    <div className="max-w-xs">
                        <p className="text-base text-primary-text">
                            About manual transfers
                        </p>
                        <p className="text-xs text-secondary-text">
                            <span>Transfer assets to Layerswap’s deposit address to complete the swap.</span> <Link target="_blank" className="text-primary underline hover:no-underline decoration-primary cursor-pointer" href='https://intercom.help/layerswap/en/articles/8448449-transferring-manually'>Learn more</Link>
                        </p>
                    </div>
                </div>
                <SubmitButton type="button" size="medium" onClick={handleCloseNote}>
                    OK
                </SubmitButton>
            </div>
            <div className={hintClicked ? "" : "invisible"}>
                <TransferInvoice deposit_address={generatedDepositAddress} />
            </div>
        </div>
    )
}

const TransferInvoice: FC<{ deposit_address?: string }> = ({ deposit_address }) => {
    const { swapResponse: swapResponse } = useSwapDataState()
    const { swap, quote: swapQuote } = swapResponse || {}
    const { isMobile } = useWindowDimensions()

    const minAllowedAmount = swapQuote?.min_receive_amount

    const {
        source_exchange,
        source_network,
        source_token,
    } = swap || {}
    const source_network_internal_name = swap?.source_network.name

    //TODO pick manual transfer minAllowedAmount when its available
    const requested_amount = Number(minAllowedAmount) > Number(swap?.requested_amount) ? minAllowedAmount : swap?.requested_amount

    // const handleChangeSelectedNetwork = useCallback((n: NetworkCurrency) => {
    //     setSelectedAssetNetwork(n)
    // }, [])

    return <div className='divide-y divide-secondary-500 text-primary-text h-full'>
        {source_exchange && <div className={`w-full relative rounded-md px-3 py-3 shadow-sm border-secondary-700 border bg-secondary-700 flex flex-col items-center justify-center gap-2`}>
            <ExchangeNetworkPicker />
        </div>
        }
        <div className="flex divide-x divide-secondary-500">
            <BackgroundField Copiable={true} QRable={true} header={"Deposit address"} toCopy={deposit_address} withoutBorder>
                <div>
                    {
                        deposit_address ?
                            <p className='break-all'>
                                {deposit_address}
                            </p>
                            :
                            <div className='bg-gray-500 w-56 h-5 animate-pulse rounded-md' />
                    }
                    {
                        (source_network_internal_name === KnownInternalNames.Networks.LoopringMainnet || source_network_internal_name === KnownInternalNames.Networks.LoopringGoerli) &&
                        <div className='flex text-xs items-center py-1 mt-1 border-2 border-secondary-300 rounded border-dashed text-secondary-text'>
                            <p>
                                This address might not be activated. You can ignore it.
                            </p>
                        </div>
                    }
                </div>
            </BackgroundField>
        </div>
        {
            (source_network_internal_name === KnownInternalNames.Networks.LoopringMainnet || source_network_internal_name === KnownInternalNames.Networks.LoopringGoerli) &&
            <div className='grid grid-cols-3 divide-x divide-secondary-500'>
                <div className="col-span-2">
                    <BackgroundField header={'Send type'} withoutBorder>
                        <div className='flex items-center text-xs sm:text-sm'>
                            <ArrowLeftRight className='hidden sm:inline-block sm:h-4 sm:w-4' />
                            <p>
                                To Another Loopring L2 Account
                            </p>
                        </div>
                    </BackgroundField>
                </div>
                <BackgroundField header={'Address Type'} withoutBorder>
                    <p className="text-xs sm:text-sm">
                        EOA Wallet
                    </p>
                </BackgroundField>
            </div>
        }

        <div className='flex divide-x divide-secondary-500'>
            <BackgroundField Copiable={true} toCopy={requested_amount} header={'Amount'} withoutBorder>
                <p>
                    {requested_amount}
                </p>
            </BackgroundField>
            <BackgroundField header={'Asset'} withoutBorder Explorable={source_token?.contract != null && isValidAddress(source_token?.contract, source_network)} toExplore={source_token?.contract != null ? source_network?.account_explorer_template?.replace("{0}", source_token?.contract) : undefined}>
                <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 h-7 w-7 relative">
                        {
                            source_token &&
                            <Image
                                src={source_token.logo}
                                alt="From Logo"
                                height="60"
                                width="60"
                                className="rounded-md object-contain"
                            />
                        }
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold leading-4">
                            {source_token?.symbol}
                        </span>
                        {source_token?.contract && isValidAddress(source_token.contract, source_network) &&
                            <span className="text-xs text-secondary-text flex items-center leading-3">
                                <CopyButton iconSize={isMobile ? 20 : 16} toCopy={source_token?.contract} iconClassName="hidden" className='hover:underline no-underline text-secondary-text' >
                                    {shortenAddress(source_token?.contract)}
                                </CopyButton>
                            </span>
                        }
                    </div>
                </div>
            </BackgroundField>
        </div>
    </div>
}

const ExchangeNetworkPicker: FC<{ onChange?: (exchnage: Exchange) => void }> = ({ onChange }) => {
    const { swapResponse: swap } = useSwapDataState()

    //const exchangeAssets = source_exchange?.assets?.filter(a => a.asset === source_network_asset && a.network_internal_name !== destination_network && a.network?.status !== "inactive")
    //const defaultSourceNetwork = exchangeAssets?.find(sn => sn.is_default) || exchangeAssets?.[0]

    // const handleChangeSelectedNetwork = useCallback((n: string) => {
    //     const network = exchangeAssets?.find(network => network?.network_internal_name === n)
    //     if (network)
    //         onChange(network)
    // }, [exchangeAssets])

    return <div className='flex items-center gap-1 text-sm my-2'>
        <span>Network:</span>
        {/* {exchangeAssets?.length === 1 ? */}
        <div className='flex space-x-1 items-center w-fit font-semibold text-primary-text'>
            <Image alt="chainLogo" height='20' width='20' className='h-5 w-5 rounded-md ring-2 ring-secondary-600' src={swap?.swap.source_network.logo || ''}></Image>
            <span>{swap?.swap.source_network.display_name}</span>
        </div>
        {/* :
            <Select onValueChange={handleChangeSelectedNetwork} defaultValue={defaultSourceNetwork?.network_internal_name}>
                <SelectTrigger className="w-fit border-none !text-primary-text !font-semibold !h-fit !p-0">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Networks</SelectLabel>
                        {exchangeAssets?.map(sn => (
                            <SelectItem key={sn.network_internal_name} value={sn.network_internal_name}>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-5 w-5 relative">
                                        {
                                            sn.network &&
                                            <Image
                                                src={resolveImgSrc(sn.network)}
                                                alt="From Logo"
                                                height="60"
                                                width="60"
                                                className="rounded-md object-contain"
                                            />
                                        }
                                    </div>
                                    <div className="mx-1 block">{sn?.network?.display_name}</div>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        } */}
    </div>
}

export default ManualTransfer