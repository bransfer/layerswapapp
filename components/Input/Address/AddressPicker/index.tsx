import { useFormikContext } from "formik";
import { FC, ReactElement, forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { AddressBookItem } from "../../../../lib/layerSwapApiClient";
import { SwapFormValues } from "../../../DTOs/SwapFormValues";
import { isValidAddress } from "../../../../lib/address/validator";
import { Partner } from "../../../../Models/Partner";
import useWallet from "../../../../hooks/useWallet";
import { addressFormat } from "../../../../lib/address/formatter";
import ManualAddressInput from "./ManualAddressInput";
import Modal from "../../../modal/modal";
import ResizablePanel from "../../../ResizablePanel";
import ConnectWalletButton from "./ConnectWalletButton";
import ExchangeNote from "./ExchangeNote";
import { Network, NetworkType, RouteNetwork } from "../../../../Models/Network";
import { Exchange } from "../../../../Models/Exchange";
import AddressBook from "./AddressBook";
import AddressButton from "./AddressButton";
import { useQueryState } from "../../../../context/query";
import { useAddressesStore } from "../../../../stores/addressesStore";
import { Wallet } from "../../../../stores/walletStore";

export enum AddressGroup {
    ConnectedWallet = "Connected wallet",
    ManualAdded = "Added Manually",
    RecentlyUsed = "Recently used",
    FromQuery = "Partner",
}

export type AddressItem = {
    address: string,
    group: AddressGroup,
    date?: string
}

export type AddressTriggerProps = {
    addressItem?: AddressItem;
    connectedWallet?: Wallet;
    partner?: Partner;
    disabled: boolean;
    destination: Network | undefined,
}

interface Input {
    children: (props: AddressTriggerProps) => JSX.Element;
    showAddressModal: boolean;
    setShowAddressModal: (show: boolean) => void;
    hideLabel?: boolean;
    disabled: boolean;
    name: string;
    close: () => void,
    partner?: Partner,
    canFocus?: boolean,
    address_book?: AddressBookItem[],

}

const AddressPicker: FC<Input> = forwardRef<HTMLInputElement, Input>(function Address
    ({ showAddressModal, setShowAddressModal, name, canFocus, close, address_book, disabled, partner, children }, ref) {

    const {
        values,
        setFieldValue
    } = useFormikContext<SwapFormValues>();
    const query = useQueryState()
    const { destination_address, to: destination, toExchange: destinationExchange, toCurrency: destinationAsset } = values
    const groupedAddresses = useAddressesStore(state => state.addresses)
    const setAddresses = useAddressesStore(state => state.setAddresses)
    const [selectedWallet, setSelectedWallet] = useState<Wallet | undefined>(undefined)

    const { provider } = useWallet(destinationExchange ? undefined : destination, 'autofil')
    const connectedWallets = provider?.connectedWallets
    const activeWallet = provider?.activeWallet
    const activeWalletAddress = activeWallet?.address

    const [isConnecting, setIsConnecting] = useState(false)
    const [manualAddress, setManualAddress] = useState<string>('')
    const [newAddress, setNewAddress] = useState<{ address: string, networkType: NetworkType | string } | undefined>()

    const inputReference = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const groupedAddresses = destination && resolveAddressGroups({ address_book, destination, destinationExchange, wallets: connectedWallets, newAddress, addressFromQuery: query.destAddress })
        if (groupedAddresses) setAddresses(groupedAddresses)
    }, [address_book, destination, destinationExchange, newAddress, query.destAddress])

    const destinationAddressItem = destination && destination_address ? groupedAddresses?.find(a => addressFormat(a.address, destination) === addressFormat(destination_address, destination)) : undefined
    const addressBookAddresses = groupedAddresses?.filter(a => a.group !== AddressGroup.ConnectedWallet)

    const handleSelectAddress = useCallback((address: string, wallet?: Wallet) => {
        const selected = destination && groupedAddresses?.find(a => addressFormat(a.address, destination) === addressFormat(address, destination))
        const formattedAddress = selected?.address
        setSelectedWallet(wallet)
        setFieldValue("destination_address", formattedAddress)
        close()

    }, [close, setFieldValue, groupedAddresses])

    const previouslyAutofilledAddress = useRef<string | undefined>(undefined)

    const autofillConnectedWallet = useCallback(() => {
        setFieldValue("destination_address", activeWalletAddress)
        setSelectedWallet(activeWallet)
        previouslyAutofilledAddress.current = activeWalletAddress
        if (showAddressModal && activeWallet) setShowAddressModal(false)
    }, [setFieldValue, setShowAddressModal, showAddressModal, destination, activeWallet, activeWalletAddress])

    useEffect(() => {
        if (isConnecting && activeWalletAddress) {
            setIsConnecting(false)
            autofillConnectedWallet()
        }
    }, [activeWalletAddress, isConnecting])

    useEffect(() => {
        if ((!destination_address || (previouslyAutofilledAddress.current && previouslyAutofilledAddress.current != activeWalletAddress)) && activeWallet) {
            autofillConnectedWallet()
        }
    }, [activeWallet, destination_address])

    useEffect(() => {
        if (previouslyAutofilledAddress.current === destination_address && !activeWallet) {
            setFieldValue("destination_address", undefined)
        }
    }, [activeWallet, previouslyAutofilledAddress])
    useEffect(() => {
        if (canFocus) {
            inputReference?.current?.focus()
        }
    }, [canFocus])

    return (<>
        <AddressButton
            disabled={disabled}
            addressItem={destinationAddressItem}
            openAddressModal={() => setShowAddressModal(true)}
            connectedWallet={activeWallet}
            partner={partner}
            destination={destination}
        >{children({ destination, disabled, addressItem: destinationAddressItem, connectedWallet: selectedWallet, partner })}</AddressButton>
        <Modal
            header='Send To'
            height="fit"
            show={showAddressModal} setShow={setShowAddressModal}
            modalId="address"
        >
            <ResizablePanel>
                <div className='w-full flex flex-col justify-between h-full text-primary-text pt-2 min-h-[400px]'>
                    <div className='flex flex-col self-center grow w-full'>
                        <div className='flex flex-col self-center grow w-full space-y-5'>
                            <ManualAddressInput
                                manualAddress={manualAddress}
                                setManualAddress={setManualAddress}
                                setNewAddress={setNewAddress}
                                values={values}
                                partner={partner}
                                name={name}
                                inputReference={inputReference}
                                setFieldValue={setFieldValue}
                                close={close}
                                addresses={groupedAddresses}
                                connectedWallet={activeWallet}
                            />
                            <div className="space-y-4">
                                {
                                    destinationExchange ?
                                        <ExchangeNote destination={destination} destinationAsset={destinationAsset} destinationExchange={destinationExchange} />
                                        :
                                        !disabled
                                        && destination
                                        && provider
                                        && !manualAddress &&
                                        <ConnectWalletButton provider={provider} connectedWallet={activeWallet} onClick={(address: string, wallet: Wallet) => { handleSelectAddress(address, wallet) }} onConnect={() => setIsConnecting(true)} destination={destination} destination_address={destination_address} />
                                }

                                {
                                    !disabled && addressBookAddresses && addressBookAddresses?.length > 0 && !manualAddress && destination &&
                                    <AddressBook
                                        addressBook={addressBookAddresses}
                                        onSelectAddress={handleSelectAddress}
                                        destination={destination}
                                        destination_address={destination_address}
                                        partner={partner}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                </div >
            </ResizablePanel>
        </Modal>
    </>
    )
});

