import { FC } from "react";
import CopyButton from "../buttons/copyButton";
import LayerSwapLogo from "../icons/layerSwapLogo";
import { Paperclip } from 'lucide-react'
import { renderToString } from 'react-dom/server'
import LayerSwapLogoSmall from "../icons/layerSwapLogoSmall";
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { useGoHome } from "../../hooks/useGoHome";

interface Props {
    className?: string;
    children?: JSX.Element | JSX.Element[] | string;
}

const GoHomeButton: FC<Props> = (({ className, children }) => {
    const goHome = useGoHome()

    return (
        <div onClick={goHome}>
            {
                children ??
                <>
                    <ContextMenuPrimitive.Root>
                        <ContextMenuPrimitive.Trigger>
                            <LayerSwapLogo className={className ?? "h-8 w-auto text-primary-logoColor fill-primary-text headerLogo"} />
                        </ContextMenuPrimitive.Trigger>
                        <ContextMenuPrimitive.Content className="dialog-overlay absolute z-40 border h-fit text-secondary-text border-secondary-100 mt-2 w-fit rounded-md shadow-lg bg-secondary-900 ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <ContextMenuPrimitive.ContextMenuItem className="dialog-content px-4 py-2 text-sm text-left w-full rounded-t hover:bg-secondary-400 whitespace-nowrap">
                                <CopyButton toCopy={renderToString(<LayerSwapLogo />)}>Copy logo as SVG</CopyButton>
                            </ContextMenuPrimitive.ContextMenuItem >
                            <ContextMenuPrimitive.ContextMenuItem className="dialog-content px-4 py-2 text-sm text-left w-full hover:bg-secondary-400 whitespace-nowrap">
                                <CopyButton toCopy={renderToString(<LayerSwapLogoSmall />)}>Copy symbol as SVG</CopyButton>
                            </ContextMenuPrimitive.ContextMenuItem >
                            <hr className="horizontal-gradient" />
                            <ContextMenuPrimitive.ContextMenuItem className="dialog-content">
                                <a href="https://layerswap.notion.site/layerswap/Layerswap-brand-guide-0822bc4f1a2d4af7bc2f1acbb05119e2" target='_blank' className='flex space-x-1 items-center px-4 py-2 rounded-b text-sm text-left w-full hover:bg-secondary-400 whitespace-nowrap'>
                                    <Paperclip width={16} />
                                    <p>Brand Guidelines</p>
                                </a>
                            </ContextMenuPrimitive.ContextMenuItem >
                        </ContextMenuPrimitive.Content>
                    </ContextMenuPrimitive.Root>
                </>
            }
        </div>
    )
})

export default GoHomeButton;
