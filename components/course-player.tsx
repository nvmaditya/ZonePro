"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { BookOpen, Plus, StickyNote, Trash2 } from "lucide-react"
import type { CourseProgress, CourseNote } from "@/types"
import { formatTime } from "@/utils/youtube"

interface CoursePlayerProps {
  currentCourse: CourseProgress | null
  onCourseUpdate: (courseId: string, updates: Partial<CourseProgress>) => void
  onAddCourse: () => void
  isYTReady: boolean
  settings: { autoMusicPause: boolean }
  onMusicControl: (action: "pause" | "play") => void
  musicWasPlaying: boolean
  setMusicWasPlaying: (playing: boolean) => void
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
  const coursePlayerRef = useRef<any>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [playerStateBeforeNote, setPlayerStateBeforeNote] = useState<number | null>(null)
  const [currentTimestamp, setCurrentTimestamp] = useState(0)
  // Add internal music state tracking
  const musicStateRef = useRef<boolean>(false)

  // Reset player ready state when course changes
  useEffect(() => {
    setPlayerReady(false)
  }, [currentCourse?.id])

  useEffect(() => {
    // Only proceed if YouTube API is ready and we have a current course
    if (isYTReady && window.YT && currentCourse) {
      let attempts = 0
      const maxAttempts = 3

      const initPlayer = () => {
        // Safety cleanup for existing player
        if (coursePlayerRef.current) {
          try {
            coursePlayerRef.current.destroy()
          } catch (error) {
            console.warn("Error destroying player:", error)
          }
          coursePlayerRef.current = null
        }

        // Create a fresh container
        const container = document.getElementById("course-player")
        if (!container) {
          console.error("Course player container not found")
          return
        }

        // Clear container and create new element
        container.innerHTML = ""
        const playerDiv = document.createElement("div")
        playerDiv.id = "course-player-iframe"
        container.appendChild(playerDiv)

        try {
          coursePlayerRef.current = new window.YT.Player("course-player-iframe", {
            height: "100%",
            width: "100%",
            videoId: currentCourse.videoId,
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
                  event.target.seekTo(currentCourse.currentTime)
                  setPlayerReady(true)
                  console.log("YouTube player ready")
                } catch (error) {
                  console.warn("Error during onReady:", error)
                }
              },
              onStateChange: (event: any) => {
                handlePlayerStateChange(event.data)
              },
              onError: (event: any) => {
                console.error("YouTube player error:", event.data)
                // Retry initialization on error
                if (attempts < maxAttempts) {
                  attempts++
                  setTimeout(initPlayer, 1000)
                }
              },
            },
          })
        } catch (error) {
          console.error("Error initializing YouTube player:", error)
          if (attempts < maxAttempts) {
            attempts++
            setTimeout(initPlayer, 1000)
          }
        }
      }

      // Start player initialization
      initPlayer()

