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
};

export function usePomodoro(initial?: PomodoroSession) {
    const [pomodoro, setPomodoro] = useState<PomodoroSession>(
        initial || DEFAULT_POMODORO,
    );

    // Pomodoro Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (pomodoro.isActive && pomodoro.timeLeft > 0) {
            interval = setInterval(() => {
                setPomodoro((prev) => ({
                    ...prev,
                    timeLeft: prev.timeLeft - 1,
                }));
            }, 1000);
        } else if (pomodoro.isActive && pomodoro.timeLeft === 0) {
            setPomodoro((prev) => {
                if (prev.isBreak && prev.currentSession >= prev.totalSessions) {
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
        }
        return () => clearInterval(interval);
    }, [pomodoro.isActive, pomodoro.timeLeft]);

    const startPomodoro = useCallback(() => {
        setPomodoro((prev) => ({
            ...prev,
            isActive: true,
            timeLeft:
                prev.timeLeft === 0
                    ? prev.isBreak
                        ? prev.breakTime * 60
                        : prev.workTime * 60
                    : prev.timeLeft,
        }));
    }, []);

    const pausePomodoro = useCallback(() => {
        setPomodoro((prev) => ({ ...prev, isActive: false }));
    }, []);

    const resetPomodoro = useCallback(() => {
        setPomodoro((prev) => ({
            ...prev,
            isActive: false,
            isBreak: false,
            timeLeft: prev.workTime * 60,
            currentSession: 1,
        }));
    }, []);

    const updatePomodoro = useCallback((updates: Partial<PomodoroSession>) => {
        setPomodoro((prev) => ({ ...prev, ...updates }));
    }, []);

    return {
        pomodoro,
        setPomodoro,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        updatePomodoro,
    };
}
