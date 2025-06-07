"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Plus } from "lucide-react"
import type { CourseProgress } from "@/types"
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

  useEffect(() => {
    if (isYTReady && window.YT && currentCourse) {
      // Destroy existing player
      if (coursePlayerRef.current) {
        try {
          coursePlayerRef.current.destroy()
        } catch (error) {
          console.warn("Error destroying player:", error)
        }
        coursePlayerRef.current = null
      }

      setTimeout(() => {
        try {
          coursePlayerRef.current = new window.YT.Player("course-player", {
            height: "100%",
            width: "100%",
            videoId: currentCourse.videoId,
            playerVars: {
              start: Math.floor(currentCourse.currentTime),
              autoplay: 0,
              controls: 1,
              rel: 0,
            },
            events: {
              onReady: (event: any) => {
                try {
                  event.target.seekTo(currentCourse.currentTime)
                } catch (error) {
                  console.warn("Error seeking to time:", error)
                }
              },
              onStateChange: (event: any) => {
                handlePlayerStateChange(event.data)
              },
              onError: (event: any) => {
                console.error("YouTube player error:", event.data)
              },
            },
          })
        } catch (error) {
          console.error("Error creating YouTube player:", error)
        }
      }, 100)
    }
  }, [isYTReady, currentCourse])

  const handlePlayerStateChange = (playerState: number) => {
    if (!currentCourse || !coursePlayerRef.current) return

    try {
      // When video starts playing
      if (playerState === window.YT.PlayerState.PLAYING) {
        // Check if music is currently playing before pausing it
        try {
          const musicControls = (window as any).musicPlayerControls
          if (musicControls && typeof musicControls.isPlaying === "function") {
            // Store whether music was playing before pausing
            setMusicWasPlaying(musicControls.isPlaying())
          }
        } catch (error) {
          console.warn("Error checking music state:", error)
        }

        // Pause music if auto-pause is enabled
        if (settings.autoMusicPause) {
          onMusicControl("pause")
        }
      }
      // When video is manually paused by user
      else if (playerState === window.YT.PlayerState.PAUSED) {
        // Update course info only when manually paused
        updateCourseProgress()

        // Only auto-start music if it was playing before
        if (musicWasPlaying) {
          onMusicControl("play")
        }
      }
    } catch (error) {
      console.warn("Error handling player state change:", error)
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
            <Progress
              value={currentCourse.duration > 0 ? (currentCourse.currentTime / currentCourse.duration) * 100 : 0}
            />
            {currentCourse.duration > 0 && (
              <p className="text-sm text-gray-600">
                Progress: {formatTime(Math.floor(currentCourse.currentTime))} /{" "}
                {formatTime(Math.floor(currentCourse.duration))}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No course selected. Add a course to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
