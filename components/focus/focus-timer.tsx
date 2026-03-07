"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import type { Task } from "@/types";
import { format } from "date-fns";

interface FocusTimerProps {
    tasks: Task[];
    onSessionComplete: (session: {
        taskId?: string;
        type: "pomodoro";
        plannedMinutes: number;
        actualMinutes: number;
        completed: boolean;
        startedAt: string;
        endedAt: string;
        date: string;
    }) => void;
}

export function FocusTimer({ tasks, onSessionComplete }: FocusTimerProps) {
    const [workTime, setWorkTime] = useState(25);
    const [breakTime, setBreakTime] = useState(5);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [linkedTaskId, setLinkedTaskId] = useState<string>("");
    const [currentSession, setCurrentSession] = useState(0);
    const sessionStartRef = useRef<string>("");

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (isActive && timeLeft === 0) {
            if (!isBreak) {
                // Work session completed - record it
                const now = new Date().toISOString();
                onSessionComplete({
                    taskId: linkedTaskId || undefined,
                    type: "pomodoro",
                    plannedMinutes: workTime,
                    actualMinutes: workTime,
                    completed: true,
                    startedAt: sessionStartRef.current || now,
                    endedAt: now,
                    date: format(new Date(), "yyyy-MM-dd"),
                });
                setCurrentSession((prev) => prev + 1);
                setIsBreak(true);
                setTimeLeft(breakTime * 60);
            } else {
                setIsBreak(false);
                setTimeLeft(workTime * 60);
                setIsActive(false);
            }
        }
        return () => clearInterval(interval);
    }, [
        isActive,
        timeLeft,
        isBreak,
        workTime,
        breakTime,
        linkedTaskId,
        onSessionComplete,
    ]);

    const start = () => {
        if (!isActive) {
            sessionStartRef.current = new Date().toISOString();
        }
        setIsActive(true);
    };
    const pause = () => setIsActive(false);
    const reset = () => {
        setIsActive(false);
        setIsBreak(false);
        setTimeLeft(workTime * 60);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const activeTasks = tasks.filter(
        (t) => t.status !== "done" && t.status !== "cancelled",
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Timer className="w-5 h-5" />
                    Pomodoro Timer
                    <Badge
                        variant={isBreak ? "secondary" : "default"}
                        className="ml-auto"
                    >
                        {isBreak ? "Break" : "Focus"} · Session{" "}
                        {currentSession + 1}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Timer Display */}
                <div className="text-center">
                    <div className="text-5xl font-mono font-bold tabular-nums">
                        {String(minutes).padStart(2, "0")}:
                        {String(seconds).padStart(2, "0")}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-2">
                    {!isActive ? (
                        <Button onClick={start}>
                            <Play className="w-4 h-4 mr-2" />
                            Start
                        </Button>
                    ) : (
                        <Button onClick={pause} variant="secondary">
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                        </Button>
                    )}
                    <Button onClick={reset} variant="outline">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                </div>

                {/* Task Linking */}
                {activeTasks.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">
                            Working on:
                        </label>
                        <Select
                            value={linkedTaskId}
                            onValueChange={setLinkedTaskId}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select a task (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No task</SelectItem>
                                {activeTasks.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Time Settings */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div>
                        <label className="text-xs text-muted-foreground">
                            Work (min)
                        </label>
                        <Select
                            value={String(workTime)}
                            onValueChange={(v) => {
                                setWorkTime(Number(v));
                                if (!isActive) setTimeLeft(Number(v) * 60);
                            }}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[15, 20, 25, 30, 45, 60].map((m) => (
                                    <SelectItem key={m} value={String(m)}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">
                            Break (min)
                        </label>
                        <Select
                            value={String(breakTime)}
                            onValueChange={(v) => setBreakTime(Number(v))}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[3, 5, 10, 15].map((m) => (
                                    <SelectItem key={m} value={String(m)}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
