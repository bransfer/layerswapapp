export default function shortenAddress(address: string) {
    if (address?.startsWith('ronin:')) {
        var stringAddress = address.replace('ronin:', '')
        return `ronin:${InnerShortenAddress(stringAddress)}`
    } else if (address?.startsWith('zksync:')) {
        var stringAddress = address.replace('zksync:', '')
        return `zksync:${InnerShortenAddress(stringAddress)}`
    } else {
        return InnerShortenAddress(address)
    }

    function InnerShortenAddress(address: string) {
        if (address?.length < 13)
            return address;
        return `${address?.substring(0, 5)}...${address?.substring(address?.length - 4, address?.length)}`
    }
}
export const shortenEmail = (email = '', maxNameLenght = 14) => {
    const [name, domain] = email.split('@');
    const { length: len } = name;
    let shortName = name;
    if (len > maxNameLenght) {
        shortName = name?.substring(0, maxNameLenght / 3 * 2) + '...' + name?.substring(len - maxNameLenght / 3, len);
    }
    const maskedEmail = shortName + '@' + domain;
    return maskedEmail;
};

export const addressEnding = (address: string) => {
    return `...${address?.substring(address?.length - 4, address?.length)}`
}