import useSWR from "swr"
import { Network, Token } from "../../Models/Network"
import { GasResolver } from "./gasResolver"

//TODO: Add type for address
const useSWRGas = (address: any, network: Network | undefined, token?: Token) => {

    const { data: gasData, error: gasError, isLoading } = useSWR((network && address) ? `/gases/${address}/${network.name}/${token?.symbol}` : null, () => {
        if (!network || !token || !address) return
        return new GasResolver().getGas({ address, network, token })
    }, { refreshInterval: 60000 })

    return {
        gas: gasData,
        isGasLoading: isLoading,
        gasError: gasError
    }
}

export default useSWRGas