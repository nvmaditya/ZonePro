"use client";

import { useState, useEffect, useCallback } from "react";
import type { PomodoroSession } from "@/types";
import {
    DEFAULT_WORK_TIME,
    DEFAULT_BREAK_TIME,
    DEFAULT_TOTAL_SESSIONS,
} from "@/lib/constants";

export const DEFAULT_POMODORO: PomodoroSession = {
    workTime: DEFAULT_WORK_TIME,
    breakTime: DEFAULT_BREAK_TIME,
    currentSession: 1,
    totalSessions: DEFAULT_TOTAL_SESSIONS,
    isActive: false,
    isBreak: false,
    timeLeft: DEFAULT_WORK_TIME * 60,
    mode: "pomodoro",
    elapsed: 0,
};

export function usePomodoro(initial?: PomodoroSession) {
    const [pomodoro, setPomodoro] = useState<PomodoroSession>(
        initial || DEFAULT_POMODORO,
    );

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
            if (prev.mode === "stopwatch") {
                return { ...prev, isActive: true };
            }
            return {
                ...prev,
                isActive: true,
                timeLeft:
                    prev.timeLeft === 0
                        ? prev.mode === "timer"
                            ? prev.timerDuration || 300
                            : prev.isBreak
                              ? prev.breakTime * 60
                              : prev.workTime * 60
                        : prev.timeLeft,
            };
        });
    }, []);

    const pausePomodoro = useCallback(() => {
        setPomodoro((prev) => ({ ...prev, isActive: false }));
    }, []);

    const resetPomodoro = useCallback(() => {
        setPomodoro((prev) => {
            if (prev.mode === "stopwatch") {
                return { ...prev, isActive: false, elapsed: 0 };
            }
            if (prev.mode === "timer") {
                return {
                    ...prev,
                    isActive: false,
                    timeLeft: prev.timerDuration || 300,
                };
            }
            return {
                ...prev,
                isActive: false,
                isBreak: false,
                timeLeft: prev.workTime * 60,
                currentSession: 1,
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

    const setMode = useCallback((mode: PomodoroSession["mode"]) => {
        setPomodoro((prev) => ({
            ...prev,
            mode,
            isActive: false,
            isBreak: false,
            timeLeft:
                mode === "pomodoro"
                    ? prev.workTime * 60
                    : mode === "timer"
                      ? prev.timerDuration || 300
                      : 0,
            elapsed: 0,
            currentSession: 1,
        }));
    }, []);

    const setTimerDuration = useCallback((seconds: number) => {
        setPomodoro((prev) => ({
            ...prev,
            timerDuration: seconds,
            timeLeft: seconds,
            isActive: false,
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
        setMode,
        setTimerDuration,
    };
}
