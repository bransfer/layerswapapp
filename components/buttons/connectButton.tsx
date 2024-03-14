import { ReactNode, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import useWallet from "../../hooks/useWallet";
import { NetworkType } from "../../Models/CryptoNetwork";
import RainbowIcon from "../icons/Wallets/Rainbow";
import TON from "../icons/Wallets/TON";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../shadcn/dialog";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import MetaMaskIcon from "../icons/Wallets/MetaMask";
import WalletConnectIcon from "../icons/Wallets/WalletConnect";
import Braavos from "../icons/Wallets/Braavos";
import ArgentX from "../icons/Wallets/ArgentX";
import Argent from "../icons/Wallets/Argent";
import TonKeeper from "../icons/Wallets/TonKeeper";
import OpenMask from "../icons/Wallets/OpenMask";
import Phantom from "../icons/Wallets/Phantom";
import Solflare from "../icons/Wallets/Solflare";
import CoinbaseIcon from "../icons/Wallets/Coinbase";
import GlowIcon from "../icons/Wallets/Glow";

const ConnectButton = ({
    children,
    className,
    onClose,
}: {
    children: ReactNode;
    className?: string;
    onClose?: () => void;
}) => {
    const { connectWallet, wallets } = useWallet();
    const [open, setOpen] = useState<boolean>();

    const { isMobile } = useWindowDimensions();

    const knownConnectors = [
        {
            name: "EVM",
            id: "evm",
            type: NetworkType.EVM,
        },
        {
            name: "Starknet",
            id: "starknet",
            type: NetworkType.Starknet,
        },
        {
            name: "TON",
            id: "ton",
            type: NetworkType.TON,
        },
        {
            name: "Solana",
            id: "solana",
            type: NetworkType.Solana,
        },
    ];
    const filteredConnectors = knownConnectors.filter(
        (c) => !wallets.map((w) => w?.providerName).includes(c.id)
    );
    return isMobile ? (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger aria-label="Connect wallet">{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] text-primary-text">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        Link a new wallet
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    {filteredConnectors.map((connector, index) => (
                        <button
                            type="button"
                            key={index}
                            className="w-full h-fit bg-secondary-700 border border-secondary-500 rounded py-2 px-3"
                            onClick={() => {
                                connectWallet(connector.id);
                                setOpen(false);
                                onClose && onClose();
                            }}
                        >
                            <div className="flex space-x-2 items-center">
                                {connector && (
                                    <div className="inline-flex items-center relative">
                                        <ResolveConnectorIcon
                                            connector={connector.id}
                                            className="w-7 h-7 p-0.5 rounded-full bg-secondary-800 border border-secondary-400"
                                        />
                                    </div>
                                )}
                                <p>{connector.name}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    ) : (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                aria-label="Connect wallet"
                disabled={filteredConnectors.length == 0}
                className={`${className} disabled:opacity-50 disabled:cursor-not-allowed `}
            >
                {children}
            </PopoverTrigger>
            <PopoverContent className="flex flex-col items-start gap-2 w-fit">
                {filteredConnectors.map((connector, index) => (
                    <button
                        type="button"
                        key={index}
                        className="w-full h-full hover:bg-secondary-600 rounded py-2 px-3"
                        onClick={() => {
                            connectWallet(connector.id)
                            setOpen(false);
                            onClose && onClose();
                        }}
                    >
                        <div className="flex space-x-2 items-center">
                            {connector && (
                                <div className="inline-flex items-center relative">
                                    <ResolveConnectorIcon
                                        connector={connector.id}
                                        className="w-7 h-7 p-0.5 rounded-full bg-secondary-800 border border-secondary-400"
                                    />
                                </div>
                            )}
                            <p>{connector.name}</p>
                        </div>
                    </button>
                ))}
            </PopoverContent>
        </Popover>
    );
};

export default ConnectButton;

const ResolveConnectorIcon = ({
    connector,
    className,
}: {
    connector: string;
    className: string;
}) => {
    switch (connector.toLowerCase()) {
        case KnownConnectors.EVM:
            return (
                <div className="-space-x-2 flex">
                    <RainbowIcon className={className} />
                    <WalletConnectIcon className={className} />
                    <MetaMaskIcon className={className} />
                </div>
            );
        case KnownConnectors.Starknet:
            return (
                <div className="-space-x-2 flex">
                    <Braavos className={className} />
                    <Argent className={className} />
                    <ArgentX className={className} />
                </div>
            );
        case KnownConnectors.TON:
            return (
                <div className="-space-x-2 flex">
                    <TonKeeper className={className} />
                    <OpenMask className={className} />
                    <TON className={className} />
                </div>
            );
        case KnownConnectors.Solana:
            return (
                <div className="-space-x-2 flex">
                    <CoinbaseIcon className={className} />
                    <GlowIcon className={className} />
                    <Phantom className={className} />
                </div>
            );
        default:
            return <></>;
    }
};

const KnownConnectors = {
    Starknet: "starknet",
    EVM: "evm",
    TON: "ton",
    Solana: "solana",
    Glow: "glow"
};