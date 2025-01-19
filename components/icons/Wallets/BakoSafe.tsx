import { SVGProps } from "react"

const BakoSafe = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none" {...props}>
    <rect width="50" height="50" fill="url(#paint0_linear_97_19)" />
    <mask id="mask0_97_19" style={{ "maskType": "luminance" }} maskUnits="userSpaceOnUse" x="13" y="5" width="24" height="40">
        <path d="M37 5H13V45H37V5Z" fill="white" />
    </mask>
    <g mask="url(#mask0_97_19)">
        <path d="M13 25.9167L37 37.8671L25.0024 18.9893L13 25.9167Z" fill="#F5F5F5" />
        <path d="M33.8864 22.2182L24.9976 17.0865V5.13574L13 12.0628V25.916L24.9976 18.9889V30.9396L13 37.8668L24.9976 44.7938L36.9952 37.8668V27.6033C36.9952 25.3816 35.8098 23.3291 33.8864 22.2182Z" fill="#1E1F22" />
    </g>
    <defs>
        <linearGradient id="paint0_linear_97_19" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFC010" />
            <stop offset="0.48" stopColor="#EBA312" />
            <stop offset="0.71" stopColor="#D38015" />
            <stop offset="0.99" stopColor="#B24F18" />
        </linearGradient>
    </defs>
</svg>


export default BakoSafe;