"use client";
import { useEffect } from "react";

interface ShortcutHandlers {
    onCommandPalette: () => void;
    onQuickAddTask: () => void;
    onNavigate: (section: string) => void;
}

const SECTION_KEYS: Record<string, string> = {
    "1": "learn", "2": "tasks", "3": "focus", "4": "habits",
    "5": "notes", "6": "dashboard", "7": "plan",
};

export function useKeyboardShortcuts({ onCommandPalette, onQuickAddTask, onNavigate }: ShortcutHandlers) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Don't trigger in input/textarea
            const target = e.target as HTMLElement;
            const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

            // Ctrl/Cmd + K -> Command palette (works everywhere)
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                onCommandPalette();
                return;
            }

            // Ctrl/Cmd + N -> Quick add task (works everywhere)
            if ((e.metaKey || e.ctrlKey) && e.key === "n") {
                e.preventDefault();
                onQuickAddTask();
                return;
            }

            // Number keys for navigation (only when not in an input)
            if (!isInput && SECTION_KEYS[e.key]) {
                onNavigate(SECTION_KEYS[e.key]);
                return;
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onCommandPalette, onQuickAddTask, onNavigate]);
}
