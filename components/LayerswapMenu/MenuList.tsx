import { BookOpen, Gift, Map, Home, LogIn, ScrollText, LibraryIcon, Shield, Users, MessageSquarePlus, UserCircle2 } from "lucide-react";
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useState } from "react";
import { useAuthDataUpdate, useAuthState, UserType } from "../../context/authContext";
import TokenService from "../../lib/TokenService";
import { useIntercom } from "react-use-intercom";
import ChatIcon from "../icons/ChatIcon";
import inIframe from "../utils/inIframe";
import DiscordLogo from "./../icons/DiscordLogo";
import GitHubLogo from "./../icons/GitHubLogo";
import SubstackLogo from "./../icons/SubstackLogo";
import TwitterLogo from "./../icons/TwitterLogo";
import Link from "next/link";
import Popover from "../modal/popover";
import SendFeedback from "../sendFeedback";
import YoutubeLogo from "../icons/YoutubeLogo";
import { resolvePersistantQueryParams } from "../../helpers/querryHelper";
import Menu from "./Menu";
import dynamic from "next/dynamic";
import { MenuStep } from "../../Models/Wizard";

const WalletsMenu = dynamic(() => import("../Wallet/ConnectedWallets").then((comp) => comp.WalletsMenu), {
    loading: () => <></>
})

const MenuList: FC<{ goToStep: (step: MenuStep, path: string) => void }> = ({ goToStep }) => {
    const { email, userType, userId } = useAuthState()
    const { setUserType } = useAuthDataUpdate()
    const router = useRouter();
    const { boot, show, update } = useIntercom()
    const [embedded, setEmbedded] = useState<boolean>()
    const [openFeedbackModal, setOpenFeedbackModal] = useState(false);

    useEffect(() => {
        setEmbedded(inIframe())
    }, [])

    const updateWithProps = () => update({ userId, customAttributes: { email: email, } })

    const handleLogout = useCallback(() => {
        TokenService.removeAuthData()
        if (router.pathname != '/') {
            router.push({
                pathname: '/',
                query: resolvePersistantQueryParams(router.query)
            })
        } else {
            router.reload()
        }
        setUserType(UserType.NotAuthenticatedUser)
    }, [router.query])

    const handleCloseFeedback = () => {
        setOpenFeedbackModal(false)
    }
    return <div className="text-sm font-medium focus:outline-none h-full">
        <Menu>

            <WalletsMenu />

            {
                router.pathname != '/' &&
                <Menu.Group>
                    <>

                        <Menu.Item pathname='/' icon={<Home className="h-5 w-5" />} >
                            Home
                        </Menu.Item>

                    </>
                    {/* <>
                    {router.pathname != '/transactions' &&
                        <Menu.Item onClick={() => goToStep(MenuStep.Transactions, "/transactions")} icon={<ScrollText className="h-5 w-5" />} >
                            Transactions
                        </Menu.Item>
                    }
                </>
                <>
                    {!embedded && router.pathname != '/campaigns' &&
                        <Menu.Item pathname='/campaigns' icon={<Gift className="h-5 w-5" />} >
                            Campaigns
                        </Menu.Item>
                    }
                </> */}
                </Menu.Group>
            }
            <Menu.Group>
                <Menu.Item onClick={() => {
                    boot();
                    show();
                    updateWithProps();
                }} target="_blank" icon={<ChatIcon strokeWidth={2} className="h-5 w-5" />} >
                    Help
                </Menu.Item>
                <Menu.Item pathname='https://v8-docs.layerswap.io/protocol/introduction' target="_blank" icon={<BookOpen className="h-5 w-5" />} >
                    Protocol Docs
                </Menu.Item>
            </Menu.Group>

            <Menu.Group>
                <Menu.Item pathname='https://docs.layerswap.io/user-docs/information/privacy-policy/' target="_blank" icon={<Shield className="h-5 w-5" />} >
                    Privacy Policy
                </Menu.Item>
                <Menu.Item pathname='https://docs.layerswap.io/user-docs/information/terms-of-services/' target="_blank" icon={<LibraryIcon className="h-5 w-5" />} >
                    Terms of Service
                </Menu.Item>
            </Menu.Group>


            <Menu.Group>
                <Popover
                    opener={
                        <Menu.Item onClick={() => setOpenFeedbackModal(true)} target="_blank" icon={<MessageSquarePlus className="h-5 w-5" />} >
                            Suggest a Feature
                        </Menu.Item>
                    }
                    isNested={true}
                    show={openFeedbackModal}
                    header="Suggest a Feature"
                    setShow={setOpenFeedbackModal}
                    popoverId={"feedback"}
                >
                    <div className="p-0 md:max-w-md">
                        <SendFeedback onSend={handleCloseFeedback} />
                    </div>
                </Popover>
            </Menu.Group>

            <div className="space-y-3 w-full">
                <hr className="border-secondary-500" />
                <p className="text-primary-text-muted flex justify-center my-3">Media links & suggestions:</p>
            </div>

            <div className="grid grid-cols-2 gap-2 justify-center">
                {navigation.social.map((item, index) => (
                    <Link key={index} target="_blank" href={item.href} className={`flex relative bg-secondary-700 hover:bg-secondary-600 rounded-md cursor-pointer select-none items-center outline-none text-primary-text ${item.className}`}>
                        <div className="p-2 w-full flex justify-center gap-1">
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                            <p>{item.name}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </Menu>
    </div>
}

const navigation = {
    social: [
        {
            name: 'Twitter',
            href: 'https://twitter.com/layerswap/',
            icon: (props) => TwitterLogo(props),
            className: 'plausible-event-name=Twitter'
        },
        {
            name: 'GitHub',
            href: 'https://github.com/layerswap/layerswapapp/',
            icon: (props) => GitHubLogo(props),
            className: 'plausible-event-name=GitHub'
        },
        {
            name: 'Discord',
            href: 'https://discord.com/invite/KhwYN35sHy/',
            icon: (props) => DiscordLogo(props),
            className: 'plausible-event-name=Discord'
        },
        {
            name: 'YouTube',
            href: 'https://www.youtube.com/@layerswaphq/',
            icon: (props) => YoutubeLogo(props),
            className: 'plausible-event-name=Youtube'
        },
        {
            name: 'Substack',
            href: 'https://layerswap.substack.com/',
            icon: (props) => SubstackLogo(props),
            className: 'plausible-event-name=Substack'
        },
        {
            name: 'Roadmap',
            href: 'https://layerswap.ducalis.io/roadmap/summary/',
            icon: (props) => <Map {...props}></Map>,
            className: 'plausible-event-name=Roadmap'
        },
    ]
}

export default MenuList