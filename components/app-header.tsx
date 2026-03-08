"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

interface AppHeaderProps {
    title: string;
    children?: React.ReactNode;
    mobileNav?: React.ReactNode;
}

export function AppHeader({ title, children, mobileNav }: AppHeaderProps) {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
            {mobileNav}
            <span className="text-lg font-bold tracking-tight shrink-0">
                <span className="text-primary">Zone</span>
                <span className="text-muted-foreground">Pro</span>
            </span>
            <span className="text-muted-foreground text-sm hidden sm:inline">/</span>
            <h1 className="text-sm font-medium text-muted-foreground hidden sm:block">{title}</h1>
            <div className="ml-auto flex items-center gap-2">
                {children}
                <ThemeToggle />
                <UserMenu />
            </div>
        </header>
    );
}
