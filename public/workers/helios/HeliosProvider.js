var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _HeliosProvider_instances, _HeliosProvider_client, _HeliosProvider_chainId, _HeliosProvider_req;
import initWasm, { EthereumClient, OpStackClient } from "./index.js";
export async function init() {
    await initWasm();
}
/// An EIP-1193 compliant Ethereum provider. Treat this the same as you
/// would window.ethereum when constructing an ethers or web3 provider.
export class HeliosProvider {
    /// Do not use this constructor. Instead use the createHeliosProvider function.
    constructor(config, kind) {
        _HeliosProvider_instances.add(this);
        _HeliosProvider_client.set(this, void 0);
        _HeliosProvider_chainId.set(this, void 0);
        if (kind === "ethereum") {
            const executionRpc = config.executionRpc;
            const consensusRpc = config.consensusRpc;
            const checkpoint = config.checkpoint;
            const network = config.network ?? Network.MAINNET;
            const dbType = config.dbType ?? "localstorage";
            __classPrivateFieldSet(this, _HeliosProvider_client, new EthereumClient(executionRpc, consensusRpc, network, checkpoint, dbType), "f");
        }
        else if (kind === "opstack" && config.network) {
            const executionRpc = config.executionRpc;
            const network = config.network;
            __classPrivateFieldSet(this, _HeliosProvider_client, new OpStackClient(executionRpc, network), "f");
        }
        else {
            throw "invalid kind: must be ethereum or opstack";
        }
        __classPrivateFieldSet(this, _HeliosProvider_chainId, __classPrivateFieldGet(this, _HeliosProvider_client, "f").chain_id(), "f");
    }
    async sync() {
        await __classPrivateFieldGet(this, _HeliosProvider_client, "f").sync();
    }
    async waitSynced() {
        await __classPrivateFieldGet(this, _HeliosProvider_client, "f").wait_synced();
    }
    async request(req) {
        try {
            return await __classPrivateFieldGet(this, _HeliosProvider_instances, "m", _HeliosProvider_req).call(this, req);
        }
        catch (err) {
            throw new Error(err.toString());
        }
    }
}
_HeliosProvider_client = new WeakMap(), _HeliosProvider_chainId = new WeakMap(), _HeliosProvider_instances = new WeakSet(), _HeliosProvider_req = async function _HeliosProvider_req(req) {
    switch (req.method) {
        case "eth_getBalance": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_balance(req.params[0], req.params[1]);
        }
        case "eth_chainId": {
            return __classPrivateFieldGet(this, _HeliosProvider_chainId, "f");
        }
        case "eth_blockNumber": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_block_number();
        }
        case "eth_getTransactionByHash": {
            let tx = await __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_transaction_by_hash(req.params[0]);
            return mapToObj(tx);
        }
        case "eth_getTransactionCount": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_transaction_count(req.params[0], req.params[1]);
        }
        case "eth_getBlockTransactionCountByHash": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_block_transaction_count_by_hash(req.params[0]);
        }
        case "eth_getBlockTransactionCountByNumber": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_block_transaction_count_by_number(req.params[0]);
        }
        case "eth_getCode": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_code(req.params[0], req.params[1]);
        }
        case "eth_call": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").call(req.params[0], req.params[1]);
        }
        case "eth_estimateGas": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").estimate_gas(req.params[0]);
        }
        case "eth_gasPrice": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").gas_price();
        }
        case "eth_maxPriorityFeePerGas": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").max_priority_fee_per_gas();
        }
        case "eth_sendRawTransaction": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").send_raw_transaction(req.params[0]);
        }
        case "eth_getTransactionReceipt": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_transaction_receipt(req.params[0]);
        }
        case "eth_getTransactionByHash": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_transaction_by_hash(req.params[0]);
        }
        case "eth_getTransactionByBlockHashAndIndex": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_transaction_by_block_hash_and_index(req.params[0], req.params[1]);
        }
        case "eth_getTransactionByBlockNumberAndIndex": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_transaction_by_block_number_and_index(req.params[0], req.params[1]);
        }
        case "eth_getBlockReceipts": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_block_receipts(req.params[0]);
        }
        case "eth_getLogs": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_logs(req.params[0]);
        }
        case "net_version": {
            return __classPrivateFieldGet(this, _HeliosProvider_chainId, "f");
        }
        case "eth_getBlockByNumber": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").get_block_by_number(req.params[0], req.params[1]);
        }
        case "web3_clientVersion": {
            return __classPrivateFieldGet(this, _HeliosProvider_client, "f").client_version();
        }
        default: {
            throw `method not implemented: ${req.method}`;
        }
    }
};
export var Network;
(function (Network) {
    Network["MAINNET"] = "mainnet";
    Network["GOERLI"] = "goerli";
})(Network || (Network = {}));
function mapToObj(map) {
    if (!map)
        return undefined;
    return Array.from(map).reduce((obj, [key, value]) => {
        if (value !== undefined) {
            obj[key] = value;
        }
        return obj;
    }, {});
}
