
import { SwapFormValues } from '../DTOs/SwapFormValues';
import { ReceiveAmounts } from './ReceiveAmounts';
import DetailedEstimates from './DetailedEstimates';
import { useFee } from '../../context/feeContext';
import FeeDetails from './FeeDetailsComponent';
import { useQueryState } from '../../context/query';
import ResizablePanel from '../ResizablePanel';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const RefuelModal = dynamic(() => import("./RefuelModal"), {
    loading: () => <></>,
});

const RefuelToggle = dynamic(() => import("./Refuel"), {
    loading: () => <></>,
});

export default function FeeDetailsComponent({ values }: { values: SwapFormValues }) {
    const { toCurrency, to, refuel, toExchange, from, fromCurrency, amount } = values || {};
    const { fee, isFeeLoading } = useFee()
    const query = useQueryState();
    const [openRefuelModal, setOpenRefuelModal] = useState<boolean>(false)

    return (
        <span className={amount ? 'visible' : 'hidden'}>
            <ResizablePanel>
                <FeeDetails>
                    {
                        toCurrency?.refuel && !query.hideRefuel && !toExchange &&
                        <RefuelToggle onButtonClick={() => setOpenRefuelModal(true)} />
                    }

                    {
                        fee && fromCurrency && toCurrency &&
                        <FeeDetails.Item>
                            <DetailedEstimates />
                        </FeeDetails.Item>
                    }

                    <FeeDetails.Item>
                        <ReceiveAmounts
                            source_token={fromCurrency}
                            destination_token={toCurrency}
                            refuel={!!refuel}
                            fee={fee}
                            onButtonClick={() => setOpenRefuelModal(true)}
                            isFeeLoading={isFeeLoading}
                        />
                    </FeeDetails.Item>

                </FeeDetails>
            </ResizablePanel>

            <RefuelModal openModal={openRefuelModal} setOpenModal={setOpenRefuelModal} />

        </span>
    )
}
