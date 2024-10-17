import { Context, Dispatch, FC, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';

export type SnapElement = {
    id: number;
    height: number | string;
}

type SnapPointsState = {
    snapPoints: SnapElement[];
    snapElemenetsHeight: SnapElement[];
    setSnapElemenetsHeight: Dispatch<SetStateAction<SnapElement[]>>;
}

export const SnapPointsContext = createContext<SnapPointsState | undefined>(undefined);

export const SnapPointsProvider: FC<{ children: ReactNode, snapPointsCount?: number, isMobile: boolean }> = ({ children, snapPointsCount = 1, isMobile }) => {

    const [snapElemenetsHeight, setSnapElemenetsHeight] = useState<SnapElement[]>([]);

    const snapPoints = resolveSnapPoints({
        isMobile,
        snapPointsCount,
        childrenHeights: snapElemenetsHeight.sort((a, b) => a.id - b.id)
    });

    const contextValue: SnapPointsState = {
        snapPoints,
        snapElemenetsHeight,
        setSnapElemenetsHeight
    };

    return (
        <SnapPointsContext.Provider value={contextValue}>
            {children}
        </SnapPointsContext.Provider>
    );
};

const resolveSnapPoints = ({ isMobile, snapPointsCount, childrenHeights }: { snapPointsCount: number, isMobile: boolean, childrenHeights: SnapElement[] }) => {

    let points: SnapElement[] = [];

    function sumBeforeIndex(arr, n) {
        if (n <= 0) return 0; // If n is 0 or negative, the sum is 0
        return arr.slice(0, n).reduce((acc, curr) => acc + curr, 0);
    }

    for (let i = 0; i < snapPointsCount; i++) {

        const result = sumBeforeIndex(childrenHeights.map(h => h.height), i);

        const pointHeight = childrenHeights?.[i]?.height + result + 65;
        const viewportHeight = isMobile ? window.innerHeight : document.getElementById('widget')?.offsetHeight;

        if (!pointHeight || !viewportHeight) return [{ id: i + 1, height: 1 }];

        if ((pointHeight && viewportHeight) && pointHeight > viewportHeight) {
            points.push({ id: i + 1, height: 1 });
            break;
        }
        else if (pointHeight) points.push({ id: i + 1, height: `${pointHeight}px` });
        else points.push({ id: i + 1, height: 1 });

    }

    return points;
}


export function useSnapPoints() {
    const data = useContext(SnapPointsContext as Context<SnapPointsState>);

    if (data === null) {
        throw new Error('useSnapPoints must be used within a SnapPointsProvider');
    }

    return data;
}