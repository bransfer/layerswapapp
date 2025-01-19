import { LoopringAPI } from "./LoopringAPI";
import { sortObjDictionary } from "./formatter";
import { signTypedData } from '@wagmi/core'
import { signMessage } from '@wagmi/core'
import { parseUnits } from 'viem';
import { AccountInfo, ExchangeInfo, KEY_MESSAGE, LOOPRING_URLs, LpFee, OffchainFeeReqType, OriginTransferRequestV3, UnlockedAccount } from "./defs";
import { generateKey, getEdDSASig, getTransferTypedData, getUpdateAccountEcdsaTypedData, get_EddsaSig_Transfer } from "./utils";
import { Token } from "../../Models/Network";
import { Config } from "wagmi";

type UnlockApiRes = {
    apiKey: string;
    resultInfo?: undefined
} | {
    apiKey: undefined,
    resultInfo: {
        code: number,
        message: string
    }
}

export async function unlockAccount(accInfo: AccountInfo, config: Config)
    : Promise<UnlockedAccount> {
    let keySeed = accInfo.keySeed

    if (!keySeed) {
        const exchangeInfo = await getExchangeInfo();
        keySeed = KEY_MESSAGE.replace(
            "${exchangeAddress}",
            exchangeInfo.exchangeAddress
        ).replace("${nonce}", '0');
    }
    const sig = await signMessage(config, { message: keySeed })
    const eddsaKeyData = generateKey(sig)
    const { sk } = eddsaKeyData
    const { accountId } = accInfo
    const url = `${LoopringAPI.BaseApi}${LOOPRING_URLs.API_KEY_ACTION}?accountId=${accountId}`

    const dataToSign: Map<string, any> = sortObjDictionary({ accountId })
    const eddsa = getEdDSASig(
        "GET",
        LoopringAPI.BaseApi,
        LOOPRING_URLs.API_KEY_ACTION,
        dataToSign,
        sk
    )
    const res: UnlockApiRes = await (await fetch(url, {
        headers: {
            'X-Api-Sig': eddsa
        }
    })).json()

    if (res.apiKey) {
        return { eddsaKey: eddsaKeyData, apiKey: res.apiKey }
    }
    else {
        throw Error(`Could not unlock account, error:${res.resultInfo?.message || ' unknown'}`)
    }

}
async function getExchangeInfo()
    : Promise<ExchangeInfo> {
    const result: ExchangeInfo = await (await fetch(`${LoopringAPI.BaseApi}${LOOPRING_URLs.GET_EXCHANGE_INFO}`)).json()
    return result
}

export async function getOffchainFeeAmt
    (accountId: number,
        type: OffchainFeeReqType)
    : Promise<LpFee> {
    const result: LpFee = await (await fetch(`${LoopringAPI.BaseApi}${LOOPRING_URLs.GET_OFFCHAIN_FEE_AMT}?accountId=${accountId}&requestType=${type}`)).json()
    return result
}

type StorageIdRes = {
    orderId: number;
    offchainId: number;
}

async function getNextStorageId
    (req: {
        accountId: number,
        tokenId: number
    }, apiKey: string)
    : Promise<StorageIdRes> {
    const { accountId, tokenId } = req
    const url = `${LoopringAPI.BaseApi}${LOOPRING_URLs.GET_NEXT_STORAGE_ID}?accountId=${accountId}&sellTokenId=${tokenId}`
    const result: StorageIdRes = await (await fetch(url, {
        headers: {
            'X-Api-Key': apiKey
        }
    })).json()
    return result
}

type TransferProps = {
    unlockedAccount: UnlockedAccount,
    accInfo: AccountInfo,
    token: Token,
    depositAddress: `0x${string}`,
    amount: string,
    call_data: string | undefined
}

type TransferApiRes = {
    hash: string;
    resultInfo: undefined
} | {

    hash: undefined,
    resultInfo: {
        code: number,
        message: string
    }
}


