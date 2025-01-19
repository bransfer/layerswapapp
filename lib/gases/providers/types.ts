import { GasProps } from "../../../Models/Balance"
import { Network } from "../../../Models/Network"

export interface Provider {
    supportsNetwork(network: Network): boolean,
    getGas(args: GasProps): Promise<number | undefined>
}
