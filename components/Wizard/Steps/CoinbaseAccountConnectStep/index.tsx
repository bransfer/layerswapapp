import { FC, useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { useFormWizardaUpdate } from '../../../../context/formWizardProvider';
import { useQueryState } from '../../../../context/query';
import { useSettingsState } from '../../../../context/settings';
import { useSwapDataState } from '../../../../context/swap';
import { GetSourceDestinationData } from '../../../../helpers/swapHelper';
import { useInterval } from '../../../../hooks/useInterval';
import { usePersistedState } from '../../../../hooks/usePersistedState';
import { CalculateMinimalAuthorizeAmount } from '../../../../lib/fees';
import { parseJwt } from '../../../../lib/jwtParser';
import LayerSwapApiClient, { UserExchangesData } from '../../../../lib/layerSwapApiClient';
import { OpenLink } from '../../../../lib/openLink';
import TokenService from '../../../../lib/TokenService';
import { ApiResponse } from '../../../../Models/ApiResponse';
import { SwapCreateStep, SwapWithdrawalStep } from '../../../../Models/Wizard';
import SubmitButton from '../../../buttons/submitButton';
import Carousel, { CarouselItem, CarouselRef } from '../../../Carousel';
import Widget from '../../Widget';
import { FirstScreen, FourthScreen, LastScreen, SecondScreen, ThirdScreen } from './ConnectScreens';

type Props = {
    onAuthorized?: () => void;
    inSlideOver?: boolean
}

const AccountConnectStep: FC<Props> = ({ onAuthorized, inSlideOver }) => {
    const { swap } = useSwapDataState()
    const { networks, exchanges, currencies, discovery: { resource_storage_url } } = useSettingsState()
    const { goToStep } = useFormWizardaUpdate()

    const localStorageItemKey = "alreadyFamiliarWithCoinbaseConnect";
    let [alreadyFamiliar, setAlreadyFamiliar] = usePersistedState<boolean>(false, localStorageItemKey)

    const [carouselFinished, setCarouselFinished] = useState(alreadyFamiliar)
    const [authWindow, setAuthWindow] = useState<Window>()
    const [authorizedAmount, setAuthorizedAmount] = useState<number>()

    const carouselRef = useRef<CarouselRef | null>(null)
    const query = useQueryState()
    const { network, exchange, currency } = GetSourceDestinationData({ swap, currencies, exchanges, networks, resource_storage_url })
    const { oauth_authorize_url } = exchange || {}

    const minimalAuthorizeAmount = CalculateMinimalAuthorizeAmount(currency?.usd_price, Number(swap?.requested_amount))
    const layerswapApiClient = new LayerSwapApiClient()
    const exchange_accounts_endpoint = `/exchange_accounts`
    const { data: exchange_accounts } = useSWR<ApiResponse<UserExchangesData[]>>(authorizedAmount ? exchange_accounts_endpoint : null, layerswapApiClient.fetcher)

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
            setAuthorizedAmount(Number(authorizedAmount))
            authWindow?.close()
        }
    }, [authWindow])

    useInterval(
        checkShouldStartPolling,
        authWindow && !authWindow.closed ? 1000 : null,
    )

    useEffect(() => {
        if (exchange_accounts && authorizedAmount) {
            const exchangeIsEnabled = exchange_accounts?.data?.some(e => e.exchange === exchange?.internal_name && e.type === 'authorize')
            if (exchangeIsEnabled) {
                if (Number(authorizedAmount) < minimalAuthorizeAmount)
                    toast.error("You did not authorize enough")
                else {
                    onAuthorized()
                }
            }
        }
    }, [exchange_accounts, authorizedAmount, minimalAuthorizeAmount])

    const handleConnect = useCallback(() => {
        try {
            if (!carouselFinished && !alreadyFamiliar) {
                carouselRef?.current?.next()
                return;
            }
            const access_token = TokenService.getAuthData()?.access_token
            if (!access_token)
                goToStep(SwapCreateStep.Email)
            const { sub } = parseJwt(access_token) || {}
            const encoded = btoa(JSON.stringify({ Type: 1, UserId: sub, RedirectUrl: `${window.location.origin}/salon` }))
            const authWindow = OpenLink({ link: oauth_authorize_url + encoded })
            setAuthWindow(authWindow)
        }
        catch (e) {
            toast.error(e.message)
        }
    }, [oauth_authorize_url, carouselRef, carouselFinished, query])

    const exchange_name = exchange?.display_name

    const onCarouselLast = (value) => {
        setCarouselFinished(value)
    }

    const handleToggleChange = (value: boolean) => {
        setAlreadyFamiliar(value)
        onCarouselLast(value)
    }

    return (
        <div className='flex flex-col justify-between h-full'>
            {!inSlideOver && <h3 className='md:mb-4 pt-2 text-lg sm:text-xl text-left font-roboto text-white font-semibold'>
                Please connect your {exchange_name} account
            </h3>}
            {
                alreadyFamiliar ?
                    <div className={`w-full rounded-xl inline-flex items-center justify-center flex-col pb-0 bg-gradient-to-b from-darkblue to-darkblue-700 h-100%`} style={{ width: '100%' }}>
                        <LastScreen minimalAuthorizeAmount={minimalAuthorizeAmount} />
                    </div>
                    :
                    <div className="w-full space-y-3">
                        {swap && <Carousel onLast={onCarouselLast} ref={carouselRef}>
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
                                <LastScreen minimalAuthorizeAmount={minimalAuthorizeAmount} />
                            </CarouselItem>
                        </Carousel>}
                    </div>
            }
            <div>
                <div className="flex font-normal text-sm text-primary-text">
                    <label className="block font-lighter text-left mb-2"> Even after authorization Layerswap can't initiate a withdrawal without your explicit confirmation.</label>
                </div>
                {
                    alreadyFamiliar && carouselFinished ?
                        <button onClick={() => handleToggleChange(false)} className="p-1.5 text-white bg-darkblue-400 hover:bg-darkblue-300 rounded-md border border-darkblue-400 hover:border-darkblue-100 w-full mb-3">
                            Show me full guide
                        </button>
                        :
                        <div className="flex items-center mb-3">
                            <input
                                name="alreadyFamiliar"
                                id='alreadyFamiliar'
                                type="checkbox"
                                className="h-4 w-4 bg-darkblue-600 rounded border-darkblue-300 text-priamry focus:ring-darkblue-600"
                                onChange={() => handleToggleChange(true)}
                                checked={alreadyFamiliar}
                            />
                            <label htmlFor="alreadyFamiliar" className="ml-2 block text-sm text-white">
                                I'm already familiar with the process.
                            </label>
                        </div>
                }
                <SubmitButton isDisabled={false} isSubmitting={false} onClick={handleConnect}>
                    {
                        carouselFinished ? "Connect" : "Next"
                    }
                </SubmitButton>
            </div>
        </div>
    )
}

export default AccountConnectStep;