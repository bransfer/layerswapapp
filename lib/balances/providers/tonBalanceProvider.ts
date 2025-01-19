import { datadogRum } from "@datadog/browser-rum";
import { Balance } from "../../../Models/Balance";
import { Network, NetworkWithTokens, Token } from "../../../Models/Network";
import formatAmount from "../../formatAmount";
import KnownInternalNames from "../../knownIds";
import tonClient from "../../wallets/ton/client";
import { retryWithExponentialBackoff } from "../../retry";

export class TonBalanceProvider {
    supportsNetwork(network: NetworkWithTokens): boolean {
        return KnownInternalNames.Networks.TONMainnet.includes(network.name)
    }

    fetchBalance = async (address: string, network: NetworkWithTokens) => {
        let balances: Balance[] = []

        for (let i = 0; i < network.tokens.length; i++) {
            try {
                const token = network.tokens[i]
                const balance = await resolveBalance({ network, address, token })

                if (!balance) return

                balances = [
                    ...balances,
                    balance,
                ]

            }
            catch (e) {
                console.log(e)
            }
        }

        return balances
    }
}



export const resolveBalance = async ({ address, network, token }: {
    network: Network,
    token: Token,
    address: string
}
) => {

    if (token.contract) {
        const res = await getJettonBalance({ network, token, address })
        return res
    }
    else {
        const res = await getNativeAssetBalance({ network, token, address })
        return res
    }
}

const getNativeAssetBalance = async ({ network, token, address }: { network: Network, token: Token, address: string }) => {
    try {

        const { Address } = await import("@ton/ton");

        const getBalance = async () => {
            return await tonClient.getBalance(Address.parse(address))
        }
        const tonBalance = await retryWithExponentialBackoff(getBalance)

        return ({
            network: network.name,
            token: token.symbol,
            amount: formatAmount(tonBalance.toString(), Number(token?.decimals)),
            request_time: new Date().toJSON(),
            decimals: Number(token?.decimals),
            isNativeCurrency: false,
        })
    }
    catch (e) {
        const error = new Error(e)
        error.name = "TonNativeAssetBalanceError"
        error.cause = e
        datadogRum.addError(error);
        return null;
    }
}

const getJettonBalance = async ({ network, token, address }: { network: Network, token: Token, address: string }) => {
    try {

        const { JettonMaster, JettonWallet, Address } = await import("@ton/ton");

        const jettonMasterAddress = Address.parse(token.contract!)
        const userAddress = Address.parse(address)
        const jettonMaster = tonClient.open(JettonMaster.create(jettonMasterAddress))
        const getJettonAddress = async () => {
            return await jettonMaster.getWalletAddress(userAddress)
        }
        const jettonAddress = await retryWithExponentialBackoff(getJettonAddress)

        await new Promise((resolve) => setTimeout(resolve, 1000))

        const jettonWallet = JettonWallet.create(jettonAddress)
        const getBalance = async () => {
            return await jettonWallet.getBalance(tonClient.provider(jettonAddress))
        }
        const jettonBalance = await retryWithExponentialBackoff(getBalance)

        const balance = {
            network: network.name,
            token: token.symbol,
            amount: formatAmount(Number(BigInt(jettonBalance)), token.decimals),
            request_time: new Date().toJSON(),
            decimals: token.decimals,
            isNativeCurrency: false,
        }

        return balance
    }
    catch (e) {
        const error = new Error(e)
        error.name = "TonJettonBalanceError"
        error.cause = e
        datadogRum.addError(error);
        return null;
    }
}