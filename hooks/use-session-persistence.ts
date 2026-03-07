"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import type {
    CourseProgress,
    PomodoroSession,
    MusicPlayer,
    SessionData,
} from "@/types";
import { STORAGE_KEY, OLD_STORAGE_KEY } from "@/lib/constants";
import { DEFAULT_POMODORO } from "@/hooks/use-pomodoro";
import { DEFAULT_MUSIC_PLAYER } from "@/hooks/use-music-player";

const DEFAULT_SETTINGS = { autoMusicPause: true };

interface PersistenceSetters {
    setCourses: (courses: CourseProgress[]) => void;
    setCurrentCourse: (course: CourseProgress | null) => void;
    setPomodoro: (pomodoro: PomodoroSession) => void;
    setMusicPlayer: (player: MusicPlayer) => void;
    setSettings: (settings: { autoMusicPause: boolean }) => void;
}

interface PersistenceState {
    courses: CourseProgress[];
    pomodoro: PomodoroSession;
    musicPlayer: MusicPlayer;
    settings: { autoMusicPause: boolean };
}

export function useSessionPersistence(
    state: PersistenceState,
    setters: PersistenceSetters,
) {
    const [isLoaded, setIsLoaded] = useState(false);

    // Load data from localStorage on mount (with migration from old key)
    useEffect(() => {
        if (typeof window === "undefined") return;

        let savedData = localStorage.getItem(STORAGE_KEY);

        // Migrate from old storage key if new key has no data
        if (!savedData) {
            const oldData = localStorage.getItem(OLD_STORAGE_KEY);
            if (oldData) {
                savedData = oldData;
                localStorage.setItem(STORAGE_KEY, oldData);
                localStorage.removeItem(OLD_STORAGE_KEY);
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
                setters.setSettings(data.settings || DEFAULT_SETTINGS);
            } catch {
                // Corrupted data, start fresh
            }
        }
        setIsLoaded(true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    }, [
        state.courses,
        state.pomodoro,
        state.musicPlayer,
        state.settings,
        isLoaded,
    ]);

    const exportSession = useCallback(() => {
        const sessionData: SessionData = {
            courses: state.courses,
            pomodoro: state.pomodoro,
            music: state.musicPlayer,
            settings: state.settings,
            timestamp: new Date(),
        };
        const dataStr = JSON.stringify(sessionData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `zonepro-session-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }, [state.courses, state.pomodoro, state.musicPlayer, state.settings]);

    const importSession = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data: SessionData = JSON.parse(
                        e.target?.result as string,
                    );
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
                    setters.setSettings(data.settings || DEFAULT_SETTINGS);
                    setters.setCurrentCourse(null);
                } catch {
                    // Invalid session file
                }
            };
            reader.readAsText(file);
        },
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    return { isLoaded, exportSession, importSession };
}
