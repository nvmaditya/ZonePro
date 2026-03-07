"use client";

import {
    BookOpen,
    CheckSquare,
    Timer,
    Flame,
    FileText,
    BarChart3,
    Target,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
    { id: "learn", label: "Learn", icon: BookOpen },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "focus", label: "Focus", icon: Timer },
    { id: "habits", label: "Habits", icon: Flame },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "plan", label: "Plan", icon: Target },
];

interface AppSidebarProps {
    active: string;
    onNavigate: (section: string) => void;
}

export function AppSidebar({ active, onNavigate }: AppSidebarProps) {
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <span className="text-lg font-bold">ZonePro</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        isActive={active === item.id}
                                        onClick={() => onNavigate(item.id)}
                                        tooltip={item.label}
                                    >
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
