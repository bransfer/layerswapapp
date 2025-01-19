import { SVGProps } from "react"

const SVGWithImg = (props: SVGProps<SVGSVGElement> & { image_url: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" {...props} >
            <image href={props.image_url} height={32} width={32} />
        </svg>
    )
}

export default SVGWithImg