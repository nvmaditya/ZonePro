"use client";
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { Habit, HabitLog } from "@/types";
import { format, subDays } from "date-fns";

export function useHabits() {
    const {
        value: habits,
        setValue: setHabits,
        isLoaded,
    } = useLocalStorage<Habit[]>("zonepro-habits", []);
    const { value: habitLogs, setValue: setHabitLogs } = useLocalStorage<
        HabitLog[]
    >("zonepro-habit-logs", []);

    const addHabit = useCallback(
        (data: Partial<Habit> & { title: string }) => {
            const newHabit: Habit = {
                id: crypto.randomUUID(),
                frequency: "daily",
                targetCount: 1,
                color: "#3b82f6",
                sortOrder: habits.length,
                createdAt: new Date().toISOString(),
                ...data,
            };
            setHabits((prev) => [...prev, newHabit]);
            return newHabit;
        },
        [habits.length, setHabits],
    );

    const updateHabit = useCallback(
        (id: string, updates: Partial<Habit>) => {
            setHabits((prev) =>
                prev.map((h) => (h.id === id ? { ...h, ...updates } : h)),
            );
        },
        [setHabits],
    );

    const archiveHabit = useCallback(
        (id: string) => {
            setHabits((prev) =>
                prev.map((h) =>
                    h.id === id
                        ? { ...h, archivedAt: new Date().toISOString() }
                        : h,
                ),
            );
        },
        [setHabits],
    );

    const deleteHabit = useCallback(
        (id: string) => {
            setHabits((prev) => prev.filter((h) => h.id !== id));
            setHabitLogs((prev) => prev.filter((log) => log.habitId !== id));
        },
        [setHabits, setHabitLogs],
    );

    const toggleCompletion = useCallback(
        (habitId: string, date: string) => {
            setHabitLogs((prev) => {
                const existing = prev.find(
                    (l) => l.habitId === habitId && l.date === date,
                );
                if (existing) {
                    // Toggle: if count > 0, remove it; if 0, set to 1
                    if (existing.count > 0) {
                        return prev.filter((l) => l.id !== existing.id);
                    }
                    return prev.map((l) =>
                        l.id === existing.id ? { ...l, count: 1 } : l,
                    );
                }
                // Create new log
                return [
                    ...prev,
                    { id: crypto.randomUUID(), habitId, date, count: 1 },
                ];
            });
        },
        [setHabitLogs],
    );

    const getCompletionForDate = useCallback(
        (habitId: string, date: string): number => {
            const log = habitLogs.find(
                (l) => l.habitId === habitId && l.date === date,
            );
            return log?.count || 0;
        },
        [habitLogs],
    );

    const getStreak = useCallback(
        (habitId: string): number => {
            let streak = 0;
            const today = new Date();
            for (let i = 0; i < 365; i++) {
                const date = format(subDays(today, i), "yyyy-MM-dd");
                const completed = habitLogs.some(
                    (l) =>
                        l.habitId === habitId && l.date === date && l.count > 0,
                );
                if (completed) {
                    streak++;
                } else if (i > 0) {
                    break;
                }
                // Skip today if not completed yet
            }
            return streak;
        },
        [habitLogs],
    );

    const getCompletionRate = useCallback(
        (habitId: string, days: number = 30): number => {
            let completedDays = 0;
            const today = new Date();
            for (let i = 0; i < days; i++) {
                const date = format(subDays(today, i), "yyyy-MM-dd");
                if (
                    habitLogs.some(
                        (l) =>
                            l.habitId === habitId &&
                            l.date === date &&
                            l.count > 0,
                    )
                ) {
                    completedDays++;
                }
            }
            return Math.round((completedDays / days) * 100);
        },
        [habitLogs],
    );

    const activeHabits = useMemo(
        () => habits.filter((h) => !h.archivedAt),
        [habits],
    );

    const getTodayHabits = useCallback(() => {
        const today = format(new Date(), "yyyy-MM-dd");
        const dayOfWeek = new Date().getDay();
        return activeHabits
            .filter((h) => {
                if (h.frequency === "daily") return true;
                if (h.frequency === "weekly") return dayOfWeek === 1; // Mondays
                if (h.frequency === "custom" && h.targetDays)
                    return h.targetDays.includes(dayOfWeek);
                return true;
            })
            .map((h) => ({
                ...h,
                completedToday:
                    getCompletionForDate(h.id, today) >= h.targetCount,
                todayCount: getCompletionForDate(h.id, today),
            }));
    }, [activeHabits, getCompletionForDate]);

    return {
        habits,
        setHabits,
        habitLogs,
        setHabitLogs,
        isLoaded,
        activeHabits,
        addHabit,
        updateHabit,
        archiveHabit,
        deleteHabit,
        toggleCompletion,
        getCompletionForDate,
        getStreak,
        getCompletionRate,
        getTodayHabits,
    };
}
