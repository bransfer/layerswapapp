import { CurrencyDetails } from "./Currency";

export class CryptoNetwork {
    id: string;
    display_name: string;
    order: number;
    logo: string;
    internal_name: string;
    is_default: boolean;
    transaction_explorer_template: string;
    account_explorer_template: string;
    chain_id: number;
    status: "active" | "inactive" | string;
    currencies: CurrencyDetails[];
    fee_in_usd: number;
}
