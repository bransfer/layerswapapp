import { FC } from "react"
import { useSwapDataState } from "../../../context/swap"
import Summary from "./Summary"
import { TransactionType } from "../../../lib/layerSwapApiClient"
import { shortenEmail } from "../../utils/ShortenAddress"
import KnownInternalNames from "../../../lib/knownIds"
import useWallet from "../../../hooks/useWallet"
import { useQueryState } from "../../../context/query"

const SwapSummary: FC = () => {
    const { swapResponse, selectedSourceAccount } = useSwapDataState()
    const { swap, quote: swapQuote, refuel: swapRefuel } = swapResponse || {}
    const { source_network, destination_network, source_token, destination_token } = swap || {}

    const {
        hideFrom,
        account,
    } = useQueryState()

    const sourceExchange = swap?.source_exchange
    const destExchange = swap?.destination_exchange


    if (!swap || !source_network || !source_token || !destination_token || !destination_network) {
        return <></>
    }

    const swapInputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Input)
    const swapOutputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Output)

    const requested_amount = (swapInputTransaction?.amount ?? swap.requested_amount) || undefined

    const receiveAmount = swapQuote?.receive_amount
    const calculatedReceiveAmount = swapOutputTransaction?.amount ?? receiveAmount

    let sourceAccountAddress = ""
    if (hideFrom && account) {
        sourceAccountAddress = account;
    }
    else if (swapInputTransaction?.from) {
        sourceAccountAddress = swapInputTransaction?.from;
    }
    else if (selectedSourceAccount?.address) {
        sourceAccountAddress = selectedSourceAccount.address;
    }
    else if (source_network?.name === KnownInternalNames.Exchanges.Coinbase && swap?.exchange_account_connected) {
        sourceAccountAddress = shortenEmail(swap?.exchange_account_name, 10);
    }
    else if (sourceExchange) {
        sourceAccountAddress = "Exchange"
    }
    else {
        sourceAccountAddress = "Network"
    }

    return <Summary
        sourceCurrency={source_token}
        destinationCurrency={destination_token}
        source={source_network}
        sourceExchange={sourceExchange}
        destination={destination_network}
        destExchange={destExchange}
        requestedAmount={requested_amount}
        receiveAmount={calculatedReceiveAmount}
        destinationAddress={swap.destination_address}
        refuel={swapRefuel}
        exchange_account_connected={swap?.exchange_account_connected}
        exchange_account_name={swap?.exchange_account_name}
        sourceAccountAddress={sourceAccountAddress}
    />
}
export default SwapSummary