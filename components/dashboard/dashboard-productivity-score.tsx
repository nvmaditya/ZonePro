"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";
import type { Task, FocusSession, HabitLog } from "@/types";

interface DashboardProductivityScoreProps {
    tasks: Task[];
    sessions: FocusSession[];
    habitLogs: HabitLog[];
}

export function DashboardProductivityScore({
    tasks,
    sessions,
    habitLogs,
}: DashboardProductivityScoreProps) {
    const chartData = useMemo(() => {
        const data = [];
        for (let i = 29; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateStr = format(date, "yyyy-MM-dd");

            const tasksCompleted = tasks.filter(
                (t) => t.completedAt && t.completedAt.startsWith(dateStr),
            ).length;
            const focusMinutes = sessions
                .filter((s) => s.date === dateStr && s.completed)
                .reduce((sum, s) => sum + s.actualMinutes, 0);
            const habitsCompleted = new Set(
                habitLogs
                    .filter((l) => l.date === dateStr && l.count > 0)
                    .map((l) => l.habitId),
            ).size;

            const score =
                tasksCompleted * 10 + focusMinutes * 0.5 + habitsCompleted * 15;

            data.push({
                day: format(date, "MMM d"),
                score: Math.round(score),
            });
        }
        return data;
    }, [tasks, sessions, habitLogs]);

    const todayScore = chartData[chartData.length - 1]?.score || 0;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Productivity Score
                    </span>
                    <span className="text-lg font-bold">{todayScore}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={chartData}>
                        <XAxis
                            dataKey="day"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            interval={6}
                        />
                        <YAxis
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
