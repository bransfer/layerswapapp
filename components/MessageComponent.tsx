type iconStyle = 'red' | 'green' | 'yellow'

class MessageComponentProps {
    children: JSX.Element | JSX.Element[];
    icon: iconStyle
}

function constructIcons(icon: iconStyle) {

    let iconStyle: JSX.Element

    switch (icon) {
        case 'red':
            iconStyle = <svg xmlns="http://www.w3.org/2000/svg" width="116" height="116" viewBox="0 0 116 116" fill="none">
                <circle cx="58" cy="58" r="58" fill="#E43636" fillOpacity="0.1" />
                <circle cx="58" cy="58" r="45" fill="#E43636" fillOpacity="0.5" />
                <circle cx="58" cy="58" r="30" fill="#E43636" />
                <path d="M48 69L68 48" stroke="white" strokeWidth="3.15789" strokeLinecap="round" />
                <path d="M48 48L68 69" stroke="white" strokeWidth="3.15789" strokeLinecap="round" />
            </svg>;
            break;
        case 'green':
            iconStyle = <svg xmlns="http://www.w3.org/2000/svg" width="116" height="116" viewBox="0 0 116 116" fill="none">
                <circle cx="58" cy="58" r="58" fill="#55B585" fillOpacity="0.1" />
                <circle cx="58" cy="58" r="45" fill="#55B585" fillOpacity="0.3" />
                <circle cx="58" cy="58" r="30" fill="#55B585" />
                <path d="M44.5781 57.245L53.7516 66.6843L70.6308 49.3159" stroke="white" strokeWidth="3.15789" strokeLinecap="round" />
            </svg>;
            break;
        case 'yellow':
            iconStyle = <svg xmlns="http://www.w3.org/2000/svg" width="116" height="116" viewBox="0 0 116 116" fill="none">
                <g clipPath="url(#clip0_1021_821)">
                    <path d="M58 116C90.0325 116 116 90.0325 116 58C116 25.9675 90.0325 0 58 0C25.9675 0 0 25.9675 0 58C0 90.0325 25.9675 116 58 116Z" fill="#E3D557" fillOpacity="0.1" />
                    <path d="M58 103C82.8528 103 103 82.8528 103 58C103 33.1472 82.8528 13 58 13C33.1472 13 13 33.1472 13 58C13 82.8528 33.1472 103 58 103Z" fill="#E3D557" fillOpacity="0.3" />
                    <path d="M88 58C88 74.5685 74.5685 88 58 88C41.4315 88 28 74.5685 28 58C28 41.4315 41.4315 28 58 28C74.5685 28 88 41.4315 88 58Z" fill="#E3D557" />
                    <path d="M59.7336 74.8263C60.8476 74.6778 61.7278 75.7735 61.3503 76.8387C61.1529 77.3787 60.6946 77.7578 60.1259 77.8336C58.8171 78.0029 57.4951 78.0432 56.1785 77.9539C51.3214 77.6249 46.9514 75.5077 43.714 72.2511C40.1838 68.6999 38 63.7935 38 58.3752C38 52.9561 40.1838 48.0504 43.714 44.4992C47.2442 40.9479 52.1208 38.7511 57.5078 38.7511C59.3754 38.7511 61.1957 39.0215 62.9305 39.5256C64.3537 39.9387 65.7251 40.5148 67.0177 41.2426L66.6331 40.2297C66.3123 39.381 66.7357 38.4314 67.5786 38.1079C68.4223 37.7851 69.3663 38.211 69.6879 39.0598L71.3131 43.3378C71.3744 43.5006 71.4101 43.672 71.4188 43.8458C71.5462 44.643 71.0715 45.4331 70.2822 45.6738L65.9293 47.0134C65.0677 47.2759 64.158 46.7867 63.8969 45.9208C63.6359 45.0549 64.1222 44.1389 64.983 43.8763L65.3412 43.7661C64.3095 43.2044 63.2208 42.7558 62.0938 42.4281C60.6511 42.0093 59.1128 41.7842 57.5078 41.7842C52.9536 41.7842 48.8299 43.6411 45.8458 46.6437C42.861 49.6455 41.0151 53.7931 41.0151 58.3752C41.0151 62.9565 42.861 67.104 45.8458 70.1066C48.5502 72.8271 52.1899 74.6074 56.2383 74.9169C57.3959 75.0052 58.5869 74.9763 59.7336 74.8263ZM54.5214 50.3934C54.5214 49.5564 55.1965 48.8773 56.0293 48.8773C56.8614 48.8773 57.5365 49.5564 57.5365 50.3934V59.6248L63.8177 62.4024C64.579 62.7392 64.924 63.6333 64.5891 64.3992C64.2543 65.1643 63.3655 65.512 62.6042 65.1752L55.4987 62.0335C54.9277 61.817 54.5214 61.2629 54.5214 60.6134V50.3934ZM64.9861 73.2054C63.7726 73.8298 63.9342 75.6203 65.2417 76.0134C65.6201 76.1212 65.9969 76.0884 66.3496 75.911C67.3223 75.4194 68.2561 74.8403 69.1316 74.1901C69.5589 73.8697 69.7811 73.3648 69.7353 72.831C69.6187 71.6517 68.284 71.0538 67.3355 71.7541C66.5948 72.3042 65.8089 72.7898 64.9861 73.2054ZM71.136 67.7699C70.4492 68.7999 71.2207 70.1848 72.4544 70.1301C72.9369 70.1043 73.3688 69.8667 73.6392 69.4603C74.2498 68.549 74.7773 67.5948 75.2295 66.5945C75.6653 65.6066 74.9863 64.5 73.9119 64.4539C73.2958 64.4335 72.738 64.7798 72.4816 65.3448C72.0986 66.1928 71.6534 66.9977 71.136 67.7699ZM73.9064 59.9921C73.852 60.5877 74.1395 61.1457 74.6515 61.4481C75.6117 61.9967 76.7957 61.3825 76.9083 60.2782C77.0117 59.1825 77.028 58.0977 76.9534 56.9997C76.9161 56.4721 76.6131 56.0071 76.147 55.761C75.1013 55.2155 73.8621 56.0314 73.9453 57.2123C74.009 58.1438 73.9942 59.0621 73.9064 59.9921ZM72.6572 51.8346C72.9951 52.6184 73.9018 52.9709 74.6732 52.613C75.4167 52.2691 75.75 51.393 75.4276 50.6365C75.0003 49.6291 74.486 48.6608 73.8979 47.7386C73.159 46.596 71.4204 46.9289 71.1516 48.2661C71.0778 48.6592 71.1477 49.043 71.3629 49.3814C71.8616 50.1645 72.2951 50.9788 72.6572 51.8346Z" fill="white" />
                </g>
                <defs>
                    <clipPath id="clip0_1021_821">
                        <rect width="116" height="116" fill="white" />
                    </clipPath>
                </defs>
            </svg>;
            break
    }
    return iconStyle
}

const MessageComponent = ({ children }) => {
    return <div className="w-full flex flex-col h-full justify-between px-6 md:px-8 py-6 min-h-full">
        {children}
    </div>
}

const Content = ({ children, icon }: MessageComponentProps) => {
    return <div className='space-y-8'>
        <div className='flex place-content-center'>{constructIcons(icon)}</div>
        {children}
    </div>
}

const Header = ({ children }) => {
    return <div className='md:text-3xl text-lg font-bold text-white leading-6 text-center'>
        {children}
    </div>
}

const Description = ({ children }) => {
    return <div className="text-base font-medium space-y-6 text-primary-text text-center">
        {children}
    </div>
}

const Buttons = ({ children }) => {
    return <div className="space-y-3 mt-6">
        {children}
    </div>
}

MessageComponent.Content = Content
MessageComponent.Header = Header
MessageComponent.Description = Description
MessageComponent.Buttons = Buttons

export default MessageComponent


