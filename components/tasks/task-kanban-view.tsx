"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { Task, TaskStatus } from "@/types";
import { PRIORITY_CONFIG } from "./task-item";
import { formatShortDate } from "@/lib/date-utils";

interface TaskKanbanViewProps {
    tasksByStatus: Record<string, Task[]>;
    onToggle: (id: string) => void;
    onMove: (id: string, status: TaskStatus) => void;
    onDelete: (id: string) => void;
    onClick: (task: Task) => void;
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
    { status: "todo", label: "To Do", color: "bg-muted" },
    { status: "in_progress", label: "In Progress", color: "bg-primary/10" },
    { status: "done", label: "Done", color: "bg-green-500/10" },
];

export function TaskKanbanView({ tasksByStatus, onToggle, onMove, onDelete, onClick }: TaskKanbanViewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map(({ status, label, color }) => (
                <div key={status} className={`rounded-lg ${color} p-3`}>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        {label}
                        <Badge variant="secondary" className="text-xs">
                            {(tasksByStatus[status] || []).length}
                        </Badge>
                    </h3>
                    <ScrollArea className="h-[calc(100vh-20rem)]">
                        <div className="space-y-2">
                            {(tasksByStatus[status] || []).map(task => (
                                <ContextMenu key={task.id}>
                                    <ContextMenuTrigger>
                                        <Card
                                            className="cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => onClick(task)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-2">
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <Checkbox
                                                            checked={task.status === "done"}
                                                            onCheckedChange={() => onToggle(task.id)}
                                                            className="mt-0.5"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                                                            {task.title}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                                            {task.priority !== "none" && (
                                                                <Badge className={`text-xs px-1 py-0 ${PRIORITY_CONFIG[task.priority].color}`}>
                                                                    {PRIORITY_CONFIG[task.priority].label}
                                                                </Badge>
                                                            )}
                                                            {task.labels.map(label => (
                                                                <Badge key={label} variant="outline" className="text-xs px-1 py-0">
                                                                    {label}
                                                                </Badge>
                                                            ))}
                                                            {task.dueDate && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatShortDate(task.dueDate)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent>
                                        {COLUMNS.filter(c => c.status !== status).map(c => (
                                            <ContextMenuItem key={c.status} onClick={() => onMove(task.id, c.status)}>
                                                Move to {c.label}
                                            </ContextMenuItem>
                                        ))}
                                        <ContextMenuItem
                                            className="text-destructive"
                                            onClick={() => onDelete(task.id)}
                                        >
                                            Delete
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            ))}
        </div>
    );
}
