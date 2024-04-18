const configs: {
    feedback_token: string,
    feedback_chat_id: string,
    error_token: string,
    error_chat_id: string
} = process.env.NEXT_PUBLIC_TELEGRAM_CONFIGS ? JSON.parse(process.env.NEXT_PUBLIC_TELEGRAM_CONFIGS) : undefined

export const SendFeedbackMessage = async (title: string, text: string) => {
    if (!configs.feedback_token || !configs.feedback_chat_id) return

    return await (await fetch(`https://api.telegram.org/bot${configs.feedback_token}/sendMessage?chat_id=${configs.feedback_chat_id}&text=${title} %0A ${text}`)).json()
}

export const SendErrorMessage = async (title: string, text: string) => {
    if (!configs?.error_token || !configs?.error_chat_id) return

    if (text.length > 2000) {
        text = text.slice(0, 2000);
    }

    return await (await fetch(`https://api.telegram.org/bot${configs.error_token}/sendMessage?chat_id=${configs.error_chat_id}&text=${title} %0A ${text}`)).json()
}


export const SendTransactionData = async (swapId: string, txHash: string) => {
    if (!configs.error_token || !configs.error_chat_id) return console.log('Set up token and chat id in env')

    try {
        return await (await fetch(`https://api.telegram.org/bot${configs.error_token}/sendMessage?chat_id=${configs.error_chat_id}&text=swapId:  ${swapId} %0A transaction hash: ${txHash}`)).json()
    }
    catch (e) {
        //TODO log to logger
        console.log(e)
    }
}