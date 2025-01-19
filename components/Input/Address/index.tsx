import { useState } from "react"
import { SwapFormValues } from "../../DTOs/SwapFormValues"
import { useFormikContext } from "formik"
import { Partner } from "../../../Models/Partner"
import AddressPicker, { AddressTriggerProps } from "./AddressPicker"

type AddressProps = {
    children: (props: AddressTriggerProps) => JSX.Element;
    partner: Partner | undefined
}

const Address = ({ partner, children }: AddressProps) => {
    const {
        values,
    } = useFormikContext<SwapFormValues>();

    const [showAddressModal, setShowAddressModal] = useState(false);

    return (
        <AddressPicker
            showAddressModal={showAddressModal}
            setShowAddressModal={setShowAddressModal}
            close={() => setShowAddressModal(false)}
            disabled={!values.to}
            name={"destination_address"}
            partner={partner}
        >
            {children}
        </AddressPicker>
    )
}

export default Address