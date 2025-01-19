import React from 'react'
import GoHomeButton from './utils/GoHome';

export default function Navbar() {

    return (
        <div className='mt-12 mb-8 mx-auto px-4 overflow-hidden hidden md:block'>
            <div className="flex justify-center">
                <GoHomeButton className='h-11 w-auto text-primary-logoColor fill-primary-text cursor-pointer headerLogo' />
            </div>
        </div>
    )
}