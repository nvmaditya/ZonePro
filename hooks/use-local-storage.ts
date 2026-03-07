"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>(defaultValue);
    const [isLoaded, setIsLoaded] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                setValue(JSON.parse(stored));
            }
        } catch {
            // Invalid JSON or no access
        }
        setIsLoaded(true);
    }, [key]);

    // Debounced save to localStorage when value changes
    useEffect(() => {
        if (!isLoaded) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch {
                // Storage full or no access
            }
        }, 300);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [key, value, isLoaded]);

    const updateValue = useCallback((updater: T | ((prev: T) => T)) => {
        setValue(updater);
    }, []);

    return { value, setValue: updateValue, isLoaded };
}
