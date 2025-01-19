import KnownInternalNames from "../../knownIds"
import { resolveWalletConnectorIcon } from "../utils/resolveWalletIcon"
import { Network } from "../../../Models/Network"
import { InternalConnector, Wallet, WalletProvider } from "../../../Models/WalletProvider"
import { useMemo } from "react"
import { useConnectModal } from "../../../components/WalletModal"
import { AnchorWallet, useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react"
import { ClaimParams, CommitmentParams, CreatePreHTLCParams, LockParams, RefundParams } from "../phtlc"
import { AnchorHtlc } from "./anchorHTLC"
import { AnchorProvider, Program, setProvider } from '@coral-xyz/anchor'
import { PublicKey } from "@solana/web3.js"
import { useSettingsState } from "../../../context/settings"
import { NetworkType, Token } from "../../../Models/Network"
import { useCallback } from "react"
import { lockTransactionBuilder, phtlcTransactionBuilder } from "./transactionBuilder"

const solanaNames = [KnownInternalNames.Networks.SolanaMainnet, KnownInternalNames.Networks.SolanaDevnet, KnownInternalNames.Networks.SolanaTestnet]

export default function useSolana({ network }: { network: Network | undefined }): WalletProvider {

    const commonSupportedNetworks = [
        KnownInternalNames.Networks.SolanaMainnet,
        KnownInternalNames.Networks.SolanaDevnet,
        KnownInternalNames.Networks.EclipseTestnet,
        KnownInternalNames.Networks.EclipseMainnet
    ]

    const name = 'Solana'
    const id = 'solana'
    const { disconnect, wallet: solanaWallet, select, wallets, signTransaction } = useWallet();
    const publicKey = solanaWallet?.adapter.publicKey
    const { networks } = useSettingsState()

    const connectedWallet = wallets.find(w => w.adapter.connected === true)
    const connectedAddress = connectedWallet?.adapter.publicKey?.toBase58()
    const connectedAdapterName = connectedWallet?.adapter.name

    const { connection } = useConnection();
    const anchorWallet = useAnchorWallet();
    const solana = networks.find(n => n.type === NetworkType.Solana)

    const anchorProvider = anchorWallet && new AnchorProvider(connection, anchorWallet);
    if (anchorProvider) setProvider(anchorProvider);

    const program = (anchorProvider && solana?.metadata?.htlc_token_contract) ? new Program(AnchorHtlc(solana?.metadata?.htlc_token_contract), anchorProvider) : null;

    const connectedWallets = useMemo(() => {

        if (network?.name.toLowerCase().startsWith('eclipse') && !(connectedAdapterName?.toLowerCase() === "backpack" || connectedAdapterName?.toLowerCase() === "nightly")) {
            return undefined
        }

        const wallet: Wallet | undefined = (connectedAddress && connectedAdapterName) ? {
            id: connectedAdapterName,
            address: connectedAddress,
            displayName: `${connectedWallet?.adapter.name} - Solana`,
            providerName: name,
            icon: resolveWalletConnectorIcon({ connector: String(connectedAdapterName), address: connectedAddress, iconUrl: connectedWallet?.adapter.icon }),
            disconnect,
            connect: () => connectWallet(),
            isActive: true,
            addresses: [connectedAddress],
            withdrawalSupportedNetworks: commonSupportedNetworks,
            asSourceSupportedNetworks: commonSupportedNetworks,
            autofillSupportedNetworks: commonSupportedNetworks,
            networkIcon: networks.find(n => solanaNames.some(name => name === n.name))?.logo
        } : undefined

        if (wallet) {
            return [wallet]
        }

    }, [network, connectedAddress, connectedAdapterName])

    const { connect } = useConnectModal()

    const connectWallet = async () => {
        try {
            return await connect(provider)
        }
        catch (e) {
            console.log(e)
        }
    }

    const connectConnector = async ({ connector }: { connector: InternalConnector }) => {
        const solanaConnector = wallets.find(w => w.adapter.name === connector.name)
        if (!solanaConnector) throw new Error('Connector not found')
        select(solanaConnector.adapter.name)
        await solanaConnector.adapter.connect()

        const connectedWallet = wallets.find(w => w.adapter.connected === true)
        const connectedAddress = connectedWallet?.adapter.publicKey?.toBase58()
        const wallet: Wallet | undefined = connectedAddress && connectedWallet ? {
            id: connectedWallet.adapter.name,
            address: connectedAddress,
            displayName: `${connectedWallet?.adapter.name} - Solana`,
            providerName: name,
            icon: resolveWalletConnectorIcon({ connector: String(connectedWallet?.adapter.name), address: connectedAddress, iconUrl: connectedWallet?.adapter.icon }),
            disconnect,
            connect: () => connectWallet(),
            isActive: true,
            addresses: [connectedAddress],
            withdrawalSupportedNetworks: commonSupportedNetworks,
            asSourceSupportedNetworks: commonSupportedNetworks,
            autofillSupportedNetworks: commonSupportedNetworks,
            networkIcon: networks.find(n => solanaNames.some(name => name === n.name))?.logo
        } : undefined

        return wallet
    }

    const disconnectWallet = async () => {
        try {
            await disconnect()
        }
        catch (e) {
            console.log(e)
        }
    }

    const availableWalletsForConnect = useMemo(() => {
        const connectors: InternalConnector[] = [];
        const solNetwork = network?.name?.toLowerCase().includes('eclipse') ? 'eclipse' : 'solana'

        for (const wallet of wallets) {

            const internalConnector: InternalConnector = {
                name: wallet.adapter.name,
                id: wallet.adapter.name,
                icon: wallet.adapter.icon,
                type: wallet.readyState === 'Installed' ? 'injected' : 'other'
            }

            if (solNetwork === 'eclipse') {
                if (!(wallet.adapter.name.toLowerCase() === "backpack" || wallet.adapter.name.toLowerCase() === "nightly")) {
                    continue
                } else {
                    connectors.push(internalConnector)
                }
            } else {
                connectors.push(internalConnector)
            }
        }

        return connectors;
    }, [wallets]);

    const createPreHTLC = useCallback(async (params: CreatePreHTLCParams): Promise<{ hash: string; commitId: string; } | null | undefined> => {
        if (!program || !publicKey || !solana) return null

        const transaction = await phtlcTransactionBuilder({ connection, program, walletPublicKey: publicKey, network: solana, ...params })

        const signed = transaction?.initAndCommit && signTransaction && await signTransaction(transaction.initAndCommit);
        const signature = signed && await connection.sendRawTransaction(signed.serialize());

        if (signature) {
            const blockHash = await connection.getLatestBlockhash();

            const res = await connection.confirmTransaction({
                blockhash: blockHash.blockhash,
                lastValidBlockHeight: blockHash.lastValidBlockHeight,
                signature
            });

            if (res?.value.err) {
                throw new Error(res.value.err.toString())
            }

            return { hash: signature, commitId: `0x${toHexString(transaction.commitId)}` }
        }

    }, [program, connection, signTransaction, publicKey, solana])

    const getDetails = async (params: CommitmentParams) => {

        if (!solana?.metadata.lp_address) throw new Error("No LP address")

        const { id } = params
        const idBuffer = Buffer.from(id.replace('0x', ''), 'hex');

        const lpAnchorWallet = { publicKey: new PublicKey(solana?.metadata?.lp_address) }
        const provider = new AnchorProvider(connection, lpAnchorWallet as AnchorWallet);
        const lpProgram = (provider && solana?.metadata?.htlc_token_contract) ? new Program(AnchorHtlc(solana?.metadata?.htlc_token_contract), provider) : null;

        if (!lpProgram) {
            throw new Error("Could not initiatea program")
        }

        let [htlc] = idBuffer && PublicKey.findProgramAddressSync(
            [idBuffer],
            lpProgram.programId
        );

        try {
            const result = await lpProgram?.methods.getDetails(Array.from(idBuffer)).accountsPartial({ htlc }).view();

            if (!result) return null

            const parsedResult = {
                ...result,
                hashlock: (result?.hashlock && toHexString(result.hashlock) !== '0000000000000000000000000000000000000000000000000000000000000000') && `0x${toHexString(result.hashlock)}`,
                amount: Number(result.amount) / Math.pow(10, 6),
                timelock: Number(result.timelock),
                sender: new PublicKey(result.sender).toString(),
                srcReceiver: new PublicKey(result.srcReceiver).toString(),
                secret: result.secret,
                tokenContract: new PublicKey(result.tokenContract).toString(),
                tokenWallet: new PublicKey(result.tokenWallet).toString(),
            }

            return parsedResult
        }
        catch (e) {
            console.log(e)
            throw new Error("No result")
        }
    }

    const addLock = async (params: CommitmentParams & LockParams) => {

        if (!program || !publicKey) return null

        const transaction = await lockTransactionBuilder({ connection, program, walletPublicKey: publicKey, ...params })

        const signed = transaction?.lockCommit && signTransaction && await signTransaction(transaction.lockCommit);
        const signature = signed && await connection.sendRawTransaction(signed.serialize());

        if (signature) {
            const blockHash = await connection.getLatestBlockhash();

            const res = await connection.confirmTransaction({
                blockhash: blockHash.blockhash,
                lastValidBlockHeight: blockHash.lastValidBlockHeight,
                signature
            });

            if (res?.value.err) {
                throw new Error(res.value.err.toString())
            }

            return { hash: signature, result: `0x${toHexString(transaction.lockId)}` }

        } else {
            return null
        }
    }

    const refund = async (params: RefundParams) => {
        const { id, sourceAsset } = params

        if (!program || !sourceAsset?.contract || !publicKey) return null

        const getAssociatedTokenAddress = (await import('@solana/spl-token')).getAssociatedTokenAddress;
        const senderTokenAddress = await getAssociatedTokenAddress(new PublicKey(sourceAsset.contract), publicKey);
        const tokenContract = new PublicKey(sourceAsset.contract);

        const idBuffer = Buffer.from(id.replace('0x', ''), 'hex');

        let [htlc, htlcBump] = idBuffer && PublicKey.findProgramAddressSync(
            [idBuffer],
            program.programId
        );
        let [htlcTokenAccount, bump3] = idBuffer && PublicKey.findProgramAddressSync(
            [Buffer.from("htlc_token_account"), idBuffer],
            program.programId
        );

        const result = await program.methods.refund(Array.from(idBuffer), Number(htlcBump)).accountsPartial({
            userSigning: publicKey,
            htlc,
            htlcTokenAccount,
            sender: publicKey,
            tokenContract: tokenContract,
            senderTokenAccount: senderTokenAddress,
        }).rpc();

        return { result: result }
    }

    const claim = async (params: ClaimParams) => {
        const { sourceAsset, id, secret } = params

        if (!program || !sourceAsset?.contract || !publicKey) return

        const tokenContract = new PublicKey(sourceAsset.contract);
        const idBuffer = Buffer.from(id.replace('0x', ''), 'hex');
        const secretBuffer = Buffer.from(secret.toString().replace('0x', ''), 'hex');
        const getAssociatedTokenAddress = (await import('@solana/spl-token')).getAssociatedTokenAddress;
        const senderTokenAddress = await getAssociatedTokenAddress(new PublicKey(sourceAsset.contract), publicKey);

        let [htlc, htlcBump] = idBuffer && PublicKey.findProgramAddressSync(
            [idBuffer],
            program.programId
        );
        let [htlcTokenAccount, bump3] = idBuffer && PublicKey.findProgramAddressSync(
            [Buffer.from("htlc_token_account"), idBuffer],
            program.programId
        );

        await program.methods.redeem(idBuffer, secretBuffer, htlcBump).
            accountsPartial({
                userSigning: publicKey,
                htlc: htlc,
                htlcTokenAccount: htlcTokenAccount,
                sender: publicKey,
                tokenContract: tokenContract,
                srcReceiverTokenAccount: senderTokenAddress,
            })
            .rpc();
    }

    const provider = {
        connectedWallets: connectedWallets,
        activeWallet: connectedWallets?.[0],
        connectWallet,
        connectConnector,
        disconnectWallets: disconnectWallet,
        availableWalletsForConnect,
        withdrawalSupportedNetworks: commonSupportedNetworks,
        autofillSupportedNetworks: commonSupportedNetworks,
        asSourceSupportedNetworks: commonSupportedNetworks,
        name,
        id,

        createPreHTLC,
        getDetails,
        addLock,
        refund,
        claim,
    }

    return provider
}


function toHexString(byteArray) {
    return Array.from(byteArray, function (byte: any) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}