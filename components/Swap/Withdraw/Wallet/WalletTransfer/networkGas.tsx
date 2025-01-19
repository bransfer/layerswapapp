import { FC } from "react"
import { Network, Token } from "../../../../../Models/Network"
import { Fuel } from "lucide-react"
import useSWRGas from "../../../../../lib/gases/useSWRGas"

type NetworkGasProps = {
    address: string,
    network: Network,
    token: Token,
}
const NetworkGas: FC<NetworkGasProps> = ({ address, token, network }) => {

    const { gas: networkGas, isGasLoading } = useSWRGas(address, network, token)

    if (networkGas == undefined)
        return <></>

    return <div className="flex flex-row items-center gap-1 w-full text-sm px-1 mb-2.5 justify-end">
        <Fuel className="h-4 w-4 text-secondary-text" />
        <p className="text-secondary-text">Estimated gas:</p>
        <div className="text-right flex items-center gap-1">
            {isGasLoading ? <div className='h-[10px] w-10 bg-gray-500 rounded-sm animate-pulse' /> : networkGas?.toFixed(networkGas == 0 ? 0 : token.precision || 0)} <span>{token?.symbol}</span>
        </div>
    </div>
}

export default NetworkGas