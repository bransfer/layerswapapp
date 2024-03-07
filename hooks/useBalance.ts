import { Layer } from "../Models/Layer"
import useEVMBalance from "../lib/balances/evm/useEVMBalance"
import useLoopringBalance from "../lib/balances/loopring/useLoopringBalance"
import useOptimismBalance from "../lib/balances/evm/optimism/useOptimismBalance"
import useStarknetBalance from "../lib/balances/starknet/useStarknetBalance"
import useZkSyncBalance from "../lib/balances/zksync/useZkSyncBalance"
import useSolanaBalance from "../lib/balances/solana/useSolanaBalance"
import useImxBalance from "../lib/balances/immutableX/useIMXBalances"
import { BalanceProvider } from "../Models/Balance"
import useWallet from "./useWallet"
import { useBalancesState, useBalancesUpdate } from "../context/balances"
import { NetworkCurrency } from "../Models/CryptoNetwork"
import useQueryBalances from "../lib/balances/query/useQueryBalances"
import { useQueryState } from "../context/query"

export default function useBalanceProvider() {

    const BalanceProviders: BalanceProvider[] = [
        useQueryBalances(),
        useEVMBalance(),
        useOptimismBalance(),
        useStarknetBalance(),
        useLoopringBalance(),
        useZkSyncBalance(),
        useSolanaBalance(),
        useImxBalance()
    ]

    const { balances, gases } = useBalancesState()
    const query = useQueryState()

    const {
        setIsBalanceLoading,
        setAllBalances,
        setIsGasLoading,
        setAllGases
    } = useBalancesUpdate()

    const { getAutofillProvider, wallets } = useWallet()

    const fetchBalance = async (network: Layer) => {
        const provider = getAutofillProvider(network)
        const wallet = provider?.getConnectedWallet()
        const address = query.account || wallet?.address

        const balance = balances[address || '']?.find(b => b?.network === network?.internal_name)
        const isBalanceOutDated = !balance || new Date().getTime() - (new Date(balance.request_time).getTime() || 0) > 10000

        if (network
            && isBalanceOutDated
            && address) {
            setIsBalanceLoading(true)

            const walletBalances = balances[address]
            const filteredBalances = walletBalances?.some(b => b?.network === network?.internal_name) ? walletBalances?.filter(b => b?.network !== network.internal_name) : walletBalances || []

            const provider = getBalanceProvider(network)
            const ercAndNativeBalances = await provider?.getBalance({
                layer: network,
                address: address
            }) || []

            setAllBalances((data) => ({ ...data, [address]: filteredBalances?.concat(ercAndNativeBalances) }))
            setIsBalanceLoading(false)
        }
    }

    const fetchGas = async (network: Layer, currency: NetworkCurrency, userDestinationAddress: string) => {

        if (!network) {
            return
        }


        const destination_address = network?.managed_accounts?.[0]?.address as `0x${string}`
        const gas = gases[network.internal_name]?.find(g => g?.token === currency?.asset)
        const isGasOutDated = !gas || new Date().getTime() - (new Date(gas.request_time).getTime() || 0) > 10000

        const provider = getAutofillProvider(network)
        const wallet = provider?.getConnectedWallet()

        if (isGasOutDated
            && currency
            && wallet?.address
            && destination_address) {
            setIsGasLoading(true)
            try {
                const provider = getBalanceProvider(network)
                const gas = provider?.getGas && await provider?.getGas({
                    layer: network,
                    address: wallet?.address as `0x${string}`,
                    currency,
                    userDestinationAddress,
                    wallet
                }) || []

                if (gas) {
                    const filteredGases = gases[network.internal_name]?.some(b => b?.token === currency?.asset) ? gases[network.internal_name].filter(g => g.token !== currency.asset) : gases[network.internal_name] || []
                    setAllGases((data) => ({ ...data, [network.internal_name]: filteredGases.concat(gas) }))
                }
            }
            catch (e) { console.log(e) }
            finally { setIsGasLoading(false) }
        }
    }

    const getBalanceProvider = (network: Layer) => {
        const provider = BalanceProviders.find(provider => provider.supportedNetworks.includes(network.internal_name))
        return provider
    }

    return {
        fetchGas,
        fetchBalance
    }
}
