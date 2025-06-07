"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Download, Upload } from "lucide-react"
import type { PomodoroSession } from "@/types"

interface SettingsSheetProps {
  settings: {
    autoMusicPause: boolean
    defaultWorkTime: number
    defaultBreakTime: number
  }
  pomodoro: PomodoroSession
  coursesCount: number
  musicTracksCount: number
  onUpdateSettings: (updates: any) => void
  onUpdatePomodoro: (updates: Partial<PomodoroSession>) => void
  onExportSession: () => void
  onImportSession: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function SettingsSheet({
  settings,
  pomodoro,
  coursesCount,
  musicTracksCount,
  onUpdateSettings,
  onUpdatePomodoro,
  onExportSession,
  onImportSession,
}: SettingsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Configure your learning environment</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Auto-pause music during course</Label>
              <p className="text-sm text-gray-600">Automatically pause background music when course video is playing</p>
            </div>
            <Switch
              checked={settings.autoMusicPause}
              onCheckedChange={(checked) => onUpdateSettings({ ...settings, autoMusicPause: checked })}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pomodoro Settings</h3>
            <div>
              <Label>Work Time (minutes)</Label>
              <Slider
                value={[pomodoro.workTime]}
                onValueChange={([value]) => onUpdatePomodoro({ workTime: value })}
                max={60}
                min={5}
                step={5}
                className="mt-2"
              />
              <p className="text-sm text-gray-600 mt-1">{pomodoro.workTime} minutes</p>
            </div>
            <div>
              <Label>Break Time (minutes)</Label>
              <Slider
                value={[pomodoro.breakTime]}
                onValueChange={([value]) => onUpdatePomodoro({ breakTime: value })}
                max={30}
                min={5}
                step={5}
                className="mt-2"
              />
              <p className="text-sm text-gray-600 mt-1">{pomodoro.breakTime} minutes</p>
            </div>
            <div>
              <Label>Total Sessions</Label>
              <Slider
                value={[pomodoro.totalSessions]}
                onValueChange={([value]) => onUpdatePomodoro({ totalSessions: value })}
                max={8}
                min={1}
                step={1}
                className="mt-2"
              />
              <p className="text-sm text-gray-600 mt-1">{pomodoro.totalSessions} sessions</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Session Management</h3>
            <p className="text-sm text-gray-600">
              Export your complete learning session including all courses, timestamps, music playlists, and settings.
              Import to resume exactly where you left off.
            </p>
            <div className="flex gap-4">
              <Button onClick={onExportSession} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export Session
              </Button>
              <div className="flex-1">
                <Input type="file" accept=".json" onChange={onImportSession} className="hidden" id="import-session" />
                <Button asChild variant="outline" className="w-full">
                  <label htmlFor="import-session" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Session
                  </label>
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Session Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{coursesCount}</div>
                <div className="text-sm text-gray-600">Total Courses</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{musicTracksCount}</div>
                <div className="text-sm text-gray-600">Music Tracks</div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
