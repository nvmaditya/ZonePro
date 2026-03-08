"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { CheckSquare } from "lucide-react";
import { format, subDays } from "date-fns";
import type { Task } from "@/types";

interface DashboardTaskStatsProps {
    tasks: Task[];
}

export function DashboardTaskStats({ tasks }: DashboardTaskStatsProps) {
    const todayCompleted = useMemo(() => {
        const today = format(new Date(), "yyyy-MM-dd");
        return tasks.filter(
            (t) => t.completedAt && t.completedAt.startsWith(today),
        ).length;
    }, [tasks]);

    const weekData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateStr = format(date, "yyyy-MM-dd");
            const count = tasks.filter(
                (t) => t.completedAt && t.completedAt.startsWith(dateStr),
            ).length;
            data.push({ day: format(date, "EEE"), count });
        }
        return data;
    }, [tasks]);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" /> Tasks Completed
                    </span>
                    <Badge variant="secondary">{todayCompleted} today</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={weekData}>
                        <XAxis
                            dataKey="day"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                color: "hsl(var(--popover-foreground))",
                            }}
                            labelStyle={{
                                color: "hsl(var(--muted-foreground))",
                            }}
                        />
                        <Bar
                            dataKey="count"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
