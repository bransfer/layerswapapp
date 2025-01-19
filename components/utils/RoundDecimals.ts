export function roundDecimals(value: number, decimals: number) {
    if (decimals === 1) {
        decimals = 0
    }
    return Number(Math.ceil(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

export function truncateDecimals(value: number | undefined, decimals?: number) {
    return Number(value?.toFixed(decimals || 0));
} 

export function truncateDecimalsToFloor(number: number, decimalPlaces: number) {
    let factor = Math.pow(10, decimalPlaces);
    return Math.floor(number * factor) / factor;
}

export function findIndexOfFirstNonZeroAfterComma(number) {
    // Convert the number to a string
    let numberStr = number.toString();

    // Find the position of the decimal point
    let decimalIndex = numberStr.indexOf('.');

    // If there's no decimal point, return null
    if (decimalIndex === -1) {
        return null;
    }

    // Loop through the characters after the decimal point
    for (let i = decimalIndex + 1; i < numberStr.length; i++) {
        if (numberStr[i] !== '0') {
            return i - decimalIndex; // Position after the decimal point
        }
    }

    // If no non-zero number was found, return null
    return null;
}