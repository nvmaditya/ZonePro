"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Pause } from "lucide-react"
import type { PomodoroSession } from "@/types"
import { formatTime } from "@/utils/youtube"

interface PomodoroTimerProps {
  pomodoro: PomodoroSession
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

export function PomodoroTimer({ pomodoro, onStart, onPause, onReset }: PomodoroTimerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-primary mb-2">{formatTime(pomodoro.timeLeft)}</div>
          <Badge variant={pomodoro.isBreak ? "secondary" : "default"}>
            {pomodoro.isBreak ? "Break Time" : "Focus Time"}
          </Badge>
        </div>
        <div className="flex gap-2">
          {!pomodoro.isActive ? (
            <Button onClick={onStart} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={onPause} variant="outline" className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          <Button onClick={onReset} variant="outline">
            Reset
          </Button>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Session {pomodoro.currentSession} of {pomodoro.totalSessions}
        </div>
      </CardContent>
    </Card>
  )
}
