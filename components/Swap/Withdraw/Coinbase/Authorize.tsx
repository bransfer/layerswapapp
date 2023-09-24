import { FC, useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useQueryState } from '../../../../context/query';
import { useSettingsState } from '../../../../context/settings';
import { useSwapDataState, useSwapDataUpdate } from '../../../../context/swap';
import { useInterval } from '../../../../hooks/useInterval';
import { CalculateMinimalAuthorizeAmount } from '../../../../lib/fees';
import { parseJwt } from '../../../../lib/jwtParser';
import LayerSwapApiClient, { WithdrawType } from '../../../../lib/layerSwapApiClient';
import { OpenLink } from '../../../../lib/openLink';
import TokenService from '../../../../lib/TokenService';
import SubmitButton from '../../../buttons/submitButton';
import Carousel, { CarouselItem, CarouselRef } from '../../../Carousel';
import Widget from '../../../Wizard/Widget';
import { FirstScreen, FourthScreen, LastScreen, SecondScreen, ThirdScreen } from './ConnectGuideScreens';
import KnownInternalNames from '../../../../lib/knownIds';
import { Layer } from '../../../../Models/Layer';
import { ArrowLeft } from 'lucide-react';
import IconButton from '../../../buttons/iconButton';
import { motion } from 'framer-motion';
import { useBrowserStorage } from '../../../../hooks/useBrowserStorage';
import { Configs } from '../../../../lib/LocalConfigs';

type Props = {
    onAuthorized: () => void,
    onDoNotConnect: () => void,
    stickyFooter: boolean,
    hideHeader?: boolean,
}

