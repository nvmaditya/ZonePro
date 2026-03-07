"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { DashboardTaskStats } from "@/components/dashboard/dashboard-task-stats";
import { DashboardFocusHeatmap } from "@/components/dashboard/dashboard-focus-heatmap";
import { DashboardHabitOverview } from "@/components/dashboard/dashboard-habit-overview";
import { DashboardProductivityScore } from "@/components/dashboard/dashboard-productivity-score";
import type { Task, FocusSession, Habit, HabitLog } from "@/types";

export function DashboardSection() {
    const { value: tasks } = useLocalStorage<Task[]>("zonepro-tasks", []);
    const { value: sessions } = useLocalStorage<FocusSession[]>("zonepro-focus-sessions", []);
    const { value: habits } = useLocalStorage<Habit[]>("zonepro-habits", []);
    const { value: habitLogs } = useLocalStorage<HabitLog[]>("zonepro-habit-logs", []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardTaskStats tasks={tasks} />
                <DashboardProductivityScore tasks={tasks} sessions={sessions} habitLogs={habitLogs} />
            </div>
            <DashboardFocusHeatmap sessions={sessions} />
            <DashboardHabitOverview habits={habits} habitLogs={habitLogs} />
        </div>
    );
}
