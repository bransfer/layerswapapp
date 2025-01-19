import { UpdateInterface } from "../../../context/swap"

const MockFunctions: UpdateInterface = {
    setSelectedSourceAccount: () => { throw new Error("Not implemented") },
    createSwap: () => { throw new Error("Not implemented") },
    setCodeRequested: () => { throw new Error("Not implemented") },
    mutateSwap: () => { throw new Error("Not implemented") },
    setDepositAddressIsFromAccount: () => { throw new Error("Not implemented") },
    setWithdrawType: () => {  },
    setInterval: () => { console.log("set interval called") },
    setSwapId: () => { throw new Error("Not implemented") },
}


export default MockFunctions