import { FC, useEffect, useState } from "react";
import useWallet from "../../../../hooks/useWallet";
import { useAtomicState } from "../../../../context/atomicContext";
import ActionStatus from "./Status/ActionStatus";
import { WalletActionButton } from "../buttons";
import posthog from "posthog-js";
import ButtonStatus from "./Status/ButtonStatus";
import { useRouter } from "next/router";

export const UserCommitAction: FC = () => {
    const { source_network, destination_network, amount, address, source_asset, destination_asset, onCommit, commitId, setSourceDetails, setError } = useAtomicState();
    const { provider } = useWallet(source_network, 'withdrawal')
    const wallet = provider?.activeWallet

    const atomicContract = (source_asset?.contract ? source_network?.metadata.htlc_token_contract : source_network?.metadata.htlc_native_contract) as `0x${string}`

    const handleCommit = async () => {
        try {
            if (!amount) {
                throw new Error("No amount specified")
            }
            if (!address) {
                throw new Error("Please enter a valid address")
            }
            if (!destination_network) {
                throw new Error("No destination chain")
            }
            if (!source_network?.chain_id) {
                throw new Error("No source chain")
            }
            if (!source_asset) {
                throw new Error("No source asset")
            }
            if (!destination_asset) {
                throw new Error("No destination asset")
            }
            if (!provider) {
                throw new Error("No source_provider")
            }

            const { commitId, hash } = await provider.createPreHTLC({
                address,
                amount: amount.toString(),
                destinationChain: destination_network.name,
                sourceChain: source_network.name,
                destinationAsset: destination_asset.symbol,
                sourceAsset: source_asset,
                lpAddress: source_network.metadata.lp_address,
                tokenContractAddress: source_asset.contract as `0x${string}`,
                decimals: source_asset.decimals,
                atomicContract: atomicContract,
                chainId: source_network.chain_id,
            }) || {}
            if (commitId && hash) {
                onCommit(commitId, hash)

                posthog.capture("Commit", {
                    commitId: commitId,
                    amount: amount,
                    sourceNetwork: source_network.name,
                    destinationNetwork: destination_network.name,
                    sourceAsset: source_asset.symbol,
                    destinationAsset: destination_asset.symbol,
                    userAddress: address,
                })
            }
        }
        catch (e) {
            setError(e.details || e.message)
        }
    }

    useEffect(() => {
        let commitHandler: any = undefined
        if (source_network && commitId) {
            (async () => {
                commitHandler = setInterval(async () => {
                    if (!source_network?.chain_id)
                        throw Error("No chain id")
                    if (!provider)
                        throw new Error("No source provider")

                    const data = await provider.getDetails({
                        type: source_asset?.contract ? 'erc20' : 'native',
                        chainId: source_network.chain_id,
                        id: commitId,
                        contractAddress: atomicContract
                    })
                    if (data && data.sender != '0x0000000000000000000000000000000000000000') {
                        setSourceDetails(data)
                        clearInterval(commitHandler)
                    }
                }, 5000)
            })()
        }
        return () => {
            clearInterval(commitHandler)
        }
    }, [source_network, commitId])

    if (!source_network) return <></>

    return <div className="font-normal flex flex-col w-full relative z-10 space-y-4 grow">
        {
            commitId ?
                <ButtonStatus
                    isDisabled={true}
                >
                    Confirm in wallet
                </ButtonStatus>
                :
                source_network.chain_id &&
                <WalletActionButton
                    activeChain={wallet?.chainId}
                    isConnected={!!wallet}
                    network={source_network}
                    networkChainId={source_network.chain_id}
                    onClick={handleCommit}
                >
                    Commit
                </WalletActionButton>
        }
    </div>
}


export const UserLockAction: FC = () => {
    const { source_network, commitId, sourceDetails, setSourceDetails, setUserLocked, userLocked, setError, source_asset, destinationDetails } = useAtomicState()

    const { provider } = useWallet(source_network, 'withdrawal')

    const wallet = provider?.activeWallet

    const atomicContract = (source_asset?.contract ? source_network?.metadata.htlc_token_contract : source_network?.metadata.htlc_native_contract) as `0x${string}`

    const handleLockAssets = async () => {
        try {
            if (!source_network?.chain_id)
                throw Error("No chain id")
            if (!provider)
                throw new Error("No source provider")
            if (!destinationDetails?.hashlock)
                throw new Error("No destination hashlock")

            await provider.addLock({
                type: source_asset?.contract ? 'erc20' : 'native',
                chainId: source_network.chain_id,
                id: commitId as string,
                hashlock: destinationDetails?.hashlock,
                contractAddress: atomicContract,
                lockData: destinationDetails,
                sourceAsset: source_asset,
            })

            posthog.capture("Lock", {
                commitId: commitId,
                hashlock: destinationDetails?.hashlock,
                contractAddress: atomicContract,
                lockData: destinationDetails,
                chainId: source_network.chain_id,
            })

            setUserLocked(true)
        }
        catch (e) {
            setError(e.details || e.message)
        }
        finally {
        }
    }

    useEffect(() => {
        let commitHandler: any = undefined
        if (!sourceDetails?.hashlock) {
            (async () => {
                commitHandler = setInterval(async () => {
                    if (!source_network?.chain_id)
                        throw Error("No chain id")
                    if (!provider)
                        throw new Error("No source provider")

                    const data = await provider.getDetails({
                        type: source_asset?.contract ? 'erc20' : 'native',
                        chainId: source_network.chain_id,
                        id: commitId as string,
                        contractAddress: atomicContract
                    })
                    if (data?.hashlock) {
                        setSourceDetails(data)
                        clearInterval(commitHandler)
                    }
                }, 5000)
            })()
        }
        return () => clearInterval(commitHandler)
    }, [provider])

    return <div className="font-normal flex flex-col w-full relative z-10 space-y-4 grow">
        {
            userLocked ?
                <ButtonStatus
                    isDisabled={true}
                >
                    Sign & Confirm
                </ButtonStatus>
                :
                source_network && <WalletActionButton
                    activeChain={wallet?.chainId}
                    isConnected={!!wallet}
                    network={source_network}
                    networkChainId={source_network.chain_id}
                    onClick={handleLockAssets}
                >
                    Sign & Confirm
                </WalletActionButton>
        }
    </div>

}

