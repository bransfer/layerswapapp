import { Balance, BalanceProps, BalanceProvider } from "../../../Models/Balance"
import { useQueryState } from "../../../context/query"
import { useSettingsState } from "../../../context/settings"

export default function useQueryBalances(): BalanceProvider {

    const query = useQueryState()
    const { layers } = useSettingsState()
    const supportedNetworks = [(layers.find(l => l.internal_name.toLowerCase() === query.from?.toLowerCase())?.internal_name || ''), (layers.find(l => l.internal_name.toLowerCase() === query.to?.toLowerCase())?.internal_name || '')]

    const getBalance = ({ layer }: BalanceProps) => {
        const asset = layer.assets.find(a => a.asset === query.fromAsset)

        const balancesFromQueries = new URL(window.location.href.replaceAll('&quot;', '"')).searchParams.get('balances');
        const parsedBalances = balancesFromQueries && JSON.parse(balancesFromQueries)

        if (!parsedBalances || !asset) return

        const balances = [{
            network: layer.internal_name,
            amount: parsedBalances[asset.asset],
            decimals: asset.decimals,
            isNativeCurrency: asset.is_native,
            token: asset.asset,
            request_time: new Date().toJSON(),
        }]

        return balances

    }

    return {
        getBalance,
        supportedNetworks
    }

}