"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CourseProgress, AppSettings } from "@/types";
import type { SyncStatus } from "@/hooks/use-cloud-sync";

export interface LearnContextValue {
    isYTReady: boolean;
    courses: CourseProgress[];
    currentCourse: CourseProgress | null;
    setCurrentCourse: (course: CourseProgress | null) => void;
    newCourseUrl: string;
    setNewCourseUrl: (url: string) => void;
    newCourseTitle: string;
    setNewCourseTitle: (title: string) => void;
    showAddCourse: boolean;
    setShowAddCourse: (open: boolean) => void;
    addCourse: () => void;
    selectCourse: (course: CourseProgress) => void;
    updateCourse: (courseId: string, updates: Partial<CourseProgress>) => void;
    deleteCourse: (courseId: string) => void;
    settings: AppSettings;
    handleMusicControl: (action: "pause" | "play") => void;
    musicWasPlaying: boolean;
    setMusicWasPlaying: (v: boolean) => void;
    syncStatus: SyncStatus;
}

const LearnContext = createContext<LearnContextValue | null>(null);

export function LearnProvider({
    value,
    children,
}: {
    value: LearnContextValue;
    children: ReactNode;
}) {
    return (
        <LearnContext.Provider value={value}>{children}</LearnContext.Provider>
    );
}

export function useLearn() {
    const ctx = useContext(LearnContext);
    if (!ctx) throw new Error("useLearn must be used within LearnProvider");
    return ctx;
}