const Authorize: FC<Props> = ({ onAuthorized, stickyFooter, onDoNotConnect, hideHeader }) => {
    const { swap } = useSwapDataState()
    const { setWithdrawType } = useSwapDataUpdate()
    const { layers, currencies, discovery } = useSettingsState()
    let [localConfigs, setLocalConfigs] = useBrowserStorage<Configs>('configs', {})

    const [carouselFinished, setCarouselFinished] = useState(localConfigs.alreadyFamiliarWithCoinbaseConnect)
    const [authWindow, setAuthWindow] = useState<Window>()
    const [authorizedAmount, setAuthorizedAmount] = useState<number>()
    const [firstScreen, setFirstScreen] = useState<boolean>()

    const carouselRef = useRef<CarouselRef | null>(null)
    const query = useQueryState()
    const exchange_internal_name = swap?.source_exchange
    const asset_name = swap?.source_network_asset

    const exchange = layers.find(e => e.isExchange && e.internal_name?.toLowerCase() === exchange_internal_name?.toLowerCase()) as Layer & { isExchange: true }
    const currency = currencies?.find(c => asset_name?.toLocaleUpperCase() === c.asset?.toLocaleUpperCase())

    const oauthProviders = discovery?.o_auth_providers
    const coinbaseOauthProvider = oauthProviders?.find(p => p.provider === KnownInternalNames.Exchanges.Coinbase)
    const { oauth_authorize_url } = coinbaseOauthProvider || {}

    const minimalAuthorizeAmount = CalculateMinimalAuthorizeAmount(currency?.usd_price, Number(swap?.requested_amount))

    const handleTransferMannually = useCallback(() => {
        setWithdrawType(WithdrawType.Manually)
        onDoNotConnect()
    }, [onDoNotConnect, setWithdrawType])

    const checkShouldStartPolling = useCallback(() => {
        let authWindowHref = ""
        try {
            authWindowHref = authWindow?.location?.href
        }
        catch (e) {
            //throws error when accessing href TODO research safe way
        }
        if (authWindowHref && authWindowHref?.indexOf(window.location.origin) !== -1) {
            const authWindowURL = new URL(authWindowHref)
            const authorizedAmount = authWindowURL.searchParams.get("send_limit_amount")
            alert(authorizedAmount);
            setAuthorizedAmount(Number(authorizedAmount))
            authWindow?.close()
        }
    }, [authWindow])

    useInterval(
        checkShouldStartPolling,
        authWindow && !authWindow.closed ? 1000 : null,
    )

    const handleDisconnectCoinbase = useCallback(async () => {
        const apiClient = new LayerSwapApiClient()
        await apiClient.DisconnectExchangeAsync(swap.id, "coinbase")
    }, [])

    useEffect(() => {
        if (authorizedAmount) {
            if (Number(authorizedAmount) < minimalAuthorizeAmount) {
                toast.dismiss();
                toast.error("You have not authorized enough to be able to complete the transfer. Please authorize again.");
                handleDisconnectCoinbase();
            }
            else {
                onAuthorized()
            }
        }
    }, [authorizedAmount, minimalAuthorizeAmount, onAuthorized])

    useEffect(() => { 
        console.log(query?.send_limit_amount);
        query?.send_limit_amount && Number(query?.send_limit_amount) > 0 && setAuthorizedAmount(Number(query?.send_limit_amount));
     }, [query?.send_limit_amount])

    const handleConnect = useCallback(() => {
        try {
            if (!carouselFinished && !localConfigs.alreadyFamiliarWithCoinbaseConnect) {
                carouselRef?.current?.next()
                return;
            }
            const access_token = TokenService.getAuthData()?.access_token
            const { sub } = parseJwt(access_token) || {}
            const encoded = btoa(JSON.stringify({ SwapId: swap?.id, UserId: sub, RedirectUrl: `${window.location.origin}/salon` }))
            const authWindow = OpenLink({ link: oauth_authorize_url + encoded, query: query, swapId: swap.id })
            setAuthWindow(authWindow)
        }
        catch (e) {
            toast.error(e.message)
        }
    }, [carouselFinished, localConfigs.alreadyFamiliarWithCoinbaseConnect, swap?.id, oauth_authorize_url, query])

    const handlePrev = useCallback(() => {
        carouselRef?.current?.prev()
        return;
    }, [])

    const exchange_name = exchange?.display_name

    const onCarouselLast = (value) => {
        setCarouselFinished(value)
    }

    const handleToggleChange = (value: boolean) => {
        setLocalConfigs({ ...localConfigs, alreadyFamiliarWithCoinbaseConnect: value })
        onCarouselLast(value)
    }

    return (
        <Widget>
            <Widget.Content>
                {
                    !hideHeader &&
                    <h3 className='md:mb-4 pt-2 text-lg sm:text-xl text-left font-roboto text-white font-semibold'>
                        Please connect your {exchange_name} account
                    </h3>
                }
                {
                    localConfigs.alreadyFamiliarWithCoinbaseConnect ?
                        <div className={`w-full rounded-xl inline-flex items-center justify-center flex-col pb-0 bg-gradient-to-b from-secondary-900 to-secondary-700 h-full relative`} style={{ width: '100%' }}>
                            <LastScreen minimalAuthorizeAmount={minimalAuthorizeAmount} />
                        </div>
                        :
                        <div className="w-full flex flex-col self-center h-[100%]">
                            {swap && <Carousel onLast={onCarouselLast} onFirst={setFirstScreen} ref={carouselRef}>
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
                                    <LastScreen number minimalAuthorizeAmount={minimalAuthorizeAmount} />
                                </CarouselItem>
                            </Carousel>}
                        </div>
                }
            </Widget.Content>
            <Widget.Footer sticky={stickyFooter}>
                <div>
                    {
                        <div className="flex items-center mb-3">
                            <input
                                name="alreadyFamiliar"
                                id='alreadyFamiliar'
                                type="checkbox"
                                className="h-4 w-4 bg-secondary-600 cursor-pointer rounded border-secondary-400 text-priamry"
                                onChange={() => handleToggleChange(!localConfigs.alreadyFamiliarWithCoinbaseConnect)}
                                checked={localConfigs.alreadyFamiliarWithCoinbaseConnect}
                            />
                            <label htmlFor="alreadyFamiliar" className="ml-2 cursor-pointer block text-sm text-primary-text">
                                I&apos;m already familiar with the process.
                            </label>
                        </div>
                    }
                    {
                        <div className='flex items-center'>
                            {!localConfigs.alreadyFamiliarWithCoinbaseConnect && !firstScreen &&
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <IconButton onClick={handlePrev} className='mr-4 py-3 px-3' icon={
                                        <ArrowLeft strokeWidth="3" />
                                    }>
                                    </IconButton>
                                </motion.div>
                            }
                            <SubmitButton isDisabled={false} isSubmitting={false} onClick={handleConnect}>
                                {
                                    carouselFinished ? "Connect" : "Next"
                                }
                            </SubmitButton>
                        </div>
                    }
                    <div className="pt-2 font-normal text-xs text-primary-text">
                        <p className="block font-lighter text-left">
                            <span>Even after authorization Layerswap can&apos;t initiate a withdrawal without your explicit confirmation.&nbsp;</span>
                            <a target='_blank' href='https://docs.layerswap.io/user-docs/connect-a-coinbase-account' className='text-white underline hover:no-underline decoration-white cursor-pointer'>Learn more</a></p>
                    </div>
                </div>
            </Widget.Footer>
        </Widget >
    )
}

export default Authorize;