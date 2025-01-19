import { Network } from "../../../Models/Network";
import KnownInternalNames from "../../knownIds";
import { Provider } from "./types";

export class TonGasProvider implements Provider {
    supportsNetwork(network: Network): boolean {
        return KnownInternalNames.Networks.TONMainnet.includes(network.name)
    }

    async getGas({address: string, network: Network, token: Token}): Promise<any> {
        return undefined;
    }
}