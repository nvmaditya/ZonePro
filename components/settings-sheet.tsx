"use client";

import type React from "react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Menu,
    Download,
    Upload,
    Check,
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
import { STORAGE_KEY } from "@/lib/constants";
import type { PomodoroSession } from "@/types";

interface SettingsSheetProps {
    settings: {
        autoMusicPause: boolean;
        defaultWorkTime: number;
        defaultBreakTime: number;
    };
    pomodoro: PomodoroSession;
    coursesCount: number;
    musicTracksCount: number;
    onUpdateSettings: (updates: any) => void;
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
    // Local state for all settings
    const [localSettings, setLocalSettings] = useState({
        workTime: pomodoro.workTime,
        breakTime: pomodoro.breakTime,
        totalSessions: pomodoro.totalSessions,
    });

    // State for save button feedback
    const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
        "idle",
    );

    // State for clear data confirmation dialog
    const [showClearDataDialog, setShowClearDataDialog] = useState(false);

    // Update local settings when props change
    useEffect(() => {
        setLocalSettings({
            workTime: pomodoro.workTime,
            breakTime: pomodoro.breakTime,
            totalSessions: pomodoro.totalSessions,
        });
    }, [pomodoro.workTime, pomodoro.breakTime, pomodoro.totalSessions]);

    const handleSaveAllSettings = async () => {
        setSaveState("saving");

        setTimeout(() => {
            // Update pomodoro settings only
            onUpdatePomodoro({
                workTime: localSettings.workTime,
                breakTime: localSettings.breakTime,
                totalSessions: localSettings.totalSessions,
                timeLeft: !pomodoro.isActive
                    ? localSettings.workTime * 60
                    : pomodoro.timeLeft,
            });

            setTimeout(() => {
                setSaveState("saved");
                setTimeout(() => {
                    setSaveState("idle");
                }, 2000);
            }, 300);
        }, 300);
    };

    const clearAllData = () => {
        // Clear all localStorage data
        localStorage.removeItem("zonepro-data");

        // Reload the page to reset all state
        window.location.reload();
    };

    const hasChanges =
        localSettings.workTime !== pomodoro.workTime ||
        localSettings.breakTime !== pomodoro.breakTime ||
        localSettings.totalSessions !== pomodoro.totalSessions;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription>
                        Configure your learning environment
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-4">
                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Pomodoro Settings
                        </h3>
                        <div>
                            <Label>Work Time (minutes)</Label>
                            <Slider
                                value={[localSettings.workTime]}
                                onValueChange={([value]) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        workTime: value,
                                    }))
                                }
                                max={60}
                                min={5}
                                step={5}
                                className="mt-2"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                {localSettings.workTime} minutes
                            </p>
                        </div>
                        <div>
                            <Label>Break Time (minutes)</Label>
                            <Slider
                                value={[localSettings.breakTime]}
                                onValueChange={([value]) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        breakTime: value,
                                    }))
                                }
                                max={30}
                                min={5}
                                step={5}
                                className="mt-2"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                {localSettings.breakTime} minutes
                            </p>
                        </div>
                        <div>
                            <Label>Total Sessions</Label>
                            <Slider
                                value={[localSettings.totalSessions]}
                                onValueChange={([value]) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        totalSessions: value,
                                    }))
                                }
                                max={8}
                                min={1}
                                step={1}
                                className="mt-2"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                {localSettings.totalSessions} sessions
                            </p>
                        </div>

                        {/* Redesigned Save Button - Grayish initially, black when changed */}
                        <div className="pt-2">
                            {hasChanges && saveState === "idle" && (
                                <p className="text-xs text-amber-600 mb-2 text-center font-medium">
                                    ● Unsaved changes
                                </p>
                            )}

                            <Button
                                onClick={handleSaveAllSettings}
                                className={`w-full transition-all duration-200 ${
                                    saveState === "saving"
                                        ? "bg-gray-700 hover:bg-gray-800"
                                        : saveState === "saved"
                                          ? "bg-green-600 hover:bg-green-700"
                                          : hasChanges
                                            ? "bg-gray-900 hover:bg-black shadow-md"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                                disabled={!hasChanges || saveState === "saving"}
                                variant="default"
                                size="default"
                            >
                                {saveState === "saving" ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Applying Changes...</span>
                                    </div>
                                ) : saveState === "saved" ? (
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        <span>Settings Saved!</span>
                                    </div>
                                ) : (
                                    <span className="font-medium">
                                        Save All Settings
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Session Management
                        </h3>
                        <p className="text-sm text-gray-600">
                            Export your complete learning session including all
                            courses, timestamps, music playlists, notes, and
                            settings. Import to resume exactly where you left
                            off.
                        </p>
                        <div className="flex gap-4">
                            {/* Redesigned Export Button - Grayish style */}
                            <Button
                                onClick={onExportSession}
                                className="flex-1 bg-gray-700 hover:bg-gray-900 transition-colors duration-200"
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
                                    className="w-full border-2 hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors duration-200"
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
                                className="w-full bg-red-600 hover:bg-red-700"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear All Data
                            </Button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                This will delete all your courses, notes, and
                                settings
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            Current Session Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-gray-100 rounded-lg border border-gray-200">
                                <div className="text-2xl font-bold text-gray-800">
                                    {coursesCount}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Total Courses
                                </div>
                            </div>
                            <div className="text-center p-4 bg-gray-100 rounded-lg border border-gray-200">
                                <div className="text-2xl font-bold text-gray-800">
                                    {musicTracksCount}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Music Tracks
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
                            <AlertTriangle className="h-5 w-5 text-red-500" />
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
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Yes, Delete Everything
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Sheet>
    );
}
