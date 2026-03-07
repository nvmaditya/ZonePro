"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { CoursePlayer } from "@/components/course-player";
import { CourseList } from "@/components/course-list";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { MusicPlayer } from "@/components/music-player";
import { YouTubePlaylist } from "@/components/youtube-playlist";
import { SettingsSheet } from "@/components/settings-sheet";
import { AddCourseDialog } from "@/components/add-course-dialog";
import type {
    CourseProgress,
    PomodoroSession,
    MusicPlayer as MusicPlayerType,
    MusicTrack,
    SessionData,
} from "@/types";
import { getYouTubeVideoId, getPlaylistId } from "@/utils/youtube";
import { toast } from "sonner";
import {
    STORAGE_KEY,
    OLD_STORAGE_KEY,
    DEFAULT_WORK_TIME,
    DEFAULT_BREAK_TIME,
    DEFAULT_TOTAL_SESSIONS,
} from "@/lib/constants";

const DEFAULT_POMODORO: PomodoroSession = {
    workTime: DEFAULT_WORK_TIME,
    breakTime: DEFAULT_BREAK_TIME,
    currentSession: 1,
    totalSessions: DEFAULT_TOTAL_SESSIONS,
    isActive: false,
    isBreak: false,
    timeLeft: DEFAULT_WORK_TIME * 60,
};

const DEFAULT_MUSIC_PLAYER: MusicPlayerType = {
    currentTrack: null,
    playlist: [],
    volume: 50,
    isPlaying: false,
    isMuted: true,
    currentTime: 0,
    shuffle: false,
    repeat: false,
    currentIndex: 0,
};

const DEFAULT_SETTINGS = {
    autoMusicPause: true,
};

