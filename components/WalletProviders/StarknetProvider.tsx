import { FC, ReactNode, useEffect, useState } from "react";
import { mainnet, sepolia } from "@starknet-react/chains"
import { Connector, ConnectorNotConnectedError, UserNotConnectedError, StarknetConfig, publicProvider } from '@starknet-react/core';
import { RpcMessage, RequestFnCall, RpcTypeToMessageMap } from "starknet-types-07";

const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '28168903b2d30c75e5f7f2d71902581b';

class DiscoveryConnector extends Connector {
    #wallet;
    #store;

    constructor(wallet, store) {
        super();
        this.#wallet = wallet;
        this.#store = store;
    }

    get id() {
        return `${this.#wallet.id}-mobile`;
    }

    get icon() {
        return {
            dark: this.#wallet.icon,
            light: this.#wallet.icon
        };
    }

    get name() {
        return `${this.#wallet.name} (mobile)`;
    }

    available() {
        return true;
    }

    connect(): any {
        window.open(this.#wallet.downloads[this.#store], "_blank");
        return undefined
    }

    get wallet() {
        throw new ConnectorNotConnectedError()
    }

    disconnect(): any {
        throw new UserNotConnectedError()
    }

    account(): any {
        throw new ConnectorNotConnectedError()
    }
    ready(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    chainId(): Promise<bigint> {
        throw new Error("Method not implemented.");
    }
    request<T extends RpcMessage["type"]>(call: RequestFnCall<T>): Promise<RpcTypeToMessageMap[T]["result"]> {
        throw new Error("Method not implemented.");
    }

}


const StarknetProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [connectors, setConnectors] = useState<any[]>([])

    const resolveConnectors = async () => {
        const InjectedConnector = (await import('../../node_modules/starknetkit/dist/injectedConnector')).InjectedConnector
        const ArgentMobileConnector = (await import('../../node_modules/starknetkit/dist/argentMobile')).ArgentMobileConnector
        const WebWalletConnector = (await import('../../node_modules/starknetkit/dist/webwalletConnector')).WebWalletConnector

        const isSafari =
            typeof window !== "undefined"
                ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
                : false
        const isAndroid = navigator.userAgent.match(/Android/i);
        const isIOS = navigator.userAgent.match(/iPhone|iPad|iPod/i);

        const defaultConnectors: any[] = []

        if (!isSafari) {
            if (!(isAndroid || isIOS)) {
                defaultConnectors.push(
                    new InjectedConnector({ options: { id: "argentX" } }),
                )
                defaultConnectors.push(
                    new InjectedConnector({ options: { id: "keplr" } }),
                )
            }
            defaultConnectors.push(
                new InjectedConnector({ options: { id: "braavos" } }),
            )
        }

        if ((isAndroid || isIOS) && !defaultConnectors.some(c => c.id === "braavos")) {
            const starknet = (await import('get-starknet-core')).default

            const discoverWallets = (await starknet.getDiscoveryWallets()).filter(w => {
                return (isAndroid && w.downloads["android"]) || (isIOS && w.downloads["ios"]);
            })

            if (discoverWallets.length) defaultConnectors.push(...discoverWallets.map(w => new DiscoveryConnector(w, isAndroid ? "android" : "ios")))
        }

        defaultConnectors.push(ArgentMobileConnector.init({
            options: {
                dappName: 'Layerswap',
                projectId: WALLETCONNECT_PROJECT_ID,
                url: 'https://www.layerswap.io/app/',
                description: 'Move crypto across exchanges, blockchains, and wallets.',
            }
        }))
        defaultConnectors.push(new WebWalletConnector())

        return defaultConnectors
    }

    useEffect(() => {
        (async () => {
            const result = await resolveConnectors()
            setConnectors(result)
        })()
    }, [])

    const chains = [mainnet, sepolia]

    return (
        <StarknetConfig
            chains={chains}
            provider={publicProvider()}
            connectors={connectors}
        >
            {children}
        </StarknetConfig>
    )
}

export default StarknetProvider;