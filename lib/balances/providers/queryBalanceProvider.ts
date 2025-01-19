import { NetworkWithTokens } from "../../../Models/Network";
import formatAmount from "../../formatAmount";

export class QueryBalanceProvider {
    private query: {
        from?: string | null;
        to?: string | null;
        balances?: string | null;
        fromAsset?: string | null;
    };

    constructor() {
        this.query = this.getQueryParams();
    }

    private getQueryParams() {
        if (typeof window === "undefined" || typeof location === "undefined") {
            // Return default or empty query params if not in a browser environment
            return {
                from: null,
                to: null,
                balances: null,
                fromAsset: null,
            };
        }

        const urlParams = new URLSearchParams(location.search);
        return {
            from: urlParams.get('from'),
            to: urlParams.get('to'),
            balances: urlParams.get('balances'),
            fromAsset: urlParams.get('fromAsset'),
        };
    }

    supportsNetwork(network: NetworkWithTokens): boolean {
        if (!this.query.balances) return false
        return network?.name?.toLocaleLowerCase() === this.query.from?.toLowerCase() || network?.name?.toLocaleLowerCase() === this.query.to?.toLowerCase()
    }

    fetchBalance = async (address: string, network: NetworkWithTokens) => {
        if (!network) return null;

        const asset = network.tokens?.find(a => a.symbol === this.query.fromAsset);
        const balancesFromQueries = this.query.balances ? JSON.parse(this.query.balances) : null;

        if (!balancesFromQueries || !asset) return null;

        return [{
            network: network.name,
            amount: formatAmount(balancesFromQueries[asset.symbol], asset.decimals),
            decimals: asset.decimals,
            isNativeCurrency: network.token?.symbol === asset.symbol,
            token: asset.symbol,
            request_time: new Date().toJSON(),
        }];
    };
}
