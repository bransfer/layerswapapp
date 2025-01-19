import { ReactNode } from "react";
import useWallet from "../../hooks/useWallet";
import { useConnectModal } from "../WalletModal";

const ConnectButton = ({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) => {
    const { providers } = useWallet();
    const filteredProviders = providers.filter(p => !!p.autofillSupportedNetworks)
    const { connect } = useConnectModal()

    return (
        <button
            onClick={async () => { await connect() }}
            type="button"
            aria-label="Connect wallet"
            disabled={filteredProviders.length == 0}
            className={`${className} disabled:opacity-50 disabled:cursor-not-allowed `}
        >
            {children}
        </button>
    )
};

export default ConnectButton;