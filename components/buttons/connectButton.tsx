import { ReactNode, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import useWallet from "../../hooks/useWallet";
import { NetworkType } from "../../Models/CryptoNetwork";
import RainbowIcon from "../icons/Wallets/Rainbow";
import Starknet from "../icons/Wallets/Starknet";
import TON from "../icons/Wallets/TON";

const ConnectButton = ({ children, className, onClose }: { children: ReactNode, className?: string, onClose?: () => void }) => {
    const { connectWallet, wallets } = useWallet()
    const [open, setOpen] = useState<boolean>()

    const knownConnectors = [
        {
            name: 'EVM',
            id: 'evm',
            type: NetworkType.EVM,
        },
        {
            name: 'Starknet',
            id: 'starknet',
            type: NetworkType.Starknet,
        },
        {
            name: 'TON',
            id: 'ton',
            type: NetworkType.TON,
        }
    ]
    const filteredConnectors = knownConnectors.filter(c => !wallets.map(w => w?.providerName).includes(c.id))

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger disabled={filteredConnectors.length == 0} className={`${className} disabled:opacity-50 disabled:cursor-not-allowed `}>
                {children}
            </PopoverTrigger>
            <PopoverContent className='flex flex-col items-start gap-2 w-fit'>
                {
                    filteredConnectors.map((connector, index) => (
                        <button type="button" key={index} className="w-full h-full hover:bg-secondary-600 rounded py-2 px-3" onClick={() => { connectWallet(connector.id); setOpen(false); onClose && onClose() }}>
                            <div className="flex space-x-2 items-center">
                                {
                                    connector &&
                                    <div className="inline-flex items-center relative">
                                        <ResolveConnectorIcon connector={connector.id} className="w-8 h-8 p-0.5 rounded-full bg-secondary-800 border border-secondary-400" />
                                    </div>
                                }
                                <p>{connector.name}</p>
                            </div>
                        </button>
                    ))
                }
            </PopoverContent>
        </Popover>
    )
}

export default ConnectButton

const ResolveConnectorIcon = ({ connector, className }: { connector: string, className: string }) => {
    switch (connector.toLowerCase()) {
        case KnownConnectors.EVM:
            return <RainbowIcon className={className} />
        case KnownConnectors.Starknet:
            return <Starknet className={className} />
        case KnownConnectors.TON:
            return <TON className={className} />
        default:
            return <></>
    }
}

const KnownConnectors = {
    Starknet: 'starknet',
    EVM: 'evm',
    TON: 'ton',
}