"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    syncCoursesToCloud,
    fetchCoursesFromCloud,
    syncSettingsToCloud,
    fetchSettingsFromCloud,
    syncMusicToCloud,
    fetchMusicFromCloud,
} from "@/lib/supabase/sync";
import type { CourseProgress, PomodoroSession, MusicPlayer } from "@/types";

interface CloudSyncState {
    courses: CourseProgress[];
    pomodoro: PomodoroSession;
    musicPlayer: MusicPlayer;
    settings: { autoMusicPause: boolean };
}

interface CloudSyncSetters {
    setCourses: (
        courses:
            | CourseProgress[]
            | ((prev: CourseProgress[]) => CourseProgress[]),
    ) => void;
    setPomodoro: React.Dispatch<React.SetStateAction<PomodoroSession>>;
    setMusicPlayer: React.Dispatch<React.SetStateAction<MusicPlayer>>;
    setSettings: React.Dispatch<
        React.SetStateAction<{ autoMusicPause: boolean }>
    >;
}

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

export function useCloudSync(
    state: CloudSyncState,
    setters: CloudSyncSetters,
    isLocalLoaded: boolean,
) {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
    const [userId, setUserId] = useState<string | null>(null);
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const initialSyncDone = useRef(false);

    // Get current user
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserId(user?.id ?? null);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id ?? null);
            initialSyncDone.current = false;
        });

        return () => subscription.unsubscribe();
    }, []);

    // Initial sync: pull from cloud and merge with local
    useEffect(() => {
        if (!userId || !isLocalLoaded || initialSyncDone.current) return;

        const pullFromCloud = async () => {
            setSyncStatus("syncing");
            try {
                const supabase = createClient();

                const [cloudCourses, cloudSettings, cloudMusic] =
                    await Promise.all([
                        fetchCoursesFromCloud(supabase, userId),
                        fetchSettingsFromCloud(supabase, userId),
                        fetchMusicFromCloud(supabase, userId),
                    ]);

                // Merge: cloud data takes priority for items that exist in cloud
                // local-only items are kept and will be synced up
                if (cloudCourses.length > 0) {
                    setters.setCourses((prev: CourseProgress[]) => {
                        const cloudIds = new Set(cloudCourses.map((c) => c.id));
                        const localOnly = prev.filter(
                            (c) => !cloudIds.has(c.id),
                        );
                        return [...cloudCourses, ...localOnly];
                    });
                }

                if (cloudSettings) {
                    setters.setSettings({
                        autoMusicPause: cloudSettings.settings.autoMusicPause,
                    });
                    setters.setPomodoro((prev) => ({
                        ...prev,
                        workTime: cloudSettings.pomodoro.workTime,
                        breakTime: cloudSettings.pomodoro.breakTime,
                        totalSessions: cloudSettings.pomodoro.totalSessions,
                        timeLeft: prev.isActive
                            ? prev.timeLeft
                            : cloudSettings.pomodoro.workTime * 60,
                    }));
                }

                if (cloudMusic.length > 0) {
                    setters.setMusicPlayer((prev) => ({
                        ...prev,
                        playlist: cloudMusic,
                    }));
                }

                initialSyncDone.current = true;
                setSyncStatus("synced");
            } catch {
                setSyncStatus("error");
            }
        };

        pullFromCloud();
    }, [userId, isLocalLoaded, setters]);

    // Debounced push to cloud on state changes
    const pushToCloud = useCallback(async () => {
        if (!userId || !initialSyncDone.current) return;

        setSyncStatus("syncing");
        try {
            const supabase = createClient();
            await Promise.all([
                syncCoursesToCloud(supabase, userId, state.courses),
                syncSettingsToCloud(
                    supabase,
                    userId,
                    state.settings,
                    state.pomodoro,
                ),
                syncMusicToCloud(supabase, userId, state.musicPlayer.playlist),
            ]);
            setSyncStatus("synced");
        } catch {
            setSyncStatus("error");
        }
    }, [
        userId,
        state.courses,
        state.settings,
        state.pomodoro,
        state.musicPlayer.playlist,
    ]);

    // Debounce push: wait 5 seconds after last change
    useEffect(() => {
        if (!userId || !initialSyncDone.current) return;

        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(() => {
            pushToCloud();
        }, 5000);

        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [userId, pushToCloud]);

    // Sync on window focus
    useEffect(() => {
        if (!userId) return;

        const handleFocus = () => {
            if (initialSyncDone.current) {
                pushToCloud();
            }
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [userId, pushToCloud]);

    return { syncStatus, userId };
}
