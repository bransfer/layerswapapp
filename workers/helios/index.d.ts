/* tslint:disable */
/* eslint-disable */
export class EthereumClient {
  free(): void;
  /**
   * @param {string} execution_rpc
   * @param {string | undefined} consensus_rpc
   * @param {string} network
   * @param {string | undefined} checkpoint
   * @param {string} db_type
   */
  constructor(execution_rpc: string, consensus_rpc: string | undefined, network: string, checkpoint: string | undefined, db_type: string);
  /**
   * @returns {Promise<void>}
   */
  sync(): Promise<void>;
  /**
   * @returns {Promise<void>}
   */
  wait_synced(): Promise<void>;
  /**
   * @returns {number}
   */
  chain_id(): number;
  /**
   * @returns {Promise<number>}
   */
  get_block_number(): Promise<number>;
  /**
   * @param {any} addr
   * @param {any} block
   * @returns {Promise<string>}
   */
  get_balance(addr: any, block: any): Promise<string>;
  /**
   * @param {string} hash
   * @returns {Promise<any>}
   */
  get_transaction_by_hash(hash: string): Promise<any>;
  /**
   * @param {any} hash
   * @param {any} index
   * @returns {Promise<any>}
   */
  get_transaction_by_block_hash_and_index(hash: any, index: any): Promise<any>;
  /**
   * @param {any} block
   * @param {any} index
   * @returns {Promise<any>}
   */
  get_transaction_by_block_number_and_index(block: any, index: any): Promise<any>;
  /**
   * @param {any} addr
   * @param {any} block
   * @returns {Promise<number>}
   */
  get_transaction_count(addr: any, block: any): Promise<number>;
  /**
   * @param {any} hash
   * @returns {Promise<number | undefined>}
   */
  get_block_transaction_count_by_hash(hash: any): Promise<number | undefined>;
  /**
   * @param {any} block
   * @returns {Promise<number | undefined>}
   */
  get_block_transaction_count_by_number(block: any): Promise<number | undefined>;
  /**
   * @param {any} block
   * @param {boolean} full_tx
   * @returns {Promise<any>}
   */
  get_block_by_number(block: any, full_tx: boolean): Promise<any>;
  /**
   * @param {any} addr
   * @param {any} block
   * @returns {Promise<string>}
   */
  get_code(addr: any, block: any): Promise<string>;
  /**
   * @param {any} opts
   * @param {any} block
   * @returns {Promise<string>}
   */
  call(opts: any, block: any): Promise<string>;
  /**
   * @param {any} opts
   * @returns {Promise<number>}
   */
  estimate_gas(opts: any): Promise<number>;
  /**
   * @returns {Promise<any>}
   */
  gas_price(): Promise<any>;
  /**
   * @returns {Promise<any>}
   */
  max_priority_fee_per_gas(): Promise<any>;
  /**
   * @param {string} tx
   * @returns {Promise<any>}
   */
  send_raw_transaction(tx: string): Promise<any>;
  /**
   * @param {any} tx
   * @returns {Promise<any>}
   */
  get_transaction_receipt(tx: any): Promise<any>;
  /**
   * @param {any} block
   * @returns {Promise<any>}
   */
  get_block_receipts(block: any): Promise<any>;
  /**
   * @param {any} filter
   * @returns {Promise<any>}
   */
  get_logs(filter: any): Promise<any>;
  /**
   * @returns {Promise<string>}
   */
  client_version(): Promise<string>;
}
export class OpStackClient {
  free(): void;
  /**
   * @param {string} execution_rpc
   * @param {string} network
   */
  constructor(execution_rpc: string, network: string);
  /**
   * @returns {Promise<void>}
   */
  sync(): Promise<void>;
  /**
   * @returns {Promise<void>}
   */
  wait_synced(): Promise<void>;
  /**
   * @returns {number}
   */
  chain_id(): number;
  /**
   * @returns {Promise<number>}
   */
  get_block_number(): Promise<number>;
  /**
   * @param {any} addr
   * @param {any} block
   * @returns {Promise<string>}
   */
  get_balance(addr: any, block: any): Promise<string>;
  /**
   * @param {string} hash
   * @returns {Promise<any>}
   */
  get_transaction_by_hash(hash: string): Promise<any>;
  /**
   * @param {any} hash
   * @param {any} index
   * @returns {Promise<any>}
   */
  get_transaction_by_block_hash_and_index(hash: any, index: any): Promise<any>;
  /**
   * @param {any} block
   * @param {any} index
   * @returns {Promise<any>}
   */
  get_transaction_by_block_number_and_index(block: any, index: any): Promise<any>;
  /**
   * @param {any} addr
   * @param {any} block
   * @returns {Promise<number>}
   */
  get_transaction_count(addr: any, block: any): Promise<number>;
  /**
   * @param {any} hash
   * @returns {Promise<number | undefined>}
   */
  get_block_transaction_count_by_hash(hash: any): Promise<number | undefined>;
  /**
   * @param {any} block
   * @returns {Promise<number | undefined>}
   */
  get_block_transaction_count_by_number(block: any): Promise<number | undefined>;
  /**
   * @param {any} block
   * @param {boolean} full_tx
   * @returns {Promise<any>}
   */
  get_block_by_number(block: any, full_tx: boolean): Promise<any>;
  /**
   * @param {any} addr
   * @param {any} block
   * @returns {Promise<string>}
   */
  get_code(addr: any, block: any): Promise<string>;
  /**
   * @param {any} opts
   * @param {any} block
   * @returns {Promise<string>}
   */
  call(opts: any, block: any): Promise<string>;
  /**
   * @param {any} opts
   * @returns {Promise<number>}
   */
  estimate_gas(opts: any): Promise<number>;
  /**
   * @returns {Promise<any>}
   */
  gas_price(): Promise<any>;
  /**
   * @returns {Promise<any>}
   */
  max_priority_fee_per_gas(): Promise<any>;
  /**
   * @param {string} tx
   * @returns {Promise<any>}
   */
  send_raw_transaction(tx: string): Promise<any>;
  /**
   * @param {any} tx
   * @returns {Promise<any>}
   */
  get_transaction_receipt(tx: any): Promise<any>;
  /**
   * @param {any} block
   * @returns {Promise<any>}
   */
  get_block_receipts(block: any): Promise<any>;
  /**
   * @param {any} filter
   * @returns {Promise<any>}
   */
  get_logs(filter: any): Promise<any>;
  /**
   * @returns {Promise<string>}
   */
  client_version(): Promise<string>;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_ethereumclient_free: (a: number, b: number) => void;
  readonly ethereumclient_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => Array;
  readonly ethereumclient_sync: (a: number) => number;
  readonly ethereumclient_wait_synced: (a: number) => number;
  readonly ethereumclient_chain_id: (a: number) => number;
  readonly ethereumclient_get_block_number: (a: number) => number;
  readonly ethereumclient_get_balance: (a: number, b: number, c: number) => number;
  readonly ethereumclient_get_transaction_by_hash: (a: number, b: number, c: number) => number;
  readonly ethereumclient_get_transaction_by_block_hash_and_index: (a: number, b: number, c: number) => number;
  readonly ethereumclient_get_transaction_by_block_number_and_index: (a: number, b: number, c: number) => number;
  readonly ethereumclient_get_transaction_count: (a: number, b: number, c: number) => number;
  readonly ethereumclient_get_block_transaction_count_by_hash: (a: number, b: number) => number;
  readonly ethereumclient_get_block_transaction_count_by_number: (a: number, b: number) => number;
  readonly ethereumclient_get_block_by_number: (a: number, b: number, c: number) => number;
  readonly ethereumclient_get_code: (a: number, b: number, c: number) => number;
  readonly ethereumclient_call: (a: number, b: number, c: number) => number;
  readonly ethereumclient_estimate_gas: (a: number, b: number) => number;
  readonly ethereumclient_gas_price: (a: number) => number;
  readonly ethereumclient_max_priority_fee_per_gas: (a: number) => number;
  readonly ethereumclient_send_raw_transaction: (a: number, b: number, c: number) => number;
  readonly ethereumclient_get_transaction_receipt: (a: number, b: number) => number;
  readonly ethereumclient_get_block_receipts: (a: number, b: number) => number;
  readonly ethereumclient_get_logs: (a: number, b: number) => number;
  readonly ethereumclient_client_version: (a: number) => number;
  readonly __wbg_opstackclient_free: (a: number, b: number) => void;
  readonly opstackclient_new: (a: number, b: number, c: number, d: number) => Array;
  readonly opstackclient_sync: (a: number) => number;
  readonly opstackclient_wait_synced: (a: number) => number;
  readonly opstackclient_chain_id: (a: number) => number;
  readonly opstackclient_get_block_number: (a: number) => number;
  readonly opstackclient_get_balance: (a: number, b: number, c: number) => number;
  readonly opstackclient_get_transaction_by_hash: (a: number, b: number, c: number) => number;
  readonly opstackclient_get_transaction_by_block_hash_and_index: (a: number, b: number, c: number) => number;
  readonly opstackclient_get_transaction_by_block_number_and_index: (a: number, b: number, c: number) => number;
  readonly opstackclient_get_transaction_count: (a: number, b: number, c: number) => number;
  readonly opstackclient_get_block_transaction_count_by_hash: (a: number, b: number) => number;
  readonly opstackclient_get_block_transaction_count_by_number: (a: number, b: number) => number;
  readonly opstackclient_get_block_by_number: (a: number, b: number, c: number) => number;
  readonly opstackclient_get_code: (a: number, b: number, c: number) => number;
  readonly opstackclient_call: (a: number, b: number, c: number) => number;
  readonly opstackclient_estimate_gas: (a: number, b: number) => number;
  readonly opstackclient_gas_price: (a: number) => number;
  readonly opstackclient_max_priority_fee_per_gas: (a: number) => number;
  readonly opstackclient_send_raw_transaction: (a: number, b: number, c: number) => number;
  readonly opstackclient_get_transaction_receipt: (a: number, b: number) => number;
  readonly opstackclient_get_block_receipts: (a: number, b: number) => number;
  readonly opstackclient_get_logs: (a: number, b: number) => number;
  readonly opstackclient_client_version: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly closure238_externref_shim: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h01d972fcfce72436: (a: number, b: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly closure179_externref_shim: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
