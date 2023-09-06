import { CryptoNetwork } from "./CryptoNetwork";
import { Currency } from "./Currency";
import { Exchange } from "./Exchange";

export class LayerSwapSettings {
    exchanges: Exchange[];
    networks: CryptoNetwork[];
    currencies: Currency[];
    discovery: {
        identity_url: string;
        resource_storage_url: string;
        o_auth_providers: OauthProveider[]
    }
    validSignatureisPresent?: boolean;
};

type OauthProveider = {
    provider: string,
    oauth_connect_url: string,
    oauth_authorize_url: string
}