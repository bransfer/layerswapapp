import { SwapStatus } from "../Models/SwapStatus";
import AppSettings from "./AppSettings";
import { InitializeUnauthInstance, InitializeAuthInstance } from "./axiosInterceptor"
import { v4 as uuidv4 } from 'uuid';
import { AxiosInstance, Method } from "axios";
import { AuthRefreshFailedError } from "./Errors/AuthRefreshFailedError";
import { ApiResponse, EmptyApiResponse } from "../Models/ApiResponse";
import LayerSwapAuthApiClient from "./userAuthApiClient";
import { NetworkWithTokens, Network, Token } from "../Models/Network";
import { Exchange } from "../Models/Exchange";
import { datadogRum } from '@datadog/browser-rum';

export default class LayerSwapApiClient {
    static apiBaseEndpoint?: string = AppSettings.LayerswapApiUri;
    static bridgeApiBaseEndpoint?: string = AppSettings.LayerswapBridgeApiUri;
    static apiKey: string | undefined;

    _authInterceptor: AxiosInstance;
    _unauthInterceptor: AxiosInstance
    constructor() {
        this._authInterceptor = InitializeAuthInstance(LayerSwapAuthApiClient.identityBaseEndpoint);
        this._unauthInterceptor = InitializeUnauthInstance(LayerSwapApiClient.apiBaseEndpoint)
    }

    fetcher = (url: string) => this.AuthenticatedRequest<ApiResponse<any>>("GET", url)

    async GetRoutesAsync(direction: 'sources' | 'destinations'): Promise<ApiResponse<NetworkWithTokens[]>> {
        return await this.UnauthenticatedRequest<ApiResponse<NetworkWithTokens[]>>("GET", `/${direction}?include_unmatched=true&include_swaps=true&include_unavailable=true`)
    }

    async GetSourceExchangesAsync(): Promise<ApiResponse<Exchange[]>> {
        return await this.UnauthenticatedRequest<ApiResponse<Exchange[]>>("GET", `/source_exchanges`);
    }
    async GetDestinationExchangesAsync(): Promise<ApiResponse<Exchange[]>> {
        return await this.UnauthenticatedRequest<ApiResponse<Exchange[]>>("GET", `/destination_exchanges`);
    }

    async GetLSNetworksAsync(): Promise<ApiResponse<NetworkWithTokens[]>> {
        return await this.UnauthenticatedRequest<ApiResponse<NetworkWithTokens[]>>("GET", `/networks`);
    }

    async AddLockSig(params: AddLockSig, commit_id: string): Promise<ApiResponse<{}>> {
        return await this.AuthenticatedRequest<ApiResponse<SwapResponse>>("POST", `/swap/${commit_id}/add_lock_sig`, params);
    }

    async CreateSwapAsync(params: CreateSwapParams): Promise<ApiResponse<SwapResponse>> {
        const correlationId = uuidv4()
        return await this.AuthenticatedRequest<ApiResponse<SwapResponse>>("POST", `/swaps`, params, { 'X-LS-CORRELATION-ID': correlationId });
    }

    async GetSwapsAsync(page: number, include_expired: boolean): Promise<ApiResponse<SwapResponse[]>> {
        return await this.AuthenticatedRequest<ApiResponse<SwapResponse[]>>("GET", `/internal/swaps?page=${page}&include_expired=${include_expired}`);
    }

    async GetQuote({ params }: { params: GetQuoteParams }): Promise<ApiResponse<Quote>> {
        const { source_network, source_token, source_address, destination_token, destination_network, amount, use_deposit_address, include_gas, refuel } = params
        return await this.AuthenticatedRequest<ApiResponse<Quote>>("GET", `/quote?source_network=${source_network}&source_token=${source_token}&source_address=${source_address}&destination_network=${destination_network}&destination_token=${destination_token}&use_deposit_address=${use_deposit_address}&include_gas=${include_gas}&amount=${amount}&refuel=${refuel}`);
    }

    async DisconnectExchangeAsync(swapid: string, exchangeName: string): Promise<ApiResponse<void>> {
        return await this.AuthenticatedRequest<ApiResponse<void>>("DELETE", `/internal/swaps/${swapid}/exchange/${exchangeName}/disconnect`);
    }

