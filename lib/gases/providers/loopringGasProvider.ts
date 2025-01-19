import axios from "axios";
import { Network } from "../../../Models/Network";
import formatAmount from "../../formatAmount";
import KnownInternalNames from "../../knownIds";
import { LOOPRING_URLs, LpFee } from "../../loopring/defs";
import { LoopringAPI } from "../../loopring/LoopringAPI";
import { GasProps } from "../../../Models/Balance";

export class LoopringGasProvider {
    supportsNetwork(network: Network): boolean {
        return (KnownInternalNames.Networks.LoopringMainnet.includes(network.name) || KnownInternalNames.Networks.LoopringGoerli.includes(network.name))
    }

    getGas = async ({ address, network, token }: GasProps) => {
        try {
            const account: { data: AccountInfo } = await axios.get(`${LoopringAPI.BaseApi}${LOOPRING_URLs.ACCOUNT_ACTION}?owner=${address}`)
            const accInfo = account.data
            const result: { data: LpFee } = await axios.get(`${LoopringAPI.BaseApi}${LOOPRING_URLs.GET_OFFCHAIN_FEE_AMT}?accountId=${accInfo.accountId}&requestType=3`)
            const formatedGas = formatAmount(result.data.fees.find(f => f?.token === token.symbol)?.fee, Number(token.decimals));
            return formatedGas
        }
        catch (e) {
            console.log(e)
        }
    }
}

interface AccountInfo {
    accountId: number;
}