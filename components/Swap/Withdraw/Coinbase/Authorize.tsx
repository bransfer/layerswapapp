import { FC, useCallback, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useSettingsState } from '../../../../context/settings';
import { useSwapDataState } from '../../../../context/swap';
import { useInterval } from '../../../../hooks/useInterval';
import { CalculateMinimalAuthorizeAmount } from '../../../../lib/fees';
import { parseJwt } from '../../../../lib/jwtParser';
import { OpenLink } from '../../../../lib/openLink';
import TokenService from '../../../../lib/TokenService';
import SubmitButton from '../../../buttons/submitButton';
import Carousel, { CarouselItem, CarouselRef } from '../../../Carousel';
import { FirstScreen, FourthScreen, LastScreen, SecondScreen, ThirdScreen } from './ConnectGuideScreens';
import { ArrowLeft } from 'lucide-react';
import IconButton from '../../../buttons/iconButton';
import { motion } from 'framer-motion';
import { useCoinbaseStore } from './CoinbaseStore';
import { useRouter } from 'next/router';
import { Widget } from '../../../Widget/Index';

type Props = {
    onAuthorized: () => void,
    onDoNotConnect: () => void,
    stickyFooter: boolean,
    hideHeader?: boolean,
}

const Authorize: FC<Props> = ({ onAuthorized, hideHeader }) => {
    const { swap } = useSwapDataState()
    const { layers, exchanges } = useSettingsState()
    const router = useRouter()
    let alreadyFamiliar = useCoinbaseStore((state) => state.alreadyFamiliar);
    let toggleAlreadyFamiliar = useCoinbaseStore((state) => state.toggleAlreadyFamiliar);
    const [carouselFinished, setCarouselFinished] = useState(alreadyFamiliar)

    const [authWindow, setAuthWindow] = useState<Window | null>()
    const [firstScreen, setFirstScreen] = useState<boolean>(true)

    const carouselRef = useRef<CarouselRef | null>(null)
    const exchange_internal_name = swap?.source_exchange
    const asset_name = swap?.source_network_asset

    const exchange = exchanges?.find(e => e.internal_name?.toLowerCase() === exchange_internal_name?.toLowerCase())
    const network = layers?.find(l => l.internal_name?.toLowerCase() === swap?.source_network?.toLowerCase())
    const currency = network?.assets.find(c => asset_name?.toLocaleUpperCase() === c.asset?.toLocaleUpperCase())

    const coinbaseOauthProvider = exchange?.o_auth
    const { authorize_url } = coinbaseOauthProvider || {}

    const minimalAuthorizeAmount = currency?.usd_price ?
        CalculateMinimalAuthorizeAmount(currency?.usd_price, Number(swap?.requested_amount)) : null

    const checkShouldStartPolling = useCallback(() => {
        let authWindowHref: string | undefined = ""
        try {
            authWindowHref = authWindow?.location?.href
        }
        catch (e) {
            //throws error when accessing href TODO research safe way
        }
        if (authWindowHref && authWindowHref?.indexOf(window.location.origin) !== -1) {
            authWindow?.close()
            onAuthorized()
        }
    }, [authWindow])

    useInterval(
        checkShouldStartPolling,
        authWindow && !authWindow.closed ? 1000 : null,
    )

    const handleConnect = useCallback(() => {
        try {
            if (!swap)
                return
            if (!carouselFinished && !alreadyFamiliar) {
                carouselRef?.current?.next()
                return;
            }
            const access_token = TokenService.getAuthData()?.access_token
            if (!access_token) {
                //TODO handle not authenticated
                return
            }
            const { sub } = parseJwt(access_token) || {}
            const encoded = btoa(JSON.stringify({ SwapId: swap?.id, UserId: Number(sub), RedirectUrl: `${window.location.origin}/salon` }))
            const authWindow = OpenLink({ link: authorize_url + encoded, query: router.query, swapId: swap.id })
            setAuthWindow(authWindow)
        }
        catch (e) {
            toast.error(e.message)
        }
    }, [carouselFinished, alreadyFamiliar, swap?.id, authorize_url, router.query])

    const handlePrev = useCallback(() => {
        carouselRef?.current?.prev()
        return;
    }, [])

    const exchange_name = exchange?.display_name

    const onCarouselLast = (value) => {
        setCarouselFinished(value)
    }

    const handleToggleChange = (e) => {
        if (e.target.checked) {
            carouselRef?.current?.goToLast();
        } else {
            carouselRef?.current?.goToFirst();
        }
        toggleAlreadyFamiliar();
    }

    return (
        <>
            <Widget.Content>
                {
                    !hideHeader ?
                        <h3 className='md:mb-4 pt-2 text-lg sm:text-xl text-left font-roboto text-primary-text font-semibold'>
                            Please connect your {exchange_name} account
                        </h3>
                        : <></>
                }
                {
                    <div className="w-full flex flex-col self-center h-[100%]">
                        {swap && <Carousel onLast={onCarouselLast} onFirst={setFirstScreen} ref={carouselRef} starAtLast={alreadyFamiliar}>
                            <CarouselItem width={100} >
                                <FirstScreen exchange_name={exchange_name} />
                            </CarouselItem>
                            <CarouselItem width={100}>
                                <SecondScreen />
                            </CarouselItem>
                            <CarouselItem width={100}>
                                <ThirdScreen minimalAuthorizeAmount={minimalAuthorizeAmount} />
                            </CarouselItem>
                            <CarouselItem width={100}>
                                <FourthScreen minimalAuthorizeAmount={minimalAuthorizeAmount} />
                            </CarouselItem>
                            <CarouselItem width={100}>
                                <LastScreen number={!alreadyFamiliar} minimalAuthorizeAmount={Number(minimalAuthorizeAmount)} />
                            </CarouselItem>
                        </Carousel>}
                    </div>
                }
            </Widget.Content>
            <Widget.Footer sticky={true}>
                <div>
                    {
                        <div className="flex items-center mb-3">
                            <input
                                name="alreadyFamiliar"
                                id='alreadyFamiliar'
                                type="checkbox"
                                className="h-4 w-4 bg-secondary-600 cursor-pointer rounded border-secondary-400 text-priamry"
                                onChange={handleToggleChange}
                                checked={alreadyFamiliar}
                            />
                            <label htmlFor="alreadyFamiliar" className="ml-2 cursor-pointer block text-sm text-primary-text">
                                I&apos;m already familiar with the process.
                            </label>
                        </div>
                    }
                    {
                        <div className='flex items-center'>
                            {(!firstScreen && !alreadyFamiliar) &&
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <IconButton onClick={handlePrev} className='mr-4 py-3 px-3' icon={<ArrowLeft strokeWidth="3" />} />
                                </motion.div>
                            }
                            <SubmitButton isDisabled={false} isSubmitting={false} onClick={handleConnect}>
                                {
                                    carouselFinished ? "Connect" : "Next"
                                }
                            </SubmitButton>
                        </div>
                    }
                    <div className="pt-2 font-normal text-xs text-secondary-text">
                        <p className="block font-lighter text-left">
                            <span>Even after authorization Layerswap can&apos;t initiate a withdrawal without your explicit confirmation.&nbsp;</span>
                            <a target='_blank' href='https://docs.layerswap.io/user-docs/connect-a-coinbase-account' className='text-primary-text underline hover:no-underline decoration-white cursor-pointer'>Learn more</a></p>
                    </div>
                </div>
            </Widget.Footer>
        </ >
    )
}

export default Authorize;