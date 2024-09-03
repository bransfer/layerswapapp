import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { WalletProvider } from "../../../hooks/useWallet"
import KnownInternalNames from "../../knownIds"
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react"
import resolveWalletConnectorIcon from "../utils/resolveWalletIcon"
import { CommitmentParams, CreatyePreHTLCParams, LockParams, RefundParams } from "../phtlc"
import { AnchorHtlc } from "./anchorHTLC"
import { AssetLock } from "../../../Models/PHTLC"
import { Address, AnchorProvider, BN, Program, setProvider } from '@coral-xyz/anchor'
import { PublicKey, Transaction } from "@solana/web3.js"
import { useSettingsState } from "../../../context/settings"
import { NetworkType } from "../../../Models/Network"
import { useCallback } from "react"
import { phtlcTransactionBuilder } from "./transactionBuilder"

export default function useSolana(): WalletProvider {
    const withdrawalSupportedNetworks = [KnownInternalNames.Networks.SolanaMainnet, KnownInternalNames.Networks.SolanaDevnet]
    const name = 'solana'
    const { publicKey, disconnect, wallet, signTransaction } = useWallet();
    const { setVisible } = useWalletModal();
    const { connection } = useConnection();
    const anchorWallet = useAnchorWallet();
    const { networks } = useSettingsState()
    const solana = networks.find(n => n.type === NetworkType.Solana)

    const provider = anchorWallet && new AnchorProvider(connection, anchorWallet, {});
    if (provider) setProvider(provider);

    const program = (provider && solana?.metadata?.htlc_native_contract) ? new Program(AnchorHtlc(solana?.metadata?.htlc_native_contract), provider) : null;

    const getWallet = () => {
        if (publicKey) {
            return {
                address: publicKey?.toBase58(),
                connector: wallet?.adapter?.name,
                providerName: name,
                chainId: solana?.chain_id,
                icon: resolveWalletConnectorIcon({ connector: String(wallet?.adapter.name), address: publicKey?.toBase58() })
            }
        }
    }

    const connectWallet = () => {
        return setVisible && setVisible(true)
    }

    const disconnectWallet = async () => {
        try {
            await disconnect()
        }
        catch (e) {
            console.log(e)
        }
    }

    const reconnectWallet = async () => {
        await disconnectWallet()
        connectWallet()
    }

    const createPreHTLC = useCallback(async (params: CreatyePreHTLCParams): Promise<{ hash: string; commitId: string; } | null | undefined> => {
        debugger
        const provider = anchorWallet && new AnchorProvider(connection, anchorWallet, {});
        const program = (provider && solana?.metadata?.htlc_native_contract) ? new Program(AnchorHtlc(solana?.metadata?.htlc_native_contract), provider) : null;
        if (!program || !publicKey || !solana) return null


        const transaction = await phtlcTransactionBuilder({ connection, program, walletPublicKey: publicKey, ...params, network: solana })

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

    const getCommitment = useCallback(async (params: CommitmentParams) => {
        if (!program) return null
        const { commitId } = params
        const commitIdBuffer = Buffer.from(commitId.replace('0x', ''), 'hex');

        let [phtlc, phtlcBump] = commitIdBuffer && PublicKey.findProgramAddressSync(
            [commitIdBuffer],
            program.programId
        );
        const result = await program?.methods.getCommitDetails(Array.from(commitIdBuffer), phtlcBump).accountsPartial({ phtlc }).view();

        const parsedResult = {
            ...result,
            lockId: result.locked && `0x${toHexString(result.lockId)}`,
            amount: Number(result.amount),
            timelock: Number(result.timelock),
            sender: new PublicKey(result.sender).toString(),
            srcReceiver: new PublicKey(result.srcReceiver).toString(),
            secret: new TextDecoder().decode(result.secret),
            tokenContract: new PublicKey(result.tokenContract).toString(),
            tokenWallet: new PublicKey(result.tokenWallet).toString(),
        }

        if (!result) {
            throw new Error("No result")
        }
        return parsedResult
    }, [program])

    const getLockIdByCommitId = async (params: CommitmentParams) => {
        const { commitId } = params
        const commitIdBuffer = Buffer.from(commitId.replace('0x', ''), 'hex');
        if (!program) return null

        try {
            let [lockIdStruct, _b] = commitIdBuffer && PublicKey.findProgramAddressSync(
                [Buffer.from("commit_to_lock"), commitIdBuffer],
                program.programId
            );

            const result = await program.methods.getLockIdByCommitId(Array.from(commitIdBuffer)).accountsPartial({ lockIdStruct: lockIdStruct as Address }).view();
            if (!result) return null

            const parsedResult = `0x${toHexString(result)}`

            return parsedResult
        } catch (e) {
            console.log(e)
            return null
        }
    }

    const lockCommitment = async (params: CommitmentParams & LockParams) => {
        const { commitId, lockId, chainId, lockData } = params

        const network = networks.find(n => n.chain_id === chainId)
        const token = network?.tokens.find(t => t.symbol === lockData?.dstAsset)

        if (!program || !token?.contract || !publicKey) return null

        const LOCK_TIME = 1000 * 60 * 15 // 15 minutes
        const timeLockMS = Date.now() + LOCK_TIME
        const timeLock = Math.floor(timeLockMS / 1000)
        const TIMELOCK = new BN(timeLock);

        const commitIdBuffer = Buffer.from(commitId);
        const lockIdBuffer = Buffer.from(lockId);
        let [htlc, htlcBump]: any = lockId && PublicKey.findProgramAddressSync(
            [lockIdBuffer],
            program.programId
        );
        let [phtlc, phtlcBump]: any = commitId && PublicKey.findProgramAddressSync(
            [commitIdBuffer],
            program.programId
        );
        let [htlcTokenAccount, bump2]: any = lockId && PublicKey.findProgramAddressSync(
            [Buffer.from("htlc_token_account"), lockIdBuffer],
            program.programId
        );
        let [phtlcTokenAccount, bump3]: any = commitId && PublicKey.findProgramAddressSync(
            [Buffer.from("phtlc_token_account"), commitIdBuffer],
            program.programId
        );
        const result = await program.methods.lockCommit(Array.from(commitIdBuffer), Array.from(lockIdBuffer), TIMELOCK, Number(htlcBump)).
            accountsPartial({
                messenger: publicKey,
                phtlc: phtlc,
                htlc: htlc,
                phtlc_token_account: phtlcTokenAccount,
                htlc_token_account: htlcTokenAccount,
                token_contract: new PublicKey(token.contract),
            }).rpc();

        return { hash: `0x${toHexString(result)}` as `0x${string}`, result: result } as any
    }

    const getLock = async (params: LockParams): Promise<AssetLock> => {
        const { lockId } = params
        const lockIdBuffer = Buffer.from(lockId.replace('0x', ''), 'hex');

        let [htlc, htlcBump]: any = program && lockIdBuffer && PublicKey.findProgramAddressSync(
            [lockIdBuffer],
            program.programId
        );
        const result = await program?.methods.getLockDetails(Array.from(lockIdBuffer), Number(htlcBump)).accountsPartial({ htlc }).view();

        const parsedResult = {
            ...result,
            amount: Number(result.amount),
            hashlock: `0x${toHexString(result.hashlock)}`,
            timelock: Number(result.timelock),
            sender: new PublicKey(result.sender).toString(),
            srcReceiver: new PublicKey(result.srcReceiver).toString(),
            secret: new TextDecoder().decode(result.secret),
            tokenContract: new PublicKey(result.tokenContract).toString(),
            tokenWallet: new PublicKey(result.tokenWallet).toString(),
        }

        if (!result) {
            throw new Error("No result")
        }
        return parsedResult
    }

    const refund = async (params: RefundParams) => {
        const { lockId, commit, commitId, chainId } = params

        const sourceAsset = networks.find(n => n.chain_id === chainId)?.tokens.find(t => t.symbol === commit.srcAsset)

        if (!program || !sourceAsset?.contract || !publicKey) return null

        const getAssociatedTokenAddress = (await import('@solana/spl-token')).getAssociatedTokenAddress;
        const senderTokenAddress = await getAssociatedTokenAddress(new PublicKey(sourceAsset.contract), publicKey);
        const tokenContract = new PublicKey(sourceAsset.contract);

        const commitIdBuffer = Buffer.from(commitId.replace('0x', ''), 'hex');
        const lockIdBuffer = lockId && Buffer.from(lockId.replace('0x', ''), 'hex');

        let [htlc, htlcBump] = lockIdBuffer && PublicKey.findProgramAddressSync(
            [lockIdBuffer],
            program.programId
        ) || [];
        let [htlcTokenAccount, bump2] = lockIdBuffer && PublicKey.findProgramAddressSync(
            [Buffer.from("htlc_token_account"), lockIdBuffer],
            program.programId
        ) || [];
        let [phtlc, phtlcBump] = commitIdBuffer && PublicKey.findProgramAddressSync(
            [commitIdBuffer],
            program.programId
        );
        let [phtlcTokenAccount, bump3] = commitIdBuffer && PublicKey.findProgramAddressSync(
            [Buffer.from("phtlc_token_account"), commitIdBuffer],
            program.programId
        );
        if (commit.locked && !lockId) {
            throw new Error("No lockId")
        }

        if (commit.locked && lockId) {
            const lockIdBuffer = Buffer.from(lockId);
            const result = await program.methods.unlock(Array.from(lockIdBuffer), Number(htlcBump)).accountsPartial({
                userSigning: publicKey,
                htlc: htlc,
                htlcTokenAccount: htlcTokenAccount,
                sender: publicKey,
                tokenContract: tokenContract,
                senderTokenAccount: senderTokenAddress,
            }).rpc();
            return { result: result }
        } else {
            const result = await program.methods.uncommit(Array.from(commitIdBuffer), Number(phtlcBump)).accountsPartial({
                userSigning: publicKey,
                phtlc: phtlc,
                phtlcTokenAccount: phtlcTokenAccount,
                sender: publicKey,
                tokenContract: tokenContract,
                senderTokenAccount: senderTokenAddress,
            }).rpc();
            debugger
            return { result: result }
        }
    }

    const getCommits = async () => {
        if (!program || !publicKey) return null
        let [commits] = PublicKey.findProgramAddressSync(
            [Buffer.from("commits"), publicKey.toBuffer()],
            program.programId
        );

        const res = await program.methods.getCommits(publicKey).accountsPartial({ commits: commits }).view();

        const resolvedRes = res.map((r: any) => {
            return `0x${toHexString(r)}`
        })

        return resolvedRes
    }

    const claim = () => {
        throw new Error('Not implemented')
    }

    return {
        getConnectedWallet: getWallet,
        connectWallet,
        disconnectWallet,
        reconnectWallet,
        withdrawalSupportedNetworks,
        autofillSupportedNetworks: withdrawalSupportedNetworks,
        asSourceSupportedNetworks: withdrawalSupportedNetworks,
        name,

        createPreHTLC,
        getCommitment,
        getLockIdByCommitId,
        lockCommitment,
        getLock,
        refund,

        claim,
        getCommits
    }
}


function toHexString(byteArray) {
    return Array.from(byteArray, function (byte: any) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}