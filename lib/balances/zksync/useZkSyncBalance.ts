import KnownInternalNames from "../../knownIds";
import formatAmount from "../../formatAmount";
import { Balance, BalanceProps, BalanceProvider, Gas, GasProps } from "../../../Models/Balance";

type Balances = {
    [currency: string]: string;
};

type VerifiedObject = {
    verified: {
        balances: Balances;
        nonce: number;
        pubKeyHash: string;
    };
};

type zkSyncGas = {
    feeType: string,
    gasFee: string,
    gasPriceWei: string,
    gasTxAmount: string,
    totalFee: string,
    zkpFee: string
}

export default function useZkSyncBalance(): BalanceProvider {
    const name = 'zksync_lite'
    const supportedNetworks = [
        KnownInternalNames.Networks.ZksyncMainnet
    ]

    const getBalance = async ({ layer, address }: BalanceProps) => {
        ///blabla
        let balances: Balance[] = []

        if (layer.isExchange === true || !layer.assets) return

        const { createPublicClient, http } = await import('viem');
        const provider = createPublicClient({
            transport: http(`${layer.nodes[0].url}jsrpc`)
        })

        try {
            const result: VerifiedObject = await provider.request({ method: 'account_info' as any, params: [address as `0x${string}`] });
            const zkSyncBalances = Object.entries(result.verified.balances).map(([token, amount]) => {
                const currency = layer?.assets?.find(c => c?.asset == token);
                return ({
                    network: layer.internal_name,
                    token,
                    amount: formatAmount(amount, Number(currency?.decimals)),
                    request_time: new Date().toJSON(),
                    decimals: Number(currency?.decimals),
                    isNativeCurrency: false
                })
            });

            balances = [
                ...zkSyncBalances,
            ]
        }
        catch (e) {
            console.log(e)
        }

        return balances
    }

    const getGas = async ({ layer, currency, address }: GasProps) => {

        let gas: Gas[] = [];
        if (layer.isExchange === true || !layer.assets) return

        const { createPublicClient, http } = await import('viem');
        const provider = createPublicClient({
            transport: http(`${layer.nodes[0].url}jsrpc`)
        })

        try {
            const result: zkSyncGas = await provider.request({ method: 'get_tx_fee' as any, params: ["Transfer" as any, address as `0x${string}`, currency.asset as any] })
            const currencyDec = layer?.assets?.find(c => c?.asset == currency.asset)?.decimals;
            const formatedGas = formatAmount(result.totalFee, Number(currencyDec))

            gas = [{
                token: currency.asset,
                gas: formatedGas,
                request_time: new Date().toJSON()
            }]
        }
        catch (e) {
            console.log(e)
        }

        return gas
    }

    return {
        getBalance,
        getGas,
        name,
        supportedNetworks
    }
}