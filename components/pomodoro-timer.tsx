"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    onSetWorkTime?: (minutes: number) => void;
    onSetBreakTime?: (minutes: number) => void;
    variant?: "compact" | "full";
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
    onSetWorkTime,
    onSetBreakTime,
    variant = "compact",
}: PomodoroTimerProps) {
    const viewMode = pomodoro.viewMode || pomodoro.mode || "pomodoro";
    const activeMode = pomodoro.mode || "pomodoro";
    const isViewingActiveMode = viewMode === activeMode;

    const [showCustomTimer, setShowCustomTimer] = useState(false);
    const [customTimerMin, setCustomTimerMin] = useState("");

    // --- Mode tabs ---
    const modeTabs = (
        <Tabs
            value={viewMode}
            onValueChange={(v) =>
                onSetViewMode(v as PomodoroSession["mode"])
            }
        >
            <TabsList className="w-full">
                <TabsTrigger
                    value="pomodoro"
                    className={variant === "full" ? "flex-1 text-sm py-2" : "flex-1 text-xs"}
                >
                    Pomodoro
                    {activeMode === "pomodoro" && pomodoro.isActive && viewMode !== "pomodoro" && (
                        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    )}
                </TabsTrigger>
                <TabsTrigger
                    value="timer"
                    className={variant === "full" ? "flex-1 text-sm py-2" : "flex-1 text-xs"}
                >
                    Timer
                    {activeMode === "timer" && pomodoro.isActive && viewMode !== "timer" && (
                        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                    )}
                </TabsTrigger>
                <TabsTrigger
                    value="stopwatch"
                    className={variant === "full" ? "flex-1 text-sm py-2" : "flex-1 text-xs"}
                >
                    Stopwatch
                    {activeMode === "stopwatch" && pomodoro.isActive && viewMode !== "stopwatch" && (
                        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                    )}
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );

    const backgroundNotice = !isViewingActiveMode && pomodoro.isActive && (
        <div className="text-xs text-center text-muted-foreground bg-muted/50 rounded-md py-1.5 px-2">
            {activeMode.charAt(0).toUpperCase() + activeMode.slice(1)} running ({
                activeMode === "stopwatch"
                    ? formatTime(pomodoro.elapsed || 0)
                    : formatTime(pomodoro.timeLeft)
            })
        </div>
    );

    // --- Timer presets + custom ---
    const timerPresets = (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 justify-center">
                {[5, 10, 15, 30, 60].map((min) => (
                    <Button
                        key={min}
                        variant={
                            (pomodoro.timerDuration || 300) === min * 60
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() => onSetTimerDuration(min * 60)}
                    >
                        {min}m
                    </Button>
                ))}
                <Button
                    variant={showCustomTimer ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowCustomTimer(!showCustomTimer)}
                >
                    Custom
                </Button>
            </div>
            {showCustomTimer && (
                <div className="flex items-center gap-2 justify-center">
                    <Input
                        type="number"
                        min={1}
                        max={180}
                        placeholder="Min"
                        value={customTimerMin}
                        onChange={(e) => setCustomTimerMin(e.target.value)}
                        className="w-20 h-8 text-center text-sm"
                    />
                    <Button
                        size="sm"
                        disabled={!customTimerMin || Number(customTimerMin) < 1}
                        onClick={() => {
                            onSetTimerDuration(Math.min(180, Math.max(1, Number(customTimerMin))) * 60);
                            setShowCustomTimer(false);
                            setCustomTimerMin("");
                        }}
                    >
                        Set
                    </Button>
                </div>
            )}
        </div>
    );

    // --- Pomodoro custom work/break inputs ---
    const pomodoroCustomInputs = (onSetWorkTime || onSetBreakTime) && (
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {onSetWorkTime && (
                <div className="flex items-center gap-1">
                    <span>Work:</span>
                    <Input
                        type="number"
                        min={1}
                        max={120}
                        value={pomodoro.workTime}
                        onChange={(e) => {
                            const val = Math.max(1, Math.min(120, Number(e.target.value) || 1));
                            onSetWorkTime(val);
                        }}
                        className="w-14 h-6 text-center text-xs p-1"
                        disabled={isViewingActiveMode && pomodoro.isActive && !pomodoro.isBreak}
                    />
                    <span>min</span>
                </div>
            )}
            {onSetBreakTime && (
                <div className="flex items-center gap-1">
                    <span>Break:</span>
                    <Input
                        type="number"
                        min={1}
                        max={60}
                        value={pomodoro.breakTime}
                        onChange={(e) => {
                            const val = Math.max(1, Math.min(60, Number(e.target.value) || 1));
                            onSetBreakTime(val);
                        }}
                        className="w-14 h-6 text-center text-xs p-1"
                        disabled={isViewingActiveMode && pomodoro.isActive && pomodoro.isBreak}
                    />
                    <span>min</span>
                </div>
            )}
        </div>
    );

    // --- Timer display ---
    const timerDisplay = (
        <div className="text-center">
            <div className={`font-mono font-bold text-primary mb-2 ${variant === "full" ? "text-4xl" : "text-3xl"}`}>
                {viewMode === "stopwatch"
                    ? formatTime(isViewingActiveMode ? (pomodoro.elapsed || 0) : 0)
                    : viewMode === "timer"
                      ? formatTime(isViewingActiveMode ? pomodoro.timeLeft : (pomodoro.timerDuration || 300))
                      : formatTime(isViewingActiveMode ? pomodoro.timeLeft : pomodoro.workTime * 60)}
            </div>
            <Badge variant={viewMode === "pomodoro" && isViewingActiveMode && pomodoro.isBreak ? "secondary" : viewMode === "pomodoro" ? "default" : "secondary"}>
                {viewMode === "pomodoro"
                    ? (isViewingActiveMode && pomodoro.isBreak ? "Break Time" : "Focus Time")
                    : viewMode === "timer"
                      ? (<><Timer className="w-3 h-3 mr-1" />Countdown</>)
                      : (<><StopCircle className="w-3 h-3 mr-1" />Stopwatch</>)}
            </Badge>
        </div>
    );

    // --- Control buttons ---
    const controls = (
        <div className="space-y-3">
            <div className="flex gap-2 justify-center">
                {!(isViewingActiveMode && pomodoro.isActive) ? (
                    <Button onClick={onStart} className="flex-1 max-w-48">
                        <Play className="w-4 h-4 mr-2" />
                        {!isViewingActiveMode && pomodoro.isActive ? "Switch & Start" : "Start"}
                    </Button>
                ) : (
                    <Button onClick={onPause} variant="outline" className="flex-1 max-w-48">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                    </Button>
                )}
                <Button onClick={onReset} variant="outline" disabled={!isViewingActiveMode}>
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </div>
            {viewMode === "pomodoro" && isViewingActiveMode && (
                <>
                    <div className="flex gap-2 justify-center">
                        {!pomodoro.isBreak ? (
                            <Button onClick={onSkipToBreak} variant="ghost" size="sm" className="text-xs">
                                <SkipForward className="w-3 h-3 mr-1" />
                                Skip to Break
                            </Button>
                        ) : (
                            <Button onClick={onSkipToWork} variant="ghost" size="sm" className="text-xs">
                                <SkipForward className="w-3 h-3 mr-1" />
                                Skip to Work
                            </Button>
                        )}
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        Session {pomodoro.currentSession} of {pomodoro.totalSessions}
                    </div>
                </>
            )}
        </div>
    );

    // --- Full variant: single centered column, max-width constrained ---
    if (variant === "full") {
        return (
            <div className="p-6 flex justify-center">
                <div className="w-full max-w-md space-y-5">
                    {modeTabs}
                    {backgroundNotice}
                    {viewMode === "pomodoro" && pomodoroCustomInputs}
                    {viewMode === "timer" && (!isViewingActiveMode || (!pomodoro.isActive &&
                        pomodoro.timeLeft === (pomodoro.timerDuration || 300))) && timerPresets}
                    {timerDisplay}
                    {controls}
                </div>
            </div>
        );
    }

    // --- Compact variant: single column (popover) ---
    return (
        <div className="p-4 space-y-4">
            {modeTabs}
            {backgroundNotice}
            {viewMode === "timer" && (!isViewingActiveMode || (!pomodoro.isActive &&
                pomodoro.timeLeft === (pomodoro.timerDuration || 300))) && timerPresets}
            {timerDisplay}
            {controls}
            {viewMode === "pomodoro" && pomodoroCustomInputs}
        </div>
    );
}
