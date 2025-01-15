import type { NetworkNodeConfig } from '@tronweb3/tronwallet-abstract-adapter';
import { TronWeb } from '@tronweb3/tronwallet-abstract-adapter';

export interface TronLinkWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

export { TronWeb };
export interface ReqestAccountsResponse {
    code: 200 | 4000 | 4001;
    message: string;
}

export interface TronLinkMessageEvent {
    data: {
        isTronLink: boolean;
        message: {
            action: 'setAccount' | 'accountsChanged' | 'setNode' | 'connect' | 'disconnect';
            data?: AccountsChangedEventData | NetworkChangedEventData;
        };
    };
}
export interface AccountsChangedEventData {
    // tronlink will return false when users lock accounts, treat it as string
    address: string;
}

export interface NetworkChangedEventData {
    node: NetworkNodeConfig;
    connectNode: NetworkNodeConfig;
}

interface TronRequestArguments {
    readonly method: string;
    readonly params?: unknown[] | object;
}
interface ProviderRpcError extends Error {
    code: number;
    message: string;
    data?: unknown;
}
type TronEvent = 'connect' | 'disconnect' | 'chainChanged' | 'accountsChanged';

export type TronConnectCallback = (data: { chainId: string }) => void;
export type TronChainChangedCallback = TronConnectCallback;
export type TronDisconnectCallback = (error: ProviderRpcError) => void;
export type TronAccountsChangedCallback = (data: [string?]) => void;
export interface Tron {
    request(args: { method: 'eth_requestAccounts' }): Promise<[string]>;
    request(args: TronRequestArguments): Promise<unknown>;

    on(event: 'connect', cb: TronConnectCallback): void;
    on(event: 'disconnect', cb: TronDisconnectCallback): void;
    on(event: 'chainChanged', cb: TronChainChangedCallback): void;
    on(event: 'accountsChanged', cb: TronAccountsChangedCallback): void;

    removeListener(event: TronEvent, cb: unknown): void;
    tronWeb: TronWeb | false;
    isTronLink: boolean;
}
