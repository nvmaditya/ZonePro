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

export interface PomodoroSession {
    workTime: number;
    breakTime: number;
    currentSession: number;
    totalSessions: number;
    isActive: boolean;
    isBreak: boolean;
    timeLeft: number;
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
    settings: {
        autoMusicPause: boolean;
    };
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
