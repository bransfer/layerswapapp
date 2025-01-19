import { Network, Token } from "../../../Models/Network";
import { Commit } from "../../../Models/PHTLC";

export default abstract class _LightClient {
    abstract supportsNetwork: (network: Network) => boolean
    abstract getDetails({ network, token, commitId, atomicContract }: { network: Network, token: Token, commitId: string, atomicContract: string }): Promise<Commit | undefined>
    abstract init({ network }: { network: Network }): Promise<{ initialized: boolean } | undefined>
}