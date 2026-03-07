"use client";
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { Goal, Milestone, DailyPriority, TimeBlock } from "@/types";
import { format } from "date-fns";

export function usePlanning() {
    const { value: goals, setValue: setGoals } = useLocalStorage<Goal[]>("zonepro-goals", []);
    const { value: dailyPriorities, setValue: setDailyPriorities } = useLocalStorage<DailyPriority[]>("zonepro-daily-priorities", []);
    const { value: timeBlocks, setValue: setTimeBlocks } = useLocalStorage<TimeBlock[]>("zonepro-time-blocks", []);

    // Goals CRUD
    const addGoal = useCallback((data: Partial<Goal> & { title: string }) => {
        const now = new Date().toISOString();
        const newGoal: Goal = {
            id: crypto.randomUUID(), milestones: [], status: "active",
            createdAt: now, updatedAt: now, ...data,
        };
        setGoals(prev => [...prev, newGoal]);
        return newGoal;
    }, [setGoals]);

    const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g));
    }, [setGoals]);

    const deleteGoal = useCallback((id: string) => {
        setGoals(prev => prev.filter(g => g.id !== id));
    }, [setGoals]);

    const addMilestone = useCallback((goalId: string, title: string) => {
        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;
            const milestone: Milestone = { id: crypto.randomUUID(), title, completed: false, sortOrder: g.milestones.length };
            return { ...g, milestones: [...g.milestones, milestone], updatedAt: new Date().toISOString() };
        }));
    }, [setGoals]);

    const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;
            return {
                ...g,
                milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m),
                updatedAt: new Date().toISOString(),
            };
        }));
    }, [setGoals]);

    // Daily Priorities
    const getTodayPriorities = useCallback((): string[] => {
        const today = format(new Date(), "yyyy-MM-dd");
        const dp = dailyPriorities.find(p => p.date === today);
        return dp?.taskIds || [];
    }, [dailyPriorities]);

    const setTodayPriorities = useCallback((taskIds: string[]) => {
        const today = format(new Date(), "yyyy-MM-dd");
        setDailyPriorities(prev => {
            const existing = prev.findIndex(p => p.date === today);
            if (existing >= 0) {
                return prev.map((p, i) => i === existing ? { ...p, taskIds } : p);
            }
            return [...prev, { date: today, taskIds }];
        });
    }, [setDailyPriorities]);

    // Time Blocks
    const getTodayTimeBlocks = useCallback((): TimeBlock[] => {
        const today = format(new Date(), "yyyy-MM-dd");
        return timeBlocks.filter(b => b.date === today).sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute));
    }, [timeBlocks]);

    const addTimeBlock = useCallback((data: Omit<TimeBlock, "id">) => {
        const newBlock: TimeBlock = { id: crypto.randomUUID(), ...data };
        setTimeBlocks(prev => [...prev, newBlock]);
        return newBlock;
    }, [setTimeBlocks]);

    const updateTimeBlock = useCallback((id: string, updates: Partial<TimeBlock>) => {
        setTimeBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    }, [setTimeBlocks]);

    const deleteTimeBlock = useCallback((id: string) => {
        setTimeBlocks(prev => prev.filter(b => b.id !== id));
    }, [setTimeBlocks]);

    const activeGoals = useMemo(() => goals.filter(g => g.status === "active"), [goals]);

    return {
        goals, activeGoals, addGoal, updateGoal, deleteGoal, addMilestone, toggleMilestone,
        dailyPriorities, getTodayPriorities, setTodayPriorities,
        timeBlocks, getTodayTimeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock,
    };
}