export const UserRefundAction: FC = () => {
    const { source_network, commitId, sourceDetails, setSourceDetails, setError, source_asset, destination_network, destination_asset, setDestinationDetails } = useAtomicState()
    const { getProvider } = useWallet()
    const [requestedRefund, setRequestedRefund] = useState(false)
    const router = useRouter()
    const source_provider = source_network && getProvider(source_network, 'withdrawal')
    const destination_provider = destination_network && getProvider(destination_network, 'autofil')

    const wallet = source_provider?.activeWallet

    const sourceAtomicContract = (source_asset?.contract ? source_network?.metadata.htlc_token_contract : source_network?.metadata.htlc_native_contract) as `0x${string}`
    const destinationAtomicContract = (destination_asset?.contract ? destination_network?.metadata.htlc_token_contract : destination_network?.metadata.htlc_native_contract) as `0x${string}`

    const handleRefundAssets = async () => {
        try {
            if (!source_network) throw new Error("No source network")
            if (!commitId) throw new Error("No commitment details")
            if (!sourceDetails) throw new Error("No commitment")
            if (!source_network.chain_id) throw new Error("No chain id")
            if (!source_asset) throw new Error("No source asset")

            const res = await source_provider?.refund({
                type: source_asset?.contract ? 'erc20' : 'native',
                id: commitId,
                hashlock: sourceDetails?.hashlock,
                chainId: source_network.chain_id,
                contractAddress: sourceAtomicContract,
                sourceAsset: source_asset,
            })

            posthog.capture("Refund", {
                commitId: commitId,
                commit: sourceDetails,
                hashlock: sourceDetails?.hashlock,
                chainId: source_network.chain_id,
                contractAddress: sourceAtomicContract
            })

            if (res) {
                router.replace({
                    pathname: router.pathname,
                    query: { ...router.query, refundTxId: res }
                }, undefined, { shallow: true })
            }
            setRequestedRefund(true)
        }
        catch (e) {
            setError(e.details || e.message)
        }
    }

    useEffect(() => {
        let commitHandler: any = undefined;
        (async () => {
            commitHandler = setInterval(async () => {
                if (!source_network?.chain_id)
                    throw Error("No chain id")
                if (!source_provider)
                    throw new Error("No source provider")

                const data = await source_provider.getDetails({
                    type: source_asset?.contract ? 'erc20' : 'native',
                    chainId: source_network.chain_id,
                    id: commitId as string,
                    contractAddress: sourceAtomicContract
                })
                if (data?.claimed == 2) {
                    setSourceDetails(data)
                    clearInterval(commitHandler)
                }
            }, 5000)
        })()
        return () => clearInterval(commitHandler)
    }, [source_provider])

    useEffect(() => {
        let lockHandler: any = undefined
        if (destination_provider) {
            lockHandler = setInterval(async () => {
                if (!destination_network?.chain_id)
                    throw Error("No chain id")
                if (!commitId)
                    throw Error("No commitId")

                const data = await destination_provider.getDetails({
                    type: destination_asset?.contract ? 'erc20' : 'native',
                    chainId: destination_network.chain_id,
                    id: commitId,
                    contractAddress: destinationAtomicContract,
                })

                if (data) setDestinationDetails(data)
                if (data?.claimed == 2) {
                    clearInterval(lockHandler)
                }
            }, 5000)
        }
        return () => {
            lockHandler && clearInterval(lockHandler);
        };
    }, [source_provider])

    return <div className="font-normal flex flex-col w-full relative z-10 space-y-4 grow">
        {
            requestedRefund ?
                <ActionStatus
                    status="pending"
                    title={'Waiting for confirmations'}
                />
                :
                <WalletActionButton
                    activeChain={wallet?.chainId}
                    isConnected={!!wallet}
                    network={source_network!}
                    networkChainId={Number(source_network?.chain_id)}
                    onClick={handleRefundAssets}
                >
                    Refund
                </WalletActionButton>
        }
    </div>
}