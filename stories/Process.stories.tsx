import type { Meta, StoryObj } from '@storybook/react';
import { SwapItem, BackendTransactionStatus, TransactionType, SwapResponse } from '../lib/layerSwapApiClient';
import { SwapStatus } from '../Models/SwapStatus';
import { SwapData, SwapDataStateContext, SwapDataUpdateContext } from '../context/swap';
import { SettingsStateContext } from '../context/settings';
import { FC, useEffect, useRef } from 'react';
import { LayerSwapAppSettings } from '../Models/LayerSwapAppSettings';
import { swap } from './Data/swaps'
import { Settings } from './Data/settings';
import { initialValues } from './Data/initialValues';
import { AuthDataUpdateContext, AuthStateContext, UserType } from '../context/authContext';
import { IntercomProvider } from 'react-use-intercom';
import { THEME_COLORS } from '../Models/Theme';
import Layout from '../components/layout';
import SwapDetails from '../components/Swap';
import SwapMockFunctions from './Mocks/context/SwapDataUpdate';
import AuthMockFunctions from './Mocks/context/AuthDataUpdate';
import { Formik, FormikProps } from 'formik';
import { SwapFormValues } from '../components/DTOs/SwapFormValues';
import MainStepValidation from '../lib/mainStepValidator';
import { FeeProvider, useFee } from '../context/feeContext';
import { useArgs } from '@storybook/preview-api';
import WagmiComponent from '../components/WalletProviders/Wagmi';

window.plausible = () => { }
const Comp: FC<{ settings: any, swapData: SwapData, failedSwap?: SwapItem, theme?: "default" | "light", initialValues?: SwapFormValues, timestamp?: string }> = ({ settings, swapData, theme, initialValues, timestamp }) => {
    const formikRef = useRef<FormikProps<SwapFormValues>>(null);
    const appSettings = new LayerSwapAppSettings(Settings)
    const swapContextInitialValues: SwapData = { codeRequested: false, swapResponse: swapData.swapResponse, depositAddressIsFromAccount: false, withdrawType: undefined, swapTransaction: undefined }

    if (!appSettings) {
        return <div>Loading...</div>
    }
    const themeData = theme ? THEME_COLORS[theme] : THEME_COLORS["default"];

    return <IntercomProvider appId='123'>
        <SettingsStateContext.Provider value={appSettings}>
            <Layout settings={Settings} themeData={themeData}>
                <WagmiComponent>
                    <SwapDataStateContext.Provider value={swapContextInitialValues}>
                        <AuthStateContext.Provider value={{ authData: undefined, email: "asd@gmail.com", codeRequested: false, guestAuthData: undefined, tempEmail: undefined, userId: "1", userLockedOut: false, userType: UserType.AuthenticatedUser }}>
                            <AuthDataUpdateContext.Provider value={AuthMockFunctions}>
                                <SwapDataUpdateContext.Provider value={SwapMockFunctions}>
                                    <Formik
                                        innerRef={formikRef}
                                        initialValues={initialValues!}
                                        validateOnMount={true}
                                        validate={MainStepValidation({ minAllowedAmount: 8, maxAllowedAmount: 10 })}
                                        onSubmit={() => { }}
                                    >
                                        <FeeProvider>
                                            <Component initialValues={initialValues} />
                                        </FeeProvider>
                                    </Formik>
                                </SwapDataUpdateContext.Provider>
                            </AuthDataUpdateContext.Provider>
                        </AuthStateContext.Provider>
                    </SwapDataStateContext.Provider >
                </WagmiComponent>
            </Layout>
        </SettingsStateContext.Provider>
    </IntercomProvider>
}

const Component = ({ initialValues }: { initialValues: SwapFormValues | undefined }) => {
    const { valuesChanger } = useFee()
    useEffect(() => {
        valuesChanger(initialValues!)
    }, [])
    return (
        <SwapDetails type='widget' />
    )
}

const DUMMY_TRANSACTION = {
    from: "0x5da5c2a98e26fd28914b91212b1232d58eb9bbab",
    to: "0x142c03fc8fd30d11ed17ef0f48a9941fd4a66953",
    created_date: "2023-08-16T16:33:23.4937+00:00",
    transaction_hash: "0xae9231b805139bee7e92ddae631b13bb2d13a09e106826b4f08e8efa965d1c27",
    confirmations: 12,
    max_confirmations: 12,
    amount: 0.00093,
    usd_price: 1819.02,
    type: TransactionType,
    usd_value: 1.6916886,
    status: BackendTransactionStatus,
    timestamp: "2024-07-09T09:09:40.725954+00:00",
}

