"use client";

import { Button } from "@/components/ui/button";
import { Clock, Play, Pause } from "lucide-react";
import type { PomodoroSession } from "@/types";
import { formatTime } from "@/utils/youtube";

interface MiniPomodoroProps {
    pomodoro: PomodoroSession;
    onStart: () => void;
    onPause: () => void;
}

export function MiniPomodoro({
    pomodoro,
    onStart,
    onPause,
}: MiniPomodoroProps) {
    const mode = pomodoro.mode || "pomodoro";

    const isIdle =
        !pomodoro.isActive &&
        mode === "pomodoro" &&
        pomodoro.timeLeft === pomodoro.workTime * 60 &&
        (pomodoro.elapsed || 0) === 0;

    // Collapsed state when idle -- just a clock icon
    if (isIdle) {
        return (
            <Button
                onClick={onStart}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                title="Start Pomodoro"
            >
                <Clock className="h-4 w-4 text-muted-foreground" />
            </Button>
        );
    }

    const dotColor = pomodoro.isActive
        ? mode === "stopwatch"
            ? "bg-orange-500 animate-pulse"
            : mode === "timer"
              ? "bg-purple-500 animate-pulse"
              : pomodoro.isBreak
                ? "bg-blue-500 animate-pulse"
                : "bg-green-500 animate-pulse"
        : "bg-muted-foreground";

    const displayTime =
        mode === "stopwatch"
            ? formatTime(pomodoro.elapsed || 0)
            : formatTime(pomodoro.timeLeft);

    return (
        <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2 py-1">
            <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
            <span className="text-xs font-mono font-medium tabular-nums">
                {displayTime}
            </span>
            <Button
                onClick={pomodoro.isActive ? onPause : onStart}
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
            >
                {pomodoro.isActive ? (
                    <Pause className="h-3 w-3" />
                ) : (
                    <Play className="h-3 w-3" />
                )}
            </Button>
        </div>
    );
}