    async GetSwapDetailsAsync(id: string): Promise<ApiResponse<SwapResponse>> {
        return await this.AuthenticatedRequest<ApiResponse<SwapResponse>>("GET", `/swaps/${id}`);
    }

    async GetDepositAddress(network: string, source: DepositAddressSource): Promise<ApiResponse<DepositAddress>> {
        return await this.AuthenticatedRequest<ApiResponse<DepositAddress>>("GET", `/internal/swaps?network=${network}&source=${source}`);
    }

    async WithdrawFromExchange(swapId: string, exchange: string, twoFactorCode?: string): Promise<ApiResponse<void>> {
        return await this.AuthenticatedRequest<ApiResponse<void>>("POST", `/internal/swaps/${swapId}/exchange/${exchange}/withdraw${twoFactorCode ? `?twoFactorCode=${twoFactorCode}` : ''}`);
    }

    async SwapsMigration(GuestAuthorization: string): Promise<ApiResponse<void>> {
        return await this.AuthenticatedRequest<ApiResponse<void>>("POST", `/internal/swaps/migrate`, null, { GuestAuthorization });
    }

    async GetTransactionStatus(network: string, tx_id: string): Promise<ApiResponse<any>> {
        return await this.AuthenticatedRequest<ApiResponse<any>>("POST", `/internal/networks/${network}/transaction_status`, { transaction_id: tx_id });
    }

    private async AuthenticatedRequest<T extends EmptyApiResponse>(method: Method, endpoint: string, data?: any, header?: {}): Promise<T> {
        let uri = LayerSwapApiClient.apiBaseEndpoint + "/api" + endpoint;
        return await this._authInterceptor(uri, { method: method, data: data, headers: { 'Access-Control-Allow-Origin': '*', ...(header ? header : {}) } })
            .then(res => {
                return res?.data;
            })
            .catch(async reason => {
                if (reason instanceof AuthRefreshFailedError) {
                    return Promise.resolve(new EmptyApiResponse());
                }
                else {
                    const renderingError = new Error(`API request error with uri:${uri}`);
                    renderingError.name = `APIError`;
                    renderingError.cause = reason;
                    datadogRum.addError(renderingError);
                    return Promise.reject(reason);
                }
            });
    }

    private async UnauthenticatedRequest<T extends EmptyApiResponse>(method: Method, endpoint: string, data?: any, header?: {}): Promise<T> {
        let uri = LayerSwapApiClient.apiBaseEndpoint + "/api" + endpoint;
        return await this._unauthInterceptor(uri, { method: method, data: data, headers: { 'Access-Control-Allow-Origin': '*', ...(header ? header : {}) } })
            .then(res => {
                return res?.data;
            })
            .catch(async reason => {
                if (reason instanceof AuthRefreshFailedError) {
                    return Promise.resolve(new EmptyApiResponse());
                }
                else {
                    return Promise.reject(reason);
                }
            });
    }
}

export type AddLockSig = {
    r: string
    s: string
    v: string
    signer_address: string,
    signature: string
    timelock: number
}

export type CommitFromApi = {
    source_netowrk: string,
    source_asset: string,
    destination_network: string,
    destination_asset: string,
    destination_address: string,
    liquidity_provider_address: string,
    locked_amount: number,
    receive_amount: number,
    fee_amount: number,
    transactions: {
        type: 'lock' | 'redeem' | 'addlocksig',
        hash: string,
        network: string
    }[]
}

export type DepositAddress = {
    type: string
    address: `0x${string}`;
}

export enum DepositAddressSource {
    UserGenerated = 0,
    Managed = 1
}

export type CreateSwapParams = {
    source_network: string,
    source_token: string,
    destination_network: string,
    destination_token: string
    refuel?: boolean,
    slippage?: number,
    destination_address: string,
    source_address?: string
    amount: string,
    reference_id?: string,
    source_exchange?: string
    destination_exchange?: string
    use_deposit_address: boolean
    app_name?: string,
}

export type SwapResponse = {
    swap: SwapItem;
    quote: SwapQuote
    refuel?: Refuel,
}

export type Refuel = {
    network: Network
    token: Token,
    amount: number,
    amount_in_usd: number
}

