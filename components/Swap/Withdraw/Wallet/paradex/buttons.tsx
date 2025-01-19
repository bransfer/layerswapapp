import { FC, useCallback, useState } from "react";
import { useSwitchChain } from "wagmi";
import WalletIcon from "../../../../icons/WalletIcon";
import SubmitButton, { SubmitButtonProps } from "../../../../buttons/submitButton";
import useWallet from "../../../../../hooks/useWallet";
import { useSwapDataState } from "../../../../../context/swap";
import toast from "react-hot-toast";
import { ActionData } from "../WalletTransfer/sharedTypes";
import ManualTransferNote from "../WalletTransfer/manualTransferNote";
import { NetworkWithTokens } from "../../../../../Models/Network";
import WalletMessage from "../../messages/Message";

type ConnectProps = {
    network: NetworkWithTokens | undefined,
    text: string,
    icon: React.ReactNode,
    onClick?: () => void,
    secondary: boolean,
    onConnect?: () => void
}


export const ConnectWalletButton: FC<ConnectProps> = ({ network, text, icon, onClick, secondary, onConnect }) => {
    const { provider } = useWallet(network, 'withdrawal')

    const clickHandler = useCallback(async () => {
        try {
            onClick && onClick()
            if (!provider) throw new Error(`No provider from ${network?.name}`)

            await provider.connectWallet()
            onConnect && onConnect()
        }
        catch (e) {
            toast.error(e.message)
        }

    }, [provider, onClick])

    return <div
        className={`${secondary ? 'bg-secondary-900 border-secondary-700' : 'bg-secondary-700 border-secondary-500'} flex items-center gap-2 rounded-md outline-none text-secondary-text p-3 font-normal text-sm border cursor-pointer hover:text-primary-text hover:border-secondary-500`}
        onClick={clickHandler}
    >
        {icon}
        {text}
    </div>
}

export const ChangeNetworkMessage: FC<{ data: ActionData, network: string }> = ({ data, network }) => {
    if (data.isPending) {
        return <WalletMessage
            status="pending"
            header='Network switch required'
            details="Confirm switching the network with your wallet"
        />
    }
    else if (data.isError) {
        return <WalletMessage
            status="error"
            header='Network switch failed'
            details={`Please try again or switch your wallet network manually to ${network}`}
        />
    }
}

export const ChangeNetworkButton: FC<{ chainId: number, network: string }> = ({ chainId, network }) => {
    const { switchChain, error, isPending, isError } = useSwitchChain();

    const clickHandler = useCallback(() => {
        return switchChain({ chainId })
    }, [switchChain, chainId])

    return <>
        {
            <ChangeNetworkMessage
                data={{
                    isPending: isPending,
                    isError: isError,
                    error
                }}
                network={network}
            />
        }
        {
            !isPending &&
            <ButtonWrapper
                onClick={clickHandler}
                icon={<WalletIcon className="stroke-2 w-6 h-6" />}
            >
                {
                    error ? <span>Try again</span>
                        : <span>Send from wallet</span>
                }
            </ButtonWrapper>
        }
    </>
}

export const ButtonWrapper: FC<SubmitButtonProps> = ({
    ...props
}) => {
    const { swapResponse } = useSwapDataState()
    const { swap } = swapResponse || {}
    const { source_network } = swap || {}

    return <div className="flex flex-col text-primary-text text-base space-y-2">
        <SubmitButton
            text_align='center'
            buttonStyle='filled'
            size="medium"
            {...props}
        >
            {props.children}
        </SubmitButton>
        {
            source_network?.deposit_methods?.some(m => m === 'deposit_address') &&
            <ManualTransferNote />
        }
    </div>
}