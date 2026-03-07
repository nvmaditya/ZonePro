"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, X } from "lucide-react";
import type { Task } from "@/types";

interface PlanDailyTop3Props {
    priorityTaskIds: string[];
    tasks: Task[];
    onUpdate: (taskIds: string[]) => void;
}

export function PlanDailyTop3({ priorityTaskIds, tasks, onUpdate }: PlanDailyTop3Props) {
    const [adding, setAdding] = useState(false);

    const priorityTasks = priorityTaskIds.map(id => tasks.find(t => t.id === id)).filter(Boolean) as Task[];
    const availableTasks = tasks.filter(t => t.status !== "done" && t.status !== "cancelled" && !priorityTaskIds.includes(t.id));

    const handleAdd = (taskId: string) => {
        if (priorityTaskIds.length < 3) {
            onUpdate([...priorityTaskIds, taskId]);
        }
        setAdding(false);
    };

    const handleRemove = (taskId: string) => {
        onUpdate(priorityTaskIds.filter(id => id !== taskId));
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" /> Today&apos;s Top 3
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {[0, 1, 2].map(i => {
                    const task = priorityTasks[i];
                    return (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
                            <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                                {i + 1}
                            </Badge>
                            {task ? (
                                <>
                                    <span className={`flex-1 text-sm ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                                        {task.title}
                                    </span>
                                    {task.estimatedMinutes && (
                                        <span className="text-xs text-muted-foreground">{task.estimatedMinutes}m</span>
                                    )}
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleRemove(task.id)}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </>
                            ) : (
                                <span className="flex-1 text-sm text-muted-foreground">Empty slot</span>
                            )}
                        </div>
                    );
                })}
                {priorityTaskIds.length < 3 && availableTasks.length > 0 && (
                    adding ? (
                        <Select onValueChange={handleAdd}>
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select a task..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTasks.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Button size="sm" variant="outline" className="w-full" onClick={() => setAdding(true)}>
                            Add Priority Task
                        </Button>
                    )
                )}
            </CardContent>
        </Card>
    );
}
