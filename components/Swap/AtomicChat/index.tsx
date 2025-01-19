import { FC, useEffect } from "react";
import { Widget } from "../../Widget/Index";
import { useSettingsState } from "../../../context/settings";
import useWallet from "../../../hooks/useWallet";
import Summary from "./Summary";
import { useFee } from "../../../context/feeContext";
import ConnectedWallet from "./ConnectedWallet";
import { Actions } from "./Resolver";
import { useAtomicState } from "../../../context/atomicContext";
import ResizablePanel from "../../ResizablePanel";

type ContainerProps = {
    type: "widget" | "contained",
    source: string;
    destination: string;
    amount: number;
    address: string;
    source_asset: string;
    destination_asset: string;
}

const Commitment: FC<ContainerProps> = (props) => {
    const { source, destination, amount, address, source_asset, destination_asset } = props;
    const { networks } = useSettingsState()
    const { fee, valuesChanger } = useFee()

    const { commitId, sourceDetails } = useAtomicState()

    const source_network = networks.find(n => n.name.toUpperCase() === source?.toUpperCase())
    const destination_network = networks.find(n => n.name.toUpperCase() === destination?.toUpperCase())
    const source_token = source_network?.tokens.find(t => t.symbol === source_asset)
    const destination_token = destination_network?.tokens.find(t => t.symbol === destination_asset)

    const { provider } = useWallet(source_network, 'withdrawal')

    useEffect(() => {
        if (amount && source_network && destination_network && source_asset && destination_asset)
            valuesChanger({
                amount: amount.toString(),
                from: source_network,
                fromCurrency: source_token,
                to: destination_network,
                toCurrency: destination_token,
            })
    }, [amount, source_network, destination, source_token, destination_token])

    const wallet = provider?.activeWallet
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
                                    destinationAddress={address}
                                    destinationCurrency={destination_token}
                                    requestedAmount={amount}
                                    sourceCurrency={source_token}
                                    sourceAccountAddress={sourceDetails?.sender || wallet?.address}
                                    receiveAmount={receiveAmount}
                                />
                            }
                            <ConnectedWallet />
                        </div>
                    </div>
                </ResizablePanel>
            </Widget.Content>
            <Widget.Footer sticky={true}>
                <Actions />
            </Widget.Footer>
        </>
    )
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