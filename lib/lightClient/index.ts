import { Network, Token } from "../../Models/Network"
import EVMLightClient from "./providers/evm"
import StarknetLightClient from "./providers/starknet"

export default class LightClient {
    private providers = [
        new EVMLightClient(),
        new StarknetLightClient()
    ]

    initProvider = async ({ network }: { network: Network }) => {
        const provider = this.providers.find(p => p.supportsNetwork(network));

        if (!provider) throw new Error(`No light client provider found for network ${network.name}`);

        return provider.init({ network })
    }

    getHashlock = async ({ network, token, commitId, atomicContract }: { network: Network, token: Token, commitId: string, atomicContract: string }) => {
        const provider = this.providers.find(p => p.supportsNetwork(network));

        if (!provider) throw new Error(`No light client provider found for network ${network.name}`);

        return provider.getDetails({
            network,
            token,
            commitId,
            atomicContract
        })
    }

}