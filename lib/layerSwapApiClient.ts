import { LayerSwapSettings } from "../Models/LayerSwapSettings";
import { SwapStatus } from "../Models/SwapStatus";
import AppSettings from "./AppSettings";
import { InitializeInstance } from "./axiosInterceptor"
import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosInstance, Method } from "axios";
import { NextRouter } from "next/router";
import { AuthRefreshFailedError } from "./Errors/AuthRefreshFailedError";
import { ApiResponse, EmptyApiResponse } from "../Models/ApiResponse";
import LayerSwapAuthApiClient from "./userAuthApiClient";
import { CryptoNetwork } from "../Models/CryptoNetwork";
import { Exchange } from "../Models/Exchange";

export default class LayerSwapApiClient {
    static apiBaseEndpoint?: string = AppSettings.LayerswapApiUri;
    static apiVersion: string = AppSettings.ApiVersion;

    _authInterceptor: AxiosInstance;
    constructor(private readonly _router?: NextRouter, private readonly _redirect?: string) {
        this._authInterceptor = InitializeInstance(LayerSwapAuthApiClient.identityBaseEndpoint);
    }

    fetcher = (url: string) => this.AuthenticatedRequest<ApiResponse<any>>("GET", url)

    async GetSourceRoutesAsync(): Promise<ApiResponse<{
        network: string;
        asset: string;
    }[]>> {
        return await axios.get(`${LayerSwapApiClient.apiBaseEndpoint}/api/routes/sources?version=${LayerSwapApiClient.apiVersion}`).then(res => res.data);
    }

    async GetDestinationRoutesAsync(): Promise<ApiResponse<{
        network: string;
        asset: string;
    }[]>> {
        return await axios.get(`${LayerSwapApiClient.apiBaseEndpoint}/api/routes/destinations?version=${LayerSwapApiClient.apiVersion}`).then(res => res.data);
    }

    async GetExchangesAsync(): Promise<ApiResponse<Exchange[]>> {
        return await axios.get(`${LayerSwapApiClient.apiBaseEndpoint}/api/exchanges?version=${LayerSwapApiClient.apiVersion}`).then(res => res.data);
    }

    async GetSettingsAsync(): Promise<ApiResponse<LayerSwapSettings>> {
        return await axios.get(`${LayerSwapApiClient.apiBaseEndpoint}/api/settings?version=${LayerSwapApiClient.apiVersion}`).then(res => res.data);
    }

    async GetLSNetworksAsync(): Promise<ApiResponse<CryptoNetwork[]>> {
        return await axios.get(`${LayerSwapApiClient.apiBaseEndpoint}/api/networks?version=${LayerSwapApiClient.apiVersion}`).then(res => res.data);
    }

    async CreateSwapAsync(params: CreateSwapParams): Promise<ApiResponse<CreateSwapData>> {
        const correlationId = uuidv4()
        return await this.AuthenticatedRequest<ApiResponse<CreateSwapData>>("POST", `/swaps?version=${LayerSwapApiClient.apiVersion}`, params, { 'X-LS-CORRELATION-ID': correlationId });
    }

    async GetSwapsAsync(page: number, status?: SwapStatusInNumbers): Promise<ApiResponse<SwapItem[]>> {
        return await this.AuthenticatedRequest<ApiResponse<SwapItem[]>>("GET", `/swaps?page=${page}${status ? `&status=${status}` : ''}&version=${LayerSwapApiClient.apiVersion}`);
    }

    async GetPendingSwapsAsync(): Promise<ApiResponse<SwapItem[]>> {
        return await this.AuthenticatedRequest<ApiResponse<SwapItem[]>>("GET", `/swaps?status=0&version=${LayerSwapApiClient.apiVersion}`);
    }

    async CancelSwapAsync(swapid: string): Promise<ApiResponse<void>> {
        return await this.AuthenticatedRequest<ApiResponse<void>>("DELETE", `/swaps/${swapid}`);
    }

    async DisconnectExchangeAsync(swapid: string, exchangeName: string): Promise<ApiResponse<void>> {
        return await this.AuthenticatedRequest<ApiResponse<void>>("DELETE", `/swaps/${swapid}/exchange/${exchangeName}/disconnect`);
    }

    async GetSwapDetailsAsync(id: string): Promise<ApiResponse<SwapItem>> {
        return await this.AuthenticatedRequest<ApiResponse<SwapItem>>("GET", `/swaps/${id}?version=${LayerSwapApiClient.apiVersion}`);
    }

