import React, { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { useSwipeable } from "react-swipeable";


interface CarouselItemProps {
    children?: JSX.Element | JSX.Element[];
    width: number;
}

export const CarouselItem: React.FC<CarouselItemProps> = ({ children, width }) => {
    return (
        <div className={`rounded-xl inline-flex items-center justify-center flex-col pb-0 bg-gradient-to-b from-secondary-900 to-secondary-700 h-full relative`} style={{ width: width }}>
            {children}
        </div>
    );
};

interface CarouselProps {
    children?: JSX.Element | JSX.Element[];
    starAtLast: boolean;
    onLast: (value: boolean) => void;
    onFirst: (value: boolean) => void;
}

export type CarouselRef = {
    next: () => void;
    prev: () => void;
    goToLast: () => void;
    goToFirst: () => void;
};

const Carousel = forwardRef<CarouselRef, CarouselProps>(function Carousel({ onFirst, onLast, children, starAtLast }, ref) {
    const [activeIndex, setActiveIndex] = useState(starAtLast ? React.Children.count(children) - 1 : 0);

    const updateIndex = useCallback((newIndex) => {
        onFirst(false)
        onLast(false)
        if (newIndex >= 0 && newIndex <= React.Children.count(children) - 1) {
            setActiveIndex(newIndex);
        }
        if (newIndex >= React.Children.count(children) - 1)
            onLast(true)
        if (newIndex == 0)
            onFirst(true)
    }, [children, onFirst, onLast]);

    useImperativeHandle(ref, () => ({
        next: () => {
            updateIndex(activeIndex + 1)
        },
        prev: () => {
            updateIndex(activeIndex - 1);
        },
        goToLast: () => {
            updateIndex(React.Children.count(children) - 1);
        },
        goToFirst: () => {
            updateIndex(0);
        }
    }), [activeIndex, children, updateIndex]);

    const handlers = useSwipeable({
        onSwipedLeft: () => updateIndex(activeIndex + 1),
        onSwipedRight: () => updateIndex(activeIndex - 1),
    });

    return (
        <div
            {...handlers}
            className="overflow-hidden h-full"
        >
            <div
                className="whitespace-nowrap transition-transform duration-500 inner h-full"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
                {children && React.Children.map(children, (child, index) => {
                    return React.cloneElement(child, { width: "100%" });
                })}
            </div>
        </div>
    );
});

export default Carousel;
