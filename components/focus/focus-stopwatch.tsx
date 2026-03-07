"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play, Square, Save } from "lucide-react";
import { format } from "date-fns";

interface FocusStopwatchProps {
    onSessionComplete: (session: {
        type: "stopwatch";
        plannedMinutes: number;
        actualMinutes: number;
        completed: boolean;
        startedAt: string;
        endedAt: string;
        date: string;
    }) => void;
}

export function FocusStopwatch({ onSessionComplete }: FocusStopwatchProps) {
    const [elapsed, setElapsed] = useState(0); // seconds
    const [isRunning, setIsRunning] = useState(false);
    const startTimeRef = useRef<string>("");

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => setElapsed((prev) => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const start = () => {
        if (!isRunning && elapsed === 0) {
            startTimeRef.current = new Date().toISOString();
        }
        setIsRunning(true);
    };

    const stop = () => setIsRunning(false);

    const save = () => {
        if (elapsed > 0) {
            const actualMinutes = Math.round(elapsed / 60);
            onSessionComplete({
                type: "stopwatch",
                plannedMinutes: 0,
                actualMinutes: Math.max(actualMinutes, 1),
                completed: true,
                startedAt: startTimeRef.current || new Date().toISOString(),
                endedAt: new Date().toISOString(),
                date: format(new Date(), "yyyy-MM-dd"),
            });
            setElapsed(0);
            setIsRunning(false);
        }
    };

    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="w-5 h-5" />
                    Stopwatch
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <div className="text-4xl font-mono font-bold tabular-nums">
                        {String(hours).padStart(2, "0")}:
                        {String(minutes).padStart(2, "0")}:
                        {String(seconds).padStart(2, "0")}
                    </div>
                </div>
                <div className="flex justify-center gap-2">
                    {!isRunning ? (
                        <Button onClick={start}>
                            <Play className="w-4 h-4 mr-2" />
                            Start
                        </Button>
                    ) : (
                        <Button onClick={stop} variant="secondary">
                            <Square className="w-4 h-4 mr-2" />
                            Stop
                        </Button>
                    )}
                    {elapsed > 0 && !isRunning && (
                        <Button onClick={save} variant="outline">
                            <Save className="w-4 h-4 mr-2" />
                            Save Session
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
