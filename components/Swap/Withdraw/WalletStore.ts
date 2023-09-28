import { create } from 'zustand'
import { SwapItem } from '../../../lib/layerSwapApiClient'
import { CryptoNetwork, NetworkType } from '../../../Models/CryptoNetwork'
import { GetDefaultNetwork } from '../../../helpers/settingsHelper'
import { StarknetWindowObject } from 'get-starknet'
import KnownInternalNames from '../../../lib/knownIds'
import { Layer } from '../../../Models/Layer'
import { createPublicClient, http, parseAbi } from 'viem'
import resolveChain from '../../../lib/resolveChain'

type Networks = {
    [network: string]: Network
}

type Network = {
    address: string,
    metadata?: Metadata
}

export type Metadata = {
    isArgent?: boolean
}

interface WalletState {
    networks: Networks
    addNetwork: (address: string, source_layer: Layer, swap?: SwapItem, starknetAccount?: StarknetWindowObject, imxAccount?: string) => void
    updateNetworkMetadata: (swap: SwapItem, metadata: Metadata) => void
}

export const useWalletStore = create<WalletState>()((set) => ({
    networks: {},
    addNetwork: async (address, source_layer, swap, starknetAccount, imxAccount) => {

        if (!source_layer) return

        let isArgent: boolean
        let accountAddress: string

        // Check if addres generated by Argent Wallet
        if (source_layer?.internal_name === KnownInternalNames.Networks.EthereumMainnet) {
            isArgent = await isArgentWallet(address, source_layer?.assets?.[0].network)
        }

        // Set source address
        const sourceNetworkType = GetDefaultNetwork(source_layer, swap?.source_network_asset)?.type
        const sourceIsImmutableX = swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.ImmutableXMainnet?.toUpperCase()
            || swap?.source_network === KnownInternalNames.Networks.ImmutableXGoerli?.toUpperCase()
        if (swap?.source_exchange) {
            accountAddress = swap.exchange_account_name
        }
        else if (sourceNetworkType === NetworkType.EVM) {
            accountAddress = address;
        }
        else if (sourceNetworkType === NetworkType.Starknet) {
            accountAddress = starknetAccount?.account?.address;
        }
        else if (sourceIsImmutableX) {
            accountAddress = imxAccount;
        }

        set((state) => {
            return {
                networks: {
                    ...state.networks,
                    [source_layer.internal_name]: {
                        ...state.networks[source_layer.internal_name],
                        address: accountAddress,
                        metadata: {
                            ...state.networks[source_layer.internal_name]?.metadata,
                            isArgent: isArgent
                        }
                    }
                }
            }
        })
    },

    updateNetworkMetadata: (swap, metadata) => set((state) => {
        return {
            networks: {
                ...state.networks,
                [swap.source_network]: {
                    ...state.networks[swap.source_network],
                    metadata: {
                        ...state.networks[swap.source_network].metadata,
                        metadata
                    }
                }
            }
        }
    })
}))


const isArgentWallet = async (address: string, source_network: CryptoNetwork) => {

    const publicClient = createPublicClient({
        chain: resolveChain(source_network),
        transport: http()
    })

    const walletDetectorAddress = "0xeca4B0bDBf7c55E9b7925919d03CbF8Dc82537E8";
    const walletDetectorABI = parseAbi([
        "function isArgentWallet(address _wallet) external view returns (bool)"
    ]);
    const result = await publicClient.readContract({
        address: walletDetectorAddress,
        abi: walletDetectorABI,
        functionName: 'isArgentWallet',
        args: [address as `0x${string}`]
    })
    const data: boolean = result
    return data

}