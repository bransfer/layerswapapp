import { SwapFormValues } from "../../DTOs/SwapFormValues";
import { useBalancesState } from "../../../context/balances";
import useWallet from "../../../hooks/useWallet";
import { useEffect, useMemo, useRef } from "react";
import { truncateDecimals } from "../../utils/RoundDecimals";
import useBalance from "../../../hooks/useBalance";
import { useSettingsState } from "../../../context/settings";
import { isValidAddress } from "../../../lib/address/validator";

const Balance = ({ values, direction }: { values: SwapFormValues, direction: string }) => {

    const { to, fromCurrency, toCurrency, from, destination_address } = values
    const { balances } = useBalancesState()
    const { getAutofillProvider: getProvider } = useWallet()

    const sourceWalletProvider = useMemo(() => {
        return from && getProvider(from)
    }, [from, getProvider])

    const destinationWalletProvider = useMemo(() => {
        return to && getProvider(to)
    }, [to, getProvider])
    const { fetchNetworkBalances, fetchGas, fetchAllBalances } = useBalance()
    const { networks, sourceRoutes } = useSettingsState()

    const filteredNetworks = networks.filter(l => sourceRoutes.some(sr => sr.name.includes(l.name) && l.tokens))
    const activeNetworks = filteredNetworks.map(chain => {
        chain.tokens = chain.tokens.filter(asset => asset.contract); //TODO check this check
        return chain;
    });

    const sourceNetworkWallet = sourceWalletProvider?.getConnectedWallet(values.from)
    const destinationNetworkWallet = destinationWalletProvider?.getConnectedWallet(values.to)

    const walletBalance = sourceNetworkWallet && balances[sourceNetworkWallet.address]?.find(b => b?.network === from?.name && b?.token === fromCurrency?.symbol)
    const destinationBalance = balances[destination_address || (destinationNetworkWallet?.address || '')]?.find(b => b?.network === to?.name && b?.token === toCurrency?.symbol)

    const walletBalanceAmount = walletBalance?.amount && truncateDecimals(walletBalance?.amount, fromCurrency?.precision)
    const destinationBalanceAmount = destinationBalance?.amount && truncateDecimals(destinationBalance?.amount, toCurrency?.precision)
    const balanceAmount = direction === 'from' ? walletBalanceAmount : destinationBalanceAmount

    const previouslySelectedSource = useRef(from);

    useEffect(() => {
        if (((previouslySelectedSource.current && (from?.type == previouslySelectedSource.current?.type))
            || (from && isValidAddress(sourceNetworkWallet?.address, from)))
            && from
            && direction === 'from') {
            fetchNetworkBalances(from, sourceNetworkWallet?.address);
        }
        previouslySelectedSource.current = from
    }, [from, sourceNetworkWallet?.address])

    const previouslySelectedDestination = useRef(to);

    useEffect(() => {
        const destinationAddress = destination_address || destinationNetworkWallet?.address
        if (((previouslySelectedDestination.current && (to?.type == previouslySelectedDestination.current?.type))
            || (to && isValidAddress(destinationAddress, to)))
            && to
            && direction === 'to') fetchNetworkBalances(to, destinationAddress);
        previouslySelectedDestination.current = to
    }, [to, destination_address, destinationNetworkWallet?.address])

    useEffect(() => {
        direction === 'from'
            && sourceNetworkWallet?.address
            && from
            && fromCurrency
            && fetchGas(from, fromCurrency, destination_address || sourceNetworkWallet.address)

    }, [from, fromCurrency, sourceNetworkWallet?.address])

    return (
        (direction === 'from' ? (from && fromCurrency) : (to && toCurrency)) && balanceAmount != undefined && !isNaN(balanceAmount) &&
        <div className="text-xs text-right absolute right-0 -top-7">
            <div className='bg-secondary-700 py-1.5 pl-2 text-xs'>
                <div>
                    <span>Balance:&nbsp;</span>
                    {!isNaN(balanceAmount) &&
                        <span>{balanceAmount}</span>}
                </div>
            </div>
        </div>
    )
}

export default Balance