"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface FocusDailyBudgetProps {
    todayMinutes: number;
    budgetMinutes: number;
}

export function FocusDailyBudget({
    todayMinutes,
    budgetMinutes,
}: FocusDailyBudgetProps) {
    const percentage =
        budgetMinutes > 0
            ? Math.min((todayMinutes / budgetMinutes) * 100, 100)
            : 0;
    const hours = Math.floor(todayMinutes / 60);
    const minutes = todayMinutes % 60;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="w-5 h-5" />
                    Today&apos;s Focus
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">
                        {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        / {Math.floor(budgetMinutes / 60)}h{" "}
                        {budgetMinutes % 60 > 0 ? `${budgetMinutes % 60}m` : ""}{" "}
                        goal
                    </span>
                </div>
                <Progress value={percentage} />
                <p className="text-xs text-muted-foreground">
                    {percentage >= 100
                        ? "Goal reached!"
                        : `${Math.round(percentage)}% of daily goal`}
                </p>
            </CardContent>
        </Card>
    );
}
