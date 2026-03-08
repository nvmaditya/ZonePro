"use client";

import {
    useAppTasks,
    useAppFocus,
    useAppHabits,
} from "@/contexts/app-data-context";
import { DashboardTaskStats } from "@/components/dashboard/dashboard-task-stats";
import { DashboardFocusHeatmap } from "@/components/dashboard/dashboard-focus-heatmap";
import { DashboardHabitOverview } from "@/components/dashboard/dashboard-habit-overview";
import { DashboardProductivityScore } from "@/components/dashboard/dashboard-productivity-score";

export function DashboardSection() {
    const { tasks } = useAppTasks();
    const { sessions } = useAppFocus();
    const { habits, habitLogs } = useAppHabits();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardTaskStats tasks={tasks} />
                <DashboardProductivityScore
                    tasks={tasks}
                    sessions={sessions}
                    habitLogs={habitLogs}
                />
            </div>
            <DashboardFocusHeatmap sessions={sessions} />
            <DashboardHabitOverview habits={habits} habitLogs={habitLogs} />
        </div>
    );
}
