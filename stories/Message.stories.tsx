import type { Meta, StoryObj } from '@storybook/react';
import { THEME_COLORS } from '../Models/Theme';
import { FC } from 'react';
import { Widget } from '../components/Widget/Index';
import ColorSchema from '../components/ColorSchema';
import WalletMessage, { WalletMessageProps } from '../components/Swap/Withdraw/messages/Message';

window.plausible = () => { }
const Comp: FC<{ theme?: "default" | "light", header: string, status: 'pending' | 'error', details: string, showInModal?: boolean }> = ({ theme, status, details, header, showInModal }) => {
    const themeData = theme ? THEME_COLORS[theme] : THEME_COLORS["default"];

    return <Widget hideMenu={true} >
        <Widget.Content>
            <div style={{ width: '350px' }} className='h-[500px]'>
            </div>
        </Widget.Content>
        <Widget.Footer>
            <WalletMessage status={status}
                header={header}
                details={details}
                showInModal={!!showInModal}
            />
        </Widget.Footer>
        <ColorSchema themeData={themeData} />
    </Widget>
}

const meta = {
    title: 'LayerSwap/Message',
    component: Comp,
    parameters: {
        layout: 'centered',
    },
    args: {
        theme: 'default',
    },
    argTypes: {
        theme: {
            options: ['light', 'default', 'evmos', 'imxMarketplace', 'ea7df14a1597407f9f755f05e25bab42'],
            control: { type: 'select' },
        },
        status: {
            options: ['pending', 'error'],
            control: { type: 'select' },
        }
    },
    render: (args) => <Comp {...args} />,
} satisfies Meta<typeof Comp>;

export default meta;
type Story = StoryObj<typeof meta>;

// export const PreparingTransactionMessage: Story = {
//     args: {
//         status: "pending",
//         header: 'Preparing the transaction',
//         details: 'Will be ready to sign in a couple of seconds'
//     } as WalletMessageProps,
// };

// export const ConfirmTransactionMessage: Story = {
//     args: {
//         header: 'Confirm in wallet',
//         status: 'pending',
//         details: 'Please confirm the transaction in your wallet',
//         showInModal: true
//     } as WalletMessageProps
// };
// export const TransactionInProgressMessage: Story = {
//     args: {
//         header: 'Transaction in progress',
//         status: 'pending',
//         details: 'Waiting for your transaction to be published'
//     } as WalletMessageProps
// };
// export const InsufficientFundsMessage: Story = {
//     args: {
//         header: 'Insufficient funds',
//         status: 'error',
//         details: 'The balance of the connected wallet is not enough'
//     } as WalletMessageProps
// };

// export const TransactionRejectedMessage: Story = {
//     args: {
//         status: "error",
//         header: "Transaction rejected",
//         details: "You've rejected the transaction in your wallet. Click “Try again” to open the prompt again."
//     } as WalletMessageProps
// }