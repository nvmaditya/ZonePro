"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUserId } from "@/contexts/user-id-context";

export function useLocalStorage<T>(key: string, defaultValue: T) {
    const { userId } = useUserId();
    const scopedKey = userId ? `${key}::${userId}` : key;

    const [value, setValue] = useState<T>(defaultValue);
    const [isLoaded, setIsLoaded] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const migrationDoneRef = useRef(false);

    // One-time migration: copy unscoped data to scoped key on first login
    useEffect(() => {
        if (!userId || migrationDoneRef.current) return;
        migrationDoneRef.current = true;

        try {
            const scoped = localStorage.getItem(scopedKey);
            if (!scoped) {
                const unscoped = localStorage.getItem(key);
                if (unscoped) {
                    localStorage.setItem(scopedKey, unscoped);
                }
            }
        } catch {
            // No access
        }
    }, [userId, key, scopedKey]);

    // Load from localStorage on mount or when scopedKey changes
    useEffect(() => {
        setIsLoaded(false);
        try {
            const stored = localStorage.getItem(scopedKey);
            if (stored) {
                setValue(JSON.parse(stored));
            } else {
                setValue(defaultValue);
            }
        } catch {
            // Invalid JSON or no access
        }
        setIsLoaded(true);
    }, [scopedKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // Debounced save to localStorage when value changes
    useEffect(() => {
        if (!isLoaded) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(scopedKey, JSON.stringify(value));
            } catch {
                // Storage full or no access
            }
        }, 300);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [scopedKey, value, isLoaded]);

    const updateValue = useCallback((updater: T | ((prev: T) => T)) => {
        setValue(updater);
    }, []);

    return { value, setValue: updateValue, isLoaded };
}
