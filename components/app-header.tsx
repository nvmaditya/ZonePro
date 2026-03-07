"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

interface AppHeaderProps {
    title: string;
    children?: React.ReactNode;
}

export function AppHeader({ title, children }: AppHeaderProps) {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">{title}</h1>
            <div className="ml-auto flex items-center gap-2">
                {children}
                <ThemeToggle />
                <UserMenu />
            </div>
        </header>
    );
}
