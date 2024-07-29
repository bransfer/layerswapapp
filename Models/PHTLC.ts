export type Commit = {
    dstAddress: string,
    dstChain: string,
    dstAsset: string,
    srcAsset: string,
    sender: string,
    srcReceiver: string,
    timelock: number,
    amount: string,
    messenger: string,
    locked: boolean,
    uncommitted: boolean
}

export type AssetLock = {
    dstAddress?: string,
    dstChain?: string,
    dstAsset?: string,
    srcAsset?: string,
    
    sender: `0x${string}`,
    srcReceiver: `0x${string}`,
    hashlock: string,
    secret: number,
    amount: number,
    timelock: number,
    redeemed: boolean,
    unlocked: boolean,
}