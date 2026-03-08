"use client";
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { FocusSession } from "@/types";
import { format } from "date-fns";

export function useFocusSessions() {
    const {
        value: sessions,
        setValue: setSessions,
        isLoaded,
    } = useLocalStorage<FocusSession[]>("zonepro-focus-sessions", []);

    const addSession = useCallback(
        (session: Omit<FocusSession, "id">) => {
            const newSession: FocusSession = {
                id: crypto.randomUUID(),
                ...session,
            };
            setSessions((prev) => [...prev, newSession]);
            return newSession;
        },
        [setSessions],
    );

    const updateSession = useCallback(
        (id: string, updates: Partial<FocusSession>) => {
            setSessions((prev) =>
                prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
            );
        },
        [setSessions],
    );

    const deleteSession = useCallback(
        (id: string) => {
            setSessions((prev) => prev.filter((s) => s.id !== id));
        },
        [setSessions],
    );

    const getTodayMinutes = useCallback(() => {
        const today = format(new Date(), "yyyy-MM-dd");
        return sessions
            .filter((s) => s.date === today)
            .reduce((sum, s) => sum + s.actualMinutes, 0);
    }, [sessions]);

    const getWeekSessions = useCallback(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessions.filter((s) => new Date(s.date) >= weekAgo);
    }, [sessions]);

    const sessionsByDate = useMemo(() => {
        const map: Record<string, FocusSession[]> = {};
        sessions.forEach((s) => {
            if (!map[s.date]) map[s.date] = [];
            map[s.date].push(s);
        });
        return map;
    }, [sessions]);

    const recentSessions = useMemo(() => {
        return [...sessions]
            .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
            .slice(0, 20);
    }, [sessions]);

    return {
        sessions,
        setSessions,
        isLoaded,
        addSession,
        updateSession,
        deleteSession,
        getTodayMinutes,
        getWeekSessions,
        sessionsByDate,
        recentSessions,
    };
}
