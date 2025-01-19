import { useEffect } from "react";
import { useIntercom } from "react-use-intercom";
import { useAuthState } from "../../context/authContext";
import SubmitButton from "../buttons/submitButton";
import CardContainer from "../cardContainer";
import LayerSwapLogo from "../icons/layerSwapLogo";
import TwitterLogo from "../icons/TwitterLogo";

function MaintananceContent(props) {
    const { email, userId } = useAuthState()
    const { boot, update } = useIntercom()
    const updateWithProps = () => update({ userId, customAttributes: { email: email, } })

    useEffect(() => {
        boot()
        updateWithProps()
    })

    const twitterLogo = <TwitterLogo className="h-6 w-6" />
    return (
        <div className="flex items-stretch flex-col">
            <LayerSwapLogo className="h-8 mt-4 md:hidden w-auto text-primary-logoColor fill-primary-text" />
            <CardContainer {...props} >
                <div className="flex flex-col justify-center space-y-12 p-10 text-primary-text md:min-h-fit min-h-[400px]">
                    <h1 className="text-xl tracking-tight text-gray-200">
                        <p className="mb-4 text-secondary-text">
                            We&apos;re upgrading our systems and infrastructure to give you the best experience yet.
                        </p>
                        <span className="block font-bold text-2xl xl:inline"><span>We&apos;ll be back at</span> <span>{new Date(1729778400000).toLocaleTimeString()}</span></span>
                    </h1>
                    <SubmitButton onClick={() => window.open('https://twitter.com/layerswap', '_blank')} icon={twitterLogo} isDisabled={false} isSubmitting={false}>Follow for updates</SubmitButton>
                </div>
            </CardContainer>
        </div>
    );
}

export default MaintananceContent;
