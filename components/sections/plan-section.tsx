"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { usePlanning } from "@/hooks/use-planning";
import { PlanDailyTop3 } from "@/components/plan/plan-daily-top3";
import { PlanGoals } from "@/components/plan/plan-goals";
import { PlanWeeklyReview } from "@/components/plan/plan-weekly-review";
import type { Task, FocusSession, HabitLog } from "@/types";

export function PlanSection() {
    const { value: tasks } = useLocalStorage<Task[]>("zonepro-tasks", []);
    const { value: sessions } = useLocalStorage<FocusSession[]>("zonepro-focus-sessions", []);
    const { value: habitLogs } = useLocalStorage<HabitLog[]>("zonepro-habit-logs", []);

    const {
        activeGoals, addGoal, updateGoal, deleteGoal, addMilestone, toggleMilestone,
        getTodayPriorities, setTodayPriorities,
    } = usePlanning();

    const priorityTaskIds = getTodayPriorities();

    return (
        <div className="space-y-6">
            <Tabs defaultValue="today">
                <TabsList>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="review">Weekly Review</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="mt-4">
                    <PlanDailyTop3
                        priorityTaskIds={priorityTaskIds}
                        tasks={tasks}
                        onUpdate={setTodayPriorities}
                    />
                </TabsContent>

                <TabsContent value="goals" className="mt-4">
                    <PlanGoals
                        goals={activeGoals}
                        onAdd={addGoal}
                        onUpdate={updateGoal}
                        onDelete={deleteGoal}
                        onAddMilestone={addMilestone}
                        onToggleMilestone={toggleMilestone}
                    />
                </TabsContent>

                <TabsContent value="review" className="mt-4">
                    <PlanWeeklyReview
                        tasks={tasks}
                        sessions={sessions}
                        habitLogs={habitLogs}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
