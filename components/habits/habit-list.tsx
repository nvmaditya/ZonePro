"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Flame } from "lucide-react";
import { format } from "date-fns";

interface HabitWithStatus {
    id: string;
    title: string;
    color: string;
    targetCount: number;
    completedToday: boolean;
    todayCount: number;
}

interface HabitListProps {
    habits: HabitWithStatus[];
    streaks: Record<string, number>;
    onToggle: (habitId: string, date: string) => void;
    onClick: (habitId: string) => void;
}

export function HabitList({
    habits,
    streaks,
    onToggle,
    onClick,
}: HabitListProps) {
    const today = format(new Date(), "yyyy-MM-dd");

    if (habits.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">
                        No habits yet. Add one to get started!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-2">
            {habits.map((habit) => (
                <Card
                    key={habit.id}
                    className="cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => onClick(habit.id)}
                >
                    <CardContent className="flex items-center gap-3 p-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle(habit.id, today);
                            }}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                habit.completedToday
                                    ? "border-transparent text-white"
                                    : "border-muted-foreground/30 hover:border-muted-foreground"
                            }`}
                            style={{
                                backgroundColor: habit.completedToday
                                    ? habit.color
                                    : "transparent",
                            }}
                        >
                            {habit.completedToday && (
                                <Check className="w-4 h-4" />
                            )}
                        </button>
                        <div className="flex-1 min-w-0">
                            <span
                                className={`text-sm font-medium ${habit.completedToday ? "text-muted-foreground" : "text-foreground"}`}
                            >
                                {habit.title}
                            </span>
                        </div>
                        {(streaks[habit.id] || 0) > 0 && (
                            <Badge variant="secondary" className="gap-1">
                                <Flame className="w-3 h-3" />
                                {streaks[habit.id]}
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
