import init, { set_panic_hook, Beerus } from './beerus_web.js';

var initialized = false;
var configured = false;
var client;

self.onmessage = async event => {
    console.log('worker: ', event.data);
    if (!initialized) {
        await init();
        set_panic_hook();
        initialized = true;
    }
    if (!configured) {
        try {
            let beerus = await new Beerus(event.data, post);
            console.log('Beerus instance created');
            client = beerus;
            configured = true;
            self.postMessage('OK');
            return;
        } catch (e) {
            console.log('failed to create Beerus instance: ', e);
            return;
        }
    }
    let request = JSON.parse(event.data);
    if (request.hasOwnProperty('state')) {
        try {
            let state = await client.get_state();
            self.postMessage(`{"id":${request.id},"result":${state}}`);
        } catch (e) {
            console.error(e);
            let error = sanitize(e.toString());
            self.postMessage(`{"id":${request.id},"error":"${error}"}`);
        }
    } else if (request.hasOwnProperty('execute')) {
        let req = JSON.stringify(request['execute']);
        try {
            let result = await client.execute(req);
            self.postMessage(`{"id":${request.id},"result":${result}}`);
        } catch (e) {
            console.error(e);
            let error = sanitize(e.toString());
            self.postMessage(`{"id":${request.id},"error":"${error}"}`);
        }
    } else {
        console.error('worker: unknown request: ', event.data);
        self.postMessage(`{"id":${request.id},"error": "unknown request"}`);
    }
}

function post(url, body) {
    let call = method(body);
    let now = performance.now();

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(body);

    let ms = performance.now() - now;
    if (xhr.status != 200) {
        console.error(`call to ${call} completed in ${ms} ms`);
        throw new Error(xhr.statusText);
    }
    console.debug(`call to ${call} completed in ${ms} ms`);
    return xhr.responseText;
}

function method(body) {
    try {
        let json = JSON.parse(body);
        return json.method;
    } catch (e) {
        return "unknown";
    }
}

function sanitize(s) {
    return s.split(/\r?\n/)[0]
        .replaceAll('\"', '\'')
        .replaceAll('\\\'', '\'');
}
