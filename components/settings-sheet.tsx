"use client";

import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Settings,
    Download,
    Upload,
    Trash2,
    AlertTriangle,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ALL_STORAGE_KEYS, STORAGE_KEY } from "@/lib/constants";
import { useUserId } from "@/contexts/user-id-context";
import { useAppFocus } from "@/contexts/app-data-context";
import type { PomodoroSession, AppSettings } from "@/types";

interface SettingsSheetProps {
    settings: AppSettings;
    pomodoro: PomodoroSession;
    coursesCount: number;
    musicTracksCount: number;
    onUpdateSettings: (updates: Partial<AppSettings>) => void;
    onUpdatePomodoro: (updates: Partial<PomodoroSession>) => void;
    onExportSession: () => void;
    onImportSession: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SettingsSheet({
    settings,
    pomodoro,
    coursesCount,
    musicTracksCount,
    onUpdateSettings,
    onUpdatePomodoro,
    onExportSession,
    onImportSession,
}: SettingsSheetProps) {
    const { userId } = useUserId();
    const { sessions, getTodayMinutes } = useAppFocus();

    // Compute focus stats
    const todayFocusMinutes = getTodayMinutes();
    const totalSessionCount = sessions.length;
    const completedCount = sessions.filter((s) => s.completed).length;
    const completionRate = totalSessionCount > 0
        ? Math.round((completedCount / totalSessionCount) * 100)
        : 0;

    // State for clear data confirmation dialog
    const [showClearDataDialog, setShowClearDataDialog] = useState(false);

    const clearAllData = () => {
        // Clear all known localStorage keys (both unscoped and scoped)
        for (const key of ALL_STORAGE_KEYS) {
            localStorage.removeItem(key);
            if (userId) {
                localStorage.removeItem(`${key}::${userId}`);
            }
        }
        // Also clear the session key (scoped)
        if (userId) {
            localStorage.removeItem(`${STORAGE_KEY}::${userId}`);
        }
        // Reload the page to reset all state
        window.location.reload();
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto overflow-x-hidden sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription>
                        Configure your learning environment
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-4">
                    {/* General Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">General</h3>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="auto-music-pause">
                                Auto-pause music during breaks
                            </Label>
                            <Switch
                                id="auto-music-pause"
                                checked={settings.autoMusicPause}
                                onCheckedChange={(checked) =>
                                    onUpdateSettings({ autoMusicPause: checked })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Default View</Label>
                            <Select
                                value={settings.defaultView}
                                onValueChange={(v) =>
                                    onUpdateSettings({ defaultView: v })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="learn">Learn</SelectItem>
                                    <SelectItem value="tasks">Tasks</SelectItem>
                                    <SelectItem value="focus">Focus</SelectItem>
                                    <SelectItem value="habits">Habits</SelectItem>
                                    <SelectItem value="notes">Notes</SelectItem>
                                    <SelectItem value="dashboard">Dashboard</SelectItem>
                                    <SelectItem value="plan">Plan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Task Default View</Label>
                            <Select
                                value={settings.taskDefaultView}
                                onValueChange={(v) =>
                                    onUpdateSettings({
                                        taskDefaultView: v as "list" | "kanban" | "calendar",
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="list">List</SelectItem>
                                    <SelectItem value="kanban">Kanban</SelectItem>
                                    <SelectItem value="calendar">Calendar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Daily Focus Budget (minutes)</Label>
                            <Slider
                                value={[settings.dailyTimeBudgetMinutes]}
                                onValueChange={([value]) =>
                                    onUpdateSettings({ dailyTimeBudgetMinutes: value })
                                }
                                max={720}
                                min={60}
                                step={30}
                                className="mt-2"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                {Math.floor(settings.dailyTimeBudgetMinutes / 60)}h{" "}
                                {settings.dailyTimeBudgetMinutes % 60 > 0 &&
                                    `${settings.dailyTimeBudgetMinutes % 60}m`}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Week Starts On</Label>
                            <Select
                                value={String(settings.weekStartsOn)}
                                onValueChange={(v) =>
                                    onUpdateSettings({
                                        weekStartsOn: Number(v) as 0 | 1,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Sunday</SelectItem>
                                    <SelectItem value="1">Monday</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Pomodoro Settings
                        </h3>
                        <div>
                            <Label>Work Time (minutes)</Label>
                            <Slider
                                value={[pomodoro.workTime]}
                                onValueChange={([value]) =>
                                    onUpdatePomodoro({
                                        workTime: value,
                                        ...(!pomodoro.isActive ? { timeLeft: value * 60 } : {}),
                                    })
                                }
                                max={60}
                                min={5}
                                step={5}
                                className="mt-2"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                {pomodoro.workTime} minutes
                            </p>
                        </div>
                        <div>
                            <Label>Break Time (minutes)</Label>
                            <Slider
                                value={[pomodoro.breakTime]}
                                onValueChange={([value]) =>
                                    onUpdatePomodoro({ breakTime: value })
                                }
                                max={30}
                                min={5}
                                step={5}
                                className="mt-2"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                {pomodoro.breakTime} minutes
                            </p>
                        </div>
                        <div>
                            <Label>Total Sessions</Label>
                            <Slider
                                value={[pomodoro.totalSessions]}
                                onValueChange={([value]) =>
                                    onUpdatePomodoro({ totalSessions: value })
                                }
                                max={8}
                                min={1}
                                step={1}
                                className="mt-2"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                {pomodoro.totalSessions} sessions
                            </p>
                        </div>

                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Session Management
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Export your complete learning session including all
                            courses, timestamps, music playlists, notes, and
                            settings. Import to resume exactly where you left
                            off.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                onClick={onExportSession}
                                className="flex-1 bg-foreground/80 hover:bg-foreground transition-colors duration-200"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Session
                            </Button>
                            <div className="flex-1">
                                <Input
                                    type="file"
                                    accept=".json"
                                    onChange={onImportSession}
                                    className="hidden"
                                    id="import-session"
                                />
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full border-2 hover:bg-accent text-foreground transition-colors duration-200"
                                >
                                    <label
                                        htmlFor="import-session"
                                        className="cursor-pointer"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Import Session
                                    </label>
                                </Button>
                            </div>
                        </div>

                        {/* Clear All Data Button */}
                        <div className="pt-2">
                            <Button
                                onClick={() => setShowClearDataDialog(true)}
                                variant="destructive"
                                className="w-full bg-destructive hover:bg-destructive/90"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear All Data
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                This will delete all your courses, notes, and
                                settings
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-muted rounded-lg border border-border">
                                <div className="text-2xl font-bold text-foreground">
                                    {todayFocusMinutes}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Focus Min Today
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg border border-border">
                                <div className="text-2xl font-bold text-foreground">
                                    {totalSessionCount}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Total Sessions
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg border border-border">
                                <div className="text-2xl font-bold text-foreground">
                                    {completionRate}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Completion Rate
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg border border-border">
                                <div className="text-2xl font-bold text-foreground">
                                    {coursesCount}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Total Courses
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>

            {/* Clear Data Confirmation Dialog */}
            <AlertDialog
                open={showClearDataDialog}
                onOpenChange={setShowClearDataDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Clear All Application Data
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all your courses,
                            notes, music playlists, and settings. This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={clearAllData}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                            Yes, Delete Everything
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Sheet>
    );
}
