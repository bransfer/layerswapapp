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
import GlowIcon from "./Wallets/Glow";

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
        default:
            return <></>;
    }
};

const IconsWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return <div className={`grid grid-cols-2 gap-1.5 ${className}`}>{children}</div>;
}

const KnownConnectors = {
    Starknet: "starknet",
    EVM: "evm",
    TON: "ton",
    Solana: "solana",
    Glow: "glow"
};