"use client";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Flame, Target } from "lucide-react";

interface HabitStatsProps {
    /** Current consecutive-day streak for the selected habit */
    streak: number;
    /** 30-day completion rate (%) for the selected habit */
    completionRate: number;
    /** Total number of logged completions for the selected habit */
    totalCompletions: number;
}

/** Displays per-habit statistics. All values are scoped to the currently selected habit. */
export function HabitStats({
    streak,
    completionRate,
    totalCompletions,
}: HabitStatsProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <Card>
                <CardContent className="p-3 text-center">
                    <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <p className="text-2xl font-bold">{streak}</p>
                    <p className="text-xs text-muted-foreground">
                        Current Streak
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-3 text-center">
                    <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">{completionRate}%</p>
                    <p className="text-xs text-muted-foreground">30-day Rate</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-3 text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-2xl font-bold">{totalCompletions}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                </CardContent>
            </Card>
        </div>
    );
}
