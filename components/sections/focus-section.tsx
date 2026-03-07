"use client";

import { useMemo } from "react";
import { useFocusSessions } from "@/hooks/use-focus-sessions";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { FocusTimer } from "@/components/focus/focus-timer";
import { FocusStopwatch } from "@/components/focus/focus-stopwatch";
import { FocusSessionLog } from "@/components/focus/focus-session-log";
import { FocusDailyBudget } from "@/components/focus/focus-daily-budget";
import type { Task, FocusSession } from "@/types";

export function FocusSection() {
    const { value: tasks } = useLocalStorage<Task[]>("zonepro-tasks", []);
    const { addSession, getTodayMinutes, recentSessions } = useFocusSessions();

    const todayMinutes = getTodayMinutes();
    const budgetMinutes = 480; // 8 hours, could make configurable later

    const handleSessionComplete = (sessionData: Omit<FocusSession, "id">) => {
        addSession(sessionData);
    };

    const taskNames = useMemo(() => {
        const map: Record<string, string> = {};
        tasks.forEach(t => { map[t.id] = t.title; });
        return map;
    }, [tasks]);

    return (
        <div className="space-y-6">
            {/* Daily Budget */}
            <FocusDailyBudget todayMinutes={todayMinutes} budgetMinutes={budgetMinutes} />

            {/* Timers side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FocusTimer tasks={tasks} onSessionComplete={handleSessionComplete} />
                <FocusStopwatch onSessionComplete={handleSessionComplete} />
            </div>

            {/* Session Log */}
            <FocusSessionLog sessions={recentSessions} taskNames={taskNames} />
        </div>
    );
}
