"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAppTasks, useAppData } from "@/contexts/app-data-context";
import { TaskQuickAdd } from "@/components/tasks/task-quick-add";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskKanbanView } from "@/components/tasks/task-kanban-view";
import { TaskCalendarView } from "@/components/tasks/task-calendar-view";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Task } from "@/types";

export function TasksSection() {
    const {
        tasks,
        filteredTasks,
        tasksByStatus,
        tasksByDate,
        filters,
        setFilters,
        sortBy,
        setSortBy,
        quickAddTask,
        addTask,
        updateTask,
        deleteTask,
        toggleStatus,
        moveTask,
        getSubtasks,
    } = useAppTasks();
    const { registerQuickAddRef } = useAppData();

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const selectedTask = selectedTaskId
        ? (tasks.find((t) => t.id === selectedTaskId) ?? null)
        : null;

    const handleTaskClick = (task: Task) => {
        setSelectedTaskId(task.id);
        setDetailOpen(true);
    };

    const handleAddSubtask = (title: string, parentId: string) => {
        addTask({ title, parentId });
    };

    return (
        <div className="space-y-4">
            {/* Quick Add */}
            <TaskQuickAdd onAdd={quickAddTask} autoFocus registerRef={registerQuickAddRef} />

            {/* Search & Sort */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={filters.search}
                        onChange={(e) =>
                            setFilters({ ...filters, search: e.target.value })
                        }
                        placeholder="Search tasks..."
                        className="pl-9"
                    />
                </div>
                <Select
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as typeof sortBy)}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="created">Newest</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Views */}
            <Tabs defaultValue="list">
                <TabsList>
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="kanban">Kanban</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-4">
                    <TaskListView
                        tasks={filteredTasks}
                        onToggle={toggleStatus}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                        onClick={handleTaskClick}
                        getSubtasks={getSubtasks}
                    />
                </TabsContent>

                <TabsContent value="kanban" className="mt-4">
                    <TaskKanbanView
                        tasksByStatus={tasksByStatus}
                        onToggle={toggleStatus}
                        onMove={moveTask}
                        onDelete={deleteTask}
                        onClick={handleTaskClick}
                    />
                </TabsContent>

                <TabsContent value="calendar" className="mt-4">
                    <TaskCalendarView
                        tasksByDate={tasksByDate}
                        onClick={handleTaskClick}
                        onToggle={toggleStatus}
                        onDelete={deleteTask}
                    />
                </TabsContent>
            </Tabs>

            {/* Task Detail Sheet */}
            <TaskDetailSheet
                task={selectedTask}
                open={detailOpen}
                onOpenChange={(open) => {
                    setDetailOpen(open);
                    if (!open) setSelectedTaskId(null);
                }}
                onUpdate={updateTask}
                onDelete={deleteTask}
                subtasks={selectedTask ? getSubtasks(selectedTask.id) : []}
                onAddSubtask={handleAddSubtask}
            />
        </div>
    );
}
