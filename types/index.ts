export interface CourseNote {
    id: string;
    timestamp: number;
    content: string;
    createdAt: Date;
}

export interface PlaylistVideoProgress {
    videoId: string;
    currentTime: number;
    duration: number;
    completed: boolean;
    lastWatched: Date;
    title?: string;
}

export interface PlaylistMetadata {
    totalVideos: number;
    totalDuration?: number;
    title?: string;
    description?: string;
}

export interface VideoNote extends CourseNote {
    videoId?: string; // Associate note with specific video in playlist
    videoTitle?: string;
}

export interface CourseProgress {
    id: string;
    title: string;
    url: string;
    videoId: string;
    currentTime: number;
    duration: number;
    completed: boolean;
    lastWatched: Date;
    playlistId?: string;
    playlistIndex?: number;
    notes?: VideoNote[]; // Updated to use VideoNote
    playlistProgress?: { [videoId: string]: PlaylistVideoProgress }; // Track progress for each video in playlist
    playlistMetadata?: PlaylistMetadata; // Store playlist info
}

export type PomodoroMode = "pomodoro" | "timer" | "stopwatch";

export interface PomodoroSession {
    workTime: number;
    breakTime: number;
    currentSession: number;
    totalSessions: number;
    isActive: boolean;
    isBreak: boolean;
    timeLeft: number;
    mode: PomodoroMode;
    timerDuration?: number;
    elapsed?: number;
}

export interface MusicTrack {
    id: string;
    title: string;
    videoId: string;
    duration: number;
}

export interface MusicPlayer {
    currentTrack: MusicTrack | null;
    playlist: MusicTrack[];
    volume: number;
    isPlaying: boolean;
    isMuted: boolean;
    currentTime: number;
    shuffle: boolean;
    repeat: boolean;
    currentIndex: number;
}

export interface SessionData {
    courses: CourseProgress[];
    pomodoro: PomodoroSession;
    music: MusicPlayer;
    settings: AppSettings;
    timestamp: Date;
}

export interface YTPlayerEvent {
    target: YTPlayer;
    data: number;
}

export interface YTPlayer {
    playVideo: () => void;
    pauseVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getPlayerState: () => number;
    setVolume: (volume: number) => void;
    loadVideoById: (videoId: string) => void;
    destroy: () => void;
}

export interface YTPlayerConfig {
    height: string;
    width: string;
    videoId: string;
    playerVars?: Record<string, unknown>;
    events?: {
        onReady?: (event: YTPlayerEvent) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
        onError?: (event: YTPlayerEvent) => void;
    };
}

// ============ TASK MANAGEMENT ============

export type TaskPriority = "urgent" | "high" | "medium" | "low" | "none";
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    labels: string[];
    dueDate?: string;
    parentId?: string;
    dependsOn?: string[];
    linkedNoteIds?: string[];
    linkedFocusSessionIds?: string[];
    recurrence?: TaskRecurrence | null;
    estimatedMinutes?: number;
    actualMinutes?: number;
    sortOrder: number;
    createdAt: string;
    completedAt?: string;
    updatedAt: string;
}

export interface TaskRecurrence {
    frequency: "daily" | "weekly" | "monthly" | "custom";
    interval: number;
    daysOfWeek?: number[];
    nextDue?: string;
}

// ============ FOCUS & TIME ============

export interface FocusSession {
    id: string;
    taskId?: string;
    type: "pomodoro" | "stopwatch" | "timeblock";
    startedAt: string;
    endedAt?: string;
    plannedMinutes: number;
    actualMinutes: number;
    completed: boolean;
    notes?: string;
    date: string;
}

export interface DailyTimeBudget {
    date: string;
    budgetMinutes: number;
    actualMinutes: number;
}

// ============ HABITS ============

export interface Habit {
    id: string;
    title: string;
    description?: string;
    frequency: "daily" | "weekly" | "custom";
    targetDays?: number[];
    targetCount: number;
    color: string;
    icon?: string;
    createdAt: string;
    archivedAt?: string;
    sortOrder: number;
}

export interface HabitLog {
    id: string;
    habitId: string;
    date: string;
    count: number;
    note?: string;
}

// ============ NOTES ============

export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    isArchived: boolean;
    linkedTaskIds?: string[];
    linkedCourseId?: string;
    createdAt: string;
    updatedAt: string;
}

// ============ PLANNING ============

export interface Goal {
    id: string;
    title: string;
    description?: string;
    targetDate?: string;
    milestones: Milestone[];
    status: "active" | "completed" | "abandoned";
    createdAt: string;
    updatedAt: string;
}

export interface Milestone {
    id: string;
    title: string;
    completed: boolean;
    linkedTaskIds?: string[];
    sortOrder: number;
}

export interface DailyPriority {
    date: string;
    taskIds: string[];
}

export interface TimeBlock {
    id: string;
    date: string;
    startHour: number;
    startMinute: number;
    durationMinutes: number;
    title: string;
    taskId?: string;
    color?: string;
}

// ============ APP SETTINGS ============

export interface AppSettings {
    autoMusicPause: boolean;
    defaultView: string;
    taskDefaultView: "list" | "kanban" | "calendar";
    dailyTimeBudgetMinutes: number;
    weekStartsOn: 0 | 1;
}

declare global {
    interface Window {
        YT: {
            Player: new (elementId: string, config: YTPlayerConfig) => YTPlayer;
            PlayerState: {
                UNSTARTED: number;
                ENDED: number;
                PLAYING: number;
                PAUSED: number;
                BUFFERING: number;
                CUED: number;
            };
        };
        onYouTubeIframeAPIReady: () => void;
        musicPlayerControls?: {
            play: () => void;
            pause: () => void;
            isPlaying: () => boolean;
        };
    }
}
