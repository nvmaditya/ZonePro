"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Play,
    Pause,
    RotateCcw,
    SkipForward,
    Timer,
    StopCircle,
} from "lucide-react";
import type { PomodoroSession } from "@/types";
import { formatTime } from "@/utils/youtube";

interface PomodoroTimerProps {
    pomodoro: PomodoroSession;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onSkipToBreak: () => void;
    onSkipToWork: () => void;
    onSetViewMode: (mode: PomodoroSession["mode"]) => void;
    onSetTimerDuration: (seconds: number) => void;
}

export function PomodoroTimer({
    pomodoro,
    onStart,
    onPause,
    onReset,
    onSkipToBreak,
    onSkipToWork,
    onSetViewMode,
    onSetTimerDuration,
}: PomodoroTimerProps) {
    const viewMode = pomodoro.viewMode || pomodoro.mode || "pomodoro";
    const activeMode = pomodoro.mode || "pomodoro";
    const isViewingActiveMode = viewMode === activeMode;

    return (
        <div className="p-4 space-y-4">
            {/* Mode Tabs */}
            <Tabs
                value={viewMode}
                onValueChange={(v) =>
                    onSetViewMode(v as PomodoroSession["mode"])
                }
            >
                <TabsList className="w-full">
                    <TabsTrigger
                        value="pomodoro"
                        className="flex-1 text-xs"
                    >
                        Pomodoro
                        {activeMode === "pomodoro" && pomodoro.isActive && viewMode !== "pomodoro" && (
                            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="timer" className="flex-1 text-xs">
                        Timer
                        {activeMode === "timer" && pomodoro.isActive && viewMode !== "timer" && (
                            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="stopwatch"
                        className="flex-1 text-xs"
                    >
                        Stopwatch
                        {activeMode === "stopwatch" && pomodoro.isActive && viewMode !== "stopwatch" && (
                            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                        )}
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Active timer running in background notice */}
            {!isViewingActiveMode && pomodoro.isActive && (
                <div className="text-xs text-center text-muted-foreground bg-muted/50 rounded-md py-1.5 px-2">
                    {activeMode.charAt(0).toUpperCase() + activeMode.slice(1)} running ({
                        activeMode === "stopwatch"
                            ? formatTime(pomodoro.elapsed || 0)
                            : formatTime(pomodoro.timeLeft)
                    })
                </div>
            )}

            {/* Pomodoro Mode */}
            {viewMode === "pomodoro" && (
                <div className="space-y-3">
                    <div className="text-center">
                        <div className="text-4xl font-mono font-bold text-primary mb-2">
                            {isViewingActiveMode
                                ? formatTime(pomodoro.timeLeft)
                                : formatTime(pomodoro.workTime * 60)}
                        </div>
                        <Badge
                            variant={
                                isViewingActiveMode && pomodoro.isBreak ? "secondary" : "default"
                            }
                        >
                            {isViewingActiveMode && pomodoro.isBreak ? "Break Time" : "Focus Time"}
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        {!(isViewingActiveMode && pomodoro.isActive) ? (
                            <Button onClick={onStart} className="flex-1">
                                <Play className="w-4 h-4 mr-2" />
                                {!isViewingActiveMode && pomodoro.isActive ? "Switch & Start" : "Start"}
                            </Button>
                        ) : (
                            <Button
                                onClick={onPause}
                                variant="outline"
                                className="flex-1"
                            >
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                            </Button>
                        )}
                        <Button onClick={onReset} variant="outline" disabled={!isViewingActiveMode}>
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    </div>
                    {isViewingActiveMode && (
                        <>
                            <div className="flex gap-2 justify-center">
                                {!pomodoro.isBreak ? (
                                    <Button
                                        onClick={onSkipToBreak}
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs"
                                    >
                                        <SkipForward className="w-3 h-3 mr-1" />
                                        Skip to Break
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={onSkipToWork}
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs"
                                    >
                                        <SkipForward className="w-3 h-3 mr-1" />
                                        Skip to Work
                                    </Button>
                                )}
                            </div>
                            <div className="text-center text-sm text-muted-foreground">
                                Session {pomodoro.currentSession} of{" "}
                                {pomodoro.totalSessions}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Timer Mode */}
            {viewMode === "timer" && (
                <div className="space-y-3">
                    {(!isViewingActiveMode || (!pomodoro.isActive &&
                        pomodoro.timeLeft ===
                            (pomodoro.timerDuration || 300))) && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {[5, 10, 15, 30, 60].map((min) => (
                                <Button
                                    key={min}
                                    variant={
                                        (pomodoro.timerDuration ||
                                            300) ===
                                        min * 60
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        onSetTimerDuration(min * 60)
                                    }
                                >
                                    {min}m
                                </Button>
                            ))}
                        </div>
                    )}
                    <div className="text-center">
                        <div className="text-4xl font-mono font-bold text-primary mb-2">
                            {isViewingActiveMode
                                ? formatTime(pomodoro.timeLeft)
                                : formatTime(pomodoro.timerDuration || 300)}
                        </div>
                        <Badge variant="secondary">
                            <Timer className="w-3 h-3 mr-1" />
                            Countdown
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        {!(isViewingActiveMode && pomodoro.isActive) ? (
                            <Button onClick={onStart} className="flex-1">
                                <Play className="w-4 h-4 mr-2" />
                                {!isViewingActiveMode && pomodoro.isActive ? "Switch & Start" : "Start"}
                            </Button>
                        ) : (
                            <Button
                                onClick={onPause}
                                variant="outline"
                                className="flex-1"
                            >
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                            </Button>
                        )}
                        <Button onClick={onReset} variant="outline" disabled={!isViewingActiveMode}>
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Stopwatch Mode */}
            {viewMode === "stopwatch" && (
                <div className="space-y-3">
                    <div className="text-center">
                        <div className="text-4xl font-mono font-bold text-primary mb-2">
                            {isViewingActiveMode
                                ? formatTime(pomodoro.elapsed || 0)
                                : formatTime(0)}
                        </div>
                        <Badge variant="secondary">
                            <StopCircle className="w-3 h-3 mr-1" />
                            Stopwatch
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        {!(isViewingActiveMode && pomodoro.isActive) ? (
                            <Button onClick={onStart} className="flex-1">
                                <Play className="w-4 h-4 mr-2" />
                                {!isViewingActiveMode && pomodoro.isActive ? "Switch & Start" : "Start"}
                            </Button>
                        ) : (
                            <Button
                                onClick={onPause}
                                variant="outline"
                                className="flex-1"
                            >
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                            </Button>
                        )}
                        <Button onClick={onReset} variant="outline" disabled={!isViewingActiveMode}>
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
