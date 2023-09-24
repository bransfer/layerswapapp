import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react'
import { useEventCallback } from './useEventCallback'
import { useEventListener } from './useEventListener'
import { storageType } from '../helpers/storageAvailable'

type SetValue<T> = Dispatch<SetStateAction<T>>


declare global {
    interface WindowEventMap {
        'localStorage': CustomEvent,
        'sessionStorage': CustomEvent
    }
}
export function useBrowserStorage<T>(
    key: string,
    initialValue: T,
    storageType: storageType = 'localStorage'
): [T, SetValue<T>] {
    // Get from  storage then
    // parse stored json or return initialValue
    const readValue = useCallback((): T => {
        // Prevent build error "window is undefined" but keep keep working
        if (typeof window === 'undefined') {
            return initialValue
        }

        try {
            const item = window[storageType].getItem(key)
            return item ? (parseJSON(item) as T) : initialValue
        } catch (error) {
            console.warn(`Error reading ${storageType} key “${key}”:`, error)
            return initialValue
        }
    }, [initialValue, key])

    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(readValue)

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to sessionStorage/localStorage.
    const setValue: SetValue<T> = useEventCallback(value => {
        // Prevent build error "window is undefined" but keeps working
        if (typeof window == 'undefined') {
            console.warn(
                `Tried setting ${storageType} key “${key}” even though environment is not a client`,
            )
        }

        try {
            // Allow value to be a function so we have the same API as useState
            const newValue = value instanceof Function ? value(storedValue) : value

            // Save to storage
            window[storageType].setItem(key, JSON.stringify(newValue))

            // Save state
            setStoredValue(newValue)

            // We dispatch a custom event so every useBrowserStorage hook are notified
            window.dispatchEvent(new Event(storageType))
        } catch (error) {
            console.warn(`Error setting ${storageType} key “${key}”:`, error)
        }
    })

    useEffect(() => {
        setStoredValue(readValue())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleStorageChange = useCallback(
        (event: StorageEvent | CustomEvent) => {
            if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
                return
            }
            setStoredValue(readValue())
        },
        [key, readValue],
    )

    // this only works for other documents, not the current one
    useEventListener('storage', handleStorageChange)

    // this is a custom event, triggered writing to storage
    useEventListener(storageType, handleStorageChange)

    return [storedValue, setValue]
}

// A wrapper for "JSON.parse()"" to support "undefined" value
function parseJSON<T>(value: string | null): T | undefined {
    try {
        return value === 'undefined' ? undefined : JSON.parse(value ?? '')
    } catch {
        console.log('parsing error on', { value })
        return undefined
    }
}