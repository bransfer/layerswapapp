import { FC, useEffect } from 'react'
import { useAuthDataUpdate } from '../../../context/authContext';
import SendEmail from '../../SendEmail';

type Props = {
    OnNext: () => void
}

const EmailStep: FC<Props> = ({ OnNext }) => {
    const { updateEmail } = useAuthDataUpdate()
    const onSend = (email: string) => {
        updateEmail(email)
        OnNext();
    }

    return (
        <>
            <SendEmail onSend={onSend} />
        </>
    )
}

export default EmailStep;