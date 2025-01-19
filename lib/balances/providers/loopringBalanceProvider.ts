import axios from "axios";
import { NetworkWithTokens } from "../../../Models/Network";
import formatAmount from "../../formatAmount";
import KnownInternalNames from "../../knownIds";
import { LOOPRING_URLs } from "../../loopring/defs";
import { LoopringAPI } from "../../loopring/LoopringAPI";
import { Balance } from "../../../Models/Balance";

export class LoopringBalanceProvider {
    supportsNetwork(network: NetworkWithTokens): boolean {
        return (KnownInternalNames.Networks.LoopringMainnet.includes(network.name) || KnownInternalNames.Networks.LoopringGoerli.includes(network.name))
    }

    fetchBalance = async (address: string, network: NetworkWithTokens) => {

        let balances: Balance[] = [];

        if (!network?.tokens) return
        
        try {

            const account: { data: AccountInfo } = await axios.get(`${LoopringAPI.BaseApi}${LOOPRING_URLs.ACCOUNT_ACTION}?owner=${address}`)
            const accInfo = account.data
            const tokens = network?.tokens?.map(obj => obj.contract).join(',');
            const result: { data: LpBalance[] } = await axios.get(`${LoopringAPI.BaseApi}${LOOPRING_URLs.GET_USER_EXCHANGE_BALANCES}?accountId=${accInfo.accountId}&tokens=${tokens}`)

            const loopringBalances = network?.tokens?.map(asset => {
                const amount = result.data.find(d => d.tokenId == Number(asset.contract))?.total;
                return ({
                    network: network.name,
                    token: asset?.symbol,
                    amount: amount ? formatAmount(amount, Number(asset?.decimals)) : 0,
                    request_time: new Date().toJSON(),
                    decimals: Number(asset?.decimals),
                    isNativeCurrency: false
                })
            });

            balances = [
                ...loopringBalances,
            ]
        }
        catch (e) {
            console.log(e)
        }

        return balances
    }
}

interface AccountInfo {
    accountId: number;
}

type PendingBalances = {
    withdraw: string;
    deposit: string;
}

type LpBalance = {
    accountId: number;
    tokenId: number;
    total: string;
    locked: string;
    pending: PendingBalances;
}

