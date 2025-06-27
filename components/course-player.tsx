"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, StickyNote, Trash2 } from "lucide-react";
import type { CourseProgress, VideoNote, PlaylistVideoProgress } from "@/types";
import { formatTime } from "@/utils/youtube";

interface CoursePlayerProps {
    currentCourse: CourseProgress | null;
    onCourseUpdate: (
        courseId: string,
        updates: Partial<CourseProgress>
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
    const coursePlayerRef = useRef<any>(null);
    const [playerReady, setPlayerReady] = useState(false);
    const [newNote, setNewNote] = useState("");
    const [currentTimestamp, setCurrentTimestamp] = useState(0);
    // Add internal music state tracking
    const musicStateRef = useRef<boolean>(false);

    // Reset player ready state when course changes
    useEffect(() => {
        setPlayerReady(false);
    }, [currentCourse?.id]);

    useEffect(() => {
        // Only proceed if YouTube API is ready and we have a current course
        if (isYTReady && window.YT && currentCourse) {
            let attempts = 0;
            const maxAttempts = 3;

            const initPlayer = () => {
                // Safety cleanup for existing player
                if (coursePlayerRef.current) {
                    try {
                        coursePlayerRef.current.destroy();
                    } catch (error) {
                        console.warn("Error destroying player:", error);
                    }
                    coursePlayerRef.current = null;
                }

                // Wait for DOM element to be available
                const container = document.getElementById("course-player");
                if (!container) {
                    // If container not found, retry after a short delay
                    if (attempts < maxAttempts) {
                        attempts++;
                        setTimeout(initPlayer, 100);
                    } else {
                        console.error(
                            "Course player container not found after maximum attempts"
                        );
                    }
                    return;
                }

                // Clear container and create new element
                container.innerHTML = "";
                const playerDiv = document.createElement("div");
                playerDiv.id = "course-player-iframe";
                container.appendChild(playerDiv);

                try {
                    // For playlist-only courses, we need to get the first video ID
                    let videoIdToPlay = currentCourse.videoId;

                    // If no video ID but has playlist ID, we'll need to handle this differently
                    if (!videoIdToPlay && currentCourse.playlistId) {
                        // For now, show a message that playlist support is coming
                        // In a full implementation, you'd fetch the first video from the playlist
                        console.log(
                            "Playlist-only course detected, playlist ID:",
                            currentCourse.playlistId
                        );
                        // We'll handle this case below by showing a different UI
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
                                iv_load_policy: 3, // Hide annotations
                            },
                            events: {
                                onReady: (event: any) => {
                                    try {
                                        event.target.seekTo(
                                            currentCourse.currentTime
                                        );
                                        setPlayerReady(true);
                                        console.log("YouTube player ready");
                                    } catch (error) {
                                        console.warn(
                                            "Error during onReady:",
                                            error
                                        );
                                    }
                                },
                                onStateChange: (event: any) => {
                                    handlePlayerStateChange(event.data);
                                },
                                onError: (event: any) => {
                                    console.error(
                                        "YouTube player error:",
                                        event.data
                                    );
                                    // Retry initialization on error
                                    if (attempts < maxAttempts) {
                                        attempts++;
                                        setTimeout(initPlayer, 1000);
                                    }
                                },
                            },
                        }
                    );
                } catch (error) {
                    console.error("Error initializing YouTube player:", error);
                    if (attempts < maxAttempts) {
                        attempts++;
                        setTimeout(initPlayer, 1000);
                    }
                }
            };

            // Start player initialization with a small delay to ensure DOM is ready
            setTimeout(initPlayer, 100);

            // Cleanup function
            return () => {
                if (coursePlayerRef.current) {
                    try {
                        coursePlayerRef.current.destroy();
                    } catch (error) {
                        console.warn(
                            "Error destroying player on cleanup:",
                            error
                        );
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
                    if (
                        typeof coursePlayerRef.current.getCurrentTime ===
                        "function"
                    ) {
                        const currentTime =
                            coursePlayerRef.current.getCurrentTime();
                        if (
                            typeof currentTime === "number" &&
                            !isNaN(currentTime)
                        ) {
                            setCurrentTimestamp(currentTime);
                        }
                    }
                } catch (error) {
                    // Silently handle errors to avoid console spam
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

        console.log("Player state changed:", playerState);

        try {
            // When video starts playing - always pause music
            if (playerState === window.YT.PlayerState.PLAYING) {
                try {
                    const musicControls = (window as any).musicPlayerControls;
                    if (
                        musicControls &&
                        typeof musicControls.isPlaying === "function"
                    ) {
                        const isPlaying = musicControls.isPlaying();
                        setMusicWasPlaying(isPlaying);
                        musicStateRef.current = isPlaying;

                        if (isPlaying) {
                            console.log(
                                "Auto-pausing music - video started playing"
                            );
                            onMusicControl("pause");
                        }
                    }
                } catch (error) {
                    console.warn("Error with music controls:", error);
                }
            }
            // When video is paused - resume music if it was playing
            else if (playerState === window.YT.PlayerState.PAUSED) {
                updateCourseProgress();

                if (musicWasPlaying || musicStateRef.current) {
                    console.log("Auto-resuming music - video paused");
                    onMusicControl("play");
                }
            }
            // When video ends - resume music if it was playing
            else if (playerState === window.YT.PlayerState.ENDED) {
                updateCourseProgress();

                if (musicWasPlaying || musicStateRef.current) {
                    console.log("Auto-resuming music - video ended");
                    onMusicControl("play");
                }
            }
        } catch (error) {
            console.warn("Error in player state change handler:", error);
        }
    };

    const updateCourseProgress = () => {
        if (!coursePlayerRef.current || !currentCourse) return;

        try {
            // Check if the player methods are available
            if (
                typeof coursePlayerRef.current.getCurrentTime === "function" &&
                typeof coursePlayerRef.current.getDuration === "function"
            ) {
                const currentTime = coursePlayerRef.current.getCurrentTime();
                const duration = coursePlayerRef.current.getDuration();

                // Only update if we have valid values
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

                    // If this is a playlist course, also update the playlist progress
                    if (currentCourse.playlistId && currentCourse.videoId) {
                        const playlistProgress = {
                            ...currentCourse.playlistProgress,
                            [currentCourse.videoId]: {
                                videoId: currentCourse.videoId,
                                currentTime,
                                duration,
                                completed: currentTime / duration > 0.9, // Consider completed if 90% watched
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
        } catch (error) {
            console.warn("Error updating course progress:", error);
        }
    };

    const getCurrentTime = () => {
        if (!coursePlayerRef.current || !playerReady) return 0;
        try {
            return coursePlayerRef.current.getCurrentTime() || 0;
        } catch (error) {
            console.warn("Error getting current time:", error);
            return 0;
        }
    };

    const getPlayerState = () => {
        if (!coursePlayerRef.current || !playerReady) return null;
        try {
            return coursePlayerRef.current.getPlayerState();
        } catch (error) {
            console.warn("Error getting player state:", error);
            return null;
        }
    };

    const deleteNote = (noteId: string) => {
        if (!currentCourse) return;
        const updatedNotes = (currentCourse.notes || []).filter(
            (note) => note.id !== noteId
        );
        onCourseUpdate(currentCourse.id, { notes: updatedNotes });
    };

    const jumpToTimestamp = (timestamp: number) => {
        if (!coursePlayerRef.current || !playerReady) return;
        try {
            coursePlayerRef.current.seekTo(timestamp);
        } catch (error) {
            console.warn("Error seeking to timestamp:", error);
        }
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

                        {/* Show different UI for playlist-only courses vs individual videos */}
                        {!currentCourse.videoId && currentCourse.playlistId ? (
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="text-center p-8">
                                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-gray-700 mb-2">
                                        Playlist Course
                                    </h4>
                                    <p className="text-gray-600 mb-4">
                                        This is a playlist-based course. Select
                                        a video from the playlist in the sidebar
                                        to start learning.
                                    </p>
                                    <p className="text-sm text-gray-500">
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
                            <p className="text-sm text-gray-600 mr-4">
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
                                <p className="text-xs text-gray-500">
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
                                            ? // For playlist courses, group notes by video
                                              (() => {
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
                                                                  note
                                                              );
                                                              return acc;
                                                          },
                                                          {} as {
                                                              [
                                                                  key: string
                                                              ]: VideoNote[];
                                                          }
                                                      );

                                                  return Object.entries(
                                                      notesByVideo
                                                  ).map(([videoId, notes]) => (
                                                      <div
                                                          key={videoId}
                                                          className="border rounded-lg p-3 bg-white"
                                                      >
                                                          <h5 className="font-medium text-sm mb-2 text-blue-700">
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
                                                                          a.timestamp
                                                                  )
                                                                  .map(
                                                                      (
                                                                          note
                                                                      ) => (
                                                                          <div
                                                                              key={
                                                                                  note.id
                                                                              }
                                                                              className="bg-gray-50 p-2 rounded"
                                                                          >
                                                                              <div className="flex items-start justify-between gap-2">
                                                                                  <div className="flex-1">
                                                                                      <div className="flex items-center gap-2 mb-1">
                                                                                          <Badge
                                                                                              variant="secondary"
                                                                                              className="cursor-pointer hover:bg-blue-100 text-xs"
                                                                                              onClick={() => {
                                                                                                  // For playlist notes, need to switch to the video first
                                                                                                  if (
                                                                                                      note.videoId &&
                                                                                                      note.videoId !==
                                                                                                          currentCourse.videoId
                                                                                                  ) {
                                                                                                      // TODO: Add logic to switch video
                                                                                                      console.log(
                                                                                                          "Switch to video:",
                                                                                                          note.videoId
                                                                                                      );
                                                                                                  }
                                                                                                  jumpToTimestamp(
                                                                                                      note.timestamp
                                                                                                  );
                                                                                              }}
                                                                                          >
                                                                                              {formatTime(
                                                                                                  Math.floor(
                                                                                                      note.timestamp
                                                                                                  )
                                                                                              )}
                                                                                          </Badge>
                                                                                          <span className="text-xs text-gray-500">
                                                                                              {new Date(
                                                                                                  note.createdAt
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
                                                                                              note.id
                                                                                          )
                                                                                      }
                                                                                      variant="ghost"
                                                                                      size="sm"
                                                                                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                                                                  >
                                                                                      <Trash2 className="w-3 h-3" />
                                                                                  </Button>
                                                                              </div>
                                                                          </div>
                                                                      )
                                                                  )}
                                                          </div>
                                                      </div>
                                                  ));
                                              })()
                                            : // For single video courses, show notes normally
                                              currentCourse.notes
                                                  .sort(
                                                      (a, b) =>
                                                          b.timestamp -
                                                          a.timestamp
                                                  )
                                                  .map((note) => (
                                                      <div
                                                          key={note.id}
                                                          className="bg-gray-50 p-3 rounded-lg"
                                                      >
                                                          <div className="flex items-start justify-between gap-2">
                                                              <div className="flex-1">
                                                                  <div className="flex items-center gap-2 mb-1">
                                                                      <Badge
                                                                          variant="secondary"
                                                                          className="cursor-pointer hover:bg-blue-100"
                                                                          onClick={() =>
                                                                              jumpToTimestamp(
                                                                                  note.timestamp
                                                                              )
                                                                          }
                                                                      >
                                                                          {formatTime(
                                                                              Math.floor(
                                                                                  note.timestamp
                                                                              )
                                                                          )}
                                                                      </Badge>
                                                                      <span className="text-xs text-gray-500">
                                                                          {new Date(
                                                                              note.createdAt
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
                                                                          note.id
                                                                      )
                                                                  }
                                                                  variant="ghost"
                                                                  size="sm"
                                                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
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
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                            No course selected. Add a course to get started!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
