import { Exchange, ExchangeToken } from "../Models/Exchange";
import { RouteNetwork, RouteToken } from "../Models/Network";
import { SwapDirection } from "../components/DTOs/SwapFormValues";
import { SelectMenuItem } from "../components/Select/Shared/Props/selectMenuItem";
import CurrencySettings from "./CurrencySettings";
import ExchangeSettings from "./ExchangeSettings";
import NetworkSettings from "./NetworkSettings";

export const SortAscending = (x: { order: number }, y: { order: number }) => x.order - y.order;

export function ResolveNetworkOrder(network: RouteNetwork, direction: SwapDirection, is_new: boolean) {


    let orderProp: keyof NetworkSettings = direction == 'from' ? 'OrderInSource' : 'OrderInDestination';
    const initial_order = resolveInitialWeightedOrder(NetworkSettings.KnownSettings[network.name]?.[orderProp], 1)

    const is_active = network.tokens?.some(r => r.status === 'active')
    const is_inactive = network.tokens?.every(r => r.status === 'inactive')

    return initial_order + resolveConditionWeight(!is_inactive, 4) + resolveConditionWeight(is_active, 3) + resolveConditionWeight(is_new, 2);
}
export function ResolveExchangeOrder(exchange: Exchange, direction: SwapDirection) {

    let orderProp: keyof NetworkSettings = direction == 'from' ? 'OrderInSource' : 'OrderInDestination';

    const initial_order = resolveInitialWeightedOrder(ExchangeSettings.KnownSettings[exchange.name]?.[orderProp], 1)
    return initial_order;
}
export function ResolveCEXCurrencyOrder(token: ExchangeToken) {

    const initial_order = resolveInitialWeightedOrder(CurrencySettings.KnownSettings[token.symbol]?.Order, 1)

    return initial_order;
}
export function ResolveCurrencyOrder(currency: RouteToken, is_new: boolean) {

    const initial_order = resolveInitialWeightedOrder(CurrencySettings.KnownSettings[currency.symbol]?.Order, 1)
    const is_active = currency.status === 'active'
    const is_inactive = currency.status === 'inactive'

    return initial_order + resolveConditionWeight(!is_inactive, 4) + resolveConditionWeight(is_active, 2)

}

export function SortingByAvailability<T>(x: SelectMenuItem<T>, y: SelectMenuItem<T>) {
    const reasonA = x.isAvailable && x.isAvailable;
    const reasonB = y.isAvailable && y.isAvailable;
    if (reasonA && !reasonB) {
        return 1;
    } else if (!reasonA && reasonB) {
        return -1;
    } else {
        const balanceAmountsComparison = (Number(y.balanceAmount) || 0) - (Number(x.balanceAmount) || 0);
        const orderComparison = balanceAmountsComparison !== 0 ? balanceAmountsComparison : x.order - y.order;
        return orderComparison;
    }
}
const resolveInitialWeightedOrder = (settingsOrder: number | undefined, initialOrderWeight: number) => {
    // Add 1 to distinguish between 0 and undefined
    const settings_order = (Number(settingsOrder) + 1)
    const hasSettings = settings_order > 0
    return settings_order || resolveConditionWeight(hasSettings, initialOrderWeight)
}

const resolveConditionWeight = (value: boolean, priority: number) => value ? 0 : 10 ** (priority + 1)
