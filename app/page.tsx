"use client";

import { useState, useCallback } from "react";
import { AppHeader } from "@/components/app-header";
import { FloatingNav, MobileNav } from "@/components/floating-nav";
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
    const { isYTReady } = useYouTubeAPI();

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
    } = usePomodoro();

    const {
        musicPlayer,
        setMusicPlayer,
        musicWasPlaying,
        setMusicWasPlaying,
        updateMusicPlayer,
        handleMusicControl,
        playTrack,
        deleteTrack,
    } = useMusicPlayer();

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
    });

    const [settings, setSettings] = useState({ autoMusicPause: true });
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

    const { syncStatus } = useCloudSync(
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
            onUpdateSettings={(updates: Partial<{ autoMusicPause: boolean }>) =>
                setSettings((prev) => ({ ...prev, ...updates }))
            }
            onUpdatePomodoro={updatePomodoro}
            onExportSession={exportSession}
            onImportSession={importSession}
        />
    );

    return (
        <div className="flex h-svh flex-col bg-background overflow-hidden">
            {/* Hidden YouTube Player -- must never unmount */}
            <div
                style={{
                    position: "absolute",
                    left: "-9999px",
                    top: "-9999px",
                }}
            >
                <div id="music-player"></div>
            </div>

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
                />
                <MiniMusicPlayer
                    musicPlayer={musicPlayer}
                    isActuallyPlaying={isActuallyPlaying}
                    onPlay={playMusic}
                    onPause={pauseMusic}
                    onNext={playNextTrack}
                />
            </AppHeader>

            <main className="flex-1 overflow-y-auto p-4 pb-24">
                {activeSection === "learn" && (
                    <LearnSection
                        isYTReady={isYTReady}
                        courses={courses}
                        currentCourse={currentCourse}
                        setCurrentCourse={setCurrentCourse}
                        newCourseUrl={newCourseUrl}
                        setNewCourseUrl={setNewCourseUrl}
                        newCourseTitle={newCourseTitle}
                        setNewCourseTitle={setNewCourseTitle}
                        showAddCourse={showAddCourse}
                        setShowAddCourse={setShowAddCourse}
                        addCourse={addCourse}
                        selectCourse={selectCourse}
                        updateCourse={updateCourse}
                        deleteCourse={deleteCourse}
                        pomodoro={pomodoro}
                        startPomodoro={startPomodoro}
                        pausePomodoro={pausePomodoro}
                        resetPomodoro={resetPomodoro}
                        musicPlayer={musicPlayer}
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
                        onPlayMusic={playMusic}
                        onPauseMusic={pauseMusic}
                        onPlayNext={playNextTrack}
                        onPlayPrev={playPreviousTrack}
                        isActuallyPlaying={isActuallyPlaying}
                        settings={settings}
                        handleMusicControl={handleMusicControl}
                        musicWasPlaying={musicWasPlaying}
                        setMusicWasPlaying={setMusicWasPlaying}
                        syncStatus={syncStatus}
                    />
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
    );
}
