import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import AddressIcon from "../AddressIcon"
import IconButton from "../buttons/iconButton"
import CoinbaseIcon from "../icons/Wallets/Coinbase"
import MetaMaskIcon from "../icons/Wallets/MetaMask"
import RainbowIcon from "../icons/Wallets/Rainbow"
import WalletConnectIcon from "../icons/Wallets/WalletConnect"
import WalletIcon from "../icons/WalletIcon"
import { useEffect, useState } from "react"
import { StarknetWindowObject, getStarknet } from "get-starknet-core"
import { Contract, uint256 } from "starknet"
import { disconnect } from "get-starknet"
import Modal from "../modal/modal"
import useCopyClipboard from "../../hooks/useCopyClipboard"
import { Dialog, DialogContent, DialogTrigger } from "../shadcn/dialog"
import { Check, Copy, LogOut } from "lucide-react"
import shortenAddress from "../utils/ShortenAddress"
import { truncateDecimals } from "../utils/RoundDecimals"
import Image from "next/image"
import { formatUnits } from 'viem'
import Erc20Abi from "../../lib/abis/ERC20.json"
import { useWalletState, useWalletUpdate } from "../../context/wallet"


export const RainbowKitConnectWallet = ({ isButton }: { isButton?: boolean }) => {
    return <ConnectButton.Custom>
        {({ openConnectModal, account, mounted, chain, openAccountModal }) => {
            const connected = !!(mounted && account && chain)
            const { connector } = useAccount()
            return <button type="button" className="justify-self-center w-full" onClick={() => connected ? openAccountModal() : openConnectModal()} >
                {
                    connected ?
                        isButton ?
                            <div className="bg-secondary-700 rounded-lg border-2 border-secondary-500 hover:brightness-110 active:scale-90 transition duration-100 py-4 w-full flex justify-center items-center gap-4">
                                <div className="inline-flex items-center relative">
                                    <AddressIcon address={account.address} size={25} />
                                    {
                                        connector && <span className="absolute -bottom-1 -right-2 ml-1 shadow-sm text-[10px] leading-4 font-semibold text-white">
                                            <ResolveWalletIcon connector={connector?.id} className="w-5 h-5 border-2 border-secondary-600 rounded-full bg-primary-text" />
                                        </span>
                                    }
                                </div>
                                <p>
                                    {connector?.name}
                                </p>
                            </div>
                            :
                            <div className="font-bold grow flex space-x-2 -mx-2 py-1.5 px-2 justify-self-start text-primary-text hover:bg-secondary-500 hover:text-white focus:outline-none rounded-lg items-center">
                                <div className="inline-flex items-center relative">
                                    <AddressIcon address={account.address} size={25} />
                                    {
                                        connector && <span className="absolute -bottom-1 -right-2 ml-1 shadow-sm text-[10px] leading-4 font-semibold text-white">
                                            <ResolveWalletIcon connector={connector?.id} className="w-5 h-5 border-2 border-secondary-600 rounded-full bg-primary-text" />
                                        </span>
                                    }
                                </div>
                            </div>
                        : <WalletIcon className="h-6 w-6" strokeWidth="2" />
                }
            </button>
        }}
    </ConnectButton.Custom>
}

export const ResolveWalletIcon = ({ connector, className }: { connector: string, className: string }) => {
    switch (connector) {
        case KnownKonnectors.MetaMask:
            return <MetaMaskIcon className={className} />
        case KnownKonnectors.Coinbase:
            return <CoinbaseIcon className={className} />
        case KnownKonnectors.WaletConnect:
            return <WalletConnectIcon className={className} />
        case KnownKonnectors.Rainbow:
            return <RainbowIcon className={className} />
        default:
            return <></>
    }
}

const KnownKonnectors = {
    MetaMask: 'metaMask',
    WaletConnect: 'waletConnect',
    Coinbase: 'coinbase',
    Rainbow: 'rainbow',
}