export async function transfer
    ({
        accInfo,
        amount,
        depositAddress,
        call_data,
        token,
        unlockedAccount
    }: TransferProps, config: Config): Promise<TransferApiRes> {

    const exchangeInfo = await getExchangeInfo();
    const { apiKey, eddsaKey } = unlockedAccount
    const storageId = await getNextStorageId(
        {
            accountId: accInfo.accountId,
            tokenId: Number(token?.contract),
        },
        apiKey)
    const feeData = await getOffchainFeeAmt(accInfo.accountId, OffchainFeeReqType.TRANSFER)
    const fee = feeData.fees.find(f => f.token.toUpperCase() == token.symbol.toUpperCase())?.fee
    if (!fee) {
        throw new Error(`Could not get fee for ${token.symbol.toUpperCase()}`)
    }
    const req = {
        exchange: exchangeInfo.exchangeAddress,
        payerAddr: accInfo.owner,
        payerId: accInfo.accountId,
        payeeAddr: depositAddress as `0x${string}`,
        payeeId: 0,
        storageId: storageId.offchainId,
        token: {
            tokenId: Number(token?.contract),
            volume: parseUnits(amount, Number(token?.decimals)).toString(),
        },
        maxFee: {
            tokenId: Number(token?.contract),
            volume: fee,
        },
        validUntil: Math.round(Date.now() / 1000) + 30 * 86400,
        ...(call_data ? { memo: call_data } : {}),
    }

    return await submitInternalTransfer(req, apiKey, eddsaKey.sk, config)
}


async function submitInternalTransfer
    (req: OriginTransferRequestV3, apiKey: string, eddsaKey: string, config: Config)
    : Promise<TransferApiRes> {

    const typedData = getTransferTypedData(req, LoopringAPI.CHAIN)
    const ecdsaSignature = (await signTypedData(config, typedData as any)).slice(0, 132)
    const eddsaSignature = get_EddsaSig_Transfer(req, eddsaKey).result
    return await (await fetch(`${LoopringAPI.BaseApi}${LOOPRING_URLs.POST_INTERNAL_TRANSFER}`, {
        method: "POST",
        body: JSON.stringify({
            ...req,
            eddsaSignature,
            ecdsaSignature: ecdsaSignature,
        }),
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Sig': ecdsaSignature,
            'X-Api-Key': apiKey
        }
    })).json()
}

type ActivateAccountProps = {
    token: { symbol: string, id: number },
    accInfo: AccountInfo
}

export async function activateAccount
    ({
        token,
        accInfo
    }: ActivateAccountProps, config: Config)
    : Promise<{ x: string; y: string }> {

    const exchangeInfo = await getExchangeInfo();

    const message = KEY_MESSAGE.replace(
        "${exchangeAddress}",
        exchangeInfo.exchangeAddress
    ).replace("${nonce}", accInfo.nonce.toString());

    const sig = await signMessage(config, { message })

    const eddsaKeyData = generateKey(sig)
    const { formatedPx, formatedPy } = eddsaKeyData
    const publicKey = { x: formatedPx, y: formatedPy }
    const feeData = await getOffchainFeeAmt(accInfo.accountId, OffchainFeeReqType.UPDATE_ACCOUNT);
    const fee = feeData.fees.find(f => f.token.toUpperCase() == token.symbol.toUpperCase())?.fee
    if (!fee) {
        throw new Error(`Could not get fee for ${token.symbol.toUpperCase()}`)
    }
    const req = {
        exchange: exchangeInfo.exchangeAddress,
        owner: accInfo.owner,
        accountId: accInfo.accountId,
        publicKey,
        maxFee: {
            tokenId: token.id,
            volume: fee,
        },
        keySeed: message,
        validUntil: Math.round(Date.now() / 1000) + 30 * 86400,
        nonce: accInfo.nonce as number,
    }

    const typedData = getUpdateAccountEcdsaTypedData(req, LoopringAPI.CHAIN)
    const ecdsaSignature = (await signTypedData(config, typedData as any)).slice(0, 132)

    const activationReq = await (await fetch(`${LoopringAPI.BaseApi}${LOOPRING_URLs.ACCOUNT_ACTION}`, {
        method: "POST",
        body: JSON.stringify({ ...req, ecdsaSignature: ecdsaSignature }),
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Sig': ecdsaSignature
        }
    })).json()

    if (activationReq?.resultInfo?.message) {
        throw new Error(activationReq.resultInfo.message)
    }

    return publicKey
}