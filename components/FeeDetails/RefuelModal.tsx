import { SwapFormValues } from '../DTOs/SwapFormValues';
import { Dispatch, FC, SetStateAction } from 'react';
import useWallet from '../../hooks/useWallet';
import Modal from '../modal/modal';
import { Fuel } from 'lucide-react';
import { roundDecimals, truncateDecimals } from '../utils/RoundDecimals';
import SubmitButton from '../buttons/submitButton';
import SecondaryButton from '../buttons/secondaryButton';
import { useFormikContext } from 'formik';
import { useFee } from '../../context/feeContext';
import useSWRBalance from '../../lib/balances/useSWRBalance';
import { useSwapDataState } from '../../context/swap';

type RefuelModalProps = {
    openModal: boolean,
    setOpenModal: Dispatch<SetStateAction<boolean>>
}

const RefuelModal: FC<RefuelModalProps> = ({ openModal, setOpenModal }) => {
    const {
        values,
        setFieldValue
    } = useFormikContext<SwapFormValues>();

    const { to, toCurrency, refuel, destination_address } = values || {};

    const { fee } = useFee()

    const nativeAsset = to?.token
    const token_usd_price = fee?.quote?.destination_network?.token?.price_in_usd || nativeAsset?.price_in_usd

    const { balance } = useSWRBalance(destination_address, to)
    const destNativeTokenBalance = balance?.find(b => b.token === nativeAsset?.symbol && b.network === to?.name)
    const amountInUsd = (destNativeTokenBalance && token_usd_price) ? (destNativeTokenBalance.amount * token_usd_price).toFixed(2) : undefined

    const closeModal = () => {
        setOpenModal(false)
    }

    const enabldeRefuel = () => {
        setFieldValue('refuel', true)
        setOpenModal(false)
    }

    return (
        <Modal height="fit" show={openModal} setShow={setOpenModal} modalId={"refuel"}>
            <div className="flex flex-col items-center gap-6 mt-2">
                <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-xl p-2 bg-primary/20">
                    <Fuel className="h-16 w-16 text-primary" aria-hidden="true" />
                </div>
                <div className="text-center max-w-72">
                    <p className="text-2xl">About Refuel</p>
                    <p className="text-secondary-text">
                        <span>You can get a small amount of</span> <span>{nativeAsset?.symbol}</span> <span>that can be used for covering gas fees on</span> <span>{to?.display_name}.</span>
                    </p>
                </div>
                {
                    (values.refuel || destNativeTokenBalance) &&
                    <div className="flex flex-col divide-y-2 divide-secondary-900 w-full rounded-componentRoundness bg-secondary-700 overflow-hidden">
                        {
                            destNativeTokenBalance &&
                            <div className="gap-4 flex relative items-center outline-none w-full text-primary-text px-4 py-3">
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-secondary-text">
                                        <span>Your current balance</span>
                                    </div>
                                    <p className='text-end'>
                                        <span>{truncateDecimals(destNativeTokenBalance.amount, nativeAsset?.precision)} {nativeAsset?.symbol}</span> <span className="text-secondary-text">(${amountInUsd})</span>
                                    </p>
                                </div>
                            </div>
                        }
                        {
                            toCurrency?.refuel && nativeAsset &&
                            <div className="gap-4 flex relative items-center outline-none w-full text-primary-text px-4 py-3">
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-secondary-text">
                                        You will receive
                                    </div>
                                    <p>
                                        <span>{roundDecimals(toCurrency.refuel?.amount, nativeAsset.precision)} {nativeAsset?.symbol}</span> <span className="text-secondary-text">(${toCurrency.refuel?.amount_in_usd})</span>
                                    </p>
                                </div>
                            </div>
                        }
                    </div>
                }
                <div className='flex flex-col gap-3 w-full h-full'>
                    {
                        !refuel &&
                        <SubmitButton type="button" onClick={enabldeRefuel}>
                            Enable Refuel
                        </SubmitButton>
                    }
                    <SecondaryButton type="button" className='h-full w-full py-3' onClick={closeModal}>
                        Close
                    </SecondaryButton>
                </div>
            </div>
        </Modal>
    )
}

export default RefuelModal
