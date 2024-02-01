import KnownInternalNames from "../../knownIds"
import formatAmount from "../../formatAmount";
import { BalanceProps, BalanceProvider, GasProps } from "../../../Models/Balance";

export default function useImxBalance(): BalanceProvider {

    const supportedNetworks = [
        KnownInternalNames.Networks.ImmutableXMainnet,
        KnownInternalNames.Networks.ImmutableXGoerli
    ]

    const getBalance = async ({ layer, address }: BalanceProps) => {

        const axios = (await import("axios")).default

        if (!layer.assets) return

        const res: BalancesResponse = await axios.get(`${layer?.nodes[0].url}/v2/balances/${address}`).then(r => r.data)

        const balances = layer?.assets?.map(asset => {
            const balance = res.result.find(r => r.symbol === asset.asset)

            return {
                network: layer.internal_name,
                amount: formatAmount(balance?.balance, asset.decimals),
                decimals: asset.decimals,
                isNativeCurrency: false,
                token: asset.asset,
                request_time: new Date().toJSON(),
            }
        })

        return balances

    }

    return {
        getBalance,
        supportedNetworks
    }
}

type BalancesResponse = {
    result: {
        balance: string,
        symbol: string,
        token_address: string
    }[]
}