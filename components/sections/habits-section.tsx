"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Flame } from "lucide-react";
import { useAppHabits } from "@/contexts/app-data-context";
import { HabitList } from "@/components/habits/habit-list";
import { HabitDotGrid } from "@/components/habits/habit-dot-grid";
import { HabitDetailDialog } from "@/components/habits/habit-detail-dialog";
import { HabitStats } from "@/components/habits/habit-stats";
import type { Habit } from "@/types";

export function HabitsSection() {
    const {
        activeHabits,
        habitLogs,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleCompletion,
        getCompletionForDate,
        getStreak,
        getCompletionRate,
        getTodayHabits,
    } = useAppHabits();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

    const todayHabits = getTodayHabits();

    const streaks = useMemo(() => {
        const map: Record<string, number> = {};
        activeHabits.forEach((h) => {
            map[h.id] = getStreak(h.id);
        });
        return map;
    }, [activeHabits, getStreak]);

    const selectedHabit = activeHabits.find((h) => h.id === selectedHabitId);

    const handleSave = (data: Partial<Habit> & { title: string }) => {
        if (editingHabit) {
            updateHabit(editingHabit.id, data);
        } else {
            addHabit(data);
        }
        setEditingHabit(null);
    };

    const handleHabitClick = (habitId: string) => {
        setSelectedHabitId(selectedHabitId === habitId ? null : habitId);
    };

    const totalCompletions = selectedHabitId
        ? habitLogs.filter((l) => l.habitId === selectedHabitId && l.count > 0)
              .length
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Flame className="w-5 h-5" />
                    Today&apos;s Habits
                </h2>
                <Button
                    size="sm"
                    onClick={() => {
                        setEditingHabit(null);
                        setDialogOpen(true);
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Habit
                </Button>
            </div>

            {/* Today's habits */}
            <HabitList
                habits={todayHabits}
                streaks={streaks}
                onToggle={toggleCompletion}
                onClick={handleHabitClick}
            />

            {/* Selected habit details */}
            {selectedHabit && (
                <div className="space-y-4">
                    <HabitStats
                        streak={streaks[selectedHabit.id] || 0}
                        completionRate={getCompletionRate(selectedHabit.id)}
                        totalCompletions={totalCompletions}
                    />
                    <HabitDotGrid
                        habitId={selectedHabit.id}
                        habitTitle={selectedHabit.title}
                        habitColor={selectedHabit.color}
                        getCompletion={getCompletionForDate}
                        targetCount={selectedHabit.targetCount}
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setEditingHabit(selectedHabit);
                                setDialogOpen(true);
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                                deleteHabit(selectedHabit.id);
                                setSelectedHabitId(null);
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            )}

            {/* Dot grids for all habits */}
            {!selectedHabitId && activeHabits.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                        30-Day Overview
                    </h3>
                    {activeHabits.map((habit) => (
                        <HabitDotGrid
                            key={habit.id}
                            habitId={habit.id}
                            habitTitle={habit.title}
                            habitColor={habit.color}
                            getCompletion={getCompletionForDate}
                            targetCount={habit.targetCount}
                        />
                    ))}
                </div>
            )}

            {/* Dialog */}
            <HabitDetailDialog
                habit={editingHabit}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSave={handleSave}
            />
        </div>
    );
}
