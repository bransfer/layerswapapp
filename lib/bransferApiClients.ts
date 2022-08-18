import AppSettings from "./AppSettings"
import authInterceptor from "./axiosInterceptor"


export class BransferApiClient {
    static apiBaseEndpoint: string = AppSettings.BransferApiUri;

    async GetExchangeAccounts(token: string): Promise<UserExchangesResponse> {
        return await authInterceptor.get(BransferApiClient.apiBaseEndpoint + '/api/exchange_accounts')
            .then(res => res.data)
    }
    async GetExchangeDepositAddress(exchange: string, currency: string, token: string): Promise<ExchangeDepositAddressReponse> {
        return await authInterceptor.get(BransferApiClient.apiBaseEndpoint + `/api/exchange_accounts/${exchange}/deposit_address/${currency}`,
            { headers: { 'Access-Control-Allow-Origin': '*', Authorization: `Bearer ${token}` } })
            .then(res => res.data)
    }
    async DeleteExchange(exchange: string, token: string): Promise<ConnectResponse> {
        return await authInterceptor.delete(BransferApiClient.apiBaseEndpoint + `/api/exchange_accounts/${exchange}`,
            { headers: { 'Access-Control-Allow-Origin': '*', Authorization: `Bearer ${token}` } })
            .then(res => res.data)
    }
    async ConnectExchangeApiKeys(params: ConnectParams, token: string): Promise<ConnectResponse> {
        return await authInterceptor.post(BransferApiClient.apiBaseEndpoint + '/api/exchange_accounts',
            params,
            { headers: { 'Access-Control-Allow-Origin': '*', Authorization: `Bearer ${token}` } })
            .then(res => res.data)
    }
    async ProcessPayment(id: string, token: string, twoFactorCode?: string): Promise<PaymentProcessreponse> {
        return await authInterceptor.post(BransferApiClient.apiBaseEndpoint + `/api/payments/${id}/process${twoFactorCode ? `?twoFactor=${twoFactorCode}` : ''}`,
            { headers: { 'Access-Control-Allow-Origin': '*', Authorization: `Bearer ${token}` } })
            .then(res => res.data)
    }

}

export type PaymentProcessreponse = {
    is_success: boolean,
    request_id: string,
    errors: string
}

export type ExchangeDepositAddressReponse = {
    data: string,
    is_success: boolean,
    errors: [
        {
            code: string,
            message: string
        }
    ]
}


export type ConnectParams = {
    api_key: string,
    api_secret: string,
    keyphrase?: string,
    exchange: string
}

export type ConnectResponse = {
    is_success: boolean,
    request_id: string,
    errors: [
        {
            code: string,
            message: string
        }
    ]
}


export interface UserExchangesResponse {
    data: [
        {
            exchange: string,
            is_enabled: boolean,
            note: string
        }
    ],
    is_success: boolean,
    request_id: string,
    errors: string
}
