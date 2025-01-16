import { Balance } from "../../../Models/Balance";
import { NetworkWithTokens } from "../../../Models/Network";
import { checkStorageIsAvailable } from "../../../helpers/storageAvailable";
import KnownInternalNames from "../../knownIds";
import * as Paradex from "../../wallets/paradex/lib";
import { LOCAL_STORAGE_KEY } from "../../wallets/paradex/lib/constants";

export class ParadexBalanceProvider {
    supportsNetwork(network: NetworkWithTokens): boolean {
        return KnownInternalNames.Networks.ParadexMainnet.includes(network.name) || KnownInternalNames.Networks.ParadexTestnet.includes(network.name)
    }

    fetchBalance = async (address: string, network: NetworkWithTokens) => {

        try {
            const paradexAccounts = checkStorageIsAvailable("localStorage") && window.localStorage?.getItem(LOCAL_STORAGE_KEY);
            const paradexAddress = paradexAccounts && JSON.parse(paradexAccounts)[address.toLowerCase()]
            if (!network?.tokens || !paradexAddress) return

            const environment = process.env.NEXT_PUBLIC_API_VERSION === 'sandbox' ? 'testnet' : 'prod'
            const config = await Paradex.Config.fetchConfig(environment);

            const paraclearProvider = new Paradex.ParaclearProvider.DefaultProvider(config);

            const result: Balance[] = []

            for (const token of network.tokens) {

                const getBalanceResult = await Paradex.Paraclear.getTokenBalance({
                    provider: paraclearProvider, //account can be passed as the provider
                    config,
                    account: { address: paradexAddress },
                    token: token.symbol,
                });
                const balance = {
                    network: network.name,
                    token: token.symbol,
                    amount: Number(getBalanceResult.size),
                    request_time: new Date().toJSON(),
                    decimals: Number(token?.decimals),
                    isNativeCurrency: false
                }
                result.push(balance)
            }

            return result
        }
        catch (e) {
            console.log(e)
            throw e
        }
    }
}