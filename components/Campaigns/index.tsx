import { Gift } from "lucide-react";
import { FC } from "react";
import { ApiResponse } from "../../Models/ApiResponse";
import LayerSwapApiClient, { Campaign } from "../../lib/layerSwapApiClient";
import SpinIcon from "../icons/spinIcon";
import useSWR from 'swr'
import Image from "next/image";
import LinkWrapper from "../LinkWraapper";
import { Widget } from "../Widget/Index";

const Rewards = () => {

    const apiClient = new LayerSwapApiClient()
    const { data: campaignsData, isLoading } = useSWR<ApiResponse<Campaign[]>>('/campaigns', apiClient.fetcher)
    const campaigns = campaignsData?.data

    const sortedCampaigns = campaigns?.sort((a, b) => {
        const dateA = new Date(a.end_date).getTime();
        const dateB = new Date(b.end_date).getTime();
        return dateA - dateB;
    });

    const activeCampaigns = sortedCampaigns?.filter(IsCampaignActive) || []
    const inactiveCampaigns = sortedCampaigns?.filter(c => !IsCampaignActive(c)) || []

    return (
        <Widget className="min-h-[520px]">
            <Widget.Content>
                {!isLoading ?
                    <div className="space-y-5 h-full text-primary-text">
                        <div className="space-y-2">
                            <p className="font-bold text-left leading-5">Campaigns</p>
                            <div className="bg-secondary-700 border border-secondary-700 hover:border-secondary-500 transition duration-200 rounded-lg shadow-lg">
                                <div className="p-3 space-y-4">
                                    {
                                        activeCampaigns.length > 0 ?
                                            activeCampaigns.map(c =>
                                                <CampaignItem
                                                    campaign={c}
                                                    key={c.id}
                                                />)
                                            :
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Gift className="h-10 w-10 text-primary" />
                                                <p className="font-bold text-center">There are no active campaigns right now</p>
                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            inactiveCampaigns.length > 0 &&
                            <div className="space-y-2">
                                <p className="font-bold text-left leading-5">Old campaigns</p>
                                <div className="bg-secondary-700 border border-secondary-700 hover:border-secondary-500 transition duration-200 rounded-lg shadow-lg">
                                    <div className="p-3 dpsv flex flex-col space-y-4">
                                        {inactiveCampaigns?.map(c =>
                                            <CampaignItem
                                                campaign={c}
                                                key={c.id}
                                            />)}
                                    </div >
                                </div >
                            </div >
                        }
                    </div >
                    :
                    <div className="absolute top-[calc(50%-5px)] left-[calc(50%-5px)]">
                        <SpinIcon className="animate-spin h-5 w-5" />
                    </div>
                }
            </Widget.Content>
        </Widget>
    )
}
type CampaignProps = {
    campaign: Campaign,
}
const CampaignItem: FC<CampaignProps> = ({ campaign }) => {

    const campaignDaysLeft = ((new Date(campaign.end_date).getTime() - new Date().getTime()) / 86400000).toFixed()
    const campaignIsActive = IsCampaignActive(campaign)

    return <LinkWrapper href={`/campaigns/${campaign.name}`}
        className="flex justify-between items-center">
        <span className="flex items-center gap-1 hover:opacity-70 active:scale-90 duration-200 transition-all">
            <span className="h-5 w-5 relative">
                <Image
                    src={campaign.network.logo}
                    alt="Project Logo"
                    height="40"
                    width="40"
                    loading="eager"
                    className="rounded-md object-contain" />
            </span>
            <span className="font-semibold text-base text-left flex items-center">{campaign?.display_name} </span>
        </span>
        {
            campaignIsActive &&
            <span className="text-primary-text-muted text-right text-sm">
                {campaignDaysLeft} days left
            </span>
        }
    </LinkWrapper>
}

function IsCampaignActive(campaign: Campaign) {
    const now = new Date()
    return (new Date(campaign?.end_date).getTime() > now.getTime())
}

export default Rewards