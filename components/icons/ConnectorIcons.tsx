import RainbowIcon from "../icons/Wallets/Rainbow";
import TON from "../icons/Wallets/TON";
import MetaMaskIcon from "../icons/Wallets/MetaMask";
import WalletConnectIcon from "../icons/Wallets/WalletConnect";
import Braavos from "../icons/Wallets/Braavos";
import ArgentX from "../icons/Wallets/ArgentX";
import Argent from "../icons/Wallets/Argent";
import TonKeeper from "../icons/Wallets/TonKeeper";
import OpenMask from "../icons/Wallets/OpenMask";
import Phantom from "../icons/Wallets/Phantom";
import CoinbaseIcon from "../icons/Wallets/Coinbase";
import { Mail } from "lucide-react";
import MyTonWallet from "./Wallets/MyTonWallet";
import GlowIcon from "../icons/Wallets/Glow";
import Fuel from "./Wallets/Fuel";
import BakoSafe from "./Wallets/BakoSafe";
import Ethereum from "./Wallets/Ethereum";
import Solana from "./Wallets/Solana";
import BitGetIcon from "./Wallets/Bitget";

export const ResolveConnectorIcon = ({
    connector,
    iconClassName,
    className,
}: {
    connector: string;
    iconClassName: string;
    className?: string;
}) => {
    switch (connector.toLowerCase()) {
        case KnownConnectors.EVM:
            return (
                <IconsWrapper className={className}>
                    <MetaMaskIcon className={iconClassName} />
                    <WalletConnectIcon className={iconClassName} />
                    <RainbowIcon className={iconClassName} />
                    <Phantom className={iconClassName} />
                </IconsWrapper>
            );
        case KnownConnectors.Starknet:
            return (
                <IconsWrapper className={className}>
                    <Braavos className={iconClassName} />
                    <Argent className={iconClassName} />
                    <ArgentX className={iconClassName} />
                    <Mail className={`p-1.5 ${iconClassName}`} />
                </IconsWrapper>
            );
        case KnownConnectors.TON:
            return (
                <IconsWrapper className={className}>
                    <TonKeeper className={iconClassName} />
                    <OpenMask className={iconClassName} />
                    <TON className={iconClassName} />
                    <MyTonWallet className={iconClassName} />
                </IconsWrapper>
            );
        case KnownConnectors.Solana:
            return (
                <IconsWrapper className={className}>
                    <CoinbaseIcon className={iconClassName} />
                    <WalletConnectIcon className={iconClassName} />
                    <Phantom className={iconClassName} />
                    <GlowIcon className={iconClassName} />
                </IconsWrapper>
            );
        case KnownConnectors.Fuel:
            return (
                <IconsWrapper className={className}>
                    <Fuel className={iconClassName} />
                    <BakoSafe className={iconClassName} />
                    <Ethereum className={iconClassName} />
                    <Solana className={iconClassName} />
                </IconsWrapper>
            );
        case KnownConnectors.Tron:
            return (
                <IconsWrapper className={className}>
                    <BitGetIcon className={iconClassName} />
                    <WalletConnectIcon className={iconClassName} />
                    <img src='data:image/png;base64,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' className={iconClassName} />
                    <img src ='data:image/png;base64,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' className={iconClassName} />
                </IconsWrapper>
            );
        default:
            return <></>;
    }
};

const IconsWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return <div className={className ?? "-space-x-2 flex"}>{children}</div>;
}

const KnownConnectors = {
    Starknet: "starknet",
    EVM: "evm",
    TON: "ton",
    Solana: "solana",
    Glow: "glow",
    Fuel: "fuel",
    Tron: "tron",
};