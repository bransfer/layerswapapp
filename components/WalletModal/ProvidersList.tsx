import { FC } from "react";
import useWallet from "../../hooks/useWallet";
import { ResolveConnectorIcon } from "../icons/ConnectorIcons";
import { useConnectModal } from ".";
import { Wallet, WalletProvider } from "../../Models/WalletProvider";

const ProvidersList: FC<{ onFinish: (result: Wallet) => void }> = ({ onFinish }) => {
    const { providers } = useWallet();
    const filteredProviders = providers.filter(p => !!p.autofillSupportedNetworks)
    const { setSelectedProvider } = useConnectModal()

    const connect = async (provider: WalletProvider) => {
        if (!provider.availableWalletsForConnect) {
            const result = await provider.connectWallet()
            if (result) onFinish(result)
        } else {
            setSelectedProvider(provider)
        }
    }

    return (
        <div className="text-primary-text space-y-2">
            {filteredProviders.map((provider, index) => (
                <button
                    type="button"
                    key={index}
                    className="w-full h-fit bg-secondary-700 hover:bg-secondary-500 transition-colors duration-200 rounded-xl px-2 p-3"
                    onClick={async () => connect(provider)}
                >
                    <div className="flex flex-row gap-3 items-center justify-between font-semibold px-4">
                        <p>{provider.name}</p>
                        {
                            provider &&
                            <ResolveConnectorIcon
                                connector={provider.id}
                                iconClassName="w-7 h-7 rounded-full bg-secondary-700 p-0.5 border border-secondary-400"
                            />
                        }
                    </div>
                </button>
            ))}
        </div>
    )
}

export default ProvidersList