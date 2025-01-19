let wasm;
const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available'); } });
if (typeof TextDecoder !== 'undefined') {
    cachedTextDecoder.decode();
}
;
let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}
function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
let WASM_VECTOR_LEN = 0;
const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available'); } });
const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
    }
    : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    });
function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }
    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;
    const mem = getUint8ArrayMemory0();
    let offset = 0;
    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F)
            break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);
        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }
    WASM_VECTOR_LEN = offset;
    return ptr;
}
function isLikeNone(x) {
    return x === undefined || x === null;
}
let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}
function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        }
        else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        }
        else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for (let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    }
    else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        }
        catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}
const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry(state => {
        wasm.__wbindgen_export_3.get(state.dtor)(state.a, state.b);
    });
function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        }
        finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_3.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            }
            else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function __wbg_adapter_28(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h85fbd8b08a9f3bc1(arg0, arg1);
}
function __wbg_adapter_31(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he0c89c8310bb9b46(arg0, arg1);
}
function __wbg_adapter_34(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h159a095dc87f6dca(arg0, arg1);
}
function __wbg_adapter_37(arg0, arg1, arg2) {
    wasm.closure3662_externref_shim(arg0, arg1, arg2);
}
export function set_panic_hook() {
    wasm.set_panic_hook();
}
function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
}
function handleError(f, args) {
    try {
        return f.apply(this, args);
    }
    catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}
