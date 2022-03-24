import SupportIcon from './icons/supportIcon';
import Link from 'next/link';
import { BookOpenIcon, PlayIcon } from '@heroicons/react/outline';
import CardContainer from './cardContainer';

function IntroCard(props) {
    return (
        <CardContainer {...props} >
            <div className='flex items-center justify-center px-6 md:px-10 py-12'>
                <div className="flex flex-col justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">LayerSwap</h1>
                        <p className="md:max-w-lg text-base text-gray-100 mt-2">
                            Save 10x on fees when moving crypto from Coinbase, Binance or FTX to Arbitrum, zkSync, Loopring and other L2s.
                        </p>
                        <p className="py-4">
                            <span className="bg-indigo-600 text-sm mr-2 rounded-md py-1 px-2">New</span>
                            <span className="md:hidden">
                                1 ETH and 1500 USDC in zkSync!
                            </span>
                            <span className="hidden md:inline">
                                1 ETH and 1500 USDC transfers in zkSync!
                                {/* <a className='underline text-indigo-300' target="_blank" href="https://twitter.com/layerswap/status/1480921959252774918">Join the discussion</a> */}
                            </span>
                        </p>
                    </div>
                    <div className="flex items-center">
                        <div className="mt-2 space-y-2 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
                            <a href="https://www.loom.com/share/c853ca7e2ed04fa986e35928e8da015b" target="_blank" className="text-indigo-300 font-semibold hover:underline hover:cursor-pointer">
                                <div className="flex flex-row items-center">
                                    <PlayIcon className="w-5 h-5 mr-2" />
                                    <span>Watch Intro Video</span>
                                </div>
                            </a>
                            <Link key="userGuide" href="/userguide">
                                <a className="text-indigo-300 font-semibold hover:underline hover:cursor-pointer">
                                    <div className="flex flex-row items-center">
                                        <BookOpenIcon className="w-5 h-5 mr-2" />
                                        <span>Read User Guide</span>
                                    </div>
                                </a>
                            </Link>
                            <a href="https://discord.gg/PeqHAqzxQX" target="_blank" className="text-indigo-300 font-semibold hover:underline hover:cursor-pointer">
                                <div className="flex flex-row items-center">
                                    <SupportIcon className="w-5 h-5" />
                                    <span className='ml-2'>Get Support</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </CardContainer>
    );
}

export default IntroCard;
