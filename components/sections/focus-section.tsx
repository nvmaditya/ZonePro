"use client";

import { useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import {
    useAppTasks,
    useAppFocus,
    useAppSettings,
    useAppPomodoro,
} from "@/contexts/app-data-context";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { FocusSessionLog } from "@/components/focus/focus-session-log";
import { FocusDailyBudget } from "@/components/focus/focus-daily-budget";
import { format } from "date-fns";

export function FocusSection() {
    const { tasks } = useAppTasks();
    const { addSession, getTodayMinutes, recentSessions } = useAppFocus();
    const settings = useAppSettings();
    const {
        pomodoro,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        skipToBreak,
        skipToWork,
        setViewMode,
        setTimerDuration,
    } = useAppPomodoro();

    const todayMinutes = getTodayMinutes();
    const budgetMinutes = settings.dailyTimeBudgetMinutes;

    // Track session start for logging
    const sessionStartRef = useRef<string>("");
    const prevActiveRef = useRef(pomodoro.isActive);
    const prevIsBreakRef = useRef(pomodoro.isBreak);

    // Record session start time
    useEffect(() => {
        if (pomodoro.isActive && !prevActiveRef.current) {
            sessionStartRef.current = new Date().toISOString();
        }
        prevActiveRef.current = pomodoro.isActive;
    }, [pomodoro.isActive]);

    // Auto-log completed work sessions (when isBreak flips from false to true)
    useEffect(() => {
        if (
            pomodoro.mode === "pomodoro" &&
            pomodoro.isBreak &&
            !prevIsBreakRef.current
        ) {
            const now = new Date().toISOString();
            addSession({
                type: "pomodoro",
                plannedMinutes: pomodoro.workTime,
                actualMinutes: pomodoro.workTime,
                completed: true,
                startedAt: sessionStartRef.current || now,
                endedAt: now,
                date: format(new Date(), "yyyy-MM-dd"),
            });
        }
        prevIsBreakRef.current = pomodoro.isBreak;
    }, [pomodoro.isBreak, pomodoro.mode, pomodoro.workTime, addSession]);

    const taskNames = useMemo(() => {
        const map: Record<string, string> = {};
        tasks.forEach((t) => {
            map[t.id] = t.title;
        });
        return map;
    }, [tasks]);

    return (
        <div className="space-y-6">
            {/* Daily Budget */}
            <FocusDailyBudget
                todayMinutes={todayMinutes}
                budgetMinutes={budgetMinutes}
            />

            {/* Shared Timer */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="w-5 h-5" />
                        Timer
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <PomodoroTimer
                        pomodoro={pomodoro}
                        onStart={startPomodoro}
                        onPause={pausePomodoro}
                        onReset={resetPomodoro}
                        onSkipToBreak={skipToBreak}
                        onSkipToWork={skipToWork}
                        onSetViewMode={setViewMode}
                        onSetTimerDuration={setTimerDuration}
                    />
                </CardContent>
            </Card>

            {/* Session Log */}
            <FocusSessionLog sessions={recentSessions} taskNames={taskNames} />
        </div>
    );
}
