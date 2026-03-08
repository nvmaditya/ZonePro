"use client";

import { CoursePlayer } from "@/components/course-player";
import { CourseList } from "@/components/course-list";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { YouTubePlaylist } from "@/components/youtube-playlist";
import { AddCourseDialog } from "@/components/add-course-dialog";
import { SyncStatusIndicator } from "@/components/sync-status";
import type { CourseProgress, PomodoroSession } from "@/types";
import type { SyncStatus } from "@/hooks/use-cloud-sync";

interface LearnSectionProps {
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
    pomodoro: PomodoroSession;
    startPomodoro: () => void;
    pausePomodoro: () => void;
    resetPomodoro: () => void;
    settings: { autoMusicPause: boolean };
    handleMusicControl: (action: "pause" | "play") => void;
    musicWasPlaying: boolean;
    setMusicWasPlaying: (v: boolean) => void;
    syncStatus: SyncStatus;
}

export function LearnSection({
    isYTReady,
    courses,
    currentCourse,
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
    pomodoro,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    settings,
    handleMusicControl,
    musicWasPlaying,
    setMusicWasPlaying,
    syncStatus,
}: LearnSectionProps) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <SyncStatusIndicator status={syncStatus} />
            </div>

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
                            currentVideoIndex={currentCourse.playlistIndex || 0}
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
                                            ...currentCourse.playlistProgress?.[
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
                                            currentCourse.playlistProgress?.[
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
    );
}
