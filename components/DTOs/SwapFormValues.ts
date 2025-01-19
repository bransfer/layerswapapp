import { RouteNetwork, RouteToken } from "../../Models/Network";
import { Exchange, ExchangeToken } from "../../Models/Exchange";

export type SwapFormValues = {
  amount?: string;
  destination_address?: string;
  fromCurrency?: RouteToken;
  toCurrency?: RouteToken;
  refuel?: boolean;
  from?: RouteNetwork;
  to?: RouteNetwork;
  fromExchange?: Exchange,
  toExchange?: Exchange,
  currencyGroup?: ExchangeToken
  depositMethod?: 'wallet' | 'deposit_address',
}


export type SwapDirection = "from" | "to";