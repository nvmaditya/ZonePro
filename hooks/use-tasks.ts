"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { Task, TaskPriority, TaskStatus } from "@/types";

interface TaskFilters {
    status: TaskStatus[];
    priority: TaskPriority[];
    labels: string[];
    search: string;
}

const DEFAULT_FILTERS: TaskFilters = {
    status: [],
    priority: [],
    labels: [],
    search: "",
};

export function useTasks() {
    const {
        value: tasks,
        setValue: setTasks,
        isLoaded,
    } = useLocalStorage<Task[]>("zonepro-tasks", []);
    const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
    const [sortBy, setSortBy] = useState<
        "priority" | "dueDate" | "created" | "manual"
    >("manual");

    // Quick add - creates task with minimal fields
    const quickAddTask = useCallback(
        (title: string) => {
            const now = new Date().toISOString();
            const newTask: Task = {
                id: crypto.randomUUID(),
                title,
                status: "todo",
                priority: "none",
                labels: [],
                sortOrder: tasks.length,
                createdAt: now,
                updatedAt: now,
            };
            setTasks((prev) => [...prev, newTask]);
            return newTask;
        },
        [tasks.length, setTasks],
    );

    // Full add with all fields
    const addTask = useCallback(
        (taskData: Partial<Task> & { title: string }) => {
            const now = new Date().toISOString();
            const newTask: Task = {
                id: crypto.randomUUID(),
                status: "todo",
                priority: "none",
                labels: [],
                sortOrder: tasks.length,
                createdAt: now,
                updatedAt: now,
                ...taskData,
            };
            setTasks((prev) => [...prev, newTask]);
            return newTask;
        },
        [tasks.length, setTasks],
    );

    const updateTask = useCallback(
        (id: string, updates: Partial<Task>) => {
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === id
                        ? {
                              ...t,
                              ...updates,
                              updatedAt: new Date().toISOString(),
                          }
                        : t,
                ),
            );
        },
        [setTasks],
    );

    const deleteTask = useCallback(
        (id: string) => {
            // Also delete subtasks
            setTasks((prev) =>
                prev.filter((t) => t.id !== id && t.parentId !== id),
            );
        },
        [setTasks],
    );

    const toggleStatus = useCallback(
        (id: string) => {
            setTasks((prev) =>
                prev.map((t) => {
                    if (t.id !== id) return t;
                    const now = new Date().toISOString();
                    if (t.status === "done") {
                        return {
                            ...t,
                            status: "todo" as TaskStatus,
                            completedAt: undefined,
                            updatedAt: now,
                        };
                    }
                    return {
                        ...t,
                        status: "done" as TaskStatus,
                        completedAt: now,
                        updatedAt: now,
                    };
                }),
            );
        },
        [setTasks],
    );

    const moveTask = useCallback(
        (id: string, newStatus: TaskStatus) => {
            const now = new Date().toISOString();
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === id
                        ? {
                              ...t,
                              status: newStatus,
                              completedAt:
                                  newStatus === "done" ? now : undefined,
                              updatedAt: now,
                          }
                        : t,
                ),
            );
        },
        [setTasks],
    );

    // Get subtasks for a parent
    const getSubtasks = useCallback(
        (parentId: string) => {
            return tasks.filter((t) => t.parentId === parentId);
        },
        [tasks],
    );

    // All unique labels across tasks
    const allLabels = useMemo(() => {
        const labelSet = new Set<string>();
        tasks.forEach((t) => t.labels.forEach((l) => labelSet.add(l)));
        return Array.from(labelSet).sort();
    }, [tasks]);

    // Filtered and sorted tasks (excluding subtasks from top level)
    const filteredTasks = useMemo(() => {
        let result = tasks.filter((t) => !t.parentId); // Only top-level tasks

        if (filters.status.length > 0) {
            result = result.filter((t) => filters.status.includes(t.status));
        }
        if (filters.priority.length > 0) {
            result = result.filter((t) =>
                filters.priority.includes(t.priority),
            );
        }
        if (filters.labels.length > 0) {
            result = result.filter((t) =>
                t.labels.some((l) => filters.labels.includes(l)),
            );
        }
        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    t.description?.toLowerCase().includes(q),
            );
        }

        // Sort
        const priorityOrder: Record<TaskPriority, number> = {
            urgent: 0,
            high: 1,
            medium: 2,
            low: 3,
            none: 4,
        };
        switch (sortBy) {
            case "priority":
                result.sort(
                    (a, b) =>
                        priorityOrder[a.priority] - priorityOrder[b.priority],
                );
                break;
            case "dueDate":
                result.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return a.dueDate.localeCompare(b.dueDate);
                });
                break;
            case "created":
                result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
                break;
            case "manual":
            default:
                result.sort((a, b) => a.sortOrder - b.sortOrder);
                break;
        }

        return result;
    }, [tasks, filters, sortBy]);

    // Tasks grouped by status for kanban
    const tasksByStatus = useMemo(
        () => ({
            todo: filteredTasks.filter((t) => t.status === "todo"),
            in_progress: filteredTasks.filter(
                (t) => t.status === "in_progress",
            ),
            done: filteredTasks.filter((t) => t.status === "done"),
        }),
        [filteredTasks],
    );

    // Tasks grouped by due date for calendar
    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};
        tasks
            .filter((t) => t.dueDate && !t.parentId)
            .forEach((t) => {
                const date = t.dueDate!;
                if (!map[date]) map[date] = [];
                map[date].push(t);
            });
        return map;
    }, [tasks]);

    return {
        tasks,
        setTasks,
        isLoaded,
        filteredTasks,
        tasksByStatus,
        tasksByDate,
        filters,
        setFilters,
        sortBy,
        setSortBy,
        allLabels,
        quickAddTask,
        addTask,
        updateTask,
        deleteTask,
        toggleStatus,
        moveTask,
        getSubtasks,
    };
}
