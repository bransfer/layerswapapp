import { ExchangeToken } from "../Models/Exchange"
import { SwapDirection, SwapFormValues } from "../components/DTOs/SwapFormValues"

export const resolveExchangesURLForSelectedToken = (direction: SwapDirection, values: SwapFormValues) => {

    const include_unmatched = 'true'
    const include_swaps = 'true'
    const include_unavailable = 'true'

    const { from, to, fromCurrency, toCurrency } = values

    const network = direction === "from" ? to?.name : from?.name
    const token = direction === "from" ? toCurrency?.symbol : fromCurrency?.symbol

    const params = new URLSearchParams({
        include_unmatched,
        include_swaps,
        include_unavailable,
        ...(network && token ?
            {
                [direction === 'to' ? 'source_network' : 'destination_network']: network,
                [direction === 'to' ? 'source_token' : 'destination_token']: token,
            }
            : {}
        )
    });

    const sourcesURL = `/source_exchanges?${params.toString()}`
    const destinationsURL = `/destination_exchanges?${params.toString()}`
    const result = direction === "from" ? sourcesURL : destinationsURL

    return result

}

export const resolveNetworkRoutesURL = (direction: SwapDirection, values: SwapFormValues) => {

    const { from, to, fromCurrency, toCurrency, fromExchange, toExchange, currencyGroup } = values

    const selectedExchange = direction === 'from' ? toExchange : fromExchange

    if (selectedExchange) {
        return currencyGroup ?
            resolveRoutesURLForSelectedAssetGroup(direction, currencyGroup)
            :
            resolveRoutesURLForSelectedToken({ direction, network: undefined, token: undefined, includes: { unavailable: true, unmatched: true } })
    }
    else {
        const selectednetwork = direction === "from" ? to : from
        const selectedToken = direction === "from" ? toCurrency?.symbol : fromCurrency?.symbol
        return resolveRoutesURLForSelectedToken({ direction, network: selectednetwork?.name, token: selectedToken, includes: { unmatched: true, unavailable: true } })
    }
}

export const resolveRoutesURLForSelectedToken = ({ direction, network, token, includes }: { direction: SwapDirection, network: string | undefined, token: string | undefined, includes: { unavailable: boolean, unmatched: boolean } }) => {

    const include_unmatched = includes.unmatched ? 'true' : 'false'
    const include_swaps = 'true'
    const include_unavailable = includes.unavailable ? 'true' : 'false'

    const params = new URLSearchParams({
        include_unmatched,
        include_swaps,
        include_unavailable,
        ...(network ?
            {
                [direction === 'to' ? 'source_network' : 'destination_network']: network,
            }
            : {}
        ),
        ...(network && token ?
            {
                [direction === 'to' ? 'source_network' : 'destination_network']: network,
            }
            : {}
        ),
        ...(token ?
            {
                [direction === 'to' ? 'source_token' : 'destination_token']: token,
            }
            : {}
        )
    });

    const sourceRoutesURL = `/sources?${params.toString()}`
    const destinationRoutesURL = `/destinations?${params.toString()}`
    const result = direction === "from" ? sourceRoutesURL : destinationRoutesURL

    return result

}

export const resolveRoutesURLForSelectedAssetGroup = (direction: SwapDirection, currencyGroup: ExchangeToken) => {
    const include_unmatched = 'true'
    const include_swaps = 'true'
    const include_unavailable = 'true'

    const parrams = new URLSearchParams({
        include_unmatched,
        include_swaps,
        include_unavailable,
        [direction === 'to' ? 'source_token_group' : 'destination_token_group']: currencyGroup.symbol
    });
    const endpoint = direction === "to" ? '/exchange_destination_networks' : '/exchange_source_networks'
    return `${endpoint}?${parrams.toString()}`
}