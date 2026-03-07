"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X, Plus } from "lucide-react";
import { format } from "date-fns";
import type { Task, TaskPriority, TaskStatus } from "@/types";

interface TaskDetailSheetProps {
    task: Task | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
    subtasks: Task[];
    onAddSubtask: (title: string, parentId: string) => void;
}

export function TaskDetailSheet({ task, open, onOpenChange, onUpdate, onDelete, subtasks, onAddSubtask }: TaskDetailSheetProps) {
    const [newLabel, setNewLabel] = useState("");
    const [newSubtask, setNewSubtask] = useState("");

    if (!task) return null;

    const handleAddLabel = () => {
        if (newLabel.trim() && !task.labels.includes(newLabel.trim())) {
            onUpdate(task.id, { labels: [...task.labels, newLabel.trim()] });
            setNewLabel("");
        }
    };

    const handleRemoveLabel = (label: string) => {
        onUpdate(task.id, { labels: task.labels.filter(l => l !== label) });
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            onAddSubtask(newSubtask.trim(), task.id);
            setNewSubtask("");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Task Details</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={task.title}
                            onChange={(e) => onUpdate(task.id, { title: e.target.value })}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={task.description || ""}
                            onChange={(e) => onUpdate(task.id, { description: e.target.value })}
                            placeholder="Add a description..."
                            className="min-h-[80px]"
                        />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={task.status}
                                onValueChange={(v) => onUpdate(task.id, {
                                    status: v as TaskStatus,
                                    completedAt: v === "done" ? new Date().toISOString() : undefined,
                                })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                                value={task.priority}
                                onValueChange={(v) => onUpdate(task.id, { priority: v as TaskPriority })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {task.dueDate ? format(new Date(task.dueDate), "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                        onSelect={(date) => onUpdate(task.id, { dueDate: date ? format(date, "yyyy-MM-dd") : undefined })}
                                    />
                                </PopoverContent>
                            </Popover>
                            {task.dueDate && (
                                <Button variant="ghost" size="icon" onClick={() => onUpdate(task.id, { dueDate: undefined })}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Estimated Time */}
                    <div className="space-y-2">
                        <Label>Estimated Time (minutes)</Label>
                        <Input
                            type="number"
                            value={task.estimatedMinutes || ""}
                            onChange={(e) => onUpdate(task.id, { estimatedMinutes: e.target.value ? parseInt(e.target.value) : undefined })}
                            placeholder="e.g., 30"
                        />
                    </div>

                    {/* Labels */}
                    <div className="space-y-2">
                        <Label>Labels</Label>
                        <div className="flex flex-wrap gap-1 mb-2">
                            {task.labels.map(label => (
                                <Badge key={label} variant="secondary" className="gap-1">
                                    {label}
                                    <button onClick={() => handleRemoveLabel(label)}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddLabel()}
                                placeholder="Add label..."
                                className="flex-1"
                            />
                            <Button size="sm" variant="outline" onClick={handleAddLabel}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Subtasks */}
                    <div className="space-y-2">
                        <Label>Subtasks ({subtasks.length})</Label>
                        <div className="space-y-1">
                            {subtasks.map(st => (
                                <div key={st.id} className="flex items-center gap-2 py-1">
                                    <input
                                        type="checkbox"
                                        checked={st.status === "done"}
                                        onChange={() => onUpdate(st.id, {
                                            status: st.status === "done" ? "todo" : "done",
                                            completedAt: st.status === "done" ? undefined : new Date().toISOString(),
                                        })}
                                        className="rounded"
                                    />
                                    <span className={`text-sm ${st.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                                        {st.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                                placeholder="Add subtask..."
                                className="flex-1"
                            />
                            <Button size="sm" variant="outline" onClick={handleAddSubtask}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Delete */}
                    <div className="pt-4 border-t">
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => { onDelete(task.id); onOpenChange(false); }}
                        >
                            Delete Task
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
