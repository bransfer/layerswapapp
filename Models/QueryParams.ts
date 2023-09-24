///Doe to typechecking please always set default values in this class
export class QueryParams {
    coinbase_redirect?: string = "";
    send_limit_amount?: string = "";
    from?: string = "";
    to?: string = "";
    lockAddress?: boolean = false;
    lockFrom?: boolean = false;
    lockTo?: boolean = false;
    lockAsset?: boolean = false;
    destAddress?: string = "";
    addressSource?: string = "";
    hideRefuel?: boolean = false;
    hideAddress?: boolean = false;
    hideFrom?: boolean = false;
    hideTo?: boolean = false;
    asset?: string = "";
    amount?: string = "";
    externalId?: string = ""
    signature?: string = "";
    timestamp?: string = "";
    apiKey?: string = "";
    balances?: string = null;
    account?: string = "";
    actionButtonText?: string = "";
    
    // Obsolate
    sourceExchangeName?: string = "";
    destNetwork?: string = "";
    lockNetwork?: boolean = false;
    lockExchange?: boolean = false;
}