"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Trash2,
    ArrowUp,
    ArrowDown,
    ArrowRight,
    Minus,
    Circle,
} from "lucide-react";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import { formatShortDate } from "@/lib/date-utils";

interface TaskItemProps {
    task: Task;
    subtaskCount?: number;
    onToggle: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
    onClick: (task: Task) => void;
}

const PRIORITY_CONFIG: Record<
    TaskPriority,
    { label: string; color: string; icon: React.ElementType }
> = {
    urgent: { label: "Urgent", color: "bg-red-500 text-white", icon: ArrowUp },
    high: { label: "High", color: "bg-orange-500 text-white", icon: ArrowUp },
    medium: { label: "Medium", color: "bg-yellow-500 text-white", icon: Minus },
    low: { label: "Low", color: "bg-blue-500 text-white", icon: ArrowDown },
    none: {
        label: "None",
        color: "bg-muted text-muted-foreground",
        icon: Circle,
    },
};

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" },
    { value: "cancelled", label: "Cancelled" },
];

export function TaskItem({
    task,
    subtaskCount,
    onToggle,
    onUpdate,
    onDelete,
    onClick,
}: TaskItemProps) {
    const isOverdue =
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== "done";

    return (
        <div
            className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onClick(task)}
        >
            <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={task.status === "done"}
                    onCheckedChange={() => onToggle(task.id)}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-sm ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                        {task.title}
                    </span>
                    {subtaskCount !== undefined && subtaskCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                            ({subtaskCount})
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    {task.priority !== "none" && (
                        <Badge
                            className={`text-xs px-1.5 py-0 ${PRIORITY_CONFIG[task.priority].color}`}
                        >
                            {PRIORITY_CONFIG[task.priority].label}
                        </Badge>
                    )}
                    {task.labels.map((label) => (
                        <Badge
                            key={label}
                            variant="outline"
                            className="text-xs px-1.5 py-0"
                        >
                            {label}
                        </Badge>
                    ))}
                    {task.dueDate && (
                        <span
                            className={`text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}
                        >
                            {formatShortDate(task.dueDate)}
                        </span>
                    )}
                </div>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {STATUS_OPTIONS.map((opt) => (
                                    <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() =>
                                            onUpdate(task.id, {
                                                status: opt.value,
                                                completedAt:
                                                    opt.value === "done"
                                                        ? new Date().toISOString()
                                                        : undefined,
                                            })
                                        }
                                    >
                                        {opt.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                Priority
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {(
                                    Object.keys(
                                        PRIORITY_CONFIG,
                                    ) as TaskPriority[]
                                ).map((p) => (
                                    <DropdownMenuItem
                                        key={p}
                                        onClick={() =>
                                            onUpdate(task.id, { priority: p })
                                        }
                                    >
                                        {PRIORITY_CONFIG[p].label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(task.id)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export { PRIORITY_CONFIG };
