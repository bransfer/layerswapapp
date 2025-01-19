import { Network, Token } from "./Network"
import { Wallet } from "./WalletProvider"

export type BalanceProps = {
    networkName: string,
    token: Token,
    address: string
}

export type NetworkBalancesProps = {
    networkName: string,
    address: string
}

export type GasProps = {
    network: Network,
    token: Token,
    address?: `0x${string}`,
    recipientAddress?: string,
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
    getBalance: ({ networkName, token, address }: BalanceProps) => Promise<Balance | undefined | null> | Balance | undefined,
    getNetworkBalances: (props: NetworkBalancesProps) => Promise<Balance[] | undefined> | Balance[] | undefined | void,
    getGas?: (props: GasProps) => Promise<Gas[] | undefined> | undefined | void,
    supportedNetworks: string[],
}