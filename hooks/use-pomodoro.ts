"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { PomodoroSession, PomodoroMode } from "@/types";
import {
    DEFAULT_WORK_TIME,
    DEFAULT_BREAK_TIME,
    DEFAULT_TOTAL_SESSIONS,
} from "@/lib/constants";

export interface StoppedSessionInfo {
    mode: PomodoroMode;
    elapsed: number; // seconds actually spent
    startedAt: string;
}

export const DEFAULT_POMODORO: PomodoroSession = {
    workTime: DEFAULT_WORK_TIME,
    breakTime: DEFAULT_BREAK_TIME,
    currentSession: 1,
    totalSessions: DEFAULT_TOTAL_SESSIONS,
    isActive: false,
    isBreak: false,
    timeLeft: DEFAULT_WORK_TIME * 60,
    mode: "pomodoro",
    viewMode: "pomodoro",
    elapsed: 0,
};

function getElapsedForMode(p: PomodoroSession): number {
    if (p.mode === "stopwatch") return p.elapsed || 0;
    if (p.mode === "timer") return (p.timerDuration || 300) - p.timeLeft;
    // pomodoro
    const totalSeconds = p.isBreak ? p.breakTime * 60 : p.workTime * 60;
    return totalSeconds - p.timeLeft;
}

export function usePomodoro(initial?: PomodoroSession) {
    const [pomodoro, setPomodoro] = useState<PomodoroSession>(
        initial || DEFAULT_POMODORO,
    );

    // Ref to expose stopped session info when mode-switching while active
    const lastStoppedSession = useRef<StoppedSessionInfo | null>(null);

    // Timer Logic -- handles all three modes
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (pomodoro.isActive) {
            interval = setInterval(() => {
                setPomodoro((prev) => {
                    // Stopwatch mode: count up
                    if (prev.mode === "stopwatch") {
                        return { ...prev, elapsed: (prev.elapsed || 0) + 1 };
                    }

                    // Countdown for "pomodoro" and "timer" modes
                    if (prev.timeLeft > 0) {
                        return { ...prev, timeLeft: prev.timeLeft - 1 };
                    }

                    // timeLeft === 0
                    if (prev.mode === "timer") {
                        return { ...prev, isActive: false };
                    }

                    // Pomodoro mode: break/work transition
                    if (
                        prev.isBreak &&
                        prev.currentSession >= prev.totalSessions
                    ) {
                        return {
                            ...prev,
                            isActive: false,
                            isBreak: false,
                            timeLeft: prev.workTime * 60,
                            currentSession: prev.totalSessions,
                        };
                    }
                    return {
                        ...prev,
                        isActive: false,
                        isBreak: !prev.isBreak,
                        timeLeft: prev.isBreak
                            ? prev.workTime * 60
                            : prev.breakTime * 60,
                        currentSession: prev.isBreak
                            ? prev.currentSession + 1
                            : prev.currentSession,
                    };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [pomodoro.isActive]);

    const startPomodoro = useCallback(() => {
        setPomodoro((prev) => {
            const activeView = prev.viewMode || prev.mode;

            // If viewMode matches mode, just resume the current timer
            if (activeView === prev.mode) {
                if (prev.mode === "stopwatch") {
                    return {
                        ...prev,
                        isActive: true,
                        startedAt: prev.startedAt || new Date().toISOString(),
                    };
                }
                return {
                    ...prev,
                    isActive: true,
                    startedAt: prev.startedAt || new Date().toISOString(),
                    timeLeft:
                        prev.timeLeft === 0
                            ? prev.mode === "timer"
                                ? prev.timerDuration || 300
                                : prev.isBreak
                                  ? prev.breakTime * 60
                                  : prev.workTime * 60
                            : prev.timeLeft,
                };
            }

            // Mode promotion: switching to a different mode
            // Record the old session if it was active or had progress
            const elapsed = getElapsedForMode(prev);
            if ((prev.isActive || elapsed > 0) && prev.startedAt) {
                lastStoppedSession.current = {
                    mode: prev.mode,
                    elapsed,
                    startedAt: prev.startedAt,
                };
            }

            const newMode = activeView;
            const now = new Date().toISOString();
            return {
                ...prev,
                mode: newMode,
                viewMode: newMode,
                isActive: true,
                isBreak: false,
                startedAt: now,
                timeLeft:
                    newMode === "pomodoro"
                        ? prev.workTime * 60
                        : newMode === "timer"
                          ? prev.timerDuration || 300
                          : 0,
                elapsed: 0,
                currentSession: newMode === "pomodoro" ? 1 : prev.currentSession,
            };
        });
    }, []);

    const pausePomodoro = useCallback(() => {
        setPomodoro((prev) => ({ ...prev, isActive: false }));
    }, []);

    const resetPomodoro = useCallback(() => {
        setPomodoro((prev) => {
            if (prev.mode === "stopwatch") {
                return { ...prev, isActive: false, elapsed: 0, startedAt: undefined };
            }
            if (prev.mode === "timer") {
                return {
                    ...prev,
                    isActive: false,
                    timeLeft: prev.timerDuration || 300,
                    startedAt: undefined,
                };
            }
            return {
                ...prev,
                isActive: false,
                isBreak: false,
                timeLeft: prev.workTime * 60,
                currentSession: 1,
                startedAt: undefined,
            };
        });
    }, []);

    const updatePomodoro = useCallback((updates: Partial<PomodoroSession>) => {
        setPomodoro((prev) => ({ ...prev, ...updates }));
    }, []);

    const skipToBreak = useCallback(() => {
        setPomodoro((prev) => ({
            ...prev,
            isActive: false,
            isBreak: true,
            timeLeft: prev.breakTime * 60,
        }));
    }, []);

    const skipToWork = useCallback(() => {
        setPomodoro((prev) => ({
            ...prev,
            isActive: false,
            isBreak: false,
            timeLeft: prev.workTime * 60,
            currentSession: prev.isBreak
                ? prev.currentSession + 1
                : prev.currentSession,
        }));
    }, []);

    // setViewMode only changes the UI tab, does NOT stop the running timer
    const setViewMode = useCallback((viewMode: PomodoroSession["mode"]) => {
        setPomodoro((prev) => ({ ...prev, viewMode }));
    }, []);

    const setTimerDuration = useCallback((seconds: number) => {
        setPomodoro((prev) => ({
            ...prev,
            timerDuration: seconds,
            timeLeft: seconds,
            isActive: false,
            startedAt: undefined,
        }));
    }, []);

    const setWorkTime = useCallback((minutes: number) => {
        setPomodoro((prev) => ({
            ...prev,
            workTime: minutes,
            ...(!prev.isActive && !prev.isBreak ? { timeLeft: minutes * 60 } : {}),
        }));
    }, []);

    const setBreakTime = useCallback((minutes: number) => {
        setPomodoro((prev) => ({
            ...prev,
            breakTime: minutes,
            ...(prev.isBreak && !prev.isActive ? { timeLeft: minutes * 60 } : {}),
        }));
    }, []);

    return {
        pomodoro,
        setPomodoro,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        updatePomodoro,
        skipToBreak,
        skipToWork,
        setViewMode,
        setTimerDuration,
        setWorkTime,
        setBreakTime,
        lastStoppedSession,
    };
}
