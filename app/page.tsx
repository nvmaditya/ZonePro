"use client";

import { useState, useCallback, useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { FloatingNav } from "@/components/floating-nav";
import { MobileNav } from "@/components/mobile-nav";
import { MiniMusicPlayer } from "@/components/mini-music-player";
import { MiniPomodoro } from "@/components/mini-pomodoro";
import { CommandPalette } from "@/components/command-palette";
import { SettingsSheet } from "@/components/settings-sheet";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useYouTubeAPI } from "@/hooks/use-youtube-api";
import { useCourses } from "@/hooks/use-courses";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { useMusicPlayerEngine } from "@/hooks/use-music-player-engine";
import { useSessionPersistence } from "@/hooks/use-session-persistence";
import { useCloudSync } from "@/hooks/use-cloud-sync";
import { AppDataProvider } from "@/contexts/app-data-context";
import { LearnProvider } from "@/contexts/learn-context";
import { UserIdProvider } from "@/contexts/user-id-context";
import { DEFAULT_APP_SETTINGS } from "@/lib/constants";
import type { AppSettings } from "@/types";
import { LearnSection } from "@/components/sections/learn-section";
import { TasksSection } from "@/components/sections/tasks-section";
import { FocusSection } from "@/components/sections/focus-section";
import { HabitsSection } from "@/components/sections/habits-section";
import { NotesSection } from "@/components/sections/notes-section";
import { DashboardSection } from "@/components/sections/dashboard-section";
import { PlanSection } from "@/components/sections/plan-section";

const SECTION_TITLES: Record<string, string> = {
    learn: "Learn",
    tasks: "Tasks",
    focus: "Focus",
    habits: "Habits",
    notes: "Notes",
    dashboard: "Dashboard",
    plan: "Plan",
};

