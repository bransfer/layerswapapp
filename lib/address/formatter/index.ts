import { Address } from "@ton/core";

export function addressFormat(address: string, network: { name: string } | null): string {

    if (network?.name.toLowerCase().startsWith("starknet")) {
        const removeHexPrefix = (hex: string) => {
            return hex?.replace("0x", "");
        }
        const addHexPrefix = (hex: string) => {
            return `0x${hex}`
        }
        const addAddressPadding = (address: string) => {
            return addHexPrefix(removeHexPrefix(address)?.padStart(64, '0'))
        }

        return addAddressPadding(address?.toLowerCase());

    }
    else if (network?.name.toLowerCase().startsWith("ton")) {
        try {
            return Address.parse(address).toString({ bounceable: false, testOnly: false, urlSafe: true })
        } catch (error) {
            return address
        }
    }
    else if (network?.name.toLowerCase().startsWith("solana") || network?.name.toLowerCase().startsWith("eclipse")) {
        return address
    }
    else {
        return address?.toLowerCase();
    }
}