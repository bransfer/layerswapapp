import { FC, useEffect, useState } from "react"
import useWallet from "../../../../hooks/useWallet";
import { CommitStatus, useAtomicState } from "../../../../context/atomicContext";
import ActionStatus from "./Status/ActionStatus";
import { WalletActionButton } from "../buttons";
import { TriangleAlert } from "lucide-react";

export const RedeemAction: FC = () => {
    const { destination_network, source_network, sourceDetails, destinationDetails, setDestinationDetails, setSourceDetails, destination_asset, source_asset, commitId, commitStatus, setError } = useAtomicState()
    const [requestedManualClaim, setRequestedManualClaim] = useState(false)

    const { getProvider } = useWallet()

    const source_provider = source_network && getProvider(source_network, 'withdrawal')
    const destination_provider = destination_network && getProvider(destination_network, 'autofil')
    const destination_wallet = destination_provider?.activeWallet
    const destination_contract = destination_asset?.contract ? destination_network?.metadata.htlc_token_contract : destination_network?.metadata.htlc_native_contract
    const source_contract = source_asset?.contract ? source_network?.metadata.htlc_token_contract : source_network?.metadata.htlc_native_contract

    useEffect(() => {
        let commitHandler: any = undefined;
        if (commitId) {
            (async () => {
                commitHandler = setInterval(async () => {
                    if (!destination_network?.chain_id)
                        throw Error("No chain id")
                    if (!destination_provider)
                        throw new Error("No destination provider")

                    const data = await destination_provider.getDetails({
                        type: destination_asset?.contract ? 'erc20' : 'native',
                        chainId: destination_network.chain_id,
                        id: commitId,
                        contractAddress: destination_contract as `0x${string}`,
                    })
                    if (data) setDestinationDetails(data)
                    if (data?.claimed == 3) {
                        clearInterval(commitHandler)
                    }
                }, 5000)
            })()
        }
        return () => clearInterval(commitHandler)
    }, [destination_network, sourceDetails])

    useEffect(() => {
        let commitHandler: any = undefined;
        if (commitId) {
            (async () => {
                commitHandler = setInterval(async () => {
                    if (!source_network?.chain_id)
                        throw Error("No chain id")
                    if (!source_provider)
                        throw new Error("No destination provider")

                    const data = await source_provider.getDetails({
                        type: source_asset?.contract ? 'erc20' : 'native',
                        chainId: source_network.chain_id,
                        id: commitId,
                        contractAddress: source_contract as `0x${string}`,
                    })
                    if (data) setSourceDetails(data)
                    if (data?.claimed == 3) {
                        clearInterval(commitHandler)
                    }
                }, 5000)
            })()
        }
        return () => clearInterval(commitHandler)
    }, [source_network, sourceDetails])

    const handleClaimAssets = async () => {
        try {
            if (!destination_network) throw new Error("No source network")
            if (!commitId) throw new Error("No commitment details")
            if (!destinationDetails) throw new Error("No commitment")
            if (!destination_network.chain_id) throw new Error("No chain id")
            if (!destination_asset) throw new Error("No source asset")
            if (!destinationDetails?.secret) throw new Error("No secret")

            await source_provider?.claim({
                type: source_asset?.contract ? 'erc20' : 'native',
                id: commitId,
                secret: destinationDetails?.secret,
                chainId: destination_network.chain_id,
                contractAddress: destination_contract as `0x${string}`,
                sourceAsset: destination_asset,
            })

            setRequestedManualClaim(true)
        }
        catch (e) {
            setError(e.details || e.message)
        }
    }

    return (
        commitStatus == CommitStatus.ManualClaim ?
            requestedManualClaim ?
                <ActionStatus
                    status="pending"
                    title='Assets are currently being released'
                />
                :
                <div>
                    <div className="inline-flex text-secondary-text">
                        <TriangleAlert className="w-6 h-6" />
                        <p className="p-1">
                            The solver was unable to release your funds. Please claim them manually.
                        </p>
                    </div>
                    <WalletActionButton
                        activeChain={destination_wallet?.chainId}
                        isConnected={!!destination_wallet}
                        network={destination_network!}
                        networkChainId={Number(destination_network?.chain_id)}
                        onClick={handleClaimAssets}
                    >
                        Claim Manually
                    </WalletActionButton>
                </div>
            :
            <ActionStatus
                status="pending"
                title='Assets are currently being released'
            />
    )
}
