import { FC, useEffect, useRef, useState } from "react";
import { Network, Token } from "../../../../Models/Network";
import { useAtomicState } from "../../../../context/atomicContext";
import SubmitButton from "../../../buttons/submitButton";
import useWallet from "../../../../hooks/useWallet";
import { WalletProvider } from "../../../../Models/WalletProvider";

export const LpLockingAssets: FC = () => {
    const { destination_network, commitId, setDestinationDetails, destination_asset, lightClient, sourceDetails } = useAtomicState()
    const { provider } = useWallet(destination_network, 'autofil')
    const isLoading = useRef(false)

    const atomicContract = (destination_asset?.contract ? destination_network?.metadata.htlc_token_contract : destination_network?.metadata.htlc_native_contract) as `0x${string}`

    const getDetails = async ({ provider, network, commitId, asset }: { provider: WalletProvider, network: Network, commitId: string, asset: Token }) => {
        if (lightClient && !sourceDetails?.hashlock) {
            try {
                const destinationDetails = await lightClient.getHashlock({
                    network: network,
                    token: asset,
                    commitId,
                    atomicContract
                })
                if (destinationDetails) {
                    setDestinationDetails({ ...destinationDetails, fetchedByLightClient: true })
                    return
                }
            }
            catch (e) {
                console.log(e)
            }
        }

        let lockHandler: any = undefined
        lockHandler = setInterval(async () => {
            if (!network.chain_id)
                throw Error("No chain id")

            if (provider.secureGetDetails) {
                try {
                    const destiantionDetails = await provider.secureGetDetails({
                        type: asset?.contract ? 'erc20' : 'native',
                        chainId: network.chain_id,
                        id: commitId,
                        contractAddress: atomicContract,
                    })

                    if (destiantionDetails?.hashlock) {
                        setDestinationDetails({ ...destiantionDetails, fetchedByLightClient: false })
                        clearInterval(lockHandler)
                    }
                    return
                }
                catch (e) {
                    clearInterval(lockHandler)
                    console.log(e)
                }

            }

            const destiantionDetails = await provider.getDetails({
                type: asset?.contract ? 'erc20' : 'native',
                chainId: network.chain_id,
                id: commitId,
                contractAddress: atomicContract
            })

            if (destiantionDetails?.hashlock) {
                setDestinationDetails({ ...destiantionDetails, fetchedByLightClient: false })
                clearInterval(lockHandler)
            }

        }, 5000)

        return () => {
            lockHandler && clearInterval(lockHandler);
        };

    }

    useEffect(() => {
        (async () => {
            if (provider && destination_network && commitId && destination_asset && !isLoading.current) {
                isLoading.current = true
                await getDetails({ provider, network: destination_network, commitId, asset: destination_asset })
            }
        })()
    }, [provider, destination_network, commitId, isLoading])

    return <SubmitButton
        isDisabled={true}
    >
        Sign & Confirm
    </SubmitButton>
}