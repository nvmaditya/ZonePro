"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import type { Task } from "@/types";
import { PRIORITY_CONFIG } from "./task-item";

interface TaskCalendarViewProps {
    tasksByDate: Record<string, Task[]>;
    onClick: (task: Task) => void;
}

export function TaskCalendarView({ tasksByDate, onClick }: TaskCalendarViewProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
    const selectedTasks = selectedDateStr ? (tasksByDate[selectedDateStr] || []) : [];

    // Dates that have tasks
    const datesWithTasks = Object.keys(tasksByDate).map(d => new Date(d));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
                <CardContent className="p-4">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={{ hasTasks: datesWithTasks }}
                        modifiersStyles={{
                            hasTasks: {
                                fontWeight: "bold",
                                textDecoration: "underline",
                                textUnderlineOffset: "4px",
                            },
                        }}
                        className="rounded-md"
                    />
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-3">
                        {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                    </h3>
                    <ScrollArea className="h-[300px]">
                        {selectedTasks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No tasks due on this date</p>
                        ) : (
                            <div className="space-y-2">
                                {selectedTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                        onClick={() => onClick(task)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                                                {task.title}
                                            </span>
                                            {task.priority !== "none" && (
                                                <Badge className={`text-xs px-1 py-0 ${PRIORITY_CONFIG[task.priority].color}`}>
                                                    {PRIORITY_CONFIG[task.priority].label}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