export default function ZoneProApp() {
    const [activeSection, setActiveSection] = useState("learn");
    const [commandOpen, setCommandOpen] = useState(false);

    // --- Lifted shared state ---

    const {
        musicPlayer,
        setMusicPlayer,
        musicWasPlaying,
        setMusicWasPlaying,
        updateMusicPlayer,
        handleMusicControl,
        playTrack,
        deleteTrack,
        activated,
        activate,
        deactivate,
    } = useMusicPlayer();

    const { isYTReady } = useYouTubeAPI(activated || activeSection === "learn");

    const {
        courses,
        setCourses,
        currentCourse,
        setCurrentCourse,
        newCourseUrl,
        setNewCourseUrl,
        newCourseTitle,
        setNewCourseTitle,
        showAddCourse,
        setShowAddCourse,
        addCourse,
        selectCourse,
        updateCourse,
        deleteCourse,
    } = useCourses();

    const {
        pomodoro,
        setPomodoro,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        updatePomodoro,
        skipToBreak,
        skipToWork,
        setViewMode: setPomodoroViewMode,
        setTimerDuration,
        setWorkTime,
        setBreakTime,
        lastStoppedSession,
    } = usePomodoro();

    const {
        playMusic,
        pauseMusic,
        playNextTrack,
        playPreviousTrack,
        loadAndPlayTrack,
        isActuallyPlaying,
    } = useMusicPlayerEngine({
        isYTReady,
        musicPlayer,
        onUpdateMusicPlayer: updateMusicPlayer,
        activated,
        onDeactivate: deactivate,
    });

    const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
    const [newMusicUrl, setNewMusicUrl] = useState("");
    const [showMusicQueue, setShowMusicQueue] = useState(false);

    const { isLoaded, exportSession, importSession } = useSessionPersistence(
        { courses, pomodoro, musicPlayer, settings },
        {
            setCourses,
            setCurrentCourse,
            setPomodoro,
            setMusicPlayer,
            setSettings,
        },
    );

    const { syncStatus, userId } = useCloudSync(
        { courses, pomodoro, musicPlayer, settings },
        { setCourses, setPomodoro, setMusicPlayer, setSettings },
        isLoaded,
    );

    // --- Keyboard shortcuts ---
    const handleQuickAddTask = useCallback(() => {
        setActiveSection("tasks");
    }, []);

    useKeyboardShortcuts({
        onCommandPalette: () => setCommandOpen(true),
        onQuickAddTask: handleQuickAddTask,
        onNavigate: setActiveSection,
    });

    // --- Settings element for nav bar ---
    const settingsElement = (
        <SettingsSheet
            settings={settings}
            pomodoro={pomodoro}
            coursesCount={courses.length}
            musicTracksCount={musicPlayer.playlist.length}
            onUpdateSettings={(updates: Partial<AppSettings>) =>
                setSettings((prev) => ({ ...prev, ...updates }))
            }
            onUpdatePomodoro={updatePomodoro}
            onExportSession={exportSession}
            onImportSession={importSession}
        />
    );

    const pomodoroActions = useMemo(() => ({
        pomodoro,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        skipToBreak,
        skipToWork,
        setViewMode: setPomodoroViewMode,
        setTimerDuration,
        setWorkTime,
        setBreakTime,
        lastStoppedSession,
    }), [pomodoro, startPomodoro, pausePomodoro, resetPomodoro, skipToBreak, skipToWork, setPomodoroViewMode, setTimerDuration, setWorkTime, setBreakTime, lastStoppedSession]);

    return (
        <UserIdProvider userId={userId}>
        <AppDataProvider settings={settings} pomodoroActions={pomodoroActions}>
        <div className="flex h-svh flex-col bg-background overflow-hidden">
            {/* Hidden YouTube Player -- rendered only after user activates music */}
            {activated && (
                <div
                    style={{
                        position: "absolute",
                        left: "-9999px",
                        top: "-9999px",
                    }}
                >
                    <div id="music-player"></div>
                </div>
            )}

            <AppHeader
                title={SECTION_TITLES[activeSection] || "ZonePro"}
                mobileNav={
                    <MobileNav
                        active={activeSection}
                        onNavigate={setActiveSection}
                        trailing={settingsElement}
                    />
                }
            >
                <MiniPomodoro
                    pomodoro={pomodoro}
                    onStart={startPomodoro}
                    onPause={pausePomodoro}
                    onReset={resetPomodoro}
                    onSkipToBreak={skipToBreak}
                    onSkipToWork={skipToWork}
                    onSetViewMode={setPomodoroViewMode}
                    onSetTimerDuration={setTimerDuration}
                />
                <MiniMusicPlayer
                    musicPlayer={musicPlayer}
                    isActuallyPlaying={isActuallyPlaying}
                    onPlay={playMusic}
                    onPause={pauseMusic}
                    onNext={playNextTrack}
                    onPrev={playPreviousTrack}
                    showMusicQueue={showMusicQueue}
                    newMusicUrl={newMusicUrl}
                    onToggleQueue={() => setShowMusicQueue(!showMusicQueue)}
                    onUpdateMusicPlayer={updateMusicPlayer}
                    onSetNewMusicUrl={setNewMusicUrl}
                    onPlayTrack={(track, index) => {
                        playTrack(track, index);
                        loadAndPlayTrack(track);
                    }}
                    onDeleteTrack={deleteTrack}
                    onActivate={activate}
                />
            </AppHeader>

            <main className="flex-1 overflow-y-auto p-4 pb-24">
                {activeSection === "learn" && (
                    <LearnProvider value={{
                        isYTReady, courses, currentCourse, setCurrentCourse,
                        newCourseUrl, setNewCourseUrl, newCourseTitle, setNewCourseTitle,
                        showAddCourse, setShowAddCourse, addCourse, selectCourse,
                        updateCourse, deleteCourse, settings,
                        handleMusicControl, musicWasPlaying, setMusicWasPlaying,
                        syncStatus,
                    }}>
                        <LearnSection />
                    </LearnProvider>
                )}
                {activeSection === "tasks" && <TasksSection />}
                {activeSection === "focus" && <FocusSection />}
                {activeSection === "habits" && <HabitsSection />}
                {activeSection === "notes" && <NotesSection />}
                {activeSection === "dashboard" && <DashboardSection />}
                {activeSection === "plan" && <PlanSection />}
            </main>

            <FloatingNav
                active={activeSection}
                onNavigate={setActiveSection}
                trailing={settingsElement}
            />

            <CommandPalette
                open={commandOpen}
                onOpenChange={setCommandOpen}
                onNavigate={(section) => {
                    setActiveSection(section);
                    setCommandOpen(false);
                }}
                onQuickAddTask={() => {
                    handleQuickAddTask();
                    setCommandOpen(false);
                }}
            />
        </div>
        </AppDataProvider>
        </UserIdProvider>
    );
}
