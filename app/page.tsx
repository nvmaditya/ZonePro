"use client";

import { useState, useCallback } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { CommandPalette } from "@/components/command-palette";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { LearnSection } from "@/components/sections/learn-section";
import { TasksSection } from "@/components/sections/tasks-section";
import { FocusSection } from "@/components/sections/focus-section";
import { HabitsSection } from "@/components/sections/habits-section";
import { NotesSection } from "@/components/sections/notes-section";
import { DashboardSection } from "@/components/sections/dashboard-section";
import { PlanSection } from "@/components/sections/plan-section";

const SECTION_TITLES: Record<string, string> = {
    learn: "Learn",
    tasks: "Tasks",
    focus: "Focus",
    habits: "Habits",
    notes: "Notes",
    dashboard: "Dashboard",
    plan: "Plan",
};

export default function ZoneProApp() {
    const [activeSection, setActiveSection] = useState("learn");
    const [commandOpen, setCommandOpen] = useState(false);

    const handleQuickAddTask = useCallback(() => {
        setActiveSection("tasks");
    }, []);

    useKeyboardShortcuts({
        onCommandPalette: () => setCommandOpen(true),
        onQuickAddTask: handleQuickAddTask,
        onNavigate: setActiveSection,
    });

    return (
        <SidebarProvider>
            <AppSidebar active={activeSection} onNavigate={setActiveSection} />
            <SidebarInset>
                <AppHeader title={SECTION_TITLES[activeSection] || "ZonePro"} />
                <main className="flex-1 p-4">
                    {activeSection === "learn" && <LearnSection />}
                    {activeSection === "tasks" && <TasksSection />}
                    {activeSection === "focus" && <FocusSection />}
                    {activeSection === "habits" && <HabitsSection />}
                    {activeSection === "notes" && <NotesSection />}
                    {activeSection === "dashboard" && <DashboardSection />}
                    {activeSection === "plan" && <PlanSection />}
                </main>
            </SidebarInset>

            <CommandPalette
                open={commandOpen}
                onOpenChange={setCommandOpen}
                onNavigate={(section) => { setActiveSection(section); setCommandOpen(false); }}
                onQuickAddTask={() => { handleQuickAddTask(); setCommandOpen(false); }}
            />
        </SidebarProvider>
    );
}
