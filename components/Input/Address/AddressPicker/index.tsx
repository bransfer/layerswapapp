import { useFormikContext } from "formik";
import { FC, forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { AddressBookItem } from "../../../../lib/layerSwapApiClient";
import { SwapFormValues } from "../../../DTOs/SwapFormValues";
import { isValidAddress } from "../../../../lib/address/validator";
import { Partner } from "../../../../Models/Partner";
import useWallet from "../../../../hooks/useWallet";
import { addressFormat } from "../../../../lib/address/formatter";
import ManualAddressInput from "./ManualAddressInput";
import Modal from "../../../modal/modal";
import ConnectWalletButton from "./ConnectedWallets/ConnectWalletButton";
import ExchangeNote from "./ExchangeNote";
import { Network, NetworkType, RouteNetwork } from "../../../../Models/Network";
import { Exchange } from "../../../../Models/Exchange";
import AddressBook from "./AddressBook";
import AddressButton from "./AddressButton";
import { useQueryState } from "../../../../context/query";
import { useAddressesStore } from "../../../../stores/addressesStore";
import ConnectedWallets from "./ConnectedWallets";
import { useSwapDataState } from "../../../../context/swap";
import { Wallet } from "../../../../Models/WalletProvider";

export enum AddressGroup {
    ConnectedWallet = "Connected wallet",
    ManualAdded = "Added Manually",
    RecentlyUsed = "Recently used",
    FromQuery = "Partner",
}

export type AddressItem = {
    address: string,
    group: AddressGroup,
    date?: string,
    wallet?: Wallet,
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
    const { selectedSourceAccount } = useSwapDataState()
    const { provider, wallets } = useWallet(destinationExchange ? undefined : destination, 'autofil')
    const connectedWallets = provider?.connectedWallets
    const connectedWalletskey = connectedWallets?.map(w => w.addresses.join('')).join('')

    const defaultWallet = provider?.connectedWallets?.sort((x, y) => (x.isActive === y.isActive) ? 0 : x.isActive ? -1 : 1).find(w => !w.isNotAvailable)
    const defaultAddress = (selectedSourceAccount && defaultWallet?.addresses.find(a => a.toLowerCase() == selectedSourceAccount?.address.toLowerCase())) || defaultWallet?.address

    const [manualAddress, setManualAddress] = useState<string>('')
    const [newAddress, setNewAddress] = useState<{ address: string, networkType: NetworkType | string } | undefined>()

    useEffect(() => {
        if (!destination || destinationExchange)
            setFieldValue("destination_address", undefined)
    }, [destinationExchange, destination])

    useEffect(() => {
        if (destination_address && !isValidAddress(destination_address, destination)) {
            setFieldValue("destination_address", '')
        }
    }, [destination, destination_address])

    const inputReference = useRef<HTMLInputElement>(null);
    const previouslyAutofilledAddress = useRef<string | undefined>(undefined)

    useEffect(() => {

        const groupedAddresses = destination && resolveAddressGroups({ address_book, destination, destinationExchange, wallets: connectedWallets, newAddress, addressFromQuery: query.destAddress })
        if (groupedAddresses) setAddresses(groupedAddresses)

    }, [address_book, destination, destinationExchange, newAddress, query.destAddress, connectedWalletskey])

    const destinationAddressItem = destination && destination_address ?
        groupedAddresses?.find(a => a.address.toLowerCase() === destination_address.toLowerCase()) || { address: destination_address, group: AddressGroup.ManualAdded }
        : undefined

    const addressBookAddresses = groupedAddresses?.filter(a => a.group !== AddressGroup.ConnectedWallet)

    const connectedWallet = (destination && destination_address) ? connectedWallets?.find(w => w.addresses?.find(a => addressFormat(a, destination) === addressFormat(destination_address, destination))) : undefined

    const handleSelectAddress = useCallback((address: string) => {
        const selected = destination && groupedAddresses?.find(a => addressFormat(a.address, destination) === addressFormat(address, destination))
        const formattedAddress = selected?.address
        setFieldValue("destination_address", formattedAddress)
        if (selected?.wallet)
            previouslyAutofilledAddress.current = selected?.address
        close()
    }, [close, setFieldValue, groupedAddresses])

    const autofillConnectedWallet = useCallback(() => {
        if (destination_address || !destination) return
        setFieldValue("destination_address", defaultAddress)
        previouslyAutofilledAddress.current = defaultAddress
        if (showAddressModal && defaultWallet) setShowAddressModal(false)
    }, [setFieldValue, setShowAddressModal, showAddressModal, destination, defaultWallet, defaultAddress, destination_address])

    const onConnect = (wallet: Wallet) => {
        previouslyAutofilledAddress.current = wallet.address
        setFieldValue("destination_address", wallet.address)
        close()
    }

    useEffect(() => {
        if ((!destination_address || (previouslyAutofilledAddress.current && previouslyAutofilledAddress.current != defaultAddress)) && defaultWallet) {
            autofillConnectedWallet()
        }
    }, [defaultWallet?.address, destination_address])

    useEffect(() => {
        if (previouslyAutofilledAddress && previouslyAutofilledAddress.current?.toLowerCase() === destination_address?.toLowerCase() && !connectedWallet?.address) {
            setFieldValue("destination_address", undefined)
        }
    }, [connectedWallet?.address, previouslyAutofilledAddress])

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
            connectedWallet={connectedWallet}
            partner={partner}
            destination={destination}
        >{children({ destination, disabled, addressItem: destinationAddressItem, connectedWallet: connectedWallet, partner })}</AddressButton>
        <Modal
            header='Send To'
            height="80%"
            show={showAddressModal} setShow={setShowAddressModal}
            modalId="address"
        >
            {/* <ResizablePanel> */}
            <div className='w-full flex flex-col justify-between h-full text-primary-text'>
                <div className='flex flex-col self-center grow w-full space-y-5 h-full'>

                    {
                        !destinationExchange &&
                        !disabled
                        && destination
                        && provider
                        && !defaultWallet &&
                        <ConnectWalletButton
                            provider={provider}
                            onConnect={onConnect}
                            destination={destination}
                        />
                    }

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
                        connectedWallet={connectedWallet}
                    />
                    {
                        destinationExchange &&
                        <ExchangeNote
                            destination={destination}
                            destinationAsset={destinationAsset}
                            destinationExchange={destinationExchange}
                        />
                    }
                    {
                        !disabled
                        && destination
                        && provider
                        && !manualAddress
                        &&
                        <ConnectedWallets
                            provider={provider}
                            wallets={wallets}
                            onClick={(wallet, address) => handleSelectAddress(address)}
                            onConnect={onConnect}
                            destination={destination}
                            destination_address={destination_address}
                        />
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
            {/* </ResizablePanel> */}
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
            addresses.push(...(wallet.addresses.map(a => ({ address: a, group: AddressGroup.ConnectedWallet, wallet })) || []))
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