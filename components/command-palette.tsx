"use client";
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
} from "@/components/ui/command";
import {
    BookOpen, CheckSquare, Timer, Flame, FileText, BarChart3, Target,
    Plus, Play, Search,
} from "lucide-react";

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onNavigate: (section: string) => void;
    onQuickAddTask: () => void;
}

const NAV_ITEMS = [
    { id: "learn", label: "Go to Learn", icon: BookOpen, shortcut: "1" },
    { id: "tasks", label: "Go to Tasks", icon: CheckSquare, shortcut: "2" },
    { id: "focus", label: "Go to Focus", icon: Timer, shortcut: "3" },
    { id: "habits", label: "Go to Habits", icon: Flame, shortcut: "4" },
    { id: "notes", label: "Go to Notes", icon: FileText, shortcut: "5" },
    { id: "dashboard", label: "Go to Dashboard", icon: BarChart3, shortcut: "6" },
    { id: "plan", label: "Go to Plan", icon: Target, shortcut: "7" },
];

export function CommandPalette({ open, onOpenChange, onNavigate, onQuickAddTask }: CommandPaletteProps) {
    const handleSelect = (action: string) => {
        onOpenChange(false);

        if (action.startsWith("nav:")) {
            onNavigate(action.replace("nav:", ""));
        } else if (action === "quick-add-task") {
            onQuickAddTask();
        }
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Actions">
                    <CommandItem onSelect={() => handleSelect("quick-add-task")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Task
                        <CommandShortcut>Ctrl+N</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Navigation">
                    {NAV_ITEMS.map(item => (
                        <CommandItem key={item.id} onSelect={() => handleSelect(`nav:${item.id}`)}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                            <CommandShortcut>{item.shortcut}</CommandShortcut>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