const meta = {
    title: 'LayerSwap/Process',
    component: Comp,
    parameters: {
        layout: 'centered',
    },
    args: {
        theme: 'default',
        timestamp: '',
    },
    argTypes: {
        theme: {
            options: ['light', 'default', 'evmos', 'imxMarketplace', 'ea7df14a1597407f9f755f05e25bab42'],
            control: { type: 'select' },
        },
        timestamp: {
            control: 'date',
        }
    },

    render: function Render(args, { loaded: { settings } }) {
        const [{ swap, timestamp }, updateArgs] = useArgs();

        const handleUpdateArgs = () => {
            const updatedSwap = {
                ...args.swapData,
                transactions: swap?.transactions?.map(transaction => {
                    if (transaction.type === 'input' && (transaction.timestamp || transaction.timestamp === '')) {
                        return {
                            ...transaction,
                            timestamp: timestamp ? new Date(timestamp)?.toISOString() : new Date().toISOString(),
                        };
                    }
                    return transaction;
                }),
            };
            if (updatedSwap?.transactions?.[0]?.timestamp || updatedSwap?.transactions?.[0]?.timestamp === '') {
                updateArgs({ swap: updatedSwap, timestamp: new Date(timestamp)?.toISOString() || new Date().toISOString() })
            }
        }

        useEffect(() => {
            if (timestamp !== swap?.transactions?.[0]?.timestamp) {
                handleUpdateArgs()
            }
        }, [timestamp, swap])
        return <Comp {...args} settings={settings} initialValues={initialValues} />
    },
} satisfies Meta<typeof Comp>;

export default meta;
type Story = StoryObj<typeof meta>;


// export const UserTransferInitiated: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.UserTransferPending,
//                     transactions: [
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input, confirmations: 2, max_confirmations: 3 },
//                     ]
//                 }
//             }
//         }
//     },
//     loaders: [
//         async () => ({
//             A: window.localStorage.setItem("swapTransactions", `{"${swap.swapResponse.swap.id}": {"hash": "0xe1d8539c6dbe522560c41d645f10ffc3f50b8f689a4ce4774573576cb845d5fc", "status":2}}`)
//         }),
//     ],
// };

// export const UserTransferDetected: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.UserTransferPending,
//                     transactions: [
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Initiated, type: TransactionType.Input, confirmations: 2, max_confirmations: 3 },
//                     ]
//                 }
//             }
//         }
//     }
// };
// export const UserTransferPendingInputCompleted: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.Failed,
//                     transactions: [
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
//                     ]
//                 }
//             }
//         }
//     },
// };

// export const LsTransferPending: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.LsTransferPending,
//                     transactions: [
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Pending, type: TransactionType.Output },
//                     ]
//                 }
//             }
//         }
//     }
// };

// export const LsTransferPendingWithRefuel: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.LsTransferPending,
//                     transactions: [
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Pending, type: TransactionType.Output },
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Pending, type: TransactionType.Refuel },
//                     ]
//                 }
//             }
//         }
//     }
// };

// export const LsTransferInitiated: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.LsTransferPending,
//                     transactions: [
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Initiated, type: TransactionType.Output, confirmations: 2, max_confirmations: 5 },
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Initiated, type: TransactionType.Refuel, confirmations: 1, max_confirmations: 5 },
//                     ]
//                 }
//             }
//         }
//     }
// };

// export const Completed: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.Completed,
//                     transactions: [
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Output },
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Refuel },
//                     ]
//                 }
//             }
//         }
//     }
// };

// export const OnlyRefuelCompleted: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.LsTransferPending,
//                     transactions: [
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Pending, type: TransactionType.Output },
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Refuel },
//                     ]
//                 }
//             }
//         }
//     }
// };


// export const UserTransferDelayed: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.UserTransferDelayed,
//                     transactions: [
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Pending, type: TransactionType.Input },
//                     ]
//                 }
//             }
//         }
//     }
// };

// export const Failed: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.Failed,
//                     transactions: [
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
//                     ]
//                 }
//             }
//         }
//     }
// };

// export const FailedInput: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.UserTransferPending,
//                     transactions: [
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Failed, type: TransactionType.Input },
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Pending, type: TransactionType.Output },
//                     ]
//                 }
//             }
//         }
//     },
//     loaders: [
//         async () => ({
//             A: window.localStorage.setItem("swapTransactions", `{"${swap.swapResponse.swap.id}": {"hash": "0x529ab89f4ed2ece53ca51f52d11e5123f5e5c43c09a9d054d243de0e0829d15f", "status":"failed"}}`),
//         }),
//     ]
// };

// export const FailedOutOfRangeAmount: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.Failed,
//                     transactions: [
//                         { ...DUMMY_TRANSACTION, status: BackendTransactionStatus.Completed, type: TransactionType.Input },
//                     ]
//                 }
//             }
//         }
//     }
// };

// export const Cancelled: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.Cancelled,
//                     transactions: [
//                     ]
//                 }
//             }
//         }
//     }
// };

// export const Expired: Story = {
//     args: {
//         swapData: {
//             ...swap,
//             swapResponse: {
//                 ...(swap.swapResponse as SwapResponse),
//                 swap: {
//                     ...(swap.swapResponse.swap as SwapItem),
//                     status: SwapStatus.Expired,
//                     transactions: [
//                     ]
//                 }
//             }
//         }
//     }
// };