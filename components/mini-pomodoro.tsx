"use client";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Clock, Play, Pause } from "lucide-react";
import type { PomodoroSession } from "@/types";
import { formatTime } from "@/utils/youtube";
import { PomodoroTimer } from "@/components/pomodoro-timer";

interface MiniPomodoroProps {
    pomodoro: PomodoroSession;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onSkipToBreak: () => void;
    onSkipToWork: () => void;
    onSetMode: (mode: PomodoroSession["mode"]) => void;
    onSetTimerDuration: (seconds: number) => void;
}

export function MiniPomodoro({
    pomodoro,
    onStart,
    onPause,
    onReset,
    onSkipToBreak,
    onSkipToWork,
    onSetMode,
    onSetTimerDuration,
}: MiniPomodoroProps) {
    const mode = pomodoro.mode || "pomodoro";

    const isIdle =
        !pomodoro.isActive &&
        mode === "pomodoro" &&
        pomodoro.timeLeft === pomodoro.workTime * 60 &&
        (pomodoro.elapsed || 0) === 0;

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

    const trigger = isIdle ? (
        <button
            className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors cursor-pointer"
            title="Open Timer"
        >
            <Clock className="h-4 w-4 text-muted-foreground" />
        </button>
    ) : (
        <button className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2 py-1 hover:bg-muted transition-colors cursor-pointer">
            <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
            <span className="text-xs font-mono font-medium tabular-nums">
                {displayTime}
            </span>
            {pomodoro.isActive ? (
                <Pause className="h-3 w-3 shrink-0" />
            ) : (
                <Play className="h-3 w-3 shrink-0" />
            )}
        </button>
    );

    return (
        <Popover>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end" sideOffset={8}>
                <PomodoroTimer
                    pomodoro={pomodoro}
                    onStart={onStart}
                    onPause={onPause}
                    onReset={onReset}
                    onSkipToBreak={onSkipToBreak}
                    onSkipToWork={onSkipToWork}
                    onSetMode={onSetMode}
                    onSetTimerDuration={onSetTimerDuration}
                />
            </PopoverContent>
        </Popover>
    );
}