export type SwapItem = {
    id: string,
    created_date: string,
    source_network: Network,
    source_token: Token,
    source_exchange?: Exchange,
    destination_network: Network,
    destination_token: Token,
    destination_exchange?: Exchange,
    status: SwapStatus,
    source_address: `0x${string}`,
    destination_address: `0x${string}`,
    requested_amount: number,
    use_deposit_address: boolean
    transactions: Transaction[]
    exchange_account_connected: boolean;
    exchange_account_name?: string;
    fail_reason?: string;
    metadata: {
        reference_id: string | null;
        app: string | null;
        sequence_number: number
    }
}

export type DepositAction = {
    amount: number,
    amount_in_base_units: string,
    call_data: `0x${string}` | string,
    fee: any | null,//TODO: clarify this field type
    network: Network,
    order: number,
    to_address?: `0x${string}`,
    token: Token,
    fee_token: Token,
    type: 'transfer' | 'manual_transfer',
}

export type Quote = {
    quote?: SwapQuote,
    refuel?: Refuel,
    reward?: QuoteReward
}

export type QuoteReward = {
    amount: number,
    amount_in_usd: number,
    token: Token,
    network: Network
}

export type GetQuoteParams = {
    source_network: string,
    source_token: string,
    source_address?: string,
    destination_network: string,
    destination_token: string,
    destination_address: string,
    use_deposit_address: boolean,
    include_gas?: boolean,
    amount: number,
    refuel?: boolean
}

export type SwapQuote = {
    source_network?: Network,
    source_token?: Token,
    destination_network?: Network,
    destination_token?: Token,
    receive_amount: number,
    min_receive_amount: number,
    total_fee: number,
    total_fee_in_usd: number,
    blockchain_fee: number,
    service_fee: number,
    avg_completion_time: string,
    refuel_in_source?: number,
}

export type AddressBookItem = {
    address: string,
    date: string,
    networks: string[],
    exchanges: string[]
}

export type Transaction = {
    type: TransactionType,
    from: string,
    to: string,
    created_date: string,
    amount: number,
    transaction_hash: string,
    confirmations: number,
    max_confirmations: number,
    usd_value: number,
    usd_price: number,
    status: BackendTransactionStatus,
    fee_amount?: number | null,
    fee_token?: Token,
    timestamp?: string,
}

export enum TransactionType {
    Input = 'input',
    Output = 'output',
    Refuel = 'refuel'
}

export enum BackendTransactionStatus {
    Completed = 'completed',
    Failed = 'failed',
    Initiated = 'initiated',
    Pending = 'pending'
}

export enum TransactionStatus {
    Completed = 'completed',
    Failed = 'failed',
    Pending = 'pending'
}

export enum DepositType {
    Manual = 'manual',
    Wallet = 'wallet'
}

export type Fee = {
    min_amount: number,
    max_amount: number,
    fee_amount: number,
    deposit_type: DepositType
}

export type PublishedSwapTransactions = {
    state: {
        swapTransactions: {
            [key: string]: SwapTransaction
        }
    }
}


export type SwapTransaction = {
    hash: string,
    status: BackendTransactionStatus
}

export enum SwapType {
    OnRamp = "cex_to_network",
    OffRamp = "network_to_cex",
    CrossChain = "network_to_network"
}

export enum WithdrawType {
    Wallet = 'wallet',
    Manually = 'manually',
    Stripe = 'stripe',
    Coinbase = 'coinbase',
    External = 'external'
}

export enum SwapStatusInNumbers {
    Pending = 0,
    Completed = 1,
    Failed = 2,
    Expired = 3,
    Delayed = 4,
    Cancelled = 5,
    SwapsWithoutCancelledAndExpired = '0&status=1&status=2&status=3&status=4'
}

export type Campaign = {
    id: number,
    name: string,
    display_name: string,
    token: Token,
    network: Network,
    percentage: number,
    start_date: string,
    end_date: string,
    min_payout_amount: number,
    total_budget: number,
    distributed_amount: number,
    reward_limit_period: number,
}

export type Reward = {
    user_reward: {
        period_pending_amount: number,
        total_amount: number,
        total_amount_in_usd: number
        total_pending_amount: number,
        position: number
    },
    next_airdrop_date: string | Date,
}

export type Leaderboard = {
    leaderboard: {
        address: string,
        amount: number,
        position: number
    }[],
    leaderboard_budget: number
}

export type RewardPayout = {
    date: string,
    transaction_id: string,
    amount: number
}