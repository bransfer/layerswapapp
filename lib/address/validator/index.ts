import { keccak256 } from "js-sha3";
import KnownInternalNames from "../../knownIds";
import { validateAndParseAddress } from "./starkNetAddressValidator";
import { PublicKey } from '@solana/web3.js'
import { Address } from "@ton/core";

export function isValidAddress(address?: string, network?: { name: string } | null): boolean {
    if (!address || isBlacklistedAddress(address)) {
        return false
    }
    if (network?.name.toLowerCase().startsWith("ZKSYNC".toLowerCase())) {
        if (address?.startsWith("zksync:")) {
            return isValidEtherAddress(address.replace("zksync:", ""));
        }
        return isValidEtherAddress(address);
    }
    else if (network?.name.toLowerCase().startsWith("STARKNET".toLowerCase()) || network?.name.toLowerCase().startsWith("PARADEX".toLowerCase())) {
        return validateAndParseAddress(address);
    }
    else if (network?.name.toLowerCase().startsWith("TON".toLowerCase())) {
        try {
            return !!Address.parse(address).toString({ bounceable: false, testOnly: false, urlSafe: true })
        } catch (error) {
            return false
        }
    }
    else if (network?.name === KnownInternalNames.Networks.OsmosisMainnet) {
        if (/^(osmo1)?[a-z0-9]{38}$/.test(address)) {
            return true
        }
        return false
    }
    else if (network?.name.toLowerCase().startsWith("solana") || network?.name.toLowerCase().startsWith("eclipse")) {
        try {
            let pubkey = new PublicKey(address)
            let isSolana = PublicKey.isOnCurve(pubkey.toBuffer())
            return isSolana
        } catch (error) {
            return false
        }
    }
    else if (network?.name === KnownInternalNames.Networks.SorareStage) {
        if (/^(0x)?[0-9a-f]{64}$/.test(address) || /^(0x)?[0-9A-F]{64}$/.test(address) || /^(0x)?[0-9a-f]{66}$/.test(address) || /^(0x)?[0-9A-F]{66}$/.test(address)) {
            return true;
        }
        return false
    }
    else if (network?.name === KnownInternalNames.Networks.TronMainnet || network?.name === KnownInternalNames.Networks.TronTestnet) {
        const decodedAddress = decodeBase58(address).toUpperCase();
        return decodedAddress.startsWith('41') && decodedAddress.length == 42
    }
    else if (network?.name === KnownInternalNames.Networks.FuelTestnet || network?.name === KnownInternalNames.Networks.FuelMainnet) {
        const hexRegex = /^[0-9a-fA-F]+$/;

        if (address.startsWith("0x")) {
            address = address.slice(2); // Remove the "0x" prefix
        } else {
            return false;
        }

        return address.length === 64 && hexRegex.test(address);
    }
    else {
        return isValidEtherAddress(address);
    }
}

function isValidEtherAddress(address: string): boolean {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return true
        return true;
    } else {
        // Otherwise check each case
        return isChecksumAddress(address);
    }
}

function isChecksumAddress(address: string): boolean {
    // Check each case
    address = address.replace('0x', '');
    var addressHash = keccak256(address.toLowerCase());
    for (var i = 0; i < 40; i++) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
};

function isBlacklistedAddress(address: string): boolean {

    const BlacklistedAddresses = [
        "0xa9d38c3FB49074c00596a25CcF396402362C92C5",
        "0x4d70500858f9705ddbd56d007d13bbc92c9c67d1"
    ]

    let account = address

    if (account.includes(":")) {
        account = account.split(":")[1]
    }

    if (BlacklistedAddresses.find(a => a.toLowerCase() === account.toLowerCase())) return true
    else return false
}

// Function to decode a Base58 string
function decodeBase58(base58Str) {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const BASE = 58;

    let num = 0n; // Use BigInt for large numbers

    // Decode Base58 string to a BigInt
    for (let char of base58Str) {
        let charIndex = ALPHABET.indexOf(char);
        num = num * BigInt(BASE) + BigInt(charIndex);
    }

    // Convert BigInt to a byte array
    let hex = num.toString(16);
    if (hex.length % 2 !== 0) {
        hex = '0' + hex; // Ensure even length for proper byte representation
    }
    let bytes = Array.from(Buffer.from(hex, 'hex'));

    // Add leading zero bytes for each '1' in the original Base58 string
    let leadingZeroes = 0;
    for (let char of base58Str) {
        if (char === '1') {
            leadingZeroes++;
        } else {
            break;
        }
    }
    // Prepend zero bytes for each leading '1'
    bytes = new Array(leadingZeroes).fill(0).concat(bytes);

    // Remove the last 4 bytes (checksum) from the decoded data
    if (bytes.length > 4) {
        bytes = bytes.slice(0, -4);
    }

    // Convert byte array to hex string
    let resultHex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');

    return resultHex;
}