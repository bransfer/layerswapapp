import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { classNames } from "../utils/classNames"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = ({
    children,
    ...props
}: DialogPrimitive.DialogPortalProps) => (
    <DialogPrimitive.Portal {...props}>
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {children}
        </div>
    </DialogPrimitive.Portal>
)
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={classNames(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
            className
        )}
        {...props}
    />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={classNames(
                "fixed z-50 grid w-full gap-4 rounded-t-lg bg-secondary-800 p-4 shadow-lg animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:max-w-sm sm:rounded-lg sm:zoom-in-90 data-[state=open]:sm:slide-in-from-bottom-0",
                className
            )}
            {...props}
        >
            {children}
            <DialogPrimitive.Close className="absolute text-secondary-text right-4 top-3 p-1 justify-self-start hover:brightness-105 hover:scale-110 duartion-100 ring-1 ring-secondary-400 transition bg-secondary-500 hover:text-primary-text focus:outline-none rounded-full items-center">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={classNames(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={classNames(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={classNames(
            "text-lg font-normal leading-none tracking-tight text-primary-text",
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={classNames("text-sm text-secondary-text", className)}
        {...props}
    />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}
