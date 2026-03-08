"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
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
import type { PomodoroSession } from "@/types";

function getElapsedSeconds(p: PomodoroSession): number {
    if (p.mode === "stopwatch") return p.elapsed || 0;
    if (p.mode === "timer") return (p.timerDuration || 300) - p.timeLeft;
    // pomodoro
    const totalSeconds = p.isBreak ? p.breakTime * 60 : p.workTime * 60;
    return totalSeconds - p.timeLeft;
}

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
        setWorkTime,
        setBreakTime,
        lastStoppedSession,
    } = useAppPomodoro();

    const todayMinutes = getTodayMinutes();
    const budgetMinutes = settings.dailyTimeBudgetMinutes;

    // Track session start for logging
    const sessionStartRef = useRef<string>("");
    const prevActiveRef = useRef(pomodoro.isActive);
    const prevIsBreakRef = useRef(pomodoro.isBreak);
    const prevModeRef = useRef(pomodoro.mode);

    // Record session start time
    useEffect(() => {
        if (pomodoro.isActive && !prevActiveRef.current) {
            sessionStartRef.current = pomodoro.startedAt || new Date().toISOString();
        }
        prevActiveRef.current = pomodoro.isActive;
    }, [pomodoro.isActive, pomodoro.startedAt]);

    // Auto-log completed pomodoro work sessions (when isBreak flips from false to true)
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
            sessionStartRef.current = "";
        }
        prevIsBreakRef.current = pomodoro.isBreak;
    }, [pomodoro.isBreak, pomodoro.mode, pomodoro.workTime, addSession]);

    // Auto-log completed timer sessions (timer reaches 0)
    useEffect(() => {
        if (
            pomodoro.mode === "timer" &&
            prevActiveRef.current &&
            !pomodoro.isActive &&
            pomodoro.timeLeft === 0
        ) {
            const now = new Date().toISOString();
            const durationMin = Math.round((pomodoro.timerDuration || 300) / 60);
            addSession({
                type: "timer",
                plannedMinutes: durationMin,
                actualMinutes: durationMin,
                completed: true,
                startedAt: sessionStartRef.current || now,
                endedAt: now,
                date: format(new Date(), "yyyy-MM-dd"),
            });
            sessionStartRef.current = "";
        }
    }, [pomodoro.isActive, pomodoro.mode, pomodoro.timeLeft, pomodoro.timerDuration, addSession]);

    // Log mode-switch interruptions via lastStoppedSession ref
    useEffect(() => {
        if (pomodoro.mode !== prevModeRef.current) {
            const stopped = lastStoppedSession.current;
            if (stopped && stopped.elapsed >= 30) {
                const elapsedMin = Math.round(stopped.elapsed / 60);
                if (elapsedMin > 0) {
                    addSession({
                        type: stopped.mode === "pomodoro" ? "pomodoro"
                            : stopped.mode === "timer" ? "timer" : "stopwatch",
                        plannedMinutes: 0,
                        actualMinutes: elapsedMin,
                        completed: false,
                        startedAt: stopped.startedAt,
                        endedAt: new Date().toISOString(),
                        date: format(new Date(), "yyyy-MM-dd"),
                    });
                }
                lastStoppedSession.current = null;
            }
            prevModeRef.current = pomodoro.mode;
        }
    }, [pomodoro.mode, lastStoppedSession, addSession]);

    // Wrap resetPomodoro to log incomplete session before resetting
    const handleReset = useCallback(() => {
        const elapsed = getElapsedSeconds(pomodoro);
        const elapsedMin = Math.round(elapsed / 60);
        if (elapsed >= 30 && sessionStartRef.current) {
            const now = new Date().toISOString();
            addSession({
                type: pomodoro.mode === "pomodoro" ? "pomodoro"
                    : pomodoro.mode === "timer" ? "timer" : "stopwatch",
                plannedMinutes: pomodoro.mode === "pomodoro"
                    ? pomodoro.workTime
                    : pomodoro.mode === "timer"
                      ? Math.round((pomodoro.timerDuration || 300) / 60)
                      : 0,
                actualMinutes: elapsedMin > 0 ? elapsedMin : 1,
                completed: false,
                startedAt: sessionStartRef.current,
                endedAt: now,
                date: format(new Date(), "yyyy-MM-dd"),
            });
        }
        sessionStartRef.current = "";
        resetPomodoro();
    }, [pomodoro, resetPomodoro, addSession]);

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
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="w-5 h-5" />
                        Timer
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                    <PomodoroTimer
                        pomodoro={pomodoro}
                        onStart={startPomodoro}
                        onPause={pausePomodoro}
                        onReset={handleReset}
                        onSkipToBreak={skipToBreak}
                        onSkipToWork={skipToWork}
                        onSetViewMode={setViewMode}
                        onSetTimerDuration={setTimerDuration}
                        onSetWorkTime={setWorkTime}
                        onSetBreakTime={setBreakTime}
                        variant="full"
                    />
                </CardContent>
            </Card>

            {/* Session Log */}
            <FocusSessionLog sessions={recentSessions} taskNames={taskNames} />
        </div>
    );
}
