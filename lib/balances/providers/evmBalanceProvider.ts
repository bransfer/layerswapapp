
import { PublicClient } from "viem"
import { Balance } from "../../../Models/Balance"
import { Network, NetworkType, NetworkWithTokens, Token } from "../../../Models/Network"
import formatAmount from "../../formatAmount"
import { http, createConfig } from '@wagmi/core'
import { erc20Abi } from 'viem'
import { multicall } from '@wagmi/core'
import { getBalance, GetBalanceReturnType } from '@wagmi/core'
import resolveChain from "../../resolveChain"
import { datadogRum } from "@datadog/browser-rum"

export class EVMBalanceProvider {
    supportsNetwork(network: NetworkWithTokens): boolean {
        return network.type === NetworkType.EVM && !!network.token
    }

    fetchBalance = async (address: string, network: NetworkWithTokens) => {

        if (!network) return
    
        try {

            const chain = resolveChain(network)
            if (!chain) return
    
            const { createPublicClient, http } = await import("viem")
            const publicClient = createPublicClient({
                chain: chain,
                transport: http()
            })
    
            const erc20BalancesContractRes = await getErc20Balances({
                address,
                assets: network.tokens,
                network,
                publicClient,
                hasMulticall: !!network.metadata?.evm_multicall_contract
            });
    
            const erc20Balances = (erc20BalancesContractRes && await resolveERC20Balances(
                erc20BalancesContractRes,
                network
            )) || [];
    
            const nativeTokens = network.tokens.filter(t => !t.contract)
            const nativeBalances: Balance[] = []
    
            for (let i = 0; i < nativeTokens.length; i++) {
                const token = nativeTokens[i]
                const nativeBalanceData = await getTokenBalance(address as `0x${string}`, network)
                const nativeBalance = (nativeBalanceData
                    && await resolveBalance(network, token, nativeBalanceData))
                if (nativeBalance)
                    nativeBalances.push(nativeBalance)
            }
    
            let res: Balance[] = []
            return res.concat(erc20Balances, nativeBalances)
        }
        catch (e) {
            console.log(e)
        }
    }
}



export type ERC20ContractRes = ({
    error: Error;
    result?: undefined | null;
    status: "failure";
} | {
    error?: undefined | null;
    result: unknown;
    status: "success";
})

export const resolveERC20Balances = async (
    multicallRes: ERC20ContractRes[],
    from: NetworkWithTokens,
) => {
    const assets = from?.tokens?.filter(a => a.contract)
    if (!assets)
        return null
    const contractBalances = multicallRes?.map((d, index) => {
        const currency = assets[index]
        return {
            network: from.name,
            token: currency.symbol,
            amount: formatAmount(d.result, currency.decimals),
            request_time: new Date().toJSON(),
            decimals: currency.decimals,
            isNativeCurrency: false,
        }
    })
    return contractBalances
}

type GetBalanceArgs = {
    address: string,
    network: Network,
    assets: Token[],
    publicClient: PublicClient,
    hasMulticall: boolean
}

export const getErc20Balances = async ({
    address,
    network,
    assets,
    publicClient,
    hasMulticall = false
}: GetBalanceArgs): Promise<ERC20ContractRes[] | null> => {

    const contracts = assets?.filter(a => a.contract).map(a => ({
        address: a?.contract as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
    }))

    try {
        if (hasMulticall) {
            const chain = resolveChain(network)
            if (!chain) throw new Error("Could not resolve chain")

            const config = createConfig({
                chains: [chain],
                transports: {
                    [chain.id]: http()
                }
            })

            const contractRes = await multicall(config, {
                chainId: chain.id,
                contracts: contracts
            })
            return contractRes
        }
        else {
            const balances: ERC20ContractRes[] = []
            for (let i = 0; i < contracts.length; i++) {
                try {
                    const contract = contracts[i]
                    const balance = await publicClient.readContract({
                        address: contract?.address as `0x${string}`,
                        abi: erc20Abi,
                        functionName: 'balanceOf',
                        args: [address as `0x${string}`]
                    })
                    balances.push({
                        status: "success",
                        result: balance,
                        error: undefined
                    })
                }
                catch (e) {
                    balances.push({
                        status: "failure",
                        result: null,
                        error: e?.message
                    })
                }
            }
            return balances
        }
    }
    catch (e) {
        const error = new Error(e)
        error.name = "ERC20BalanceError"
        error.cause = e
        datadogRum.addError(error);
        return null;
    }

}

export const getTokenBalance = async (address: `0x${string}`, network: Network, contract?: `0x${string}` | null): Promise<GetBalanceReturnType | null> => {

    try {
        const chain = resolveChain(network)
        if (!chain) throw new Error("Could not resolve chain")
        const config = createConfig({
            chains: [chain],
            transports: {
                [chain.id]: http()
            }
        })
        const res = await getBalance(config, {
            address,
            chainId: chain.id,
            ...(contract ? { token: contract } : {})
        })
        return res
    } catch (e) {
        const error = new Error(e)
        error.name = "TokenBalanceError"
        error.cause = e
        datadogRum.addError(error);
        return null
    }

}

export const resolveBalance = async (
    network: Network,
    token: Token,
    balanceData: GetBalanceReturnType
) => {

    const nativeBalance: Balance = {
        network: network.name,
        token: token.symbol,
        amount: formatAmount(balanceData?.value, token.decimals),
        request_time: new Date().toJSON(),
        decimals: token.decimals,
        isNativeCurrency: true,
    }

    return nativeBalance
}

export const resolveERC20Balance = async (
    network: Network,
    token: Token,
    balanceData: GetBalanceReturnType
) => {

    const nativeBalance: Balance = {
        network: network.name,
        token: token.symbol,
        amount: formatAmount(balanceData?.value, token.decimals),
        request_time: new Date().toJSON(),
        decimals: token.decimals,
        isNativeCurrency: false,
    }

    return nativeBalance
}