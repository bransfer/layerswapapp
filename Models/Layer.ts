import { ManagedAccount, Metadata, Token, NetworkType } from "./Network";

export type LayerStatus = "active" | "inactive" | 'insufficient_liquidity';
export type Layer = {
    display_name: string;
    internal_name: string;
    is_featured: boolean;
    created_date: string;   
    img_url: string;
    metadata: Metadata | null | undefined;
    assets: Token[];
    chain_id: string | null | undefined;
    transaction_explorer_template: string | null
    account_explorer_template: string,
    type: NetworkType,
    managed_accounts: ManagedAccount[];
    nodes: NetworkNodes[];
}

export type NetworkNodes = {
    url: string;
}