"use client";

import { useState } from "react";
import { CoursePlayer } from "@/components/course-player";
import { CourseList } from "@/components/course-list";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { MusicPlayer } from "@/components/music-player";
import { YouTubePlaylist } from "@/components/youtube-playlist";
import { SettingsSheet } from "@/components/settings-sheet";
import { AddCourseDialog } from "@/components/add-course-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useYouTubeAPI } from "@/hooks/use-youtube-api";
import { useCourses } from "@/hooks/use-courses";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { useSessionPersistence } from "@/hooks/use-session-persistence";

export default function ZoneProApp() {
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

    const [settings, setSettings] = useState({ autoMusicPause: true });
    const [newMusicUrl, setNewMusicUrl] = useState("");
    const [showMusicQueue, setShowMusicQueue] = useState(false);

    const { exportSession, importSession } = useSessionPersistence(
        { courses, pomodoro, musicPlayer, settings },
        {
            setCourses,
            setCurrentCourse,
            setPomodoro,
            setMusicPlayer,
            setSettings,
        },
    );

    return (
        <div className="min-h-screen bg-background p-4">
            {/* Hidden YouTube Players */}
            <div
                style={{
                    position: "absolute",
                    left: "-9999px",
                    top: "-9999px",
                }}
            >
                <div id="music-player"></div>
            </div>

            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground mb-2">
                            ZonePro
                        </h1>
                        <p className="text-muted-foreground">Your Productivity Zone</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <SettingsSheet
                        settings={settings}
                        pomodoro={pomodoro}
                        coursesCount={courses.length}
                        musicTracksCount={musicPlayer.playlist.length}
                        onUpdateSettings={(updates) =>
                            setSettings((prev) => ({ ...prev, ...updates }))
                        }
                        onUpdatePomodoro={updatePomodoro}
                        onExportSession={exportSession}
                        onImportSession={importSession}
                    />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <CoursePlayer
                            currentCourse={currentCourse}
                            onCourseUpdate={updateCourse}
                            onAddCourse={() => setShowAddCourse(true)}
                            isYTReady={isYTReady}
                            settings={settings}
                            onMusicControl={handleMusicControl}
                            musicWasPlaying={musicWasPlaying}
                            setMusicWasPlaying={setMusicWasPlaying}
                        />

                        <CourseList
                            courses={courses}
                            onSelectCourse={selectCourse}
                            onDeleteCourse={deleteCourse}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {currentCourse?.playlistId && (
                            <YouTubePlaylist
                                playlistId={currentCourse.playlistId}
                                currentVideoIndex={
                                    currentCourse.playlistIndex || 0
                                }
                                playlistProgress={
                                    currentCourse.playlistProgress || {}
                                }
                                onPlaylistMetadata={(metadata) => {
                                    if (currentCourse) {
                                        updateCourse(currentCourse.id, {
                                            playlistMetadata: metadata,
                                        });
                                    }
                                }}
                                onVideoSelect={(video, index) => {
                                    if (currentCourse) {
                                        const updatedPlaylistProgress = {
                                            ...currentCourse.playlistProgress,
                                            [video.id]: {
                                                ...currentCourse
                                                    .playlistProgress?.[
                                                    video.id
                                                ],
                                                videoId: video.id,
                                                title: video.title,
                                                currentTime:
                                                    currentCourse
                                                        .playlistProgress?.[
                                                        video.id
                                                    ]?.currentTime || 0,
                                                duration:
                                                    currentCourse
                                                        .playlistProgress?.[
                                                        video.id
                                                    ]?.duration || 0,
                                                completed:
                                                    currentCourse
                                                        .playlistProgress?.[
                                                        video.id
                                                    ]?.completed || false,
                                                lastWatched: new Date(),
                                            },
                                        };

                                        updateCourse(currentCourse.id, {
                                            playlistIndex: index,
                                            videoId: video.id,
                                            currentTime:
                                                currentCourse
                                                    .playlistProgress?.[
                                                    video.id
                                                ]?.currentTime || 0,
                                            duration: 0,
                                            playlistProgress:
                                                updatedPlaylistProgress,
                                        });
                                    }
                                }}
                            />
                        )}

                        <PomodoroTimer
                            pomodoro={pomodoro}
                            onStart={startPomodoro}
                            onPause={pausePomodoro}
                            onReset={resetPomodoro}
                        />

                        <MusicPlayer
                            musicPlayer={musicPlayer}
                            showMusicQueue={showMusicQueue}
                            newMusicUrl={newMusicUrl}
                            isYTReady={isYTReady}
                            onToggleQueue={() =>
                                setShowMusicQueue(!showMusicQueue)
                            }
                            onUpdateMusicPlayer={updateMusicPlayer}
                            onSetNewMusicUrl={setNewMusicUrl}
                            onPlayTrack={playTrack}
                            onDeleteTrack={deleteTrack}
                        />
                    </div>
                </div>

                <AddCourseDialog
                    open={showAddCourse}
                    onOpenChange={setShowAddCourse}
                    newCourseTitle={newCourseTitle}
                    newCourseUrl={newCourseUrl}
                    onTitleChange={setNewCourseTitle}
                    onUrlChange={setNewCourseUrl}
                    onAddCourse={addCourse}
                />
            </div>
        </div>
    );
}
