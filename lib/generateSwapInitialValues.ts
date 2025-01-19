import { SwapFormValues } from "../components/DTOs/SwapFormValues";
import { QueryParams } from "../Models/QueryParams";
import { isValidAddress } from "./address/validator";
import { LayerSwapAppSettings } from "../Models/LayerSwapAppSettings";
import { SwapResponse } from "./layerSwapApiClient";

export function generateSwapInitialValues(settings: LayerSwapAppSettings, queryParams: QueryParams): SwapFormValues {
    const { destAddress, amount, fromAsset, toAsset, from, to, lockFromAsset, lockToAsset, depositMethod } = queryParams
    const { sourceExchanges, destinationExchanges, sourceRoutes, destinationRoutes } = settings || {}

    const lockedSourceCurrency = lockFromAsset ?
        sourceRoutes.find(l => l.name === to)
            ?.tokens?.find(c => c?.symbol?.toUpperCase() === fromAsset?.toUpperCase())
        : undefined
    const lockedDestinationCurrency = lockToAsset ?
        destinationRoutes.find(l => l.name === to)
            ?.tokens?.find(c => c?.symbol?.toUpperCase() === toAsset?.toUpperCase())
        : undefined

    const sourceNetwork = sourceRoutes.find(l => l.name.toUpperCase() === from?.toUpperCase())
    const destinationNetwork = destinationRoutes.find(l => l.name.toUpperCase() === to?.toUpperCase())

    const initialSourceExchange = sourceExchanges.find(e => e.name.toLowerCase() === from?.toLowerCase())
    const initialDestinationExchange = destinationExchanges.find(e => e.name.toLowerCase() === to?.toLowerCase())

    const initialSource = sourceNetwork ?? undefined
    const initialDestination = destinationNetwork ?? undefined

    const filteredSourceCurrencies = lockedSourceCurrency ?
        [lockedSourceCurrency]
        : sourceNetwork?.tokens

    const filteredDestinationCurrencies = lockedDestinationCurrency ?
        [lockedDestinationCurrency]
        : destinationNetwork?.tokens

    let initialAddress =
        destAddress && initialDestination && isValidAddress(destAddress, destinationNetwork) ? destAddress : "";

    let initialSourceCurrency = filteredSourceCurrencies?.find(c => c.symbol?.toUpperCase() == fromAsset?.toUpperCase())

    let initialDestinationCurrency = filteredDestinationCurrencies?.find(c => c.symbol?.toUpperCase() == toAsset?.toUpperCase())

    //TODO this looks wrong
    let initialAmount =
        (lockedDestinationCurrency && amount) || (initialDestinationCurrency ? amount : '')

    const result: SwapFormValues = {
        fromExchange: initialSourceExchange,
        toExchange: initialDestinationExchange,
        from: initialSource,
        to: initialDestination,
        amount: initialAmount,
        fromCurrency: initialSourceCurrency,
        toCurrency: initialDestinationCurrency,
        destination_address: initialAddress ? initialAddress : '',
        depositMethod: (depositMethod === "wallet" || depositMethod === "deposit_address") ? depositMethod : undefined,
    }

    return result
}


export function generateSwapInitialValuesFromSwap(swapResponse: SwapResponse, settings: LayerSwapAppSettings): SwapFormValues {
    const { swap, refuel } = swapResponse || ''
    const {
        destination_address,
        requested_amount,
        source_network,
        destination_network,
        source_token,
        destination_token,
        source_exchange,
        destination_exchange,
    } = swap

    const { sourceRoutes, destinationRoutes } = settings || {}

    const from = sourceRoutes.find(l => l.name === source_network.name);
    const to = destinationRoutes.find(l => l.name === destination_network.name);


    const direction = source_exchange ? 'from' : 'to';
    const availableAssetGroups = direction === 'from' ? source_exchange?.token_groups : destination_exchange?.token_groups;
    const currencyGroup = availableAssetGroups?.find(a => a.symbol === (direction === 'from' ? source_token.symbol : destination_token.symbol))

    const fromCurrency = from?.tokens.find(c => c.symbol === source_token.symbol);
    const toCurrency = to?.tokens.find(c => c.symbol === destination_token.symbol);

    const result: SwapFormValues = {
        from,
        to,
        amount: requested_amount?.toString(),
        fromCurrency,
        toCurrency,
        destination_address,
        refuel: !!refuel,
        fromExchange: source_exchange,
        toExchange: destination_exchange,
        currencyGroup
    }

    return result
}