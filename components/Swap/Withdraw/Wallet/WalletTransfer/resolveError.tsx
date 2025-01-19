import { BaseError, InsufficientFundsError, EstimateGasExecutionError, UserRejectedRequestError } from 'viem'


type ResolvedError = "insufficient_funds" | "transaction_rejected"

const resolveError = (error: BaseError): ResolvedError | undefined => {

    const isInsufficientFundsError = typeof error?.walk === "function" && error?.walk((e: BaseError) => (e instanceof InsufficientFundsError)
        || (e instanceof EstimateGasExecutionError) || e?.['data']?.args?.some((a: string) => a?.includes("amount exceeds")))

    if (isInsufficientFundsError)
        return "insufficient_funds"

    const isUserRejectedRequestError = typeof error?.walk === "function" && error?.walk && error?.walk((e: BaseError) => e instanceof UserRejectedRequestError) instanceof UserRejectedRequestError

    if (isUserRejectedRequestError)
        return "transaction_rejected"

    const code_name = error?.['code']
        || error?.["name"]
    const inner_code = error?.['data']?.['code']
        || error?.['cause']?.['code']
        || error?.["cause"]?.["cause"]?.["cause"]?.["code"]

    if (code_name === 'INSUFFICIENT_FUNDS'
        || code_name === 'UNPREDICTABLE_GAS_LIMIT'
        || (code_name === -32603 && inner_code === 3)
        || inner_code === -32000
        || code_name === 'EstimateGasExecutionError'
        || code_name === 3)
        return "insufficient_funds"
    else if (code_name === 4001 || inner_code === -1) {
        return "transaction_rejected"
    }
}

export default resolveError
