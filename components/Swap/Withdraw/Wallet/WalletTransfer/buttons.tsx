import { FC, useCallback, useState } from "react";
import { useSwitchChain } from "wagmi";
import WalletIcon from "../../../../icons/WalletIcon";
import { ActionData } from "./sharedTypes";
import SubmitButton, { SubmitButtonProps } from "../../../../buttons/submitButton";
import useWallet from "../../../../../hooks/useWallet";
import { useSwapDataState } from "../../../../../context/swap";
import ManualTransferNote from "./manualTransferNote";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import WalletMessage from "../../messages/Message";

export const ConnectWalletButton: FC<SubmitButtonProps> = ({ ...props }) => {
    const { swapResponse } = useSwapDataState()
    const { swap } = swapResponse || {}
    const { source_network } = swap || {}
    const [loading, setLoading] = useState(false)

    const { provider } = useWallet(source_network, 'withdrawal')

    const clickHandler = useCallback(async () => {
        try {
            setLoading(true)

            if (!provider) throw new Error(`No provider from ${source_network?.name}`)

            await provider.connectWallet()
        }
        catch (e) {
            toast.error(e.message)
        }
        finally {
            setLoading(false)
        }

    }, [provider])

    return <ButtonWrapper
        onClick={props.onClick ?? clickHandler}
        icon={loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (props.icon ?? <WalletIcon className="stroke-2 w-6 h-6" />)}
        isDisabled={loading || props.isDisabled}
        isSubmitting={loading || props.isSubmitting}
        {...props}
    >
        Send from wallet
    </ButtonWrapper>
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
                        : <span>Switch network</span>
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
            type="button"
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