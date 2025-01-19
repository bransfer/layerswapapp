import { Info } from "lucide-react";
import { RouteNetwork, Token } from "../../../../Models/Network";
import Image from "next/image";
import { Exchange } from "../../../../Models/Exchange";


const ExchangeNote = ({ destinationAsset, destinationExchange, destination }: { destinationAsset: Token | undefined, destinationExchange: Exchange, destination: RouteNetwork | undefined }) => {

    if (!destinationAsset || !destinationExchange || !destination) return

    return (
        <div className='text-left p-4 bg-secondary-800 text-primary-text rounded-lg border border-secondary-500 mt-3 w-full'>
            <div className="flex items-center">
                <Info className='h-5 w-5 text-primary-600 mr-3' />
                <label className="block text-sm md:text-base font-medium leading-6">How to find your {destinationExchange.display_name} deposit address</label>
            </div>
            <ul className="list-disc font-light space-y-1 text-xs md:text-sm mt-2 ml-8 text-primary-text">
                <li>Go to the Deposits page</li>
                <li>
                    <span>Select</span>
                    <span className="inline-block mx-1">
                        <span className='flex gap-1 items-baseline text-sm '>
                            <Image src={destinationAsset.logo}
                                alt="Project Logo"
                                height="15"
                                width="15"
                                className='rounded-sm'
                            />
                            <span className="text-primary-text">{destinationAsset.symbol}</span>
                        </span>
                    </span>
                    <span>as asset</span>
                </li>
                <li>
                    <span>Select</span>
                    <span className="inline-block mx-1">
                        <span className='flex gap-1 items-baseline text-sm '>
                            <Image src={destination?.logo || ''}
                                alt="Project Logo"
                                height="15"
                                width="15"
                                className='rounded-sm'
                            />
                            <span className="text-primary-text">{destination?.display_name}</span>
                        </span>
                    </span>
                    <span>as network</span>
                </li>
            </ul>
        </div>
    )
}

export default ExchangeNote