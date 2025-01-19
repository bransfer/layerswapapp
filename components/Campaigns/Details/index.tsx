import { useRouter } from "next/router"
import { FC, useCallback } from "react"
import Image from 'next/image'
import { Gift } from "lucide-react"
import LayerSwapApiClient, { Campaign } from "../../../lib/layerSwapApiClient"
import useSWR from "swr"
import { ApiResponse } from "../../../Models/ApiResponse"
import SubmitButton from "../../buttons/submitButton";
import WalletIcon from "../../icons/WalletIcon";
import LinkWrapper from "../../LinkWraapper";
import { Widget } from "../../Widget/Index";
import Leaderboard from "./Leaderboard"
import Rewards from "./Rewards";
import SpinIcon from "../../icons/spinIcon"
import useWallet from "../../../hooks/useWallet"

function CampaignDetails() {
    const router = useRouter();
    const camapaignName = router.query.campaign?.toString()

    const apiClient = new LayerSwapApiClient()
    const { data: campaignsData, isLoading } = useSWR<ApiResponse<Campaign[]>>('/campaigns', apiClient.fetcher)
    const campaign = campaignsData?.data?.find(c => c.name === camapaignName)
    const network = campaign?.network

    const { provider } = useWallet(network, 'autofil')

    const handleConnect = useCallback(async () => {
        await provider?.connectWallet()
    }, [provider, network])

    const wallet = provider?.activeWallet
    const isConnected = !!wallet?.address

    if (isLoading) {
        return <Loading />
    }

    if (!campaign) {
        return <NotFound />
    }

    return (
        <Widget>
            <Widget.Content>
                <div className="space-y-5">
                    <div className="flex items-center gap-1">
                        <div className="h-7 w-7 relative">
                            {network && <Image
                                src={network.logo}
                                alt="Project Logo"
                                height="40"
                                width="40"
                                loading="eager"
                                className="rounded-md object-contain" />}
                        </div>
                        <p className="font-bold text-xl text-left flex items-center text-primary-text">
                            {network?.display_name} Rewards
                        </p>
                    </div>
                    {
                        isConnected ?
                            <Rewards campaign={campaign} />
                            :
                            <BriefInformation campaign={campaign} />
                    }
                    <Leaderboard campaign={campaign} />
                </div>
            </Widget.Content>
            <>
                {
                    !isConnected &&
                    <Widget.Footer>
                        <SubmitButton isDisabled={false} isSubmitting={false} onClick={handleConnect} icon={<WalletIcon className="stroke-2 w-6 h-6" />}>
                            Connect a wallet
                        </SubmitButton>
                    </Widget.Footer>
                }
            </>
        </Widget >
    )
}

type BriefInformationProps = {
    campaign: Campaign,
}
const BriefInformation: FC<BriefInformationProps> = ({ campaign }) =>
    <p className="text-secondary-text text-base">
        <span>You can earn $</span>
        <span>{campaign?.token.symbol}</span>
        <span>&nbsp;tokens by transferring assets to&nbsp;</span>
        <span>{campaign.network.display_name}.</span>
        <span> For each transaction, you&#39;ll receive&nbsp;</span>
        <span>{campaign?.percentage}</span>
        <span>% of paid fees back.&nbsp;</span>
        {/* <Link target='_blank' href="https://docs.layerswap.io/user-docs/layerswap-campaigns/usdop-rewards"
            className="text-primary underline hover:no-underline decoration-primary cursor-pointer">
            Learn more
        </Link> */}
    </p>

const Loading = () => <Widget className="min-h-[500px]">
    <Widget.Content>
        <div className="absolute top-[calc(50%-5px)] left-[calc(50%-5px)]">
            <SpinIcon className="animate-spin h-5 w-5" />
        </div>
    </Widget.Content>
</Widget>

const NotFound = () => <Widget className="min-h-[500px]">
    <Widget.Content>
        <div className="h-[364px] flex flex-col items-center justify-center space-y-4">
            <Gift className="h-20 w-20 text-primary" />
            <p className="font-bold text-center">Campaign not found</p>
            <LinkWrapper className="text-xs underline hover:no-underline" href='/campaigns'>See all campaigns</LinkWrapper>
        </div>
    </Widget.Content>
</Widget>

export default CampaignDetails;