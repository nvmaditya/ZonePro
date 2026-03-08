"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Clock,
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
    onSetMode: (mode: PomodoroSession["mode"]) => void;
    onSetTimerDuration: (seconds: number) => void;
}

export function PomodoroTimer({
    pomodoro,
    onStart,
    onPause,
    onReset,
    onSkipToBreak,
    onSkipToWork,
    onSetMode,
    onSetTimerDuration,
}: PomodoroTimerProps) {
    const mode = pomodoro.mode || "pomodoro";

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timer
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Mode Tabs */}
                <Tabs
                    value={mode}
                    onValueChange={(v) =>
                        onSetMode(v as PomodoroSession["mode"])
                    }
                >
                    <TabsList className="w-full">
                        <TabsTrigger
                            value="pomodoro"
                            className="flex-1 text-xs"
                        >
                            Pomodoro
                        </TabsTrigger>
                        <TabsTrigger value="timer" className="flex-1 text-xs">
                            Timer
                        </TabsTrigger>
                        <TabsTrigger
                            value="stopwatch"
                            className="flex-1 text-xs"
                        >
                            Stopwatch
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Pomodoro Mode */}
                {mode === "pomodoro" && (
                    <div className="space-y-3">
                        <div className="text-center">
                            <div className="text-4xl font-mono font-bold text-primary mb-2">
                                {formatTime(pomodoro.timeLeft)}
                            </div>
                            <Badge
                                variant={
                                    pomodoro.isBreak ? "secondary" : "default"
                                }
                            >
                                {pomodoro.isBreak ? "Break Time" : "Focus Time"}
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            {!pomodoro.isActive ? (
                                <Button onClick={onStart} className="flex-1">
                                    <Play className="w-4 h-4 mr-2" />
                                    Start
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
                            <Button onClick={onReset} variant="outline">
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
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
                    </div>
                )}

                {/* Timer Mode */}
                {mode === "timer" && (
                    <div className="space-y-3">
                        {!pomodoro.isActive &&
                            pomodoro.timeLeft ===
                                (pomodoro.timerDuration || 300) && (
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
                                {formatTime(pomodoro.timeLeft)}
                            </div>
                            <Badge variant="secondary">
                                <Timer className="w-3 h-3 mr-1" />
                                Countdown
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            {!pomodoro.isActive ? (
                                <Button onClick={onStart} className="flex-1">
                                    <Play className="w-4 h-4 mr-2" />
                                    Start
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
                            <Button onClick={onReset} variant="outline">
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Stopwatch Mode */}
                {mode === "stopwatch" && (
                    <div className="space-y-3">
                        <div className="text-center">
                            <div className="text-4xl font-mono font-bold text-primary mb-2">
                                {formatTime(pomodoro.elapsed || 0)}
                            </div>
                            <Badge variant="secondary">
                                <StopCircle className="w-3 h-3 mr-1" />
                                Stopwatch
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            {!pomodoro.isActive ? (
                                <Button onClick={onStart} className="flex-1">
                                    <Play className="w-4 h-4 mr-2" />
                                    Start
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
                            <Button onClick={onReset} variant="outline">
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
