"use client";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";

interface HabitDotGridProps {
    habitId: string;
    habitTitle: string;
    habitColor: string;
    getCompletion: (habitId: string, date: string) => number;
    targetCount: number;
}

export function HabitDotGrid({
    habitId,
    habitTitle,
    habitColor,
    getCompletion,
    targetCount,
}: HabitDotGridProps) {
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, "yyyy-MM-dd");
        const count = getCompletion(habitId, dateStr);
        const completed = count >= targetCount;
        days.push({ date, dateStr, count, completed });
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                    {habitTitle}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="grid grid-cols-10 gap-1">
                        {days.map((day) => (
                            <Tooltip key={day.dateStr}>
                                <TooltipTrigger asChild>
                                    <div
                                        className="w-5 h-5 rounded-sm transition-colors"
                                        style={{
                                            backgroundColor: day.completed
                                                ? habitColor
                                                : day.count > 0
                                                  ? `${habitColor}40`
                                                  : "var(--muted)",
                                        }}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        {format(day.date, "MMM d")}: {day.count}
                                        /{targetCount}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
