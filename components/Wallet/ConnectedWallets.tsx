import WalletIcon from "../icons/WalletIcon"
import shortenAddress from "../utils/ShortenAddress"
import useWallet from "../../hooks/useWallet"
import ConnectButton from "../buttons/connectButton"
import { useState } from "react"
import WalletsList from "./WalletsList"
import VaulDrawer from "../modal/vaulModal"
import { Wallet } from "../../Models/WalletProvider"

export const WalletsHeader = () => {
    const { wallets } = useWallet()

    if (wallets.length > 0) {
        return (
            <WalletsHeaderWalletsList wallets={wallets} />
        )
    }

    return (
        <ConnectButton>
            <div className="p-1.5 justify-self-start text-secondary-text hover:bg-secondary-500 hover:text-primary-text focus:outline-none inline-flex rounded-lg items-center">
                <WalletIcon className="h-6 w-6 mx-0.5" strokeWidth="2" />
            </div>
        </ConnectButton>
    )
}

const WalletsHeaderWalletsList = ({ wallets }: { wallets: Wallet[] }) => {
    const [openModal, setOpenModal] = useState<boolean>(false)
    return <>
        <button type="button" onClick={() => setOpenModal(true)} className="p-1.5 justify-self-start text-secondary-text hover:bg-secondary-500 hover:text-primary-text focus:outline-none inline-flex rounded-lg items-center">
            <WalletsIcons wallets={wallets} />
        </button>
        <VaulDrawer
            show={openModal}
            setShow={setOpenModal}
            header={`Connected wallets`}
            modalId="connectedWallets"
        >
            <VaulDrawer.Snap id="item-1">
                <WalletsList wallets={wallets} />
            </VaulDrawer.Snap>
        </VaulDrawer>
    </>
}

const WalletsIcons = ({ wallets }: { wallets: Wallet[] }) => {
    const firstWallet = wallets[0]
    const secondWallet = wallets[1]

    return (
        <div className="-space-x-2 flex">
            {
                firstWallet?.displayName &&
                <firstWallet.icon className="rounded-full border-2 border-secondary-600 bg-secondary-700 flex-shrink-0 h-6 w-6" />
            }
            {
                secondWallet?.displayName &&
                <secondWallet.icon className="rounded-full border-2 border-secondary-600 bg-secondary-700 flex-shrink-0 h-6 w-6" />
            }
            {
                wallets.length > 2 &&
                <div className="h-6 w-6 flex-shrink-0 rounded-full justify-center p-1 bg-secondary-600 text-primary-text overlfow-hidden text-xs">
                    <span><span>+</span>{wallets.length - 2}</span>
                </div>
            }
        </div>
    )
}

export const WalletsMenu = () => {
    const { wallets } = useWallet()

    if (wallets.length > 0) {
        return (
            <WalletsMenuWalletsList wallets={wallets} />
        )
    }

    return (
        <ConnectButton>
            <div className=" border border-primary disabled:border-primary-900 items-center space-x-1 disabled:text-opacity-40 disabled:bg-primary-900 disabled:cursor-not-allowed relative w-full flex justify-center font-semibold rounded-md transform hover:brightness-125 transition duration-200 ease-in-out bg-primary py-3 md:px-3 bg-primary/20 border-none !text-primary !px-4" >
                <span className="order-first absolute left-0 inset-y-0 flex items-center pl-3">
                    <WalletIcon className="h-6 w-6" strokeWidth="2" />
                </span>
                <span className="grow text-center">Connect a wallet</span>
            </div>
        </ConnectButton>
    )
}

const WalletsMenuWalletsList = ({ wallets }: { wallets: Wallet[] }) => {
    const wallet = wallets[0]
    const [openModal, setOpenModal] = useState<boolean>(false)

    return <>
        <button onClick={() => setOpenModal(true)} type="button" className="py-3 px-4 bg-secondary-700 flex items-center w-full rounded-componentRoundness space-x-1 disabled:text-opacity-40 disabled:bg-primary-900 disabled:cursor-not-allowed relative font-semibold transform hover:bg-secondary-600 transition duration-200 ease-in-out">
            {
                wallets.length === 1 ?
                    <div className="flex gap-4 items-start">
                        <wallet.icon className='h-5 w-5' />
                        {!wallet.isLoading && wallet.address && <p>{shortenAddress(wallet.address)}</p>}
                    </div>
                    :
                    <>
                        <div className="flex justify-center w-full">
                            Connected wallets
                        </div>
                        <div className="place-items-end absolute left-2.5">
                            <WalletsIcons wallets={wallets} />
                        </div>
                    </>
            }
        </button>
        <VaulDrawer
            show={openModal}
            setShow={setOpenModal}
            header={`Connected wallets`}
            modalId="connectedWallets"
        >
            <VaulDrawer.Snap id="item-1">
                <WalletsList wallets={wallets} />
            </VaulDrawer.Snap>
        </VaulDrawer>
    </>
}