// TODO refactor and fix this
export const ConnectedWallets = () => {
    const { isConnected } = useAccount();
    const [balance, setBalance] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const starknet = getStarknet()
    const { starknetAccount } = useWalletState()
    const { setStarknetAccount } = useWalletUpdate()
    const walletAddress = starknetAccount?.selectedAddress

    useEffect(() => {
        (async () => {
            const lastConnectedWallet = await starknet.getLastConnectedWallet()
            if (lastConnectedWallet) {
                const res = await starknet.enable(lastConnectedWallet)
                setStarknetAccount(res)
                if (res) {
                    const erc20Contract = new Contract(
                        Erc20Abi,
                        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                        res?.account,
                    )
                    const balanceResult = await erc20Contract.balanceOf(res?.account?.address)
                    const balanceInWei = BigInt(uint256.uint256ToBN(balanceResult.balance as any).toString());
                    const formattedResult = formatUnits(balanceInWei, 18);
                    setBalance(Number(formattedResult))
                }
            }
        })()
    }, [])

    const handleDisconnect = () => {
        setStarknetAccount(null);
        disconnect({ clearLastWallet: true })
    }

    if (isConnected && starknetAccount) {
        return (
            <>
                <IconButton onClick={() => setShowModal(true)} icon={
                    <WalletIcon className="h-6 w-6" strokeWidth="2" />
                } />
                <Modal header={'Connected wallets'} height="fit" show={showModal} setShow={setShowModal}>
                    <div className="grid grid-cols-2 items-center place-items-center gap-5 mt-2">
                        <StarknetWallet walletAddress={walletAddress} account={starknetAccount} balance={balance} handleDisconnect={handleDisconnect} isButton />
                        <RainbowKitConnectWallet isButton />
                    </div>
                </Modal>
            </>
        )
    } else if (!isConnected && starknetAccount) {
        return <StarknetWallet walletAddress={walletAddress} account={starknetAccount} balance={balance} handleDisconnect={handleDisconnect} />
    } else if (isConnected && !starknetAccount) {
        return <RainbowKitConnectWallet />
    } else if (!isConnected && !starknetAccount) {
        return <RainbowKitConnectWallet />
    }
}

export const StarknetWallet = ({ walletAddress, account, balance, handleDisconnect, isButton }: { walletAddress: string, account: StarknetWindowObject, balance: number, handleDisconnect: () => void, isButton?: boolean }) => {
    const [isCopied, setCopied] = useCopyClipboard()

    return walletAddress ?
        <Dialog>
            <DialogTrigger className="w-full h-full">
                {
                    isButton ?
                        <div className="bg-secondary-700 rounded-lg border-2 border-secondary-500 hover:brightness-110 active:scale-90 transition duration-100 py-4 w-full flex justify-center items-center gap-4">
                            <div className="inline-flex items-center relative">
                                <AddressIcon address={walletAddress} size={25} />
                                {
                                    <span className="absolute -bottom-1 -right-2 ml-1 shadow-sm text-[10px] leading-4 font-semibold text-white">
                                        <Image width={20} height={20} src={account.icon} className="border-2 border-secondary-600 rounded-full bg-primary-text" alt={account.id} />
                                    </span>
                                }
                            </div>
                            <p>
                                {account.name}
                            </p>
                        </div>
                        :
                        <div className="font-bold grow flex space-x-2 -mx-2 py-1.5 px-2 justify-self-start text-primary-text hover:bg-secondary-500 hover:text-white focus:outline-none rounded-lg items-center">
                            <div className="inline-flex items-center relative">
                                <AddressIcon address={walletAddress} size={25} />
                                {
                                    <span className="absolute -bottom-1 -right-2 ml-1 shadow-sm text-[10px] leading-4 font-semibold text-white">
                                        <Image width={20} height={20} src={account.icon} className="border-2 border-secondary-600 rounded-full bg-primary-text" alt={account.id} />
                                    </span>
                                }
                            </div>
                        </div>
                }
            </DialogTrigger>
            <DialogContent>
                <div className="flex flex-col items-center text-white gap-3">
                    <div className="inline-flex items-center relative mt-3">
                        <AddressIcon address={walletAddress} size={70} />
                        {
                            <span className="absolute -bottom-1 -right-2 ml-1 shadow-sm text-[10px] leading-4 font-semibold text-white">
                                <Image width={30} height={30} src={account.icon} className=" border-2 border-secondary-600 rounded-full bg-primary-text" alt={account.id} />
                            </span>
                        }
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold">{shortenAddress(walletAddress)}</p>
                        <p className="text-base font-medium text-primary-text">{truncateDecimals(balance, 6)} ETH</p>
                    </div>
                    <div className="grid grid-cols-2 w-full gap-2 text-xs font-medium">
                        <button onClick={() => setCopied(walletAddress)} type="button" className="w-full py-2 flex flex-col items-center text-white bg-secondary-500 rounded gap-1 transition duration-100 hover:scale-[1.03] hover:brightness-110 active:scale-95">
                            {
                                isCopied ?
                                    <Check className="h-4 w-4" />
                                    :
                                    <Copy className="h-4 w-4" />
                            }
                            <span>Copy Address</span>
                        </button>
                        <button onClick={handleDisconnect} type="button" className="w-full py-2 flex flex-col items-center text-white bg-secondary-500 rounded gap-1 transition duration-100 hover:scale-[1.03] hover:brightness-110 active:scale-95">
                            <LogOut className="h-4 w-4" />
                            <span>Disconnect</span>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
        : <></>
}
