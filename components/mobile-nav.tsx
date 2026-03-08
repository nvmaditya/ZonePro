"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { navItems } from "@/lib/nav-items";

interface MobileNavProps {
    active: string;
    onNavigate: (section: string) => void;
    trailing?: React.ReactNode;
}

export function MobileNav({ active, onNavigate, trailing }: MobileNavProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={() => setOpen(true)}
            >
                <Menu className="h-5 w-5" />
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl backdrop-blur-xl bg-background/80 border-t border-border/50"
                >
                    <SheetHeader>
                        <SheetTitle className="text-sm text-muted-foreground">
                            Navigation
                        </SheetTitle>
                    </SheetHeader>
                    <div className="grid grid-cols-4 gap-2 py-4">
                        {navItems.map((item) => (
                            <Button
                                key={item.id}
                                variant="ghost"
                                onClick={() => {
                                    onNavigate(item.id);
                                    setOpen(false);
                                }}
                                className={`flex flex-col items-center gap-1.5 h-auto py-3 rounded-xl ${
                                    active === item.id
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground"
                                }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-xs">{item.label}</span>
                            </Button>
                        ))}
                        {trailing && (
                            <div className="flex items-center justify-center">
                                {trailing}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
