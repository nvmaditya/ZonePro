"use client";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { navItems } from "@/lib/nav-items";

interface FloatingNavProps {
    active: string;
    onNavigate: (section: string) => void;
    trailing?: React.ReactNode;
}

export function FloatingNav({
    active,
    onNavigate,
    trailing,
}: FloatingNavProps) {
    return (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-1 rounded-full px-2 py-1.5 border border-border/50 bg-background/60 backdrop-blur-xl shadow-lg shadow-black/5">
            <TooltipProvider delayDuration={200}>
                {navItems.map((item) => (
                    <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onNavigate(item.id)}
                                className={`h-9 w-9 rounded-full transition-colors ${
                                    active === item.id
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <item.icon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                            {item.label}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
            {trailing && (
                <>
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    {trailing}
                </>
            )}
        </nav>
    );
}
