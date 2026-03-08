"use client";

import {
    createContext,
    useContext,
    useRef,
    useCallback,
    type ReactNode,
} from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useFocusSessions } from "@/hooks/use-focus-sessions";
import { useHabits } from "@/hooks/use-habits";
import type { AppSettings, PomodoroSession } from "@/types";
import { DEFAULT_APP_SETTINGS } from "@/lib/constants";

type TasksReturn = ReturnType<typeof useTasks>;
type FocusReturn = ReturnType<typeof useFocusSessions>;
type HabitsReturn = ReturnType<typeof useHabits>;

export interface PomodoroActions {
    pomodoro: PomodoroSession;
    startPomodoro: () => void;
    pausePomodoro: () => void;
    resetPomodoro: () => void;
    skipToBreak: () => void;
    skipToWork: () => void;
    setMode: (mode: PomodoroSession["mode"]) => void;
    setTimerDuration: (seconds: number) => void;
}

interface AppDataContextValue {
    tasks: TasksReturn;
    focus: FocusReturn;
    habits: HabitsReturn;
    settings: AppSettings;
    pomodoroActions: PomodoroActions;
    focusQuickAdd: () => void;
    registerQuickAddRef: (ref: HTMLInputElement | null) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

interface AppDataProviderProps {
    children: ReactNode;
    settings?: AppSettings;
    pomodoroActions?: PomodoroActions;
}

const DEFAULT_POMODORO_ACTIONS: PomodoroActions = {
    pomodoro: { workTime: 25, breakTime: 5, currentSession: 1, totalSessions: 4, isActive: false, isBreak: false, timeLeft: 1500, mode: "pomodoro", elapsed: 0 },
    startPomodoro: () => {},
    pausePomodoro: () => {},
    resetPomodoro: () => {},
    skipToBreak: () => {},
    skipToWork: () => {},
    setMode: () => {},
    setTimerDuration: () => {},
};

export function AppDataProvider({ children, settings = DEFAULT_APP_SETTINGS, pomodoroActions = DEFAULT_POMODORO_ACTIONS }: AppDataProviderProps) {
    const tasks = useTasks();
    const focus = useFocusSessions();
    const habits = useHabits();

    const quickAddRef = useRef<HTMLInputElement | null>(null);

    const registerQuickAddRef = useCallback((ref: HTMLInputElement | null) => {
        quickAddRef.current = ref;
    }, []);

    const focusQuickAdd = useCallback(() => {
        quickAddRef.current?.focus();
    }, []);

    return (
        <AppDataContext.Provider
            value={{ tasks, focus, habits, settings, pomodoroActions, focusQuickAdd, registerQuickAddRef }}
        >
            {children}
        </AppDataContext.Provider>
    );
}

export function useAppData() {
    const ctx = useContext(AppDataContext);
    if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
    return ctx;
}

export function useAppTasks() {
    return useAppData().tasks;
}

export function useAppFocus() {
    return useAppData().focus;
}

export function useAppHabits() {
    return useAppData().habits;
}

export function useAppSettings() {
    return useAppData().settings;
}

export function useAppPomodoro() {
    return useAppData().pomodoroActions;
}
