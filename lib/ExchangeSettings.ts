import KnownInternalNames from "./knownIds";

export default class ExchangeSettings {
    CustomAuthorizationFlow?: "o_auth2" | "api_credentials";
    ExchangeWithdrawalPageUrl?: string;
    ExchangeApiKeyPageUrl?: string;
    ExchangeWithdrawalGuideUrl?: string;
    UserApiKeyGuideUrl?: string;
    UserWithdrawalGuideUrl?: string;
    AuthorizationNote?: string;
    WithdrawalWarningMessage?: string;
    KeyphraseDisplayName?: string;
    EstimatedTransferTime?: number;
    Order?: number;
    EnableDepositAddressConnect?: boolean;

    public static KnownSettings: { [key: string]: ExchangeSettings } = {};
    public static ForceDisable?: { [exchange: string]: { offramp: boolean, onramp: boolean } }
    
    private static _isInitialized = false;
    public static Initialize() {
        if (ExchangeSettings._isInitialized) {
            return;
        }

        ExchangeSettings._isInitialized = true;
        ExchangeSettings.ForceDisable = JSON.parse(process.env.NEXT_PUBLIC_EXCHANGE_FORCE_SETTINGS || "{}")

        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.Binance] = {
            EnableDepositAddressConnect: true,
            UserApiKeyGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/getting-api-keys/binance",
            ExchangeApiKeyPageUrl: "https://www.binance.com/en/my/settings/api-management",
            ExchangeWithdrawalPageUrl: "https://www.binance.com/en/my/wallet/account/main/withdrawal/crypto",
            ExchangeWithdrawalGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/withdrawals/binance",
            Order: 10,
        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.BinanceUS] = {
            Order: 11,
        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.Bitfinex] = {
            UserApiKeyGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/getting-api-keys/bitfinex",
            ExchangeApiKeyPageUrl: "https://setting.bitfinex.com/api",
            ExchangeWithdrawalPageUrl: "https://movement.bitfinex.com/withdraw",
            ExchangeWithdrawalGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/withdrawals/bitfinex",
            Order: 90,
        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.Bittrex] = {
            UserApiKeyGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/getting-api-keys/bittrex-global",
            ExchangeApiKeyPageUrl: "https://global.bittrex.com/Manage?view=api",
            ExchangeWithdrawalPageUrl: "https://global.bittrex.com/balance",
            ExchangeWithdrawalGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/withdrawals/bittrex-global",
            Order: 80,

        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.Blocktane] = {
            ExchangeApiKeyPageUrl: "https://trade.blocktane.io/account/security/api-keys",
            ExchangeWithdrawalPageUrl: "https://trade.blocktane.io/account/wallets",
        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.Coinbase] = {
            EnableDepositAddressConnect: true,
            ExchangeWithdrawalGuideUrl: "https://docs.layerswap.io/user-docs/your-first-swap/on-ramp/withdraw-from-coinbase",
            Order: 0,
        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.CryptoCom] = {
            UserApiKeyGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/getting-api-keys/crypto.com",
            ExchangeApiKeyPageUrl: "https://crypto.com/exchange/user/settings/api-management",
            ExchangeWithdrawalPageUrl: "https://crypto.com/exchange/",
            WithdrawalWarningMessage: "Only use Crypto.com 'Exchange' to do the transfer. Transfers done from the Crypto.com *App* will not be credited.",
            Order: 40,
        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.CryptoComApp] = {
            Order: 50,
        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.FtxCom] = {
            UserApiKeyGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/getting-api-keys/ftx.com",
            ExchangeApiKeyPageUrl: "https://ftx.com/settings/api",
            ExchangeWithdrawalPageUrl: "https://ftx.com/wallet",
            ExchangeWithdrawalGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/withdrawals/ftx.com",
        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.FtxUs] = {
        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.Huobi] = {
            ExchangeApiKeyPageUrl: "https://www.huobi.com/en-us/apikey/",
            ExchangeWithdrawalPageUrl: "https://www.huobi.com/en-us/finance/withdraw",
            UserApiKeyGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/getting-api-keys/huobi-global",
            ExchangeWithdrawalGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/withdrawals/huobi-global",
            Order: 70,
        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.Kraken] = {
            AuthorizationNote: "When generating the API keys, make sure that the 'Query Ledger Entries' key permission is checked.",
            ExchangeWithdrawalPageUrl: "https://www.kraken.com/u/funding/withdraw",
            UserApiKeyGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/getting-api-keys/kraken",
            ExchangeApiKeyPageUrl: "https://www.kraken.com/u/security/api",
            ExchangeWithdrawalGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/withdrawals/kraken",
            Order: 30,

        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.Kucoin] = {
            ExchangeWithdrawalPageUrl: "https://www.kucoin.com/assets/withdraw",
            ExchangeApiKeyPageUrl: "https://www.kucoin.com/account/api",
            KeyphraseDisplayName: "Passphrase",
            CustomAuthorizationFlow: "api_credentials",
            ExchangeWithdrawalGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/withdrawals/kucoin",
            Order: 20,
        };
        ExchangeSettings.KnownSettings[KnownInternalNames.Exchanges.Okex] = {
            UserApiKeyGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/getting-api-keys/okx",
            KeyphraseDisplayName: "Passphrase",
            ExchangeApiKeyPageUrl: "https://www.okx.com/account/my-api",
            ExchangeWithdrawalPageUrl: "https://www.okx.com/balance/withdrawal",
            ExchangeWithdrawalGuideUrl: "https://docs.layerswap.io/user-docs/using-layerswap/withdrawals/okx",
            Order: 60,
        };
    }
}

ExchangeSettings.Initialize();
