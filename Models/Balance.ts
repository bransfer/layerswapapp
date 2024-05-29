import { Wallet } from "../stores/walletStore"
import { Network, NetworkWithTokens, Token } from "./Network"

export type BalanceProps = {
    network: Network,
    token: Token,
    address: string
}

export type NetworkBalancesProps = {
    network: NetworkWithTokens,
    address: string
}

export type GasProps = {
    network: Network,
    token: Token,
    address?: `0x${string}`,
    userDestinationAddress?: string,
    wallet?: Wallet
}

export type Balance = {
    network: string,
    amount: number,
    decimals: number,
    isNativeCurrency: boolean,
    token: string,
    request_time: string,
}

export type Gas = {
    token: string,
    gas: number,
    gasDetails?: {
        gasLimit?: number,
        maxFeePerGas?: number,
        gasPrice?: number,
        maxPriorityFeePerGas?: number
    },
    request_time: string
}

export type BalanceProvider = {
    getBalance: ({ network, token, address }: BalanceProps) => Promise<Balance | undefined | null> | Balance | undefined,
    getNetworkBalances: (props: NetworkBalancesProps) => Promise<Balance[] | undefined> | Balance[] | undefined,
    getGas?: (props: GasProps) => Promise<Gas[] | undefined> | undefined,
    supportedNetworks: string[],
}