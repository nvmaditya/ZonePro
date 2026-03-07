"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Timer } from "lucide-react";
import { format, subDays } from "date-fns";
import type { FocusSession } from "@/types";

interface DashboardFocusHeatmapProps {
    sessions: FocusSession[];
}

export function DashboardFocusHeatmap({
    sessions,
}: DashboardFocusHeatmapProps) {
    const heatmapData = useMemo(() => {
        const minutesByDate: Record<string, number> = {};
        sessions.forEach((s) => {
            if (s.completed) {
                minutesByDate[s.date] =
                    (minutesByDate[s.date] || 0) + s.actualMinutes;
            }
        });

        const days = [];
        let maxMinutes = 0;
        for (let i = 89; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateStr = format(date, "yyyy-MM-dd");
            const minutes = minutesByDate[dateStr] || 0;
            if (minutes > maxMinutes) maxMinutes = minutes;
            days.push({ date, dateStr, minutes });
        }
        return { days, maxMinutes };
    }, [sessions]);

    const getColor = (minutes: number) => {
        if (minutes === 0) return "bg-muted";
        const intensity = Math.min(
            minutes / Math.max(heatmapData.maxMinutes, 60),
            1,
        );
        if (intensity > 0.75) return "bg-primary";
        if (intensity > 0.5) return "bg-primary/75";
        if (intensity > 0.25) return "bg-primary/50";
        return "bg-primary/25";
    };

    const todayMinutes = useMemo(() => {
        const today = format(new Date(), "yyyy-MM-dd");
        return sessions
            .filter((s) => s.date === today && s.completed)
            .reduce((sum, s) => sum + s.actualMinutes, 0);
    }, [sessions]);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Timer className="w-4 h-4" /> Focus Time
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {todayMinutes}min today
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="grid grid-cols-[repeat(30,1fr)] gap-0.5">
                        {heatmapData.days.map((day) => (
                            <Tooltip key={day.dateStr}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={`aspect-square rounded-sm ${getColor(day.minutes)}`}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        {format(day.date, "MMM d")}:{" "}
                                        {day.minutes}min
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </TooltipProvider>
                <div className="flex items-center gap-2 mt-2 justify-end">
                    <span className="text-xs text-muted-foreground">Less</span>
                    <div className="w-3 h-3 rounded-sm bg-muted" />
                    <div className="w-3 h-3 rounded-sm bg-primary/25" />
                    <div className="w-3 h-3 rounded-sm bg-primary/50" />
                    <div className="w-3 h-3 rounded-sm bg-primary/75" />
                    <div className="w-3 h-3 rounded-sm bg-primary" />
                    <span className="text-xs text-muted-foreground">More</span>
                </div>
            </CardContent>
        </Card>
    );
}
