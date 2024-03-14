import React, { useCallback } from "react";

import { sepolia, mainnet } from "@starknet-react/chains";
import {
    Connector,
    InjectedConnector,
    StarknetConfig,
    publicProvider
} from "@starknet-react/core";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "../shadcn/dialog";
import { useWalletStore } from "../../stores/walletStore";
import resolveWalletConnectorIcon from "../../lib/wallets/utils/resolveWalletIcon";
import { fromHex } from "viem";

export default function StarknetProvider({ children }) {
    const connectors = [
        new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
        new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
    ]

    const name = 'starknet'
    const WALLETCONNECT_PROJECT_ID = '28168903b2d30c75e5f7f2d71902581b';

    const addWallet = useWalletStore((state) => state.connectWallet)
    const removeWallet = useWalletStore((state) => state.disconnectWallet)

    const connectWallet = useCallback(async (chain: string) => {
        const constants = (await import('starknet')).constants
        const chainId = (chain && fromHex(chain as `0x${string}`, 'string')) || constants.NetworkName.SN_MAIN

        const connect = (await import('starknetkit')).connect
        try {
            const { wallet } = await connect({
                argentMobileOptions: {
                    dappName: 'Layerswap',
                    projectId: WALLETCONNECT_PROJECT_ID,
                    url: 'https://www.layerswap.io/app',
                    description: 'Move crypto across exchanges, blockchains, and wallets.',
                    chainId: chainId as any
                },
                dappName: 'Layerswap',
                modalMode: 'alwaysAsk'
            })
            if (wallet && wallet.account && wallet.isConnected) {
                addWallet({
                    address: wallet.account.address,
                    chainId: wallet.provider?.chainId || wallet.provider?.provider?.chainId,
                    icon: resolveWalletConnectorIcon({ connector: wallet.name, address: wallet.account.address }),
                    connector: wallet.name,
                    providerName: name,
                    metadata: {
                        starknetAccount: wallet
                    }
                })
            } else if (wallet?.isConnected === false) {
                await disconnectWallet()
                connectWallet(chain)
            }
        }
        catch (e) {
            throw new Error(e)
        }
    }, [addWallet])

    const disconnectWallet = async () => {
        const disconnect = (await import('starknetkit')).disconnect
        try {
            disconnect({ clearLastWallet: true })
            removeWallet(name)
        }
        catch (e) {
            console.log(e)
        }
    }

    return (
        <StarknetConfig
            chains={[mainnet, sepolia]}
            provider={publicProvider()}
            connectors={connectors}
        >
            {children}
            <div className="w-full flex justify-end">
                <Dialog>
                    <DialogTrigger asChild>
                        <button >Connect Wallet</button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>Connect Wallet</DialogHeader>
                        <div className="flex flex-col gap-4">
                            {connectors.map((connector: Connector) => (
                                <button
                                    key={connector.id}
                                    onClick={() => connectWallet('')}
                                    disabled={!connector.available()}
                                >
                                    Connect {connector.name}
                                </button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </StarknetConfig>
    );
}