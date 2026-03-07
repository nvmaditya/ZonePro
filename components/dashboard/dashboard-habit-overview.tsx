"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { format, subDays } from "date-fns";
import type { Habit, HabitLog } from "@/types";

interface DashboardHabitOverviewProps {
    habits: Habit[];
    habitLogs: HabitLog[];
}

export function DashboardHabitOverview({
    habits,
    habitLogs,
}: DashboardHabitOverviewProps) {
    const activeHabits = habits.filter((h) => !h.archivedAt);

    const habitData = useMemo(() => {
        return activeHabits.map((habit) => {
            // Last 14 days
            const days = [];
            for (let i = 13; i >= 0; i--) {
                const dateStr = format(subDays(new Date(), i), "yyyy-MM-dd");
                const completed = habitLogs.some(
                    (l) =>
                        l.habitId === habit.id &&
                        l.date === dateStr &&
                        l.count >= habit.targetCount,
                );
                days.push({ dateStr, completed });
            }

            // Streak
            let streak = 0;
            for (let i = 0; i < 365; i++) {
                const dateStr = format(subDays(new Date(), i), "yyyy-MM-dd");
                if (
                    habitLogs.some(
                        (l) =>
                            l.habitId === habit.id &&
                            l.date === dateStr &&
                            l.count > 0,
                    )
                ) {
                    streak++;
                } else if (i > 0) break;
            }

            return { habit, days, streak };
        });
    }, [activeHabits, habitLogs]);

    if (activeHabits.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Flame className="w-4 h-4" /> Habits
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No habits tracked yet
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Flame className="w-4 h-4" /> Habits
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {habitData.map(({ habit, days, streak }) => (
                    <div key={habit.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                {habit.title}
                            </span>
                            {streak > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="text-xs gap-1"
                                >
                                    <Flame className="w-3 h-3" />
                                    {streak}
                                </Badge>
                            )}
                        </div>
                        <div className="flex gap-0.5">
                            {days.map((day) => (
                                <div
                                    key={day.dateStr}
                                    className="w-3 h-3 rounded-sm"
                                    style={{
                                        backgroundColor: day.completed
                                            ? habit.color
                                            : "var(--muted)",
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
