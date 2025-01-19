import { ReactNode } from "react"

const FeeDetails = ({ children }: { children: ReactNode }) => {
    return <div className="flex flex-col divide-y-2 divide-secondary-900 rounded-componentRoundness bg-secondary-700 overflow-hidden text-sm">
        {children}
    </div>
}

const Item = (function Item({ children, icon }: FeeDetailsItemProps) {

    return (
        <div
            className={`gap-4 flex relative items-center outline-none w-full text-primary-text px-4 py-3`}
        >
            {
                icon &&
                <div>
                    {icon}
                </div>
            }
            {children}
        </div>
    )
})


type FeeDetailsItemProps = {
    children: ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    icon?: JSX.Element;
};

FeeDetails.Item = Item

export default FeeDetails