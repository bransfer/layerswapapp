import React from 'react'
import NoCookies from '../components/NoCookies';

export default function Salon() {
    return (
        <div className={`flex flex-col items-center min-h-screen overflow-hidden relative font-robo`}>
            <div className="w-full max-w-lg z-[1]">
                <div className="flex content-center items-center justify-center space-y-5 flex-col container mx-auto sm:px-6 max-w-lg">
                    <div className="flex flex-col w-full text-primary-text">
                        <NoCookies />
                    </div>
                </div>
            </div>
        </div>
    )
}