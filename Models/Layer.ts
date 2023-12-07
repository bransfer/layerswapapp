import { ManagedAccount, Metadata, NetworkCurrency, NetworkType } from "./CryptoNetwork";

export type LayerStatus = "active" | "inactive" | 'insufficient_liquidity';
export type Layer = {
    display_name: string;
    internal_name: string;
    status: LayerStatus;
    is_featured: boolean;
    transaction_explorer_template: string
    account_explorer_template: string,
    refuel_amount_in_usd: number
    created_date: string;
    img_url: string;
    chain_id: string | null | undefined;
    metadata: Metadata | null | undefined;
} & LayerData

type LayerData = ({
    isExchange: true;
    assets: NetworkCurrency[];
    type: "cex" | "fiat",
    authorization_flow: "o_auth2" | "api_credentials" | 'none';
} | {
    isExchange: false;
    assets: NetworkCurrency[];
    type: NetworkType,
    managed_accounts: ManagedAccount[];
    nodes: NetworkNodes[];
})

export type NetworkNodes = {
    url: string;
}