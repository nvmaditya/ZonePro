"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Target, Plus, Trash2 } from "lucide-react";
import { useAppTasks } from "@/contexts/app-data-context";
import type { Goal } from "@/types";

interface PlanGoalsProps {
    goals: Goal[];
    onAdd: (data: { title: string; description?: string }) => void;
    onUpdate: (id: string, updates: Partial<Goal>) => void;
    onDelete: (id: string) => void;
    onAddMilestone: (goalId: string, title: string) => void;
    onToggleMilestone: (goalId: string, milestoneId: string) => void;
}

export function PlanGoals({
    goals,
    onAdd,
    onUpdate,
    onDelete,
    onAddMilestone,
    onToggleMilestone,
}: PlanGoalsProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [newMilestones, setNewMilestones] = useState<Record<string, string>>(
        {},
    );
    const { tasks } = useAppTasks();

    const taskNameMap = new Map(tasks.map((t) => [t.id, t.title]));

    const handleAdd = () => {
        if (title.trim()) {
            onAdd({
                title: title.trim(),
                description: description.trim() || undefined,
            });
            setTitle("");
            setDescription("");
            setDialogOpen(false);
        }
    };

    const handleAddMilestone = (goalId: string) => {
        const msTitle = newMilestones[goalId];
        if (msTitle?.trim()) {
            onAddMilestone(goalId, msTitle.trim());
            setNewMilestones((prev) => ({ ...prev, [goalId]: "" }));
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Target className="w-4 h-4" /> Goals
                    </span>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDialogOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Goal
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {goals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No goals yet. Set a goal to get started!
                    </p>
                ) : (
                    <Accordion type="multiple" className="space-y-2">
                        {goals.map((goal) => {
                            const total = goal.milestones.length;
                            const completed = goal.milestones.filter(
                                (m) => m.completed,
                            ).length;
                            const progress =
                                total > 0 ? (completed / total) * 100 : 0;
                            return (
                                <AccordionItem key={goal.id} value={goal.id}>
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-3 flex-1 text-left">
                                            <span className="text-sm font-medium">
                                                {goal.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {completed}/{total}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3 pt-2">
                                        {goal.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {goal.description}
                                            </p>
                                        )}
                                        <Progress
                                            value={progress}
                                            className="h-2"
                                        />
                                        <div className="space-y-1.5">
                                            {goal.milestones.map((ms) => (
                                                <div
                                                    key={ms.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Checkbox
                                                        checked={ms.completed}
                                                        onCheckedChange={() =>
                                                            onToggleMilestone(
                                                                goal.id,
                                                                ms.id,
                                                            )
                                                        }
                                                    />
                                                    <span
                                                        className={`text-sm ${ms.completed ? "line-through text-muted-foreground" : ""}`}
                                                    >
                                                        {ms.title}
                                                    </span>
                                                    {ms.linkedTaskIds &&
                                                        ms.linkedTaskIds
                                                            .length > 0 && (
                                                            <div className="flex gap-1 ml-1">
                                                                {ms.linkedTaskIds.map(
                                                                    (tid) => (
                                                                        <Badge
                                                                            key={
                                                                                tid
                                                                            }
                                                                            variant="outline"
                                                                            className="text-[10px] h-5"
                                                                        >
                                                                            {taskNameMap.get(
                                                                                tid,
                                                                            ) ||
                                                                                "Unknown task"}
                                                                        </Badge>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                value={
                                                    newMilestones[goal.id] || ""
                                                }
                                                onChange={(e) =>
                                                    setNewMilestones(
                                                        (prev) => ({
                                                            ...prev,
                                                            [goal.id]:
                                                                e.target.value,
                                                        }),
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" &&
                                                    handleAddMilestone(goal.id)
                                                }
                                                placeholder="Add milestone..."
                                                className="h-8 text-sm flex-1"
                                            />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleAddMilestone(goal.id)
                                                }
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => onDelete(goal.id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />{" "}
                                            Delete Goal
                                        </Button>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}
            </CardContent>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Goal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Learn React"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description (optional)</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What do you want to achieve?"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAdd} disabled={!title.trim()}>
                            Create Goal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
