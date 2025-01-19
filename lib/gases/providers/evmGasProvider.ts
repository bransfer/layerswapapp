
import { GasProps } from "../../../Models/Balance"
import { NetworkType, Network, Token } from "../../../Models/Network"
import { Provider } from "./types"
import { PublicClient, TransactionSerializedEIP1559, encodeFunctionData, serializeTransaction } from "viem";
import { erc20Abi } from "viem";
import { datadogRum } from "@datadog/browser-rum";
import formatAmount from "../../formatAmount";

export class EVMGasProvider implements Provider {
    supportsNetwork(network: Network): boolean {
        return network.type === NetworkType.EVM && !!network.token
    }

    getGas = async ({ address, network, token, recipientAddress = '0x2fc617e933a52713247ce25730f6695920b3befe' }: GasProps) => {

        const chainId = Number(network?.chain_id)

        if (!network || !address || !chainId || !recipientAddress) {
            return
        }

        const contract_address = token.contract as `0x${string}`

        try {

            if (network.metadata.zks_paymaster_contract) return 0

            const { createPublicClient, http } = await import("viem")
            const resolveNetworkChain = (await import("../../resolveChain")).default
            const publicClient = createPublicClient({
                chain: resolveNetworkChain(network),
                transport: http(),
            })

            const getGas = network?.metadata?.evm_oracle_contract ? getOptimismGas : getEthereumGas

            const gasProvider = new getGas(
                {
                    publicClient,
                    chainId,
                    contract_address,
                    account: address,
                    from: network,
                    currency: token,
                    destination: recipientAddress as `0x${string}`,
                    nativeToken: token
                }
            )

            const gas = await gasProvider.resolveGas()

            return gas
        }
        catch (e) {
            console.log(e)
        }

    }
}


abstract class getEVMGas {

    protected publicClient: PublicClient
    protected chainId: number
    protected contract_address: `0x${string}`
    protected account: `0x${string}`
    protected from: Network
    protected currency: Token
    protected destination: `0x${string}`
    protected nativeToken: Token
    constructor(
        {
            publicClient,
            chainId,
            contract_address,
            account,
            from,
            currency,
            destination,
            nativeToken,
        }: {
            publicClient: PublicClient,
            chainId: number,
            contract_address: `0x${string}`,
            account: `0x${string}`,
            from: Network,
            currency: Token,
            destination: `0x${string}`,
            nativeToken: Token,
        }
    ) {
        this.publicClient = publicClient
        this.chainId = chainId
        this.contract_address = contract_address
        this.account = account
        this.from = from
        this.currency = currency
        this.destination = destination
        this.nativeToken = nativeToken
    }

    abstract resolveGas(): Promise<number | undefined>

    protected async resolveFeeData() {

        let gasPrice = await this.getGasPrice();
        let feesPerGas = await this.estimateFeesPerGas()
        let maxPriorityFeePerGas = feesPerGas?.maxPriorityFeePerGas
        if (!maxPriorityFeePerGas) maxPriorityFeePerGas = await this.estimateMaxPriorityFeePerGas()

        return {
            gasPrice,
            maxFeePerGas: feesPerGas?.maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas
        }

    }

    private async getGasPrice() {
        try {
            return await this.publicClient.getGasPrice()

        } catch (e) {
            const error = new Error(e)
            error.name = "GasPriceError"
            error.cause = e
            datadogRum.addError(error);
        }
    }
    private async estimateFeesPerGas() {
        try {
            return await this.publicClient.estimateFeesPerGas()

        } catch (e) {
            const error = new Error(e)
            error.name = "FeesPerGasError"
            error.cause = e
            datadogRum.addError(error);
        }
    }
    private async estimateMaxPriorityFeePerGas() {
        try {
            return await this.publicClient.estimateMaxPriorityFeePerGas()

        } catch (e) {
            const error = new Error(e)
            error.name = "MaxPriorityFeePerGasError"
            error.cause = e
            datadogRum.addError(error);
        }
    }

    protected async estimateNativeGasLimit() {
        const to = this.destination;
        const gasEstimate = await this.publicClient.estimateGas({
            account: this.account,
            to: to,
            data: this.constructSweeplessTxData(),
        })

        return gasEstimate
    }

