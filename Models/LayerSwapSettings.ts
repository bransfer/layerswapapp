import { BlacklistedAddress } from "./BlacklistedAddress";
import { CryptoNetwork } from "./CryptoNetwork";
import { Currency } from "./Currency";
import { Exchange } from "./Exchange";
import { Partner } from "./Partner";


export class LayerSwapSettings {
    data: {
        exchanges: Exchange[];
        networks: CryptoNetwork[];
        currencies: Currency[];
        partners: Partner[];
        blacklisted_addresses: BlacklistedAddress[];
        discovery: {
            identity_url: string;
            resource_storage_url: string;
        }
    }
    validSignatureisPresent?: boolean;
};
