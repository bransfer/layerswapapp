import { FC } from 'react'
import SendEmail from '../../SendEmail';

type Props = {
    OnNext: () => void;
    disclosureLogin?: boolean
}

const EmailStep: FC<Props> = ({ OnNext, disclosureLogin }) => {
    return (<>
        <SendEmail compactLogin={disclosureLogin} onSend={OnNext} />
    </>)
}

export default EmailStep;