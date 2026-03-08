"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import type {
    CourseProgress,
    PomodoroSession,
    MusicPlayer,
    SessionData,
    AppSettings,
} from "@/types";
import {
    STORAGE_KEY,
    OLD_STORAGE_KEY,
    ALL_STORAGE_KEYS,
    DEFAULT_APP_SETTINGS,
} from "@/lib/constants";
import { DEFAULT_POMODORO } from "@/hooks/use-pomodoro";
import { DEFAULT_MUSIC_PLAYER } from "@/hooks/use-music-player";
import { useUserId } from "@/contexts/user-id-context";

function scopeKey(key: string, userId: string | null): string {
    return userId ? `${key}::${userId}` : key;
}

interface PersistenceSetters {
    setCourses: (courses: CourseProgress[]) => void;
    setCurrentCourse: (course: CourseProgress | null) => void;
    setPomodoro: (pomodoro: PomodoroSession) => void;
    setMusicPlayer: (player: MusicPlayer) => void;
    setSettings: (settings: AppSettings) => void;
}

interface PersistenceState {
    courses: CourseProgress[];
    pomodoro: PomodoroSession;
    musicPlayer: MusicPlayer;
    settings: AppSettings;
}

export function useSessionPersistence(
    state: PersistenceState,
    setters: PersistenceSetters,
) {
    const { userId } = useUserId();
    const [isLoaded, setIsLoaded] = useState(false);

    const sessionKey = scopeKey(STORAGE_KEY, userId);

    // Load data from localStorage on mount (with migration from old key)
    useEffect(() => {
        if (typeof window === "undefined") return;

        let savedData = localStorage.getItem(sessionKey);

        // Migrate from old storage key if new key has no data
        if (!savedData) {
            const oldData = localStorage.getItem(OLD_STORAGE_KEY);
            if (oldData) {
                savedData = oldData;
                localStorage.setItem(sessionKey, oldData);
                localStorage.removeItem(OLD_STORAGE_KEY);
            }
        }

        // One-time migration: copy unscoped data to scoped key
        if (!savedData && userId) {
            const unscoped = localStorage.getItem(STORAGE_KEY);
            if (unscoped) {
                savedData = unscoped;
                localStorage.setItem(sessionKey, unscoped);
            }
        }

        if (savedData) {
            try {
                const data: SessionData = JSON.parse(savedData);
                setters.setCourses(
                    (data.courses || []).map((course) => ({
                        ...course,
                        lastWatched: new Date(course.lastWatched),
                        notes: (course.notes || []).map((note) => ({
                            ...note,
                            createdAt: new Date(note.createdAt),
                        })),
                    })),
                );
                setters.setPomodoro(data.pomodoro || DEFAULT_POMODORO);
                setters.setMusicPlayer(data.music || DEFAULT_MUSIC_PLAYER);
                setters.setSettings({
                    ...DEFAULT_APP_SETTINGS,
                    ...data.settings,
                });
            } catch {
                // Corrupted data, start fresh
            }
        }
        setIsLoaded(true);
    }, [sessionKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // Save data to localStorage whenever state changes
    useEffect(() => {
        if (!isLoaded) return;
        const sessionData: SessionData = {
            courses: state.courses,
            pomodoro: state.pomodoro,
            music: state.musicPlayer,
            settings: state.settings,
            timestamp: new Date(),
        };
        localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    }, [
        state.courses,
        state.pomodoro,
        state.musicPlayer,
        state.settings,
        isLoaded,
        sessionKey,
    ]);

    const exportSession = useCallback(() => {
        // Export monolithic session data
        const sessionData: SessionData = {
            courses: state.courses,
            pomodoro: state.pomodoro,
            music: state.musicPlayer,
            settings: state.settings,
            timestamp: new Date(),
        };

        // Also collect per-domain keys (scoped)
        const allData: Record<string, unknown> = { session: sessionData };
        for (const key of ALL_STORAGE_KEYS) {
            const val = localStorage.getItem(scopeKey(key, userId));
            if (val) {
                try {
                    allData[key] = JSON.parse(val);
                } catch {
                    allData[key] = val;
                }
            }
        }

        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `zonepro-session-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }, [state.courses, state.pomodoro, state.musicPlayer, state.settings, userId]);

    const importSession = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const raw = JSON.parse(e.target?.result as string);

                    // Support new format (with per-domain keys) and legacy format
                    const data: SessionData = raw.session || raw;

                    setters.setCourses(
                        (data.courses || []).map((course) => ({
                            ...course,
                            lastWatched: new Date(course.lastWatched),
                            notes: (course.notes || []).map((note) => ({
                                ...note,
                                createdAt: new Date(note.createdAt),
                            })),
                        })),
                    );
                    setters.setPomodoro(data.pomodoro || DEFAULT_POMODORO);
                    setters.setMusicPlayer(data.music || DEFAULT_MUSIC_PLAYER);
                    setters.setSettings({
                        ...DEFAULT_APP_SETTINGS,
                        ...data.settings,
                    });
                    setters.setCurrentCourse(null);

                    // Restore per-domain keys (scoped)
                    for (const key of ALL_STORAGE_KEYS) {
                        if (raw[key] !== undefined) {
                            localStorage.setItem(
                                scopeKey(key, userId),
                                JSON.stringify(raw[key]),
                            );
                        }
                    }
                } catch {
                    // Invalid session file
                }
            };
            reader.readAsText(file);
        },
        [userId], // eslint-disable-line react-hooks/exhaustive-deps
    );

    return { isLoaded, exportSession, importSession };
}
