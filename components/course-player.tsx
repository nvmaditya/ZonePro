"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, StickyNote, Trash2 } from "lucide-react";
import type { CourseProgress, VideoNote, YTPlayer } from "@/types";
import { formatTime } from "@/utils/youtube";

interface CoursePlayerProps {
    currentCourse: CourseProgress | null;
    onCourseUpdate: (
        courseId: string,
        updates: Partial<CourseProgress>,
    ) => void;
    onAddCourse: () => void;
    isYTReady: boolean;
    settings: { autoMusicPause: boolean };
    onMusicControl: (action: "pause" | "play") => void;
    musicWasPlaying: boolean;
    setMusicWasPlaying: (playing: boolean) => void;
}

export function CoursePlayer({
    currentCourse,
    onCourseUpdate,
    onAddCourse,
    isYTReady,
    settings,
    onMusicControl,
    musicWasPlaying,
    setMusicWasPlaying,
}: CoursePlayerProps) {
    const coursePlayerRef = useRef<YTPlayer | null>(null);
    const [playerReady, setPlayerReady] = useState(false);
    const [newNote, setNewNote] = useState("");
    const [currentTimestamp, setCurrentTimestamp] = useState(0);
    const musicStateRef = useRef<boolean>(false);

    // Reset player ready state when course changes
    useEffect(() => {
        setPlayerReady(false);
    }, [currentCourse?.id]);

    useEffect(() => {
        if (isYTReady && window.YT && currentCourse) {
            let attempts = 0;
            const maxAttempts = 3;

            const initPlayer = () => {
                if (coursePlayerRef.current) {
                    try {
                        coursePlayerRef.current.destroy();
                    } catch {
                        // Player cleanup error
                    }
                    coursePlayerRef.current = null;
                }

                const container = document.getElementById("course-player");
                if (!container) {
                    if (attempts < maxAttempts) {
                        attempts++;
                        setTimeout(initPlayer, 100);
                    }
                    return;
                }

                container.innerHTML = "";
                const playerDiv = document.createElement("div");
                playerDiv.id = "course-player-iframe";
                container.appendChild(playerDiv);

                try {
                    let videoIdToPlay = currentCourse.videoId;

                    if (!videoIdToPlay && currentCourse.playlistId) {
                        return;
                    }

                    coursePlayerRef.current = new window.YT.Player(
                        "course-player-iframe",
                        {
                            height: "100%",
                            width: "100%",
                            videoId: videoIdToPlay,
                            playerVars: {
                                start: Math.floor(currentCourse.currentTime),
                                autoplay: 0,
                                controls: 1,
                                rel: 0,
                                enablejsapi: 1,
                                origin: window.location.origin,
                                playsinline: 1,
                                modestbranding: 1,
                                iv_load_policy: 3,
                            },
                            events: {
                                onReady: (event: { target: YTPlayer }) => {
                                    try {
                                        event.target.seekTo(
                                            currentCourse.currentTime,
                                        );
                                        setPlayerReady(true);
                                    } catch {
                                        // onReady error
                                    }
                                },
                                onStateChange: (event: { data: number }) => {
                                    handlePlayerStateChange(event.data);
                                },
                                onError: () => {
                                    if (attempts < maxAttempts) {
                                        attempts++;
                                        setTimeout(initPlayer, 1000);
                                    }
                                },
                            },
                        },
                    );
                } catch {
                    if (attempts < maxAttempts) {
                        attempts++;
                        setTimeout(initPlayer, 1000);
                    }
                }
            };

            setTimeout(initPlayer, 100);

            return () => {
                if (coursePlayerRef.current) {
                    try {
                        coursePlayerRef.current.destroy();
                    } catch {
                        // Cleanup error
                    }
                    coursePlayerRef.current = null;
                }
            };
        }
    }, [isYTReady, currentCourse?.id, currentCourse?.videoId]);

    // Real-time timestamp updates
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (playerReady && coursePlayerRef.current) {
            interval = setInterval(() => {
                try {
                    const player = coursePlayerRef.current;
                    if (player && typeof player.getCurrentTime === "function") {
                        const currentTime = player.getCurrentTime();
                        if (
                            typeof currentTime === "number" &&
                            !isNaN(currentTime)
                        ) {
                            setCurrentTimestamp(currentTime);
                        }
                    }
                } catch {
                    // Silently handle errors
                }
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [playerReady]);

    const handlePlayerStateChange = (playerState: number) => {
        if (!currentCourse || !coursePlayerRef.current) return;

        try {
            // When video starts playing - pause music if autoMusicPause is enabled
            if (playerState === window.YT.PlayerState.PLAYING) {
                if (settings.autoMusicPause) {
                    try {
                        const musicControls = window.musicPlayerControls;
                        if (
                            musicControls &&
                            typeof musicControls.isPlaying === "function"
                        ) {
                            const isPlaying = musicControls.isPlaying();
                            setMusicWasPlaying(isPlaying);
                            musicStateRef.current = isPlaying;

                            if (isPlaying) {
                                onMusicControl("pause");
                            }
                        }
                    } catch {
                        // Music control error
                    }
                }
            }
            // When video is paused - resume music if it was playing
            else if (playerState === window.YT.PlayerState.PAUSED) {
                updateCourseProgress();

                if (
                    settings.autoMusicPause &&
                    (musicWasPlaying || musicStateRef.current)
                ) {
                    onMusicControl("play");
                }
            }
            // When video ends - resume music if it was playing
            else if (playerState === window.YT.PlayerState.ENDED) {
                updateCourseProgress();

                if (
                    settings.autoMusicPause &&
                    (musicWasPlaying || musicStateRef.current)
                ) {
                    onMusicControl("play");
                }
            }
        } catch {
            // State change handler error
        }
    };

    const updateCourseProgress = () => {
        if (!coursePlayerRef.current || !currentCourse) return;

        try {
            if (
                typeof coursePlayerRef.current.getCurrentTime === "function" &&
                typeof coursePlayerRef.current.getDuration === "function"
            ) {
                const currentTime = coursePlayerRef.current.getCurrentTime();
                const duration = coursePlayerRef.current.getDuration();

                if (
                    typeof currentTime === "number" &&
                    typeof duration === "number" &&
                    !isNaN(currentTime) &&
                    !isNaN(duration)
                ) {
                    const updates: Partial<CourseProgress> = {
                        currentTime,
                        duration,
                        lastWatched: new Date(),
                    };

                    if (currentCourse.playlistId && currentCourse.videoId) {
                        const playlistProgress = {
                            ...currentCourse.playlistProgress,
                            [currentCourse.videoId]: {
                                videoId: currentCourse.videoId,
                                currentTime,
                                duration,
                                completed: currentTime / duration > 0.9,
                                lastWatched: new Date(),
                                title: `Video ${
                                    (currentCourse.playlistIndex || 0) + 1
                                }`,
                            },
                        };
                        updates.playlistProgress = playlistProgress;
                    }

                    onCourseUpdate(currentCourse.id, updates);
                }
            }
        } catch {
            // Progress update error
        }
    };

    const deleteNote = (noteId: string) => {
        if (!currentCourse) return;
        const updatedNotes = (currentCourse.notes || []).filter(
            (note) => note.id !== noteId,
        );
        onCourseUpdate(currentCourse.id, { notes: updatedNotes });
    };

    const jumpToTimestamp = (timestamp: number) => {
        if (!coursePlayerRef.current || !playerReady) return;
        try {
            coursePlayerRef.current.seekTo(timestamp);
        } catch {
            // Seek error
        }
    };

    const handleNoteTimestampClick = (note: VideoNote) => {
        if (
            note.videoId &&
            currentCourse &&
            note.videoId !== currentCourse.videoId
        ) {
            // Switch to the correct video first
            const playlistProgress = currentCourse.playlistProgress || {};
            const videoKeys = Object.keys(playlistProgress);
            const playlistIndex = videoKeys.indexOf(note.videoId);

            onCourseUpdate(currentCourse.id, {
                videoId: note.videoId,
                currentTime: note.timestamp,
                playlistIndex:
                    playlistIndex >= 0
                        ? playlistIndex
                        : currentCourse.playlistIndex || 0,
            });
            return;
        }
        jumpToTimestamp(note.timestamp);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Current Course
                </CardTitle>
                <Button size="sm" onClick={onAddCourse}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                </Button>
            </CardHeader>
            <CardContent>
                {currentCourse ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                            {currentCourse.title}
                        </h3>

                        {!currentCourse.videoId && currentCourse.playlistId ? (
                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                <div className="text-center p-8">
                                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-foreground mb-2">
                                        Playlist Course
                                    </h4>
                                    <p className="text-muted-foreground mb-4">
                                        This is a playlist-based course. Select
                                        a video from the playlist in the sidebar
                                        to start learning.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Playlist ID: {currentCourse.playlistId}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                <div
                                    id="course-player"
                                    className="w-full h-full"
                                ></div>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <Progress
                                value={
                                    currentCourse.duration > 0
                                        ? (currentTimestamp /
                                              currentCourse.duration) *
                                          100
                                        : 0
                                }
                                className="flex-1 mr-4"
                            />
                            <p className="text-sm text-muted-foreground mr-4">
                                {formatTime(Math.floor(currentTimestamp))} /{" "}
                                {formatTime(Math.floor(currentCourse.duration))}
                            </p>
                        </div>

                        {/* Inline Note Input */}
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add a note at current timestamp..."
                                    className="flex-1 min-h-[60px]"
                                />
                                <Button
                                    onClick={() => {
                                        if (
                                            !newNote.trim() ||
                                            !currentCourse ||
                                            !playerReady
                                        )
                                            return;

                                        const note: VideoNote = {
                                            id: Date.now().toString(),
                                            timestamp: currentTimestamp,
                                            content: newNote.trim(),
                                            createdAt: new Date(),
                                            videoId: currentCourse.playlistId
                                                ? currentCourse.videoId
                                                : undefined,
                                            videoTitle: currentCourse.playlistId
                                                ? currentCourse
                                                      .playlistProgress?.[
                                                      currentCourse.videoId
                                                  ]?.title ||
                                                  `Video ${
                                                      (currentCourse.playlistIndex ||
                                                          0) + 1
                                                  }`
                                                : undefined,
                                        };

                                        const updatedNotes = [
                                            ...(currentCourse.notes || []),
                                            note,
                                        ];
                                        onCourseUpdate(currentCourse.id, {
                                            notes: updatedNotes,
                                        });
                                        setNewNote("");
                                    }}
                                    disabled={!newNote.trim() || !playerReady}
                                    className="self-start mt-0"
                                >
                                    <StickyNote className="w-4 h-4 mr-2" />
                                    Add Note
                                </Button>
                            </div>
                            {playerReady && (
                                <p className="text-xs text-muted-foreground">
                                    Current time:{" "}
                                    {formatTime(Math.floor(currentTimestamp))}
                                </p>
                            )}
                        </div>

                        {/* Notes List */}
                        {currentCourse.notes &&
                            currentCourse.notes.length > 0 && (
                                <div className="space-y-3 max-h-60 overflow-y-auto border-t pt-4">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <StickyNote className="w-4 h-4" />
                                        Course Notes (
                                        {currentCourse.notes.length})
                                    </h4>
                                    <div className="space-y-3">
                                        {currentCourse.playlistId
                                            ? (() => {
                                                  const notesByVideo =
                                                      currentCourse.notes.reduce(
                                                          (acc, note) => {
                                                              const videoId =
                                                                  note.videoId ||
                                                                  "general";
                                                              if (!acc[videoId])
                                                                  acc[videoId] =
                                                                      [];
                                                              acc[videoId].push(
                                                                  note,
                                                              );
                                                              return acc;
                                                          },
                                                          {} as {
                                                              [
                                                                  key: string
                                                              ]: VideoNote[];
                                                          },
                                                      );

                                                  return Object.entries(
                                                      notesByVideo,
                                                  ).map(([videoId, notes]) => (
                                                      <div
                                                          key={videoId}
                                                          className="border rounded-lg p-3 bg-card"
                                                      >
                                                          <h5 className="font-medium text-sm mb-2 text-primary">
                                                              {videoId ===
                                                              "general"
                                                                  ? "General Notes"
                                                                  : notes[0]
                                                                        .videoTitle ||
                                                                    `Video ${videoId}`}
                                                          </h5>
                                                          <div className="space-y-2">
                                                              {notes
                                                                  .sort(
                                                                      (a, b) =>
                                                                          b.timestamp -
                                                                          a.timestamp,
                                                                  )
                                                                  .map(
                                                                      (
                                                                          note,
                                                                      ) => (
                                                                          <div
                                                                              key={
                                                                                  note.id
                                                                              }
                                                                              className="bg-muted p-2 rounded"
                                                                          >
                                                                              <div className="flex items-start justify-between gap-2">
                                                                                  <div className="flex-1">
                                                                                      <div className="flex items-center gap-2 mb-1">
                                                                                          <Badge
                                                                                              variant="secondary"
                                                                                              className="cursor-pointer hover:bg-primary/10 text-xs"
                                                                                              onClick={() =>
                                                                                                  handleNoteTimestampClick(
                                                                                                      note,
                                                                                                  )
                                                                                              }
                                                                                          >
                                                                                              {formatTime(
                                                                                                  Math.floor(
                                                                                                      note.timestamp,
                                                                                                  ),
                                                                                              )}
                                                                                          </Badge>
                                                                                          <span className="text-xs text-muted-foreground">
                                                                                              {new Date(
                                                                                                  note.createdAt,
                                                                                              ).toLocaleDateString()}
                                                                                          </span>
                                                                                      </div>
                                                                                      <p className="text-xs">
                                                                                          {
                                                                                              note.content
                                                                                          }
                                                                                      </p>
                                                                                  </div>
                                                                                  <Button
                                                                                      onClick={() =>
                                                                                          deleteNote(
                                                                                              note.id,
                                                                                          )
                                                                                      }
                                                                                      variant="ghost"
                                                                                      size="sm"
                                                                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                                                  >
                                                                                      <Trash2 className="w-3 h-3" />
                                                                                  </Button>
                                                                              </div>
                                                                          </div>
                                                                      ),
                                                                  )}
                                                          </div>
                                                      </div>
                                                  ));
                                              })()
                                            : currentCourse.notes
                                                  .sort(
                                                      (a, b) =>
                                                          b.timestamp -
                                                          a.timestamp,
                                                  )
                                                  .map((note) => (
                                                      <div
                                                          key={note.id}
                                                          className="bg-muted p-3 rounded-lg"
                                                      >
                                                          <div className="flex items-start justify-between gap-2">
                                                              <div className="flex-1">
                                                                  <div className="flex items-center gap-2 mb-1">
                                                                      <Badge
                                                                          variant="secondary"
                                                                          className="cursor-pointer hover:bg-primary/10"
                                                                          onClick={() =>
                                                                              jumpToTimestamp(
                                                                                  note.timestamp,
                                                                              )
                                                                          }
                                                                      >
                                                                          {formatTime(
                                                                              Math.floor(
                                                                                  note.timestamp,
                                                                              ),
                                                                          )}
                                                                      </Badge>
                                                                      <span className="text-xs text-muted-foreground">
                                                                          {new Date(
                                                                              note.createdAt,
                                                                          ).toLocaleDateString()}
                                                                      </span>
                                                                  </div>
                                                                  <p className="text-sm">
                                                                      {
                                                                          note.content
                                                                      }
                                                                  </p>
                                                              </div>
                                                              <Button
                                                                  onClick={() =>
                                                                      deleteNote(
                                                                          note.id,
                                                                      )
                                                                  }
                                                                  variant="ghost"
                                                                  size="sm"
                                                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                              >
                                                                  <Trash2 className="w-4 h-4" />
                                                              </Button>
                                                          </div>
                                                      </div>
                                                  ))}
                                    </div>
                                </div>
                            )}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            No course selected. Add a course to get started!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
