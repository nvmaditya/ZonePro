export interface CourseProgress {
  id: string
  title: string
  url: string
  videoId: string
  currentTime: number
  duration: number
  completed: boolean
  lastWatched: Date
  playlistId?: string
  playlistIndex?: number
}

export interface PomodoroSession {
  workTime: number
  breakTime: number
  currentSession: number
  totalSessions: number
  isActive: boolean
  isBreak: boolean
  timeLeft: number
}

export interface MusicTrack {
  id: string
  title: string
  videoId: string
  duration: number
}

export interface MusicPlayer {
  currentTrack: MusicTrack | null
  playlist: MusicTrack[]
  volume: number
  isPlaying: boolean
  isMuted: boolean
  currentTime: number
  shuffle: boolean
  repeat: boolean
  currentIndex: number
}

export interface SessionData {
  courses: CourseProgress[]
  pomodoro: PomodoroSession
  music: MusicPlayer
  settings: {
    autoMusicPause: boolean
    defaultWorkTime: number
    defaultBreakTime: number
  }
  timestamp: Date
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}
