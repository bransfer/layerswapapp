import { SwapStatus } from "../../Models/SwapStatus"
import { PublishedSwapTransactions, SwapItem, TransactionType } from "../../lib/layerSwapApiClient"

export default function StatusIcon({ swap, withBg, short }: { swap: SwapItem, withBg?: boolean, short?: boolean }) {
  const status = swap.status;
  switch (status) {
    case SwapStatus.Failed:
      return <RedComponenet text="Failed" withBg={withBg} short={short} />
    case SwapStatus.Completed:
      return <GreenComponent text="Completed" withBg={withBg} short={short} />
    case SwapStatus.Cancelled:
      return <SecondaryComponent text="Cancelled" withBg={withBg} short={short} />
    case SwapStatus.Expired:
      return <SecondaryComponent text="Expired" withBg={withBg} short={short} />
    case SwapStatus.UserTransferPending:
      const data: PublishedSwapTransactions = JSON.parse(localStorage.getItem('swapTransactions') || "{}")
      const txForSwap = data?.state?.swapTransactions?.[swap.id];
      if (txForSwap || swap.transactions.find(t => t.type === TransactionType.Input)) {
        return <PrimaryComponent text="In Progress" withBg={withBg} short={short} />
      }
      else {
        return <YellowComponent text="Incomplete" withBg={withBg} short={short} />
      }
    case SwapStatus.LsTransferPending:
      return <PrimaryComponent text="In Progress" withBg={withBg} short={short} />
    case SwapStatus.UserTransferDelayed:
      return <YellowComponent text="Delayed" withBg={withBg} short={short} />
    case SwapStatus.Created:
      return <YellowComponent text="Incomplete" withBg={withBg} short={short} />
    default:
      return <></>
  }
}

const IconComponentWrapper = ({ children, withBg, classNames }: { children: React.ReactNode, withBg?: boolean, classNames?: string }) => {
  return (
    <div className={`inline-flex items-center gap-2 font-bold ${classNames} ${withBg ? 'py-1 w-full justify-center rounded-lg' : '!bg-transparent'}`}>
      {children}
    </div>
  )
}

const GreenComponent = ({ text, withBg, short }: IconComponentProps) => {
  return (
    <IconComponentWrapper withBg={withBg} classNames="bg-[#54b487]/20 text-[#54b487]">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="30" fill="#54b487" />
      </svg>
      {!short && <p>{text}</p>}
    </IconComponentWrapper>
  )
}

const PrimaryComponent = ({ text, withBg, short }: IconComponentProps) => {
  return (
    <IconComponentWrapper withBg={withBg} classNames="bg-primary-900/30 text-primary-500">
      <div className='relative'>
        <div className='absolute top-0.5 left-0.5 w-3 h-3 opacity-40 bg bg-primary rounded-full animate-ping'></div>
        <div className='relative top-0 left-0 w-4 h-4 scale-75 bg bg-primary rounded-full'></div>
      </div>
      {!short && <p>{text}</p>}
    </IconComponentWrapper>
  )
}

const SecondaryComponent = ({ text, withBg, short }: IconComponentProps) => {
  return (
    <IconComponentWrapper withBg={withBg} classNames="text-primary-text-muted bg-secondary-900">
      {
        short ?
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 60 60" fill="currentColor" className="text-primary-text-muted">
            <circle cx="30" cy="30" r="30" fill="currentColor" />
          </svg>
          :
          <p>{text}</p>
      }
    </IconComponentWrapper>
  )
}

const YellowComponent = ({ text, withBg, short }: IconComponentProps) => {
  return (
    <IconComponentWrapper withBg={withBg} classNames="bg-yellow-950/40 text-yellow-600">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="30" fill="#DF8B16" />
      </svg>
      {!short && <p>{text}</p>}
    </IconComponentWrapper>
  )
}

const RedComponenet = ({ text, withBg, short }: IconComponentProps) => {
  return (
    <IconComponentWrapper withBg={withBg} classNames="bg-red-950/40 text-red-600">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="30" fill="#E43636" />
      </svg>
      {!short && <p>{text}</p>}
    </IconComponentWrapper>
  )
}

type IconComponentProps = {
  text: string;
  withBg?: boolean;
  short?: boolean;
}