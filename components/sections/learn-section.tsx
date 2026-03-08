"use client";

import { CoursePlayer } from "@/components/course-player";
import { CourseList } from "@/components/course-list";
import { YouTubePlaylist } from "@/components/youtube-playlist";
import { AddCourseDialog } from "@/components/add-course-dialog";
import { SyncStatusIndicator } from "@/components/sync-status";
import { useLearn } from "@/contexts/learn-context";

export function LearnSection() {
    const {
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
        settings,
        handleMusicControl,
        musicWasPlaying,
        setMusicWasPlaying,
        syncStatus,
    } = useLearn();

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
