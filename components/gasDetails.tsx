import useWallet from "../hooks/useWallet"
import useSWRGas from "../lib/newgases/useSWRGas"
import { Network, Token } from "../Models/Network"

const GasDetails = ({ network, currency }: {  network: Network | undefined, currency: Token }) => {
    const { getSourceProvider } = useWallet()

    const provider = network && getSourceProvider(network)
    const wallet = provider?.getConnectedWallet()

    const { gas } = useSWRGas(wallet?.address, network, currency)
    const networkGas = gas?.find(g => g?.token === currency)
debugger
    if (!networkGas?.gasDetails) return

    return (
        <div className='grid grid-cols-1 gap-2 px-3 py-2 rounded-lg border-2 border-secondary-500 bg-secondary-800 mt-2 w-[350px] fixed top-0 left-2'>
            <div className="flex flex-row items-baseline justify-between">
                <label className="block text-left text-primary-text-placeholder">
                    Gas limit
                </label>
                <span className="text-right">
                    {
                        networkGas.gasDetails?.gasLimit
                    }
                </span>
            </div>
            <div className="flex flex-row items-baseline justify-between">
                <label className="block text-left text-primary-text-placeholder">
                    Gas price
                </label>
                <span className="text-right">
                    {
                        networkGas.gasDetails?.gasPrice
                    }
                </span>
            </div>
            <div className="flex flex-row items-baseline justify-between">
                <label className="block text-left text-primary-text-placeholder">
                    Max fee per gas
                </label>
                <span className="text-right">
                    {
                        networkGas.gasDetails?.maxFeePerGas
                    }
                </span>
            </div>
            <div className="flex flex-row items-baseline justify-between">
                <label className="block text-left text-primary-text-placeholder">
                    Max priority fee per gas
                </label>
                <span className="text-right">
                    {
                        networkGas.gasDetails?.maxPriorityFeePerGas
                    }
                </span>
            </div>
        </div>
    )
}

export default GasDetails