    async GetDepositAddress(network: string, source: DepositAddressSource): Promise<ApiResponse<DepositAddress>> {
        return await this.AuthenticatedRequest<ApiResponse<DepositAddress>>("GET", `/swaps?network=${network}&source=${source}`);
    }

    async GenerateDepositAddress(network: string): Promise<ApiResponse<DepositAddress>> {
        return await this.AuthenticatedRequest<ApiResponse<any>>("POST", `/networks/${network}/deposit_addresses`);
    }

    async WithdrawFromExchange(swapId: string, exchange: string, twoFactorCode?: string): Promise<ApiResponse<void>> {
        return await this.AuthenticatedRequest<ApiResponse<void>>("POST", `/swaps/${swapId}/exchange/${exchange}/withdraw${twoFactorCode ? `?twoFactorCode=${twoFactorCode}` : ''}`);
    }

    async SwapsMigration(GuestAuthorization: string): Promise<ApiResponse<void>> {
        return await this.AuthenticatedRequest<ApiResponse<void>>("POST", `/swaps/migrate`, null, { GuestAuthorization });
    }

    async RewardLeaderboard(campaign: string): Promise<ApiResponse<any>> {
        return await this.AuthenticatedRequest<ApiResponse<any>>("PUT", `/campaigns/${campaign}/leaderboard`);
    }

    async GetFee(params: GetFeeParams): Promise<ApiResponse<any>> {
        return await this.AuthenticatedRequest<ApiResponse<any>>("POST", `/swaps/quote?version=${LayerSwapApiClient.apiVersion}`, params);
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
                    return Promise.reject(reason);
                }
            });
    }
}

export type DepositAddress = {
    type: string
    address: `0x${string}`;
}

export enum DepositAddressSource {
    UserGenerated = 0,
    Managed = 1
}

type NetworkAccountParams = {
    address: string,
    network: string,
    signature: string
}

export type NetworkAccount = {
    id: string,
    address: string,
    note: string,
    network_id: string,
    network: string
}

export type CreateSwapParams = {
    amount: string,
    source: string,
    destination: string,
    source_asset: string,
    destination_asset: string
    source_exchange?: string
    destination_exchange?: string
    destination_address: string,
    app_name?: string,
    reference_id?: string,
    refuel?: boolean,
}

export type SwapItem = {
    id: string,
    created_date: string,
    fee: number,
    status: SwapStatus,
    destination_address: `0x${string}`,
    requested_amount: number,
    message?: string,
    reference_id?: string,
    app_name?: string,
    refuel_price?: number,
    refuel_transaction_id?: string,
    source_network_asset: string,
    source_network: string,
    source_exchange?: string,
    destination_network_asset: string,
    destination_network: string,
    destination_exchange?: string,
    transactions: Transaction[]
    has_refuel?: boolean,
    exchange_account_connected: boolean;
    exchange_account_name?: string;
    fiat_session_id?: string;
    fiat_redirect_url?: string;
    has_pending_deposit: boolean;
    sequence_number: number;
    fail_reason?: string;
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
    transaction_id: string,
    confirmations: number,
    max_confirmations: number,
    usd_value: number,
    usd_price: number,
    status: TransactionStatus,
}

export enum TransactionType {
    Input = 'input',
    Output = 'output',
    Refuel = 'refuel'
}

export enum TransactionStatus {
    Completed = 'completed',
    Initiated = 'initiated',
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

type GetFeeParams = {
    source: string,
    destination: string,
    asset: string,
    refuel?: boolean
}

export enum PublishedSwapTransactionStatus {
    Pending,
    Error,
    Completed
}

export type PublishedSwapTransactions = {
    [key: string]: SwapTransaction
}


export type SwapTransaction = {
    hash: string,
    status: PublishedSwapTransactionStatus
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
export type ConnectParams = {
    api_key: string,
    api_secret: string,
    keyphrase?: string,
    exchange: string
}

export type CreateSwapData = {
    swap_id: string
}

export enum SwapStatusInNumbers {
    Pending = 0,
    Completed = 1,
    Failed = 2,
    Expired = 3,
    Delayed = 4,
    Cancelled = 5,
    SwapsWithoutCancelledAndExpired = '0&status=1&status=2&status=4'
}

export type Campaign = {
    id: number,
    name: string,
    display_name: string,
    asset: string,
    network: string,
    percentage: number,
    start_date: string,
    end_date: string,
    min_payout_amount: number,
    total_budget: number,
    distributed_amount: number,
    status: 'active' | 'inactive'
}

export type Reward = {
    user_reward: {
        period_pending_amount: number,
        total_amount: number,
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