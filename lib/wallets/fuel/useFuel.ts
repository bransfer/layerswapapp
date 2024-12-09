import KnownInternalNames from "../../knownIds";
import {
    useConnectors,
} from '@fuels/react';
import { Connector, useAccount } from "wagmi";
import {
    FuelConnector,
    Predicate,
    getPredicateRoot,
} from '@fuel-ts/account';
import { Address } from '@fuel-ts/address';
import shortenAddress from "../../../components/utils/ShortenAddress";
import { BAKO_STATE } from "./Basko";
import { resolveWalletConnectorIcon } from "../utils/resolveWalletIcon";
import { InternalConnector, Wallet, WalletProvider } from "../../../Models/WalletProvider";
import { useConnectModal } from "../../../components/WalletModal";
import { useEffect, useState } from "react";

export default function useFuel(): WalletProvider {
    const autofillSupportedNetworks = [
        KnownInternalNames.Networks.FuelTestnet,
        KnownInternalNames.Networks.FuelMainnet
    ]
    const name = 'Fuel'
    const id = 'fuel'

    const { address: evmAddress, connector: evmConnector } = useAccount()
    const { connectors, isFetched, isSuccess, isFetchedAfterMount } = useConnectors()
    const { connect } = useConnectModal()
    const [connectedWallets, setConnectedWallets] = useState<Wallet[] | undefined>([])

    const connectWallet = async () => {
        try {
            return await connect(provider)
        }
        catch (e) {
            console.log(e)
        }
    }
    
    const connectConnector = async ({ connector }: { connector: InternalConnector }) => {
        try {

            const fuelConnector = connectors.find(w => w.name === connector.name)

            if (!fuelConnector?.installed) {
                const installLink = fuelConnector?.metadata.install.link
                if (installLink) {
                    window.open(installLink, "_blank");
                    return
                }
            }

            BAKO_STATE.state.last_req = undefined
            BAKO_STATE.period_durtion = 120_000
            await fuelConnector?.connect()

            const addresses = (await fuelConnector?.accounts())?.map(a => Address.fromAddressOrString(a).toB256())

            if (addresses && fuelConnector) {

                const result = resolveWallet({
                    address: addresses[0],
                    addresses: addresses,
                    connector: fuelConnector,
                    evmAddress,
                    evmConnector,
                    connectWallet,
                    disconnectWallet,
                    name,
                    autofillSupportedNetworks
                })

                return result
            }

        }
        catch (e) {
            console.log(e)
        }
    }

    const disconnectWallet = async (connectorName: string) => {
        try {
            const fuelConnector = connectors.find(c => c.name === connectorName)
            if (fuelConnector) {
                await fuelConnector.disconnect()
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    const disconnectWallets = async () => {
        try {
            BAKO_STATE.state.last_req = undefined
            BAKO_STATE.period_durtion = 10_000
            for (const connector of connectors.filter(c => c.connected)) {
                await connector.disconnect()
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    const reconnectWallet = async () => {
        try {
            await disconnectWallets()
            connectWallet()
        }
        catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        (async () => {
            const wallets: Wallet[] | undefined = []
            for (const connector of connectors.filter(c => c.connected)) {

                const addresses = (await connector.accounts()).map(a => Address.fromAddressOrString(a).toB256())

                if (connector.connected) {
                    const w = resolveWallet({
                        address: addresses?.[0],
                        addresses,
                        connector,
                        evmAddress,
                        evmConnector,
                        connectWallet,
                        disconnectWallet,
                        name,
                        autofillSupportedNetworks
                    })
                    wallets.push(w)
                }
            }
            setConnectedWallets(wallets)
        })()
    }, [connectors, isFetched, isSuccess, isFetchedAfterMount])

    const availableWalletsForConnect: InternalConnector[] = connectors.map(c => {

        const name = c.installed ? c.name : `Install ${c.name}`

        return {
            name: name,
            id: c.name,
            type: c.installed ? 'injected' : 'other',
        }
    })

    const provider = {
        connectWallet,
        connectConnector,
        disconnectWallets,
        switchAccount: reconnectWallet,
        availableWalletsForConnect,
        autofillSupportedNetworks,
        activeWallet: connectedWallets?.[0],
        connectedWallets,
        name,
        id,
    }

    return provider
}

type ResolveWalletProps = {
    address: string,
    addresses: string[],
    connector: FuelConnector,
    evmAddress: `0x${string}` | undefined,
    evmConnector: Connector | undefined,
    connectWallet: () => Promise<Wallet | undefined>,
    disconnectWallet: (connectorName: string) => Promise<void>,
    name: string,
    autofillSupportedNetworks: string[]
}

const resolveWallet = ({ address, addresses, autofillSupportedNetworks, connectWallet, connector, disconnectWallet, evmAddress, evmConnector, name }: ResolveWalletProps) => {
    let fuelCurrentConnector: string | undefined = undefined

    let customConnectorname: string | undefined = undefined
    const fuelEvmConnector = connector.name === 'Ethereum Wallets' ? connector : undefined
    const fuelSolanaConnector = connector.name === 'Solana Wallets' ? connector : undefined

    if (fuelEvmConnector && evmAddress && fuelEvmConnector.connected && evmConnector) {
        // @ts-expect-error processPredicateData is only available in the Predicate class
        const { predicateBytes } = Predicate.processPredicateData(
            (fuelEvmConnector as any)?.predicateAccount?.bytecode,
            (fuelEvmConnector as any)?.predicateAccount?.abi,
            {
                SIGNER: (fuelEvmConnector as any)?.predicateAccount?.adapter?.convertAddress(evmAddress),
            },
        );
        const convertedAddress = Address.fromB256(getPredicateRoot(predicateBytes)).toString();
        if (convertedAddress.toLowerCase() === address.toLowerCase()) {
            fuelCurrentConnector = `${evmConnector.name} (${shortenAddress(evmAddress)})`
            customConnectorname = evmConnector.name
        }
    }

    const w: Wallet = {
        address: address,
        addresses: addresses,
        isActive: true,
        connect: connectWallet,
        disconnect: () => disconnectWallet(connector.name),
        connector: fuelCurrentConnector || connector.name,
        providerName: name,
        icon: resolveWalletConnectorIcon({ connector: customConnectorname || connector.name, address: address, iconUrl: typeof connector.metadata.image === 'string' ? connector.metadata.image : (connector.metadata.image?.light.startsWith('data:') ? connector.metadata.image.light : `data:image/svg+xml;base64,${connector.metadata.image && btoa(connector.metadata.image.light)}`) }),
        autofillSupportedNetworks
    }

    return w
}