import { FC } from "react"
import { ExternalLink } from "lucide-react"
import CopyButton from "../../buttons/copyButton"
import Link from "next/link"
import AddressIcon from "../../AddressIcon"
import { SwapFormValues } from "../../DTOs/SwapFormValues"
import { Partner } from "../../../Models/Partner"

type AddressNoteModalProps = {
    partner: Partner | undefined;
    values: SwapFormValues
}

const AddressNote: FC<AddressNoteModalProps> = ({ partner, values }) => {

    const {
        to: destination,
        destination_address
    } = values

    return (
        destination && destination_address &&
        <div className="flex flex-col items-center gap-6 mt-2">
            <div className="h-24 w-24 rounded-2xl overflow-hidden">
                <AddressIcon className="scale-150 h-24 w-24 blur-[1.5px]" address={destination_address} size={96} />
            </div>
            <div className="text-center max-w-xs space-y-1">
                <p className="text-2xl">Address Confirmation</p>
                <p className="text-secondary-text">
                    <span>Destination address was autofilled from URL</span> {partner && <><span>by</span> <span>{partner.display_name}.</span></>} <span>Please double-check its correctness.</span>
                </p>
            </div>

            <div className="w-full rounded-lg bg-secondary-700 overflow-hidden px-4 py-3 space-y-2">
                <div className="gap-4 flex relative items-center outline-none w-full text-primary-text">
                    <div className="flex items-center justify-between w-full">
                        <div className="text-secondary-text">
                            <span>{destination?.display_name}</span> <span>address</span>
                        </div>
                        <div className="flex items-center gap-4 text-secondary-text">
                            <CopyButton toCopy={destination_address} />
                            <Link href={destination?.account_explorer_template?.replace('{0}', destination_address) || ''} target="_blank">
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
                <div className='flex gap-3 text-sm items-center'>
                    <div className='flex flex-shrink-0 bg-secondary-400 text-primary-text items-center justify-center rounded-md h-9 overflow-hidden w-9'>
                        <AddressIcon className="scale-150 h-9 w-9" address={destination_address} size={36} />
                    </div>
                    <p className="break-all text-sm">
                        {destination_address}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AddressNote