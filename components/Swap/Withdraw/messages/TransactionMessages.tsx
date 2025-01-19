import { FC } from "react"
import WalletMessage from "./Message"
import shortenAddress from "../../../utils/ShortenAddress"

const ConfirmTransactionMessage: FC = () => {
    return <WalletMessage
        status="pending"
        header='Confirm in wallet'
        details='Please confirm the transaction in your wallet' />
}

const TransactionInProgressMessage: FC = () => {
    return <WalletMessage
        status="pending"
        header='Transaction in progress'
        details='Waiting for your transaction to be published' />
}

const InsufficientFundsMessage: FC = () => {
    return <WalletMessage
        status="error"
        header='Insufficient funds'
        details='The balance of the connected wallet is not enough' />
}

const TransactionRejectedMessage: FC = () => {
    return <WalletMessage
        status="error"
        header='Transaction rejected'
        details={`You've rejected the transaction in your wallet. Click “Try again” to open the prompt again.`} />
}

const WaletMismatchMessage: FC<{ address: string }> = ({ address }) => {
    return <WalletMessage
        status="error"
        header='Account mismatch'
        details={`Select ${shortenAddress(address)} in your wallet, then try again`} />
}

const UexpectedErrorMessage: FC<{ message: string }> = ({ message }) => {
    return <WalletMessage
        status="error"
        header='Unexpected error'
        details={message}
        showInModal />
}

const TransactionMessages = {
    ConfirmTransactionMessage,
    TransactionInProgressMessage,
    InsufficientFundsMessage,
    TransactionRejectedMessage,
    WaletMismatchMessage,
    UexpectedErrorMessage
}

export default TransactionMessages