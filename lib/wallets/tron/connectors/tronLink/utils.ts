import { isInBrowser, isInMobileBrowser } from '@tronweb3/tronwallet-abstract-adapter';
import type { Tron } from './types.js';

export function supportTron() {
    return !!(window.tron && window.tron.isTronLink);
}
export function supportTronLink() {
    return !!(supportTron() || window.tronLink || window.tronWeb);
}

/**
 * Detect if in TronLinkApp
 * Tron DApp running in the DApp Explorer injects iTron objects automatically to offer customized App service.
 * See [here](https://docs.tronlink.org/tronlink-app/dapp-support/dapp-explorer)
 */
export function isInTronLinkApp() {
    return isInBrowser() && typeof (window as any).iTron !== 'undefined';
}

export function openTronLink(
    { dappIcon, dappName }: { dappIcon: string; dappName: string } = { dappIcon: '', dappName: '' }
) {
    if (!supportTronLink() && isInMobileBrowser() && !isInTronLinkApp()) {
        let defaultDappName = '',
            defaultDappIcon = '';
        try {
            defaultDappName = document.title;
            const link = document.querySelector('link[rel*="icon"]');
            if (link) {
                defaultDappIcon = new URL(link.getAttribute('href') || '', location.href).toString();
            }
        } catch (e) {
            // console.error(e);
        }
        const { origin, pathname, search, hash } = window.location;
        const url = origin + pathname + search + (hash.includes('?') ? hash : `${hash}?_=1`);
        const params = {
            action: 'open',
            actionId: Date.now() + '',
            callbackUrl: 'http://someurl.com', // no need callback
            dappIcon: dappIcon || defaultDappIcon,
            dappName: dappName || defaultDappName,
            url,
            protocol: 'TronLink',
            version: '1.0',
            chainId: '0x2b6653dc',
        };
        window.location.href = `tronlinkoutside://pull.activity?param=${encodeURIComponent(JSON.stringify(params))}`;
        return true;
    }
    return false;
}

export async function waitTronwebReady(tronObj: Tron) {
    return new Promise<void>((resolve, reject) => {
        const interval = setInterval(() => {
            if (tronObj.tronWeb) {
                clearInterval(interval);
                clearTimeout(timeout);
                resolve();
            }
        }, 50);
        const timeout = setTimeout(() => {
            clearInterval(interval);
            reject('`window.tron.tronweb` is not ready.');
        }, 2000);
    });
}
