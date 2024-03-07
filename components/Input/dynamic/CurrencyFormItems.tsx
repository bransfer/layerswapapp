import { truncateDecimals } from "../../utils/RoundDecimals";
import { NetworkCurrency } from "../../../Models/CryptoNetwork";
import { useBalancesState } from "../../../context/balances";
import useWallet from "../../../hooks/useWallet";
import { useMemo } from "react";
import { SwapFormValues } from "../../DTOs/SwapFormValues";

const FormItems = ({ values, network, currency }: { values: SwapFormValues, network: string | undefined, currency: NetworkCurrency }) => {

    const { to, from } = values
    const { balances: allBalances } = useBalancesState()
    const { wallets, getAutofillProvider: getProvider } = useWallet()

    for (const key in allBalances) {
        const matchingWallet = wallets.find(wallet => wallet.address === key);
        if (!matchingWallet) {
            delete allBalances[key];
        }
    }

    const sourceWalletProvider = useMemo(() => {
        return from && getProvider(from)
    }, [from, getProvider])

    const destinationWalletProvider = useMemo(() => {
        return to && getProvider(to)
    }, [to, getProvider])

    const sourceNetworkWallet = sourceWalletProvider?.getConnectedWallet()
    const destinationNetworkWallet = destinationWalletProvider?.getConnectedWallet()

    const balance = allBalances[(sourceNetworkWallet ? sourceNetworkWallet?.address : destinationNetworkWallet?.address) || ""]?.find(b => b?.token === currency?.asset && network === b.network)
    const formatted_balance_amount = balance ? Number(truncateDecimals(balance?.amount, currency.precision)) : ''

    return (
        balance && <span className="text-primary-text-placeholder flex flex-col items-end">
            {Number(formatted_balance_amount) ?
                <span className="text-primary-text-muted text-sm">{formatted_balance_amount}</span>
                :
                ""
            }
        </span>
    )
}

export default FormItems