export default function ZoneProApp() {
    const [courses, setCourses] = useState<CourseProgress[]>([]);
    const [currentCourse, setCurrentCourse] = useState<CourseProgress | null>(
        null,
    );
    const [newCourseUrl, setNewCourseUrl] = useState("");
    const [newCourseTitle, setNewCourseTitle] = useState("");
    const [newMusicUrl, setNewMusicUrl] = useState("");
    const [showMusicQueue, setShowMusicQueue] = useState(false);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [isYTReady, setIsYTReady] = useState(false);
    const [musicWasPlaying, setMusicWasPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Pomodoro Timer State
    const [pomodoro, setPomodoro] = useState<PomodoroSession>(DEFAULT_POMODORO);

    // Music Player State - turned off by default
    const [musicPlayer, setMusicPlayer] =
        useState<MusicPlayerType>(DEFAULT_MUSIC_PLAYER);

    // Settings
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    // Initialize YouTube API
    useEffect(() => {
        if (typeof window !== "undefined" && !window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                setIsYTReady(true);
            };
        } else if (typeof window !== "undefined") {
            setIsYTReady(true);
        }
    }, []);

    // Load data from localStorage on mount (with migration from old key)
    useEffect(() => {
        if (typeof window !== "undefined") {
            let savedData = localStorage.getItem(STORAGE_KEY);

            // Migrate from old storage key if new key has no data
            if (!savedData) {
                const oldData = localStorage.getItem(OLD_STORAGE_KEY);
                if (oldData) {
                    savedData = oldData;
                    localStorage.setItem(STORAGE_KEY, oldData);
                    localStorage.removeItem(OLD_STORAGE_KEY);
                }
            }

            if (savedData) {
                try {
                    const data: SessionData = JSON.parse(savedData);
                    setCourses(
                        (data.courses || []).map((course) => ({
                            ...course,
                            lastWatched: new Date(course.lastWatched),
                            notes: (course.notes || []).map((note) => ({
                                ...note,
                                createdAt: new Date(note.createdAt),
                            })),
                        })),
                    );
                    setPomodoro(data.pomodoro || DEFAULT_POMODORO);
                    setMusicPlayer(data.music || DEFAULT_MUSIC_PLAYER);
                    setSettings(data.settings || DEFAULT_SETTINGS);
                } catch {
                    // Corrupted data, start fresh
                }
            }
            setIsLoaded(true);
        }
    }, []);

    // Save data to localStorage whenever state changes
    useEffect(() => {
        if (!isLoaded) return;
        const sessionData: SessionData = {
            courses,
            pomodoro,
            music: musicPlayer,
            settings,
            timestamp: new Date(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    }, [courses, pomodoro, musicPlayer, settings, isLoaded]);

    // Pomodoro Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (pomodoro.isActive && pomodoro.timeLeft > 0) {
            interval = setInterval(() => {
                setPomodoro((prev) => ({
                    ...prev,
                    timeLeft: prev.timeLeft - 1,
                }));
            }, 1000);
        } else if (pomodoro.isActive && pomodoro.timeLeft === 0) {
            setPomodoro((prev) => {
                // If break ended and all sessions are done, stop entirely
                if (prev.isBreak && prev.currentSession >= prev.totalSessions) {
                    return {
                        ...prev,
                        isActive: false,
                        isBreak: false,
                        timeLeft: prev.workTime * 60,
                        currentSession: prev.totalSessions,
                    };
                }
                return {
                    ...prev,
                    isActive: false,
                    isBreak: !prev.isBreak,
                    timeLeft: prev.isBreak
                        ? prev.workTime * 60
                        : prev.breakTime * 60,
                    currentSession: prev.isBreak
                        ? prev.currentSession + 1
                        : prev.currentSession,
                };
            });
        }
        return () => clearInterval(interval);
    }, [pomodoro.isActive, pomodoro.timeLeft]);

    const addCourse = async () => {
        if (newCourseUrl && newCourseTitle) {
            const videoId = getYouTubeVideoId(newCourseUrl);
            const playlistId = getPlaylistId(newCourseUrl);

            if (videoId || playlistId) {
                const newCourse: CourseProgress = {
                    id: Date.now().toString(),
                    title: newCourseTitle,
                    url: newCourseUrl,
                    videoId: videoId || "",
                    currentTime: 0,
                    duration: 0,
                    completed: false,
                    lastWatched: new Date(),
                    playlistId: playlistId || undefined,
                    playlistIndex: 0,
                    notes: [],
                    playlistProgress: {},
                };

                const updatedCourses = [...courses, newCourse];
                setCourses(updatedCourses);
                setNewCourseUrl("");
                setNewCourseTitle("");
                setShowAddCourse(false);
            }
        }
    };

    const selectCourse = (course: CourseProgress) => {
        setCurrentCourse(course);
    };

    const updateCourse = (
        courseId: string,
        updates: Partial<CourseProgress>,
    ) => {
        setCourses((prev) =>
            prev.map((course) =>
                course.id === courseId ? { ...course, ...updates } : course,
            ),
        );

        if (currentCourse && currentCourse.id === courseId) {
            setCurrentCourse((prev) => (prev ? { ...prev, ...updates } : null));
        }
    };

    const deleteCourse = (courseId: string) => {
        setCourses(courses.filter((c) => c.id !== courseId));
        if (currentCourse?.id === courseId) {
            setCurrentCourse(null);
        }
    };

    const handleMusicControl = (action: "pause" | "play") => {
        try {
            if (typeof window !== "undefined") {
                const controls = (window as any).musicPlayerControls;
                if (controls) {
                    if (action === "pause") {
                        controls.pause();
                    } else {
                        controls.play();
                    }
                }
            }
        } catch {
            // Music controls not available
        }
    };

    const startPomodoro = () => {
        setPomodoro((prev) => ({
            ...prev,
            isActive: true,
            timeLeft:
                prev.timeLeft === 0
                    ? prev.isBreak
                        ? prev.breakTime * 60
                        : prev.workTime * 60
                    : prev.timeLeft,
        }));
    };

    const pausePomodoro = () => {
        setPomodoro((prev) => ({ ...prev, isActive: false }));
    };

    const resetPomodoro = () => {
        setPomodoro((prev) => ({
            ...prev,
            isActive: false,
            isBreak: false,
            timeLeft: prev.workTime * 60,
            currentSession: 1,
        }));
    };

    const exportSession = () => {
        const sessionData: SessionData = {
            courses: courses.map((course) => ({
                ...course,
                lastWatched: course.lastWatched,
                notes:
                    course.notes?.map((note) => ({
                        ...note,
                        createdAt: note.createdAt,
                    })) || [],
            })),
            pomodoro,
            music: musicPlayer,
            settings,
            timestamp: new Date(),
        };
        const dataStr = JSON.stringify(sessionData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `zonepro-session-${
            new Date().toISOString().split("T")[0]
        }.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const importSession = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data: SessionData = JSON.parse(
                        e.target?.result as string,
                    );
                    setCourses(
                        data.courses.map((course) => ({
                            ...course,
                            lastWatched: new Date(course.lastWatched),
                            notes:
                                course.notes?.map((note) => ({
                                    ...note,
                                    createdAt: new Date(note.createdAt),
                                })) || [],
                        })) || [],
                    );
                    setPomodoro(data.pomodoro || DEFAULT_POMODORO);
                    setMusicPlayer(data.music || DEFAULT_MUSIC_PLAYER);
                    setSettings(data.settings || DEFAULT_SETTINGS);

                    setCurrentCourse(null);
                    setTimeout(() => {
                        if (data.courses.length > 0) {
                            const lastCourse = data.courses.reduce(
                                (latest, course) =>
                                    new Date(course.lastWatched) >
                                    new Date(latest.lastWatched)
                                        ? course
                                        : latest,
                            );
                            selectCourse(lastCourse);
                        }
                    }, 500);
                } catch {
                    // Invalid session file
                }
            };
            reader.readAsText(file);
        }
    };

    const playMusicTrack = (track: MusicTrack, index: number) => {
        setMusicPlayer((prev) => ({
            ...prev,
            currentTrack: track,
            currentIndex: index,
        }));
    };

    const deleteMusicTrack = (trackId: string) => {
        setMusicPlayer((prev) => ({
            ...prev,
            playlist: prev.playlist.filter((t) => t.id !== trackId),
            currentTrack:
                prev.currentTrack?.id === trackId ? null : prev.currentTrack,
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            ZonePro
                        </h1>
                        <p className="text-gray-600">Your Productivity Zone</p>
                    </div>

                    <SettingsSheet
                        settings={settings}
                        pomodoro={pomodoro}
                        coursesCount={courses.length}
                        musicTracksCount={musicPlayer.playlist.length}
                        onUpdateSettings={(updates) =>
                            setSettings((prev) => ({ ...prev, ...updates }))
                        }
                        onUpdatePomodoro={(updates) =>
                            setPomodoro((prev) => ({ ...prev, ...updates }))
                        }
                        onExportSession={exportSession}
                        onImportSession={importSession}
                    />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area - Course Player */}
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

                    {/* Sidebar - YouTube, Pomodoro and Music Player */}
                    <div className="space-y-6">
                        {/* Show YouTube Playlist only when current course has a playlist */}
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
                            onUpdateMusicPlayer={(updates) =>
                                setMusicPlayer((prev) => ({
                                    ...prev,
                                    ...updates,
                                }))
                            }
                            onSetNewMusicUrl={setNewMusicUrl}
                            onPlayTrack={playMusicTrack}
                            onDeleteTrack={deleteMusicTrack}
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
