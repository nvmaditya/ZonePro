"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import type { Task, FocusSession, HabitLog } from "@/types";

interface PlanWeeklyReviewProps {
    tasks: Task[];
    sessions: FocusSession[];
    habitLogs: HabitLog[];
}

export function PlanWeeklyReview({ tasks, sessions, habitLogs }: PlanWeeklyReviewProps) {
    const [step, setStep] = useState(0);

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, "yyyy-MM-dd");
    const weekEndStr = format(weekEnd, "yyyy-MM-dd");

    const weekTasks = useMemo(() => tasks.filter(t => {
        if (t.completedAt) {
            const d = t.completedAt.substring(0, 10);
            return d >= weekStartStr && d <= weekEndStr;
        }
        return false;
    }), [tasks, weekStartStr, weekEndStr]);

    const weekFocusMinutes = useMemo(() =>
        sessions.filter(s => s.date >= weekStartStr && s.date <= weekEndStr && s.completed)
            .reduce((sum, s) => sum + s.actualMinutes, 0),
    [sessions, weekStartStr, weekEndStr]);

    const incompleteTasks = useMemo(() =>
        tasks.filter(t => t.status !== "done" && t.status !== "cancelled" && t.dueDate && t.dueDate <= weekEndStr),
    [tasks, weekEndStr]);

    const steps = [
        {
            title: "What went well?",
            content: (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">{weekTasks.length} tasks completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">{Math.round(weekFocusMinutes / 60)}h {weekFocusMinutes % 60}m focused</span>
                    </div>
                    {weekTasks.length > 0 && (
                        <div className="space-y-1 mt-2">
                            <p className="text-xs text-muted-foreground font-medium">Completed:</p>
                            {weekTasks.slice(0, 10).map(t => (
                                <p key={t.id} className="text-sm text-muted-foreground">&bull; {t.title}</p>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "What needs work?",
            content: (
                <div className="space-y-3">
                    {incompleteTasks.length > 0 ? (
                        <>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                <span className="font-medium">{incompleteTasks.length} overdue/pending tasks</span>
                            </div>
                            <div className="space-y-1">
                                {incompleteTasks.slice(0, 10).map(t => (
                                    <p key={t.id} className="text-sm text-muted-foreground">&bull; {t.title}</p>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">Great work! No overdue tasks.</p>
                    )}
                </div>
            ),
        },
        {
            title: "Plan next week",
            content: (
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Review the above and set your priorities for next week using the &quot;Today&quot; tab and Goals section.
                    </p>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">Tip</Badge>
                        <span className="text-sm">Set your Top 3 priorities for Monday</span>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Weekly Review
                    <Badge variant="outline" className="ml-auto text-xs">
                        {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Step indicator */}
                <div className="flex gap-1">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
                    ))}
                </div>

                <h3 className="font-semibold">{steps[step].title}</h3>
                {steps[step].content}

                <div className="flex justify-between pt-2">
                    <Button size="sm" variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button size="sm" onClick={() => setStep(s => s + 1)} disabled={step === steps.length - 1}>
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