function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }
function __wbg_adapter_158(arg0, arg1, arg2, arg3) {
    wasm.closure4572_externref_shim(arg0, arg1, arg2, arg3);
}
const __wbindgen_enum_BinaryType = ["blob", "arraybuffer"];
const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];
const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];
const BeerusFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry(ptr => wasm.__wbg_beerus_free(ptr >>> 0, 1));
export class Beerus {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Beerus.prototype);
        obj.__wbg_ptr = ptr;
        BeerusFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BeerusFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_beerus_free(ptr, 0);
    }
    /**
     * @param {string} config_json
     * @param {Function} f
     */
    constructor(config_json, f) {
        const ptr0 = passStringToWasm0(config_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.beerus_new(ptr0, len0, f);
        return ret;
    }
    /**
     * @returns {Promise<any>}
     */
    get_state() {
        const ret = wasm.beerus_get_state(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {string} request
     * @returns {Promise<any>}
     */
    execute(request) {
        const ptr0 = passStringToWasm0(request, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.beerus_execute(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
}
async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            }
            catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
                }
                else {
                    throw e;
                }
            }
        }
        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    }
    else {
        const instance = await WebAssembly.instantiate(module, imports);
        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        }
        else {
            return instance;
        }
    }
}
function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_beerus_new = function (arg0) {
        const ret = Beerus.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function (arg0, arg1) {
        const obj = arg1;
        const ret = typeof (obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_cb_drop = function (arg0) {
        const obj = arg0.original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function () {
        const ret = new Error();
        return ret;
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function (arg0, arg1) {
        const ret = arg1.stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function (arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        }
        finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_clearTimeout_541ac0980ffcef74 = typeof clearTimeout == 'function' ? clearTimeout : notDefined('clearTimeout');
    imports.wbg.__wbg_setTimeout_7d81d052875b0f4f = function () {
        return handleError(function (arg0, arg1) {
            const ret = setTimeout(arg0, arg1);
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_fetch_9b133f5ec268a7b8 = typeof fetch == 'function' ? fetch : notDefined('fetch');
    imports.wbg.__wbg_performance_a1b8bde2ee512264 = function (arg0) {
        const ret = arg0.performance;
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function (arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbg_now_abd80e969af37148 = function (arg0) {
        const ret = arg0.now();
        return ret;
    };
    imports.wbg.__wbg_clearTimeout_76877dbc010e786d = typeof clearTimeout == 'function' ? clearTimeout : notDefined('clearTimeout');
    imports.wbg.__wbg_setTimeout_75cb9b6991a4031d = function () {
        return handleError(function (arg0, arg1) {
            const ret = setTimeout(arg0, arg1);
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_fetch_bc7c8e27076a5c84 = typeof fetch == 'function' ? fetch : notDefined('fetch');
    imports.wbg.__wbg_queueMicrotask_848aa4969108a57e = function (arg0) {
        const ret = arg0.queueMicrotask;
        return ret;
    };
    imports.wbg.__wbindgen_is_function = function (arg0) {
        const ret = typeof (arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_c5419c06eab41e73 = typeof queueMicrotask == 'function' ? queueMicrotask : notDefined('queueMicrotask');
    imports.wbg.__wbg_instanceof_Window_6575cd7f1322f82f = function (arg0) {
        let result;
        try {
            result = arg0 instanceof Window;
        }
        catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_setTimeout_e5d5b865335ce177 = function () {
        return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.setTimeout(arg1, arg2);
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_instanceof_WorkerGlobalScope_90a78b9e967b8726 = function (arg0) {
        let result;
        try {
            result = arg0 instanceof WorkerGlobalScope;
        }
        catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_fetch_1fdc4448ed9eec00 = function (arg0, arg1) {
        const ret = arg0.fetch(arg1);
        return ret;
    };
    imports.wbg.__wbg_setTimeout_5f3721a55aef179e = function () {
        return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.setTimeout(arg1, arg2);
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_log_f740dc2253ea759b = typeof console.log == 'function' ? console.log : notDefined('console.log');
    imports.wbg.__wbg_instanceof_Response_3c0e210a57ff751d = function (arg0) {
        let result;
        try {
            result = arg0 instanceof Response;
        }
        catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_url_58af972663531d16 = function (arg0, arg1) {
        const ret = arg1.url;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_status_5f4e900d22140a18 = function (arg0) {
        const ret = arg0.status;
        return ret;
    };
    imports.wbg.__wbg_headers_1b9bf90c73fae600 = function (arg0) {
        const ret = arg0.headers;
        return ret;
    };
    imports.wbg.__wbg_arrayBuffer_144729e09879650e = function () {
        return handleError(function (arg0) {
            const ret = arg0.arrayBuffer();
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_text_ebeee8b31af4c919 = function () {
        return handleError(function (arg0) {
            const ret = arg0.text();
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_new_a9ae04a5200606a5 = function () {
        return handleError(function () {
            const ret = new Headers();
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_append_8b3e7f74a47ea7d5 = function () {
        return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            arg0.append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        }, arguments);
    };
    imports.wbg.__wbg_setbody_aa8b691bec428bf4 = function (arg0, arg1) {
        arg0.body = arg1;
    };
    imports.wbg.__wbg_setcredentials_a4e661320cdb9738 = function (arg0, arg1) {
        arg0.credentials = __wbindgen_enum_RequestCredentials[arg1];
    };
    imports.wbg.__wbg_setheaders_f5205d36e423a544 = function (arg0, arg1) {
        arg0.headers = arg1;
    };
    imports.wbg.__wbg_setmethod_ce2da76000b02f6a = function (arg0, arg1, arg2) {
        arg0.method = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_setmode_4919fd636102c586 = function (arg0, arg1) {
        arg0.mode = __wbindgen_enum_RequestMode[arg1];
    };
    imports.wbg.__wbg_setsignal_812ccb8269a7fd90 = function (arg0, arg1) {
        arg0.signal = arg1;
    };
    imports.wbg.__wbg_signal_9acfcec9e7dffc22 = function (arg0) {
        const ret = arg0.signal;
        return ret;
    };
    imports.wbg.__wbg_new_75169ae5a9683c55 = function () {
        return handleError(function () {
            const ret = new AbortController();
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_abort_c57daab47a6c1215 = function (arg0) {
        arg0.abort();
    };
    imports.wbg.__wbg_newwithstrandinit_4b92c89af0a8e383 = function () {
        return handleError(function (arg0, arg1, arg2) {
            const ret = new Request(getStringFromWasm0(arg0, arg1), arg2);
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_now_d3cbc9581625f686 = function (arg0) {
        const ret = arg0.now();
        return ret;
    };
    imports.wbg.__wbg_crypto_1d1f22824a6a080c = function (arg0) {
        const ret = arg0.crypto;
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function (arg0) {
        const val = arg0;
        const ret = typeof (val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_process_4a72847cc503995b = function (arg0) {
        const ret = arg0.process;
        return ret;
    };
    imports.wbg.__wbg_versions_f686565e586dd935 = function (arg0) {
        const ret = arg0.versions;
        return ret;
    };
    imports.wbg.__wbg_node_104a2ff8d6ea03a2 = function (arg0) {
        const ret = arg0.node;
        return ret;
    };
    imports.wbg.__wbindgen_is_string = function (arg0) {
        const ret = typeof (arg0) === 'string';
        return ret;
    };
    imports.wbg.__wbg_require_cca90b1a94a0255b = function () {
        return handleError(function () {
            const ret = module.require;
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_msCrypto_eb05e62b530a1508 = function (arg0) {
        const ret = arg0.msCrypto;
        return ret;
    };
    imports.wbg.__wbg_randomFillSync_5c9c955aa56b6049 = function () {
        return handleError(function (arg0, arg1) {
            arg0.randomFillSync(arg1);
        }, arguments);
    };
    imports.wbg.__wbg_getRandomValues_3aa56aa6edec874c = function () {
        return handleError(function (arg0, arg1) {
            arg0.getRandomValues(arg1);
        }, arguments);
    };
    imports.wbg.__wbg_newnoargs_1ede4bf2ebbaaf43 = function (arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_next_13b477da1eaa3897 = function (arg0) {
        const ret = arg0.next;
        return ret;
    };
    imports.wbg.__wbg_next_b06e115d1b01e10b = function () {
        return handleError(function (arg0) {
            const ret = arg0.next();
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_done_983b5ffcaec8c583 = function (arg0) {
        const ret = arg0.done;
        return ret;
    };
    imports.wbg.__wbg_value_2ab8a198c834c26a = function (arg0) {
        const ret = arg0.value;
        return ret;
    };
    imports.wbg.__wbg_iterator_695d699a44d6234c = function () {
        const ret = Symbol.iterator;
        return ret;
    };
    imports.wbg.__wbg_get_ef828680c64da212 = function () {
        return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_call_a9ef466721e824f2 = function () {
        return handleError(function (arg0, arg1) {
            const ret = arg0.call(arg1);
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_new_e69b5f66fda8f13c = function () {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_self_bf91bf94d9e04084 = function () {
        return handleError(function () {
            const ret = self.self;
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_window_52dd9f07d03fd5f8 = function () {
        return handleError(function () {
            const ret = window.window;
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_globalThis_05c129bf37fcf1be = function () {
        return handleError(function () {
            const ret = globalThis.globalThis;
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_global_3eca19bb09e9c484 = function () {
        return handleError(function () {
            const ret = global.global;
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_call_3bfa248576352471 = function () {
        return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.call(arg1, arg2);
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_call_5fb7c8066a4a4825 = function () {
        return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = arg0.call(arg1, arg2, arg3);
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_now_70af4fe37a792251 = function () {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_new_1073970097e5a420 = function (arg0, arg1) {
        try {
            var state0 = { a: arg0, b: arg1 };
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_158(a, state0.b, arg0, arg1);
                }
                finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return ret;
        }
        finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_resolve_0aad7c1484731c99 = function (arg0) {
        const ret = Promise.resolve(arg0);
        return ret;
    };
    imports.wbg.__wbg_then_748f75edfb032440 = function (arg0, arg1) {
        const ret = arg0.then(arg1);
        return ret;
    };
    imports.wbg.__wbg_then_4866a7d9f55d8f3e = function (arg0, arg1, arg2) {
        const ret = arg0.then(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_buffer_ccaed51a635d8a2d = function (arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_7e3eb787208af730 = function (arg0, arg1, arg2) {
        const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_new_fec2611eb9180f95 = function (arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    };
    imports.wbg.__wbg_set_ec2fcf81bc573fd9 = function (arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    };
    imports.wbg.__wbg_length_9254c4bd3b9f23c4 = function (arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_newwithlength_76462a666eca145f = function (arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_subarray_975a06f9dbd16995 = function (arg0, arg1, arg2) {
        const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_stringify_eead5648c09faaf8 = function () {
        return handleError(function (arg0) {
            const ret = JSON.stringify(arg0);
            return ret;
        }, arguments);
    };
    imports.wbg.__wbg_has_bd717f25f195f23d = function () {
        return handleError(function (arg0, arg1) {
            const ret = Reflect.has(arg0, arg1);
            return ret;
        }, arguments);
    };
    imports.wbg.__wbindgen_debug_string = function (arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_throw = function (arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function () {
        const ret = wasm.memory;
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper3157 = function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1802, __wbg_adapter_28);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper10043 = function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 3540, __wbg_adapter_31);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper10239 = function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 3618, __wbg_adapter_34);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper10319 = function (arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 3663, __wbg_adapter_37);
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function () {
        const table = wasm.__wbindgen_export_2;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };
    return imports;
}
function __wbg_init_memory(imports, memory) {
}
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}
function initSync(module) {
    if (wasm !== undefined)
        return wasm;
    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({ module } = module);
        }
        else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead');
        }
    }
    const imports = __wbg_get_imports();
    __wbg_init_memory(imports);
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}
async function __wbg_init(module_or_path) {
    if (wasm !== undefined)
        return wasm;
    module_or_path = '/beerus_web_bg.wasm';
    const imports = __wbg_get_imports();
    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }
    __wbg_init_memory(imports);
    const { instance, module } = await __wbg_load(await module_or_path, imports);
    return __wbg_finalize_init(instance, module);
}
export { initSync };
export default __wbg_init;
