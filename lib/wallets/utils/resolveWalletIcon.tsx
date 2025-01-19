import AddressIcon from "../../../components/AddressIcon";
import SVGWithImg from "../../../components/icons/SvgWithImg";
import WalletIcon from "../../../components/icons/WalletIcon";
import KnownEVMConnectors from "../evm/KnownEVMConnectors";
import KnownFuelConnectors from "../fuel/KnownFuelConnectors";
import KnownSolanaConnectors from "../solana/KnownSolanaConnectors";
import KnownStarknetConnectors from "../starknet/KnownStarknetConnectors";

const connectors = [
    ...KnownEVMConnectors,
    ...KnownSolanaConnectors,
    ...KnownStarknetConnectors,
    ...KnownFuelConnectors
]

export const resolveWalletConnectorIcon = ({ connector, address, iconUrl }: { connector?: string, address?: string, iconUrl?: string }) => {
    const knownConnector = connectors.find(c => c.id === connector?.toLowerCase())

    if (knownConnector && knownConnector.icon) return knownConnector.icon
    else if (iconUrl) return SVGIconWrapper(iconUrl)

    if (address) return AddressIconWrapper(address)
    else return WalletIcon
}

export const resolveWalletConnectorIndex = (id: string) => {
    return connectors.findIndex(c => c.id === id?.toLowerCase())
}

const AddressIconWrapper = (address: string) => (props: typeof AddressIcon) => {
    return <AddressIcon address={address} size={24} {...props} />
}

const SVGIconWrapper = (iconUrl: string) => (props) => {
    return <SVGWithImg {...props} image_url={iconUrl} />
}
