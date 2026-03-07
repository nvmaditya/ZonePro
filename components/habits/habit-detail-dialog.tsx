"use client";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Habit } from "@/types";

interface HabitDetailDialogProps {
    habit?: Habit | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: Partial<Habit> & { title: string }) => void;
}

const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#f97316",
];

export function HabitDetailDialog({
    habit,
    open,
    onOpenChange,
    onSave,
}: HabitDetailDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">(
        "daily",
    );
    const [targetCount, setTargetCount] = useState(1);
    const [color, setColor] = useState("#3b82f6");

    useEffect(() => {
        if (habit) {
            setTitle(habit.title);
            setDescription(habit.description || "");
            setFrequency(habit.frequency);
            setTargetCount(habit.targetCount);
            setColor(habit.color);
        } else {
            setTitle("");
            setDescription("");
            setFrequency("daily");
            setTargetCount(1);
            setColor("#3b82f6");
        }
    }, [habit, open]);

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({
            title: title.trim(),
            description: description.trim() || undefined,
            frequency,
            targetCount,
            color,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {habit ? "Edit Habit" : "New Habit"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Meditate"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description (optional)</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What does this habit involve?"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Select
                                value={frequency}
                                onValueChange={(v) =>
                                    setFrequency(v as typeof frequency)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">
                                        Weekly
                                    </SelectItem>
                                    <SelectItem value="custom">
                                        Custom
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Target (times/day)</Label>
                            <Input
                                type="number"
                                min={1}
                                value={targetCount}
                                onChange={(e) =>
                                    setTargetCount(
                                        Math.max(
                                            1,
                                            parseInt(e.target.value) || 1,
                                        ),
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!title.trim()}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