    protected async estimateERC20GasLimit() {
        let encodedData = encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: [this.destination, BigInt(1000)]
        })

        if (encodedData) {
            encodedData = this.constructSweeplessTxData(encodedData)
        }

        const estimatedERC20GasLimit = await this.publicClient.estimateGas({
            data: encodedData,
            to: this.contract_address,
            account: this.account
        });

        return estimatedERC20GasLimit
    }

    protected constructSweeplessTxData = (txData: string = "0x") => {
        const hexed_sequence_number = (99999999).toString(16)
        const sequence_number_even = hexed_sequence_number?.length % 2 > 0 ? `0${hexed_sequence_number}` : hexed_sequence_number
        return `${txData}${sequence_number_even}` as `0x${string}`;
    }

}


class getEthereumGas extends getEVMGas {
    resolveGas = async () => {
        const feeData = await this.resolveFeeData()

        const estimatedGasLimit = this.contract_address ?
            await this.estimateERC20GasLimit()
            : await this.estimateNativeGasLimit()

        const multiplier = feeData.maxFeePerGas || feeData.gasPrice

        if (!multiplier)
            return undefined

        const totalGas = multiplier * estimatedGasLimit

        const formattedGas = formatAmount(totalGas, this.nativeToken?.decimals)
        return formattedGas
    }

}


export default class getOptimismGas extends getEVMGas {
    resolveGas = async () => {
        const feeData = await this.resolveFeeData()

        const estimatedGasLimit = this.contract_address ?
            await this.estimateERC20GasLimit()
            : await this.estimateNativeGasLimit()

        const multiplier = feeData.maxFeePerGas || feeData.gasPrice

        if (!multiplier)
            return undefined

        let totalGas = (multiplier * estimatedGasLimit) + await this.GetOpL1Fee()

        const formattedGas = formatAmount(totalGas, this.nativeToken?.decimals)
        return formattedGas
    }

    private GetOpL1Fee = async (): Promise<bigint> => {
        const amount = BigInt(1000)
        let serializedTransaction: TransactionSerializedEIP1559

        if (this.contract_address) {
            let encodedData = encodeFunctionData({
                abi: erc20Abi,
                functionName: "transfer",
                args: [this.destination, amount]
            })

            if (encodedData) {
                encodedData = this.constructSweeplessTxData(encodedData)
            }

            serializedTransaction = serializeTransaction({
                client: this.publicClient,
                abi: erc20Abi,
                functionName: "transfer",
                chainId: this.chainId,
                args: [this.destination, amount],
                to: this.contract_address,
                data: encodedData,
                type: 'eip1559',
            }) as TransactionSerializedEIP1559
        }
        else {
            serializedTransaction = serializeTransaction({
                client: this.publicClient,
                chainId: this.chainId,
                to: this.destination,
                data: this.constructSweeplessTxData(),
                type: 'eip1559',
            }) as TransactionSerializedEIP1559
        }

        const fee = await getL1Fee({
            data: serializedTransaction,
            client: this.publicClient,
            oracleContract: this.from.metadata.evm_oracle_contract
        })

        return fee;
    }

}

//from https://github.com/ethereum-optimism/optimism/blob/develop/packages/fee-estimation/src/estimateFees.ts
import {
    gasPriceOracleABI,
    gasPriceOracleAddress,
} from '@eth-optimism/contracts-ts'
import {
    getContract,
    BlockTag,
} from 'viem'

/**
 * Options to query a specific block
 */
type BlockOptions = {
    /**
     * Block number to query from
     */
    blockNumber?: bigint
    /**
     * Block tag to query from
     */
    blockTag?: BlockTag
}

/**
 * Get gas price Oracle contract
 */
const getGasPriceOracleContract = (client: PublicClient, oracleContract?: `0x${string}` | null) => {
    return getContract({
        address: oracleContract || gasPriceOracleAddress['420'],
        abi: gasPriceOracleABI,
        client
    })
}

/**
 * Computes the L1 portion of the fee based on the size of the rlp encoded input
 * transaction, the current L1 base fee, and the various dynamic parameters.
 * @example
 * const L1FeeValue = await getL1Fee(data, params);
 */
const getL1Fee = async (options: { data: `0x02${string}`, client: PublicClient, oracleContract: `0x${string}` | null | undefined } & BlockOptions) => {
    const contract = getGasPriceOracleContract(options.client, options.oracleContract)
    return contract.read.getL1Fee([options.data], {
        blockNumber: options.blockNumber,
        blockTag: options.blockTag,
    })
}
