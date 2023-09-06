import { useFormikContext } from "formik";
import { ChangeEvent, FC, forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { AddressBookItem } from "../../lib/layerSwapApiClient";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import { classNames } from '../utils/classNames'
import { toast } from "react-hot-toast";
import { useSwapDataState, useSwapDataUpdate } from "../../context/swap";
import { getStarknet } from "get-starknet-core"
import { Info } from "lucide-react";
import KnownInternalNames from "../../lib/knownIds";
import { useSettingsState } from "../../context/settings";
import { isValidAddress } from "../../lib/addressValidator";
import { RadioGroup } from "@headlessui/react";
import Image from 'next/image';
import { Partner } from "../../Models/Partner";
import RainbowKit from "../Swap/Withdraw/Wallet/RainbowKit";
import { useAccount } from "wagmi";
import { disconnect as wagmiDisconnect } from '@wagmi/core'
import shortenAddress from "../utils/ShortenAddress";
import AddressIcon from "../AddressIcon";
import { GetDefaultNetwork } from "../../helpers/settingsHelper";
import { connect, disconnect as starknetDisconnect } from "get-starknet";
import WalletIcon from "../icons/WalletIcon";
import { NetworkAddressType } from "../../Models/CryptoNetwork";
import { useWalletState, useWalletUpdate } from "../../context/wallet";

interface Input extends Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'as' | 'onChange'> {
    hideLabel?: boolean;
    disabled: boolean;
    name: string;
    children?: JSX.Element | JSX.Element[];
    ref?: any;
    close: () => void,
    isPartnerWallet: boolean,
    partnerImage: string,
    partner: Partner,
    canFocus?: boolean,
    address_book: AddressBookItem[]
}

const Address: FC<Input> = forwardRef<HTMLInputElement, Input>(
    ({ name, canFocus, close, address_book, disabled, isPartnerWallet, partnerImage, partner }, ref) => {
        const {
            values,
            setFieldValue
        } = useFormikContext<SwapFormValues>();

        const [wrongNetwork, setWrongNetwork] = useState(false)
        const inputReference = useRef(null);
        const destination = values.to
        const asset = values.currency?.asset
        const destinationNetwork = GetDefaultNetwork(destination, asset)
        const valid_addresses = address_book?.filter(a => (destination?.isExchange ? a.exchanges?.some(e => destination?.internal_name === e) : a.networks?.some(n => destination?.internal_name === n)) && isValidAddress(a.address, destination))

        const { setDepositeAddressIsfromAccount, setAddressConfirmed } = useSwapDataUpdate()
        const { depositeAddressIsfromAccount } = useSwapDataState()
        const placeholder = "Enter your address here"
        const [inputValue, setInputValue] = useState(values?.destination_address || "")
        const [validInputAddress, setValidInputAddress] = useState<string>()
        const [autofilledWallet, setAutofilledWallet] = useState<'evm' | 'starknet'>()
        const [canAutofillStarknet, setCanAutofillStarknet] = useState(true)
        const starknet = getStarknet()
        const destinationIsStarknet = destination?.internal_name === KnownInternalNames.Networks.StarkNetGoerli
            || destination?.internal_name === KnownInternalNames.Networks.StarkNetMainnet

        const { starknetAccount } = useWalletState()
        const { setStarknetAccount } = useWalletUpdate()

        const settings = useSettingsState()

        const { isConnected: isRainbowKitConnected, address: walletAddress } = useAccount({
            onDisconnect() {
                setInputValue("")
                setAddressConfirmed(false)
                setFieldValue("destination_address", "")
            }
        });

        useEffect(() => {
            if (isRainbowKitConnected && destinationNetwork?.address_type) {
                setAutofilledWallet('evm')
            }
        }, [isRainbowKitConnected, destinationNetwork?.address_type])

        useEffect(() => {
            if (!destination?.isExchange && isValidAddress(walletAddress, destination) && !values?.destination_address) {
                setInputValue(walletAddress)
                setAddressConfirmed(true)
                setFieldValue("destination_address", walletAddress)
            }
        }, [walletAddress, destination?.isExchange])

        useEffect(() => {
            if (canFocus) {
                inputReference.current.focus()
            }
        }, [canFocus])

        useEffect(() => {
            setInputValue(values.destination_address)
        }, [values.destination_address])

        const handleRemoveDepositeAddress = useCallback(async () => {
            setDepositeAddressIsfromAccount(false)
            setFieldValue("destination_address", '')
            try {
                if (autofilledWallet === "starknet") {
                    starknetDisconnect({ clearLastWallet: true })
                    setStarknetAccount(null)
                    setWrongNetwork(false)
                }
                else if (autofilledWallet === "evm") {
                    wagmiDisconnect()
                }
            }
            catch (e) {
                toast(e.message)
            }
            setInputValue("")
        }, [depositeAddressIsfromAccount, autofilledWallet])

        const handleSelectAddress = useCallback((value: string) => {
            setAddressConfirmed(true)
            setFieldValue("destination_address", value)
            close()
        }, [close])

        const inputAddressIsValid = isValidAddress(inputValue, destination)
        let errorMessage = '';
        if (inputValue && !isValidAddress(inputValue, destination)) {
            errorMessage = `Enter a valid ${values.to?.display_name} address`
        }

        const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value)
            setAddressConfirmed(false)
        }, [])

        useEffect(() => {
            if (inputAddressIsValid) {
                setValidInputAddress(inputValue)
            }
        }, [inputValue, inputAddressIsValid])

        useEffect(() => {
            if (destinationIsStarknet) {
                (async () => {
                    const availableNetworks = await starknet.getAvailableWallets()
                    if (!(availableNetworks.length > 0)) setCanAutofillStarknet(false)
                })()
            }
        }, [destinationIsStarknet])

        const handleSetNewAddress = useCallback(() => {
            setAddressConfirmed(true)
            setFieldValue("destination_address", validInputAddress)
            close()
        }, [validInputAddress])

        const destinationAsset = destination?.assets?.find(a => a.asset === asset)
        const destinationChainId = destinationAsset?.network?.chain_id

        const handleConnectStarknet = useCallback(async () => {
            const res = await connect()
            if (res?.account?.chainId != destinationChainId) {
                setWrongNetwork(true)
                starknetDisconnect({ clearLastWallet: true })
                setStarknetAccount(null)
                setAutofilledWallet(null)
                return
            }
            setWrongNetwork(false)
            setInputValue(res?.account?.address)
            setAddressConfirmed(true)
            setFieldValue("destination_address", res?.account?.address)
            setAutofilledWallet("starknet")
            setStarknetAccount(res)
        }, [destinationChainId])

        return (<>
            <div className='w-full flex flex-col justify-between h-full text-primary-text'>
                <div className='flex flex-col self-center grow w-full'>
                    <div className={`flex flex-col self-center grow w-full space-y-3`}>
                        <div className="text-left">
                            <label htmlFor={name}>Address</label>
                            {isPartnerWallet && partner && <span className='truncate text-sm text-indigo-200'> ({partner?.display_name})</span>}
                            <div className="flex flex-wrap flex-col md:flex-row">
                                <div className="relative flex grow rounded-lg shadow-sm mt-1.5 bg-secondary-700 border-secondary-500 border focus-within:ring-0 focus-within:ring-primary focus-within:border-primary">
                                    {isPartnerWallet &&
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {
                                                partnerImage &&
                                                <Image alt="Partner logo" className='rounded-md object-contain' src={partnerImage} width="24" height="24"></Image>
                                            }
                                        </div>
                                    }
                                    <input
                                        onChange={handleInputChange}
                                        value={inputValue}
                                        placeholder={placeholder}
                                        autoCorrect="off"
                                        type={"text"}
                                        disabled={disabled || !!((isRainbowKitConnected || starknetAccount?.isConnected) && values.destination_address) || !!(starknetAccount?.isConnected && values.destination_address)}
                                        name={name}
                                        id={name}
                                        ref={inputReference}
                                        tabIndex={0}
                                        className={`${isPartnerWallet ? 'pl-11' : ''} disabled:cursor-not-allowed grow h-12 border-none leading-4  block font-semibold w-full bg-secondary-700 rounded-lg truncate hover:overflow-x-scroll focus:ring-0 focus:outline-none`}
                                    />
                                    {
                                        inputValue && !disabled &&
                                        <span className="inline-flex items-center mr-2">
                                            <div className="text-xs flex items-center space-x-2 md:ml-5 bg-secondary-500 rounded-md border border-secondary-500">
                                                <button
                                                    type="button"
                                                    className="p-0.5 duration-200 transition  hover:bg-secondary-400  rounded-md border border-secondary-500 hover:border-secondary-200"
                                                    onClick={handleRemoveDepositeAddress}
                                                >
                                                    <div className="flex items-center px-2 text-sm py-1 font-semibold">
                                                        Clear
                                                    </div>
                                                </button>
                                            </div>
                                        </span>
                                    }
                                </div>
                                {errorMessage &&
                                    <div className="basis-full text-xs text-primary">
                                        {errorMessage}
                                    </div>
                                }
                                {wrongNetwork && !inputValue &&
                                    <div className="basis-full text-xs text-primary">
                                        {
                                            destination?.internal_name === KnownInternalNames.Networks.StarkNetMainnet
                                                ? <span>Please switch to Starknet Mainnet with your wallet and click Autofill again</span>
                                                : <span>Please switch to Starknet Goerli with your wallet and click Autofill again</span>
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                        {
                            validInputAddress &&
                            <div onClick={handleSetNewAddress} className={`text-left min-h-12 cursor-pointer space-x-2 border border-secondary-300 bg-secondary-600 shadow-xl flex text-sm rounded-md items-center w-full transform hover:bg-secondary-500 transition duration-200 px-2 py-2 hover:border-secondary-500 hover:shadow-xl`}>
                                <div className='flex text-primary-text bg-secondary-400 flex-row items-left rounded-md p-2'>
                                    {
                                        destinationIsStarknet && starknetAccount?.isConnected ?
                                            <Image src={starknetAccount?.icon} alt={starknetAccount?.account?.address} width={25} height={25} />
                                            :
                                            <AddressIcon address={validInputAddress} size={25} />
                                    }
                                </div>
                                <div className="flex flex-col grow">
                                    <div className="block text-md font-medium text-white">
                                        {shortenAddress(validInputAddress)}
                                    </div>
                                </div>
                                <div className='flex text-primary-text flex-row items-left px-2 py-1 rounded-md'>
                                    Select
                                </div>
                            </div>
                        }
                        {
                            !disabled && !inputValue && destinationIsStarknet && canAutofillStarknet &&
                            <div onClick={handleConnectStarknet} className={`min-h-12 text-left cursor-pointer space-x-2 border border-secondary-500 bg-secondary-700/70  flex text-sm rounded-md items-center w-full transform transition duration-200 px-2 py-1.5 hover:border-secondary-500 hover:bg-secondary-700 hover:shadow-xl`}>
                                <div className='flex text-primary-text flex-row items-left bg-secondary-400 px-2 py-1 rounded-md'>
                                    <WalletIcon className="w-6 h-6 text-primary-text" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="block text-sm font-medium">
                                        Autofill from wallet
                                    </div>
                                    <div className="text-gray-500">
                                        Connect your wallet to fetch the address
                                    </div>
                                </div>
                            </div>
                        }
                        {
                            !disabled && !inputValue && !destination?.isExchange
                            && (destinationNetwork?.address_type === NetworkAddressType.evm || destinationNetwork?.address_type === NetworkAddressType.immutable_x)
                            &&
                            <RainbowKit>
                                <div className={`min-h-12 text-left space-x-2 border border-secondary-500 bg-secondary-700/70  flex text-sm rounded-md items-center w-full transform transition duration-200 px-2 py-1.5 hover:border-secondary-500 hover:bg-secondary-700 hover:shadow-xl`}>
                                    <div className='flex text-primary-text flex-row items-left bg-secondary-400 px-2 py-1 rounded-md'>
                                        <WalletIcon className="w-6 h-6 text-primary-text" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="block text-sm font-medium">
                                            Autofill from wallet
                                        </div>
                                        <div className="text-gray-500">
                                            Connect your wallet to fetch the address
                                        </div>
                                    </div>
                                </div>
                            </RainbowKit>
                        }
                        {
                            destination?.isExchange && !inputAddressIsValid &&
                            <div className='text-left p-4 bg-secondary-800 text-white rounded-lg border border-secondary-500'>
                                <div className="flex items-center">
                                    <Info className='h-5 w-5 text-primary-600 mr-3' />
                                    <label className="block text-sm md:text-base font-medium leading-6">How to find your {destination?.display_name} deposit address</label>
                                </div>
                                <ul className="list-disc font-light space-y-1 text-xs md:text-sm mt-2 ml-8 text-primary-text">
                                    <li>Go to the Deposits page</li>
                                    <li>
                                        Select
                                        <span className="inline-block mx-1">
                                            <span className='flex gap-1 items-baseline text-sm '>
                                                <Image src={settings.resolveImgSrc(values.currency)}
                                                    alt="Project Logo"
                                                    height="15"
                                                    width="15"
                                                    className='rounded-sm'
                                                />
                                                <span className="text-white">{values.currency.asset}</span>
                                            </span>
                                        </span>
                                        as asset
                                    </li>
                                    <li>
                                        Select
                                        <span className="inline-block mx-1">
                                            <span className='flex gap-1 items-baseline text-sm '>
                                                <Image src={settings.resolveImgSrc(destinationNetwork)}
                                                    alt="Project Logo"
                                                    height="15"
                                                    width="15"
                                                    className='rounded-sm'
                                                />
                                                <span className="text-white">{destinationNetwork?.display_name}</span>
                                            </span>
                                        </span>
                                        as network
                                    </li>
                                </ul>
                            </div>
                        }
                        {
                            !disabled && valid_addresses?.length > 0 && !inputValue &&
                            <div className="text-left">
                                <label className="">Recently used</label>
                                <RadioGroup disabled={disabled} value={values.destination_address} onChange={handleSelectAddress}>
                                    <div className="rounded-md overflow-y-auto styled-scroll max-h-[300px]">
                                        {valid_addresses?.map((a) => (
                                            <RadioGroup.Option
                                                key={a.address}
                                                value={a.address}
                                                disabled={disabled}
                                                className={({ disabled }) =>
                                                    classNames(
                                                        disabled ? ' cursor-not-allowed ' : ' cursor-pointer ',
                                                        'relative flex focus:outline-none mt-2 mb-3  '
                                                    )
                                                }
                                            >
                                                {({ checked }) => {
                                                    const difference_in_days = Math.round(Math.abs(((new Date()).getTime() - new Date(a.date).getTime()) / (1000 * 3600 * 24)))
                                                    return (
                                                        <RadioGroup.Description
                                                            as="span"
                                                            className={`space-x-2 flex text-sm rounded-md items-center w-full transform hover:bg-secondary-300 transition duration-200 px-2 py-1.5 border border-secondary-900 hover:border-secondary-500 hover:bg-secondary-700/70 hover:shadow-xl ${checked && 'border-secondary-700'}`}
                                                        >
                                                            <div className='flex bg-secondary-400 text-primary-text flex-row items-left  rounded-md p-2'>
                                                                <AddressIcon address={a.address} size={20} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <div className="block text-sm font-medium">
                                                                    {shortenAddress(a.address)}
                                                                </div>
                                                                <div className="text-gray-500">
                                                                    {
                                                                        difference_in_days === 0 ?
                                                                            <>Used today</>
                                                                            :
                                                                            (difference_in_days > 1 ?
                                                                                <>Used {difference_in_days} days ago</>
                                                                                : <>Used yesterday</>)
                                                                    }
                                                                </div>
                                                            </div>
                                                        </RadioGroup.Description>
                                                    )
                                                }}
                                            </RadioGroup.Option>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
        )
    });


export default Address