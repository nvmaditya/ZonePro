"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface TaskQuickAddProps {
    onAdd: (title: string) => void;
    autoFocus?: boolean;
    registerRef?: (ref: HTMLInputElement | null) => void;
}

export function TaskQuickAdd({
    onAdd,
    autoFocus,
    registerRef,
}: TaskQuickAddProps) {
    const [title, setTitle] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    useEffect(() => {
        if (registerRef) {
            registerRef(inputRef.current);
            return () => registerRef(null);
        }
    }, [registerRef]);

    const handleSubmit = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && title.trim()) {
            onAdd(title.trim());
            setTitle("");
        }
    };

    return (
        <div className="relative">
            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleSubmit}
                placeholder="Add a task... (press Enter)"
                className="pl-9"
            />
        </div>
    );
}
