import { useEffect, useMemo, useState } from "react"
import { useBalancesState } from "../../../context/balances"
import { useSettingsState } from "../../../context/settings"
import useWallet from "../../../hooks/useWallet"
import useBalance from "../../../hooks/useBalance"



const Comp = () => {
    const { balances } = useBalancesState()
    const { connectedWalletProviders } = useWallet()
    const { layers, sourceRoutes } = useSettingsState()
    const [fetching, setFetching] = useState<{ [address: string]: boolean }>({})
    const { fetchBalance, fetchGas, fetchAllBalances } = useBalance()

    const filteredNetworks = layers.filter(l => l.assets.some(a => a.availableInSource || a.availableInDestination))
    const activeNetworks = filteredNetworks.map(chain => {
        chain.assets = chain.assets.filter(asset => asset.availableInSource);
        return chain;
    });

    useEffect(() => {
        if (connectedWalletProviders.length > 0) {

            connectedWalletProviders.forEach(p => {
                const providerNetworks = activeNetworks.filter(n => p.autofillSupportedNetworks?.some(sn => sn.toLowerCase() === n.internal_name.toLowerCase()))
                const address = p.getConnectedWallet()?.address
                if (address && !fetching[address]) {
                    console.log("fetch")
                    setFetching(d => ({ ...d, [address]: true }))
                    fetchAllBalances(providerNetworks);
                }
            })
        }
    }, [connectedWalletProviders, fetching])

    return <></>
}

export default Comp;