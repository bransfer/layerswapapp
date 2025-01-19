/* tslint:disable */
/* eslint-disable */
export function set_panic_hook(): void;
export class Beerus {
  free(): void;
  /**
   * @param {string} config_json
   * @param {Function} f
   */
  constructor(config_json: string, f: Function);
  /**
   * @returns {Promise<any>}
   */
  get_state(): Promise<any>;
  /**
   * @param {string} request
   * @returns {Promise<any>}
   */
  execute(request: string): Promise<any>;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_beerus_free: (a: number, b: number) => void;
  readonly beerus_new: (a: number, b: number, c: number) => number;
  readonly beerus_get_state: (a: number) => number;
  readonly beerus_execute: (a: number, b: number, c: number) => number;
  readonly set_panic_hook: () => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h85fbd8b08a9f3bc1: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he0c89c8310bb9b46: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h159a095dc87f6dca: (a: number, b: number) => void;
  readonly closure3662_externref_shim: (a: number, b: number, c: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly closure4572_externref_shim: (a: number, b: number, c: number, d: number) => void;
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
export default function __wbg_init(module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