      // Cleanup function
      return () => {
        if (coursePlayerRef.current) {
          try {
            coursePlayerRef.current.destroy()
          } catch (error) {
            console.warn("Error destroying player on cleanup:", error)
          }
          coursePlayerRef.current = null
        }
      }
    }
  }, [isYTReady, currentCourse?.id, currentCourse?.videoId])

  const handlePlayerStateChange = (playerState: number) => {
    if (!currentCourse || !coursePlayerRef.current) return

    console.log("Player state changed:", playerState)

    try {
      // When video starts playing
      if (playerState === window.YT.PlayerState.PLAYING) {
        // Check if music is currently playing before pausing it
        try {
          const musicControls = (window as any).musicPlayerControls
          if (musicControls && typeof musicControls.isPlaying === "function") {
            // Store whether music was playing before pausing
            const isPlaying = musicControls.isPlaying()
            console.log("Music playing check result:", isPlaying)

            // Store in both state and ref for redundancy
            setMusicWasPlaying(isPlaying)
            musicStateRef.current = isPlaying

            // Pause music if auto-pause is enabled
            if (settings.autoMusicPause && isPlaying) {
              console.log("Auto-pausing music - confirmed playing")
              onMusicControl("pause")
            }
          } else {
            console.log("Music controls not available or missing isPlaying method")
            // Fallback: just try to pause music anyway if auto-pause is enabled
            if (settings.autoMusicPause) {
              console.log("Auto-pausing music - fallback method")
              onMusicControl("pause")
            }
          }
        } catch (error) {
          console.warn("Error with music controls:", error)
        }
      }
      // When video is paused
      else if (playerState === window.YT.PlayerState.PAUSED) {
        // Update course progress when paused
        updateCourseProgress()

        // Use both state and ref to determine if music should be resumed
        const shouldResume = settings.autoMusicPause && (musicWasPlaying || musicStateRef.current)

        console.log(
          "Video paused, should resume music:",
          shouldResume,
          "musicWasPlaying:",
          musicWasPlaying,
          "musicStateRef:",
          musicStateRef.current,
        )

        if (shouldResume && !showNoteDialog) {
          console.log("Auto-resuming music")
          onMusicControl("play")
        }
      }
      // Also handle ended state
      else if (playerState === window.YT.PlayerState.ENDED) {
        updateCourseProgress()

        // Also resume music when video ends
        if (settings.autoMusicPause && (musicWasPlaying || musicStateRef.current)) {
          console.log("Video ended, auto-resuming music")
          onMusicControl("play")
        }
      }
    } catch (error) {
      console.warn("Error in player state change handler:", error)
    }
  }

  const updateCourseProgress = () => {
    if (!coursePlayerRef.current || !currentCourse) return

    try {
      // Check if the player methods are available
      if (
        typeof coursePlayerRef.current.getCurrentTime === "function" &&
        typeof coursePlayerRef.current.getDuration === "function"
      ) {
        const currentTime = coursePlayerRef.current.getCurrentTime()
        const duration = coursePlayerRef.current.getDuration()

        // Only update if we have valid values
        if (
          typeof currentTime === "number" &&
          typeof duration === "number" &&
          !isNaN(currentTime) &&
          !isNaN(duration)
        ) {
          onCourseUpdate(currentCourse.id, {
            currentTime,
            duration,
            lastWatched: new Date(),
          })
        }
      }
    } catch (error) {
      console.warn("Error updating course progress:", error)
    }
  }

  const getCurrentTime = () => {
    if (!coursePlayerRef.current || !playerReady) return 0
    try {
      return coursePlayerRef.current.getCurrentTime() || 0
    } catch (error) {
      console.warn("Error getting current time:", error)
      return 0
    }
  }

  const getPlayerState = () => {
    if (!coursePlayerRef.current || !playerReady) return null
    try {
      return coursePlayerRef.current.getPlayerState()
    } catch (error) {
      console.warn("Error getting player state:", error)
      return null
    }
  }

  const startAddingNote = () => {
    if (!coursePlayerRef.current || !playerReady || !currentCourse) return

    try {
      // Store current player state
      const currentState = getPlayerState()
      setPlayerStateBeforeNote(currentState)

      // Store current timestamp
      const timestamp = getCurrentTime()
      setCurrentTimestamp(timestamp)

      // Pause the video
      coursePlayerRef.current.pauseVideo()

      // Open note dialog
      setShowNoteDialog(true)
    } catch (error) {
      console.warn("Error starting note:", error)
    }
  }

  const addNote = () => {
    if (!newNote.trim() || !currentCourse) return

    const note: CourseNote = {
      id: Date.now().toString(),
      timestamp: currentTimestamp,
      content: newNote.trim(),
      createdAt: new Date(),
    }

    const updatedNotes = [...(currentCourse.notes || []), note]
    onCourseUpdate(currentCourse.id, { notes: updatedNotes })
    setNewNote("")
    setShowNoteDialog(false)

    // Resume video if it was playing before
    if (playerStateBeforeNote === window.YT.PlayerState.PLAYING && coursePlayerRef.current) {
      try {
        coursePlayerRef.current.playVideo()
      } catch (error) {
        console.warn("Error resuming video:", error)
      }
    }

    setPlayerStateBeforeNote(null)
  }

  const cancelAddNote = () => {
    setNewNote("")
    setShowNoteDialog(false)

    // Resume video if it was playing before
    if (playerStateBeforeNote === window.YT.PlayerState.PLAYING && coursePlayerRef.current) {
      try {
        coursePlayerRef.current.playVideo()
      } catch (error) {
        console.warn("Error resuming video:", error)
      }
    }

    setPlayerStateBeforeNote(null)
  }

  const deleteNote = (noteId: string) => {
    if (!currentCourse) return
    const updatedNotes = (currentCourse.notes || []).filter((note) => note.id !== noteId)
    onCourseUpdate(currentCourse.id, { notes: updatedNotes })
  }

  const jumpToTimestamp = (timestamp: number) => {
    if (!coursePlayerRef.current || !playerReady) return
    try {
      coursePlayerRef.current.seekTo(timestamp)
    } catch (error) {
      console.warn("Error seeking to timestamp:", error)
    }
  }

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
            <h3 className="text-lg font-semibold">{currentCourse.title}</h3>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <div id="course-player" className="w-full h-full"></div>
            </div>
            <div className="flex justify-between items-center">
              <Progress
                value={currentCourse.duration > 0 ? (currentCourse.currentTime / currentCourse.duration) * 100 : 0}
                className="flex-1 mr-4"
              />
              <p className="text-sm text-gray-600 mr-4">
                {formatTime(Math.floor(currentCourse.currentTime))} / {formatTime(Math.floor(currentCourse.duration))}
              </p>
            </div>

            {/* Add Note Button */}
            <Button onClick={startAddingNote} variant="outline" size="sm" disabled={!playerReady} className="w-full">
              <StickyNote className="w-4 h-4 mr-2" />
              Add Note
            </Button>

            {/* Notes List */}
            {currentCourse.notes && currentCourse.notes.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto border-t pt-4">
                <h4 className="font-medium flex items-center gap-2">
                  <StickyNote className="w-4 h-4" />
                  Course Notes ({currentCourse.notes.length})
                </h4>
                <div className="space-y-3">
                  {currentCourse.notes
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map((note) => (
                      <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="secondary"
                                className="cursor-pointer hover:bg-blue-100"
                                onClick={() => jumpToTimestamp(note.timestamp)}
                              >
                                {formatTime(Math.floor(note.timestamp))}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{note.content}</p>
                          </div>
                          <Button
                            onClick={() => deleteNote(note.id)}
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
            <p className="text-gray-600">No course selected. Add a course to get started!</p>
          </div>
        )}

        {/* Note Dialog */}
        <Dialog open={showNoteDialog} onOpenChange={(open) => !open && cancelAddNote()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Note at {formatTime(Math.floor(currentTimestamp))}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="What did you learn at this moment?"
                className="min-h-[120px]"
                autoFocus
              />
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" onClick={cancelAddNote}>
                Cancel
              </Button>
              <Button onClick={addNote} disabled={!newNote.trim()}>
                Save Note & Resume
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
