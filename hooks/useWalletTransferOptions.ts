import { useSwapDataState } from "../context/swap"
import { NetworkType } from "../Models/Network"
import useWallet from "./useWallet"
import { useEffect } from "react"
import { useContractWalletsStore } from "../stores/contractWalletsStore"
import resolveChain from "../lib/resolveChain"
import { createPublicClient, http } from "viem"
import { useSettingsState } from "../context/settings"

export default function useWalletTransferOptions() {
    const { swapResponse } = useSwapDataState()
    const { networks } = useSettingsState()
    const { swap } = swapResponse || {}
    const { source_network } = swap || {}
    const { addContractWallet, getContractWallet, updateContractWallet } = useContractWalletsStore()
    const { provider } = useWallet(source_network, 'withdrawal')

    const wallet = provider?.activeWallet
    useEffect(() => {
        if (wallet?.address == undefined || source_network == undefined) return;
        let contractWallet = getContractWallet(wallet.address, source_network.name);
        if (!contractWallet) {
            // add before checking to check only once
            addContractWallet(wallet.address, source_network.name);

            const sourceNetworkFromSettings = networks.find(n => n.name === source_network.name);
            checkContractWallet(wallet.address, sourceNetworkFromSettings).then(
                result => {
                    updateContractWallet(wallet.address, sourceNetworkFromSettings?.name, result)
                }
            )
        }
    }, [wallet?.address])

    const walletAddressType = getContractWallet(wallet?.address, source_network?.name)

    const canDoSweepless = source_network && ((source_network.type == NetworkType.EVM
        && (walletAddressType?.ready && !walletAddressType?.isContract))
        || source_network.type == NetworkType.Starknet || source_network.type == NetworkType.ZkSyncLite)
        || wallet?.address?.toLowerCase() === swap?.destination_address.toLowerCase()
    return { canDoSweepless, isContractWallet: walletAddressType }
}

let checkContractWallet = async (address, network) => {
    if (!network || !address) throw new Error('Arguments are required')

    if (network.type != NetworkType.EVM) {
        return false;
    }
    else {
        const chain = resolveChain(network)
        const publicClient = createPublicClient({
            chain,
            transport: http()
        })
        try {
            const bytecode = await publicClient.getBytecode({
                address: address as `0x${string}`
            });

            return !!bytecode;
        } catch (error) {
            console.log(error)
        }
    }
}