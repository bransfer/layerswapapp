import KnownInternalNames from "../../knownIds";
import { ClaimParams, CommitmentParams, CreatePreHTLCParams, LockParams, RefundParams } from "../phtlc";
import { Address, beginCell, Cell, toNano } from "@ton/ton"
import { commitTransactionBuilder } from "./transactionBuilder";
import { Commit } from "../../../Models/PHTLC";
import { hexToBigInt } from "viem";
import { useSettingsState } from "../../../context/settings";
import { retryUntilFecth } from "../../retry";
import { getTONDetails } from "./getters";
import { ConnectedWallet, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react"
import { Wallet, WalletProvider } from "../../../Models/WalletProvider";
import { resolveWalletConnectorIcon } from "../utils/resolveWalletIcon";

export default function useTON(): WalletProvider {
    const commonSupportedNetworks = [
        KnownInternalNames.Networks.TONMainnet,
        KnownInternalNames.Networks.TONTestnet
    ]
    const [tonConnectUI] = useTonConnectUI();
    const tonWallet = useTonWallet();
    const { networks } = useSettingsState()

    const name = 'TON'
    const id = 'ton'

    const address = tonWallet?.account && Address.parse(tonWallet.account.address).toString({ bounceable: false })
    const iconUrl = tonWallet?.["imageUrl"] as string
    const wallet_id = tonWallet?.["name"] || tonWallet?.device.appName

    const wallet: Wallet | undefined = tonWallet && address ? {
        id: wallet_id,
        displayName: `${wallet_id} - Ton`,
        addresses: [address],
        address,
        providerName: id,
        isActive: true,
        icon: resolveWalletConnectorIcon({ connector: name, address, iconUrl }),
        disconnect: () => disconnectWallets(),
        connect: () => connectWallet(),
        withdrawalSupportedNetworks: commonSupportedNetworks,
        autofillSupportedNetworks: commonSupportedNetworks,
        asSourceSupportedNetworks: commonSupportedNetworks,
        networkIcon: networks.find(n => commonSupportedNetworks.some(name => name === n.name))?.logo
    } : undefined

    const connectWallet = async () => {

        if (tonWallet) {
            await disconnectWallets()
        }

        function connectAndWaitForStatusChange() {
            return new Promise((resolve, reject) => {
                try {
                    // Initiate the connection
                    tonConnectUI.openModal();

                    // Listen for the status change
                    tonConnectUI.onStatusChange((status) => {
                        if (status) resolve(status); // Resolve the promise with the status
                    });
                } catch (error) {
                    console.error('Error connecting:', error);
                    reject(error); // Reject the promise if an exception is thrown
                }
            });
        }

        const result: Wallet | undefined = await connectAndWaitForStatusChange()
            .then((status: ConnectedWallet) => {
                const connectedAddress = Address.parse(status.account.address).toString({ bounceable: false })
                const connectedName = status.device.appName
                const wallet: Wallet | undefined = status && connectedAddress ? {
                    id: connectedName,
                    displayName: `${connectedName} - Ton`,
                    addresses: [connectedAddress],
                    address: connectedAddress,
                    providerName: id,
                    isActive: true,
                    icon: resolveWalletConnectorIcon({ connector: connectedName, address: connectedAddress }),
                    disconnect: () => disconnectWallets(),
                    connect: () => connectWallet(),
                    withdrawalSupportedNetworks: commonSupportedNetworks,
                    autofillSupportedNetworks: commonSupportedNetworks,
                    asSourceSupportedNetworks: commonSupportedNetworks,
                    networkIcon: networks.find(n => commonSupportedNetworks.some(name => name === n.name))?.logo
                } : undefined

                return wallet ? wallet : undefined
            })
            .catch((error) => {
                console.error('Promise rejected with error:', error);
                return undefined
            });

        return result

    }

    const disconnectWallets = async () => {
        try {
            await tonConnectUI.disconnect()
        }
        catch (e) {
            console.log(e)
        }
    }

    // const availableWalletsForConnect: InternalConnector[] | undefined = tonWallets?.map(w => ({
    //     id: w.appName,
    //     name: w.name,
    //     icon: w.imageUrl,
    // }))

    const createPreHTLC = async (params: CreatePreHTLCParams) => {

        if (!tonWallet?.account.publicKey) return

        const tx = await commitTransactionBuilder({
            wallet: {
                address: tonWallet.account.address,
                publicKey: tonWallet.account.publicKey
            },
            ...params
        })

        if (!tx) throw new Error('Transaction not created')

        const res = await tonConnectUI.sendTransaction(tx)

        const cell = Cell.fromBase64(res.boc)
        const buffer = cell.hash();
        const messageHash = buffer.toString('hex');

        const getCommitId = async () => {

            await new Promise((resolve) => setTimeout(resolve, 3000))
            const events: Events = await fetch(`https://testnet.toncenter.com/api/v3/events?msg_hash=${messageHash}`).then(res => res.json())

            if (events?.events.length > 0) {

                const transactionsArray = Object.values(events.events[0].transactions)
                const body = transactionsArray.find(t => t.out_msgs?.length > 0 && t.out_msgs[0]?.destination == null && t.out_msgs[0].opcode === '0xbf3d24d1')?.out_msgs?.[0]?.message_content?.body
                if (!body) throw new Error('No commitId')

                const slice = Cell.fromBase64(body).beginParse()
                if (slice.loadUint(32) !== 3208455377) { }
                const commitId = slice.loadIntBig(257);

                return '0x' + commitId.toString(16);
            } else {
                throw new Error('No events')
            }
        }

        const commitId = await retryUntilFecth(getCommitId)


        return { hash: messageHash, commitId }
    }

    const getDetails = async (params: CommitmentParams): Promise<Commit> => {
        const network = networks.find(n => n.chain_id === params.chainId)

        try {

            const detailsResult = await getTONDetails({ network, ...params })

            if (!(detailsResult)) {
                throw new Error("No result")
            }
            return detailsResult
        }
        catch (e) {
            console.log(e)
            throw new Error("No result")
        }

    }

    const addLock = async (params: CommitmentParams & LockParams) => {
        const { id, hashlock, contractAddress } = params

        const LOCK_TIME = 1000 * 60 * 15 // 15 minutes
        const timeLockMS = Date.now() + LOCK_TIME
        const timelock = BigInt(Math.floor(timeLockMS / 1000))

        const body = beginCell()
            .storeUint(1558004185, 32)
            .storeInt(hexToBigInt(id as `0x${string}`), 257)
            .storeInt(hexToBigInt(hashlock as `0x${string}`), 257)
            .storeInt(timelock, 257)
            .endCell();

        const tx = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
                {
                    address: contractAddress,
                    amount: toNano('0.1').toString(),
                    payload: body.toBoc().toString("base64")
                }
            ]
        }

        const res = await tonConnectUI.sendTransaction(tx)
        const cell = Cell.fromBase64(res.boc)
        const buffer = cell.hash();
        const messageHash = buffer.toString('hex');

        return { hash: messageHash, result: res }
    }

    const refund = async (params: RefundParams) => {
        const { id, contractAddress } = params

        const opcode = 2910985977

        const body = beginCell()
            .storeUint(opcode, 32)
            .storeInt(hexToBigInt(id as `0x${string}`), 257)
            .endCell();

        const tx = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
                {
                    address: contractAddress,
                    amount: toNano('0.1').toString(),
                    payload: body.toBoc().toString("base64")
                }
            ]
        }

        const result = await tonConnectUI.sendTransaction(tx)

        if (!result) {
            throw new Error("No result")
        }
        return result
    }

    const claim = async (params: ClaimParams) => {
        const { id, secret, contractAddress } = params

        const opcode = 1972220037

        const body = beginCell()
            .storeUint(opcode, 32)
            .storeInt(hexToBigInt(id as `0x${string}`), 257)
            .storeInt(hexToBigInt(secret as `0x${string}`), 257)
            .endCell();

        const tx = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
                {
                    address: contractAddress,
                    amount: toNano('0.1').toString(),
                    payload: body.toBoc().toString("base64")
                }
            ]
        }

        await tonConnectUI.sendTransaction(tx)
    }


    const provider = {
        connectWallet,
        disconnectWallets,
        // availableWalletsForConnect,
        activeAccountAddress: wallet?.address,
        connectedWallets: wallet ? [wallet] : undefined,
        activeWallet: wallet,
        withdrawalSupportedNetworks: commonSupportedNetworks,
        autofillSupportedNetworks: commonSupportedNetworks,
        asSourceSupportedNetworks: commonSupportedNetworks,
        name,
        id,

        createPreHTLC,
        getDetails,
        addLock,
        refund,
        claim
    }

    return provider
}

type Events = {
    events: {
        transactions: {
            [transaction: string]: {
                out_msgs: {
                    opcode: string
                    destination: string | null,
                    message_content: {
                        body: string,
                    },
                }[]
            }
        }
    }[]
}