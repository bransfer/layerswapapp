import { GasProps } from "../../../Models/Balance";
import { Network } from "../../../Models/Network";
import formatAmount from "../../formatAmount";
import KnownInternalNames from "../../knownIds";
import InternalApiClient from "../../internalApiClient";
import { ApiResponse } from "../../../Models/ApiResponse";
import { EstimateFee } from "starknet";
import { useRouter } from "next/router";
import { Provider } from "./types";

export class StarknetGasProvider implements Provider {
    supportsNetwork(network: Network): boolean {
        return (KnownInternalNames.Networks.StarkNetMainnet.includes(network.name) || KnownInternalNames.Networks.StarkNetGoerli.includes(network.name) || KnownInternalNames.Networks.StarkNetSepolia.includes(network.name))
    }

    getGas = async ({ address, network, token }: GasProps) => {

        const nodeUrl = network.node_url
        const contract_address = token?.contract
        const testnetWatchdog = '0x0423074c4bf903478daaa719bb3b1539d23af07db07101d263c78d75e5e6e0a3'
        const mainnetWatchdog = '0x022993789c33e54e0d296fc266a9c9a2e9dcabe2e48941f5fa1bd5692ac4a8c4'
        const mainnetRecipient = '0x19252B1dEef483477C4D30cFcc3e5Ed9C82FAFEA44669c182A45A01b4FdB97a'
        const testnetRecipient = '0x065a93bf9a33c87346f534a3b6c825e5c9e86a8e612cba683d0271aae5062d21'
        const version = (network.name.split('_').pop() === 'SEPOLIA' || network.name.split('_').pop() === 'GOERLI') ? 'sandbox' : 'prod'
        const router = useRouter()

        const recipient = version === 'prod' ? mainnetRecipient : testnetRecipient
        const watchdogContract = version === 'prod' ? mainnetWatchdog : testnetWatchdog

        if (!token || !network.token) return

        const client = new InternalApiClient()
        const basePath = router.basePath ?? '/'
        const feeEstimateResponse: ApiResponse<EstimateFee> = await client.GetStarknetFee(`nodeUrl=${nodeUrl}&walletAddress=${address}&contractAddress=${contract_address}&recipient=${recipient}&watchDogContract=${watchdogContract}`, basePath)

        if (!feeEstimateResponse?.data?.suggestedMaxFee) {
            throw new Error(`Couldn't get fee estimation for the transfer. Response: ${JSON.stringify(feeEstimateResponse)}`);
        };

        const feeInWei = feeEstimateResponse.data.suggestedMaxFee.toString();
        const gas = formatAmount(feeInWei, network.token.decimals)

        return gas
    }
}