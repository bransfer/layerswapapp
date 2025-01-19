import { SVGProps } from "react";

const TonKeeper = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" {...props}>
            <rect width="32" height="32" fill="#0F192F" />
            <path d="M16 14L3 9L16 4L29 9L16 14Z" fill="#45AEF5" />
            <path opacity="0.6" d="M16 13.75L29 9L16 28V13.75Z" fill="#45AEF5" />
            <path opacity="0.8" d="M16 13.75L3 9L16 28V13.75Z" fill="#45AEF5" />
        </svg>
    )
}

export default TonKeeper