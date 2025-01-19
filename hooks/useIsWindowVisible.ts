import { useEffect, useState } from 'react';

export default function useIsWindowVisible(): boolean {
    const [isVisible, setIsVisible] = useState(() => {
        return typeof document !== 'undefined' && document.visibilityState !== 'hidden';
    });

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(document.visibilityState !== 'hidden');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return isVisible;
}