const resolveAddressGroups = ({
    address_book,
    destination,
    destinationExchange,
    wallets,
    newAddress,
    addressFromQuery,
}: {
    address_book: AddressBookItem[] | undefined,
    destination: RouteNetwork | undefined,
    destinationExchange: Exchange | undefined,
    wallets: Wallet[] | undefined,
    newAddress: { address: string, networkType: NetworkType | string } | undefined,
    addressFromQuery: string | undefined,
}) => {

    if (!destination) return

    const filteredAddressBook = address_book?.filter(a => destinationExchange ? a.exchanges.some(e => destinationExchange.name === e) : a.networks?.some(n => destination?.name === n) && isValidAddress(a.address, destination)) || []
    const recentlyUsedAddresses = filteredAddressBook.map(ra => ({ address: ra.address, date: ra.date, group: AddressGroup.RecentlyUsed, networkType: destinationExchange ? destinationExchange.name : destination.type }))

    const networkType = destinationExchange ? destinationExchange.name : destination?.type

    let addresses: AddressItem[] = []
    wallets?.forEach(wallet => {
        if (wallet?.addresses?.length) {
            addresses.push(...(wallet.addresses.map(a => ({ address: a, group: AddressGroup.ConnectedWallet })) || []))
        }
    })
    if (addressFromQuery) {
        addresses.push({ address: addressFromQuery, group: AddressGroup.FromQuery })
    }

    if (recentlyUsedAddresses.length > 0) {
        addresses = [...addresses, ...recentlyUsedAddresses]
    }

    if (newAddress?.address && newAddress.networkType === networkType) {
        addresses.push({ address: newAddress.address, group: AddressGroup.ManualAdded })
    }

    const uniqueAddresses = addresses.filter((a, index, self) => self.findIndex(t => addressFormat(t.address, destination) === addressFormat(a.address, destination)) === index)

    return uniqueAddresses
}

export default AddressPicker
