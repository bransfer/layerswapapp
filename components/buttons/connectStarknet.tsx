import { ReactNode, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import useWallet from "../../hooks/useWallet";
import { NetworkType } from "../../Models/CryptoNetwork";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../shadcn/dialog";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { useAccount, useConnect } from "@starknet-react/core"

const ConnectStarknet = ({
    children,
    className,
    onClose,
    openStarknetModal,
}: {
    children: ReactNode;
    className?: string;
    onClose?: () => void;
    openStarknetModal: boolean
}) => {
    const { connectWallet, wallets } = useWallet();
    const [open, setOpen] = useState<boolean>();
    const [openStarknet, setOpenStarknet] = useState<boolean>();
    const { isMobile } = useWindowDimensions();
    const { connect, connectors } = useConnect()
    const { address } = useAccount()

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
        <Dialog open={openStarknetModal} onOpenChange={setOpen}>
            <DialogTrigger aria-label="Connect wallet">{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] text-primary-text">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        Link a new wallet
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-2">

                </div>
            </DialogContent>
        </Dialog>
    ) : (
        <Popover open={openStarknetModal} onOpenChange={setOpen}>
            <PopoverTrigger
                aria-label="Connect wallet"
                disabled={filteredConnectors.length == 0}
                className={`${className} disabled:opacity-50 disabled:cursor-not-allowed `}
            >
                {children}
            </PopoverTrigger>
            <PopoverContent className="flex flex-col items-start gap-2 w-fit">
                <div>
                    <Dialog open={openStarknet} onOpenChange={setOpenStarknet}>
                        <DialogTrigger aria-label="Connect wallet">{children}</DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] text-primary-text">
                            <DialogHeader>
                                <DialogTitle className="text-center">
                                    Starknet
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">

                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ConnectStarknet;
