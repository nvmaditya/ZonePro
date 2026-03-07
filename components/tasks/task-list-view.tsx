"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { TaskItem } from "./task-item";
import type { Task, TaskStatus } from "@/types";
import { useState } from "react";

interface TaskListViewProps {
    tasks: Task[];
    onToggle: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
    onClick: (task: Task) => void;
    getSubtasks: (parentId: string) => Task[];
}

const STATUS_SECTIONS: { status: TaskStatus; label: string }[] = [
    { status: "todo", label: "To Do" },
    { status: "in_progress", label: "In Progress" },
    { status: "done", label: "Done" },
];

export function TaskListView({ tasks, onToggle, onUpdate, onDelete, onClick, getSubtasks }: TaskListViewProps) {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        todo: true,
        in_progress: true,
        done: false,
    });

    const toggleSection = (status: string) => {
        setOpenSections(prev => ({ ...prev, [status]: !prev[status] }));
    };

    return (
        <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-2">
                {STATUS_SECTIONS.map(({ status, label }) => {
                    const sectionTasks = tasks.filter(t => t.status === status);
                    return (
                        <Collapsible key={status} open={openSections[status]} onOpenChange={() => toggleSection(status)}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between px-3 py-2 h-auto">
                                    <span className="text-sm font-medium">
                                        {label} ({sectionTasks.length})
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections[status] ? "rotate-180" : ""}`} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="space-y-0.5 ml-2">
                                    {sectionTasks.length === 0 ? (
                                        <p className="text-xs text-muted-foreground py-2 px-3">No tasks</p>
                                    ) : (
                                        sectionTasks.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                subtaskCount={getSubtasks(task.id).length}
                                                onToggle={onToggle}
                                                onUpdate={onUpdate}
                                                onDelete={onDelete}
                                                onClick={onClick}
                                            />
                                        ))
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
