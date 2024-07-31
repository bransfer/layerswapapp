import { FC, useEffect } from "react";
import { Widget } from "../../Widget/Index";
import { useSettingsState } from "../../../context/settings";
import useWallet from "../../../hooks/useWallet";
import Summary from "./Summary";
import { useFee } from "../../../context/feeContext";
import ConnectedWallet from "./ConnectedWallet";
import { ActionsWithProgressbar, ResolveMessages } from "./Resolver";
import { useAtomicState } from "../../../context/atomicContext";
import ResizablePanel from "../../ResizablePanel";
import TimelockTimer from "./TimelockTimer";

type ContainerProps = {
    type: "widget" | "contained",
    source: string;
    destination: string;
    amount: number;
    address: string;
    source_asseet: string;
    destination_asset: string;
}

const Commitment: FC<ContainerProps> = (props) => {
    const { source, destination, amount, address, source_asseet, destination_asset } = props;
    const { networks } = useSettingsState()
    const { getWithdrawalProvider } = useWallet()
    const { fee, valuesChanger } = useFee()

    const { commitId, committment } = useAtomicState()

    const source_network = networks.find(n => n.name.toUpperCase() === source.toUpperCase())
    const destination_network = networks.find(n => n.name.toUpperCase() === destination.toUpperCase())
    const source_token = source_network?.tokens.find(t => t.symbol === source_asseet)
    const destination_token = destination_network?.tokens.find(t => t.symbol === destination_asset)

    useEffect(() => {
        if (amount && source_network && destination_network && source_asseet && destination_asset)
            valuesChanger({
                amount: amount.toString(),
                from: source_network,
                fromCurrency: source_token,
                to: destination_network,
                toCurrency: destination_token,
            })
    }, [amount, source_network, destination, source_token, destination_token])

    const source_provider = source_network && getWithdrawalProvider(source_network)
    const wallet = source_provider?.getConnectedWallet()
    const receiveAmount = fee?.quote?.receive_amount

    return (
        <>
            <Widget.Content>
                <ResizablePanel>
                    <div className="w-full flex flex-col justify-between  text-secondary-text">
                        <div className='grid grid-cols-1 gap-4'>
                            {
                                destination_network && source_network && destination_token && source_token &&
                                <Summary
                                    destination={destination_network}
                                    source={source_network}
                                    destinationAddress={committment?.dstAddress || address}
                                    destinationCurrency={destination_token}
                                    requestedAmount={amount}
                                    sourceCurrency={source_token}
                                    sourceAccountAddress={committment?.sender || wallet?.address}
                                    receiveAmount={receiveAmount}
                                />
                            }
                            {
                                committment?.timelock && Number(committment.timelock) - (Date.now() / 1000) > 0 &&
                                <TimelockTimer timelock={Number(committment.timelock) - (Date.now() / 1000)} />
                            }
                            {
                                !commitId && <ConnectedWallet
                                    source_network={source_network}
                                    source_token={source_token}
                                />
                            }
                            <div className="min-h-40">
                                <ResolveMessages />
                            </div>
                        </div>
                    </div>
                </ResizablePanel>
            </Widget.Content>
            {
                <Widget.Footer sticky={true}>
                    <div>
                        <ActionsWithProgressbar />
                    </div>
                </Widget.Footer>
            }
        </>
    )
}



const Footer: FC = () => {
    return <></>
}


const Container: FC<ContainerProps> = (props) => {
    const { type } = props

    if (type === "widget")
        return <Widget>
            <Commitment {...props} />
        </Widget>
    else
        return <div className="w-full flex flex-col justify-between h-full space-y-5 text-secondary-text">
            <Commitment {...props} />
        </div>

}

export default Container