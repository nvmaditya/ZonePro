"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Volume2,
    VolumeX,
    Music,
    Plus,
    Trash2,
    Shuffle,
    Repeat,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import type {
    MusicPlayer as MusicPlayerType,
    MusicTrack,
    YTPlayer,
    YTPlayerEvent,
} from "@/types";
import { getYouTubeVideoId } from "@/utils/youtube";
import { DEFAULT_LOFI_VIDEO_ID, DEFAULT_LOFI_TITLE } from "@/lib/constants";

interface MusicPlayerProps {
    musicPlayer: MusicPlayerType;
    showMusicQueue: boolean;
    newMusicUrl: string;
    isYTReady: boolean;
    onToggleQueue: () => void;
    onUpdateMusicPlayer: (updates: Partial<MusicPlayerType>) => void;
    onSetNewMusicUrl: (url: string) => void;
    onPlayTrack: (track: MusicTrack, index: number) => void;
    onDeleteTrack: (trackId: string) => void;
}

export function MusicPlayer({
    musicPlayer,
    showMusicQueue,
    newMusicUrl,
    isYTReady,
    onToggleQueue,
    onUpdateMusicPlayer,
    onSetNewMusicUrl,
    onPlayTrack,
    onDeleteTrack,
}: MusicPlayerProps) {
    const musicPlayerRef = useRef<YTPlayer | null>(null);
    const defaultInitRef = useRef(false);
    const [actualPlayerState, setActualPlayerState] = useState<number | null>(
        null,
    );

    // Initialize default lofi track (only once)
    useEffect(() => {
        if (musicPlayer.playlist.length === 0 && !defaultInitRef.current) {
            defaultInitRef.current = true;
            const lofiTrack: MusicTrack = {
                id: "default-lofi",
                title: DEFAULT_LOFI_TITLE,
                videoId: DEFAULT_LOFI_VIDEO_ID,
                duration: 0,
            };
            onUpdateMusicPlayer({
                playlist: [lofiTrack],
                currentTrack: lofiTrack,
                currentIndex: 0,
            });
        }
    }, [musicPlayer.playlist.length, onUpdateMusicPlayer]);

    // Initialize YouTube music player
    useEffect(() => {
        if (
            isYTReady &&
            typeof window !== "undefined" &&
            window.YT &&
            !musicPlayerRef.current
        ) {
            try {
                musicPlayerRef.current = new window.YT.Player("music-player", {
                    height: "1",
                    width: "1",
                    videoId: DEFAULT_LOFI_VIDEO_ID,
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        loop: 1,
                        playlist: DEFAULT_LOFI_VIDEO_ID,
                    },
                    events: {
                        onReady: (event: YTPlayerEvent) => {
                            try {
                                event.target.setVolume(musicPlayer.volume);
                                window.musicPlayerControls = {
                                    play: () => playMusic(),
                                    pause: () => pauseMusic(),
                                    isPlaying: () => musicPlayer.isPlaying,
                                };
                            } catch {
                                // Player setup error
                            }
                        },
                        onStateChange: (event: YTPlayerEvent) => {
                            try {
                                if (typeof window === "undefined") return;

                                setActualPlayerState(event.data);

                                if (
                                    event.data === window.YT.PlayerState.PLAYING
                                ) {
                                    onUpdateMusicPlayer({ isPlaying: true });
                                } else if (
                                    event.data === window.YT.PlayerState.PAUSED
                                ) {
                                    onUpdateMusicPlayer({ isPlaying: false });
                                } else if (
                                    event.data === window.YT.PlayerState.ENDED
                                ) {
                                    onUpdateMusicPlayer({ isPlaying: false });
                                    playNextTrack();
                                }
                            } catch {
                                // State change error
                            }
                        },
                        onError: () => {
                            // Music player error
                        },
                    },
                });
            } catch {
                // Player creation error
            }
        }
    }, [isYTReady]);

    // Update music player volume
    useEffect(() => {
        if (musicPlayerRef.current) {
            try {
                if (typeof musicPlayerRef.current.setVolume === "function") {
                    musicPlayerRef.current.setVolume(
                        musicPlayer.isMuted ? 0 : musicPlayer.volume,
                    );
                }
            } catch {
                // Volume setting error
            }
        }
    }, [musicPlayer.volume, musicPlayer.isMuted]);

    // Update global controls when isPlaying changes
    useEffect(() => {
        if (typeof window !== "undefined" && window.musicPlayerControls) {
            window.musicPlayerControls.isPlaying = () => musicPlayer.isPlaying;
        }
    }, [musicPlayer.isPlaying]);

    const playMusic = () => {
        if (musicPlayerRef.current && musicPlayer.currentTrack) {
            try {
                if (typeof musicPlayerRef.current.playVideo === "function") {
                    musicPlayerRef.current.playVideo();
                }
            } catch {
                // Play error
            }
        }
    };

    const pauseMusic = () => {
        if (musicPlayerRef.current) {
            try {
                if (typeof musicPlayerRef.current.pauseVideo === "function") {
                    musicPlayerRef.current.pauseVideo();
                }
            } catch {
                // Pause error
            }
        }
    };

    const playNextTrack = () => {
        if (musicPlayer.playlist.length > 0) {
            let nextIndex: number;

            if (musicPlayer.shuffle) {
                // Pick a random index different from current
                if (musicPlayer.playlist.length === 1) {
                    nextIndex = 0;
                } else {
                    do {
                        nextIndex = Math.floor(
                            Math.random() * musicPlayer.playlist.length,
                        );
                    } while (nextIndex === musicPlayer.currentIndex);
                }
            } else {
                nextIndex = musicPlayer.currentIndex + 1;
                if (nextIndex >= musicPlayer.playlist.length) {
                    nextIndex = musicPlayer.repeat
                        ? 0
                        : musicPlayer.playlist.length - 1;
                }
            }

            const nextTrack = musicPlayer.playlist[nextIndex];
            onUpdateMusicPlayer({
                currentTrack: nextTrack,
                currentIndex: nextIndex,
            });

            if (musicPlayerRef.current && nextTrack) {
                try {
                    if (
                        typeof musicPlayerRef.current.loadVideoById ===
                        "function"
                    ) {
                        // loadVideoById auto-plays the video
                        musicPlayerRef.current.loadVideoById(nextTrack.videoId);
                    }
                } catch {
                    // Next track error
                }
            }
        }
    };

    const playPreviousTrack = () => {
        if (musicPlayer.playlist.length > 0) {
            let prevIndex: number;
            if (musicPlayer.shuffle && musicPlayer.playlist.length > 1) {
                do {
                    prevIndex = Math.floor(Math.random() * musicPlayer.playlist.length);
                } while (prevIndex === musicPlayer.currentIndex);
            } else {
                prevIndex = musicPlayer.currentIndex - 1;
                if (prevIndex < 0) {
                    prevIndex = musicPlayer.repeat
                        ? musicPlayer.playlist.length - 1
                        : 0;
                }
            }

            const prevTrack = musicPlayer.playlist[prevIndex];
            onUpdateMusicPlayer({
                currentTrack: prevTrack,
                currentIndex: prevIndex,
            });

            if (musicPlayerRef.current && prevTrack) {
                try {
                    if (
                        typeof musicPlayerRef.current.loadVideoById ===
                        "function"
                    ) {
                        // loadVideoById auto-plays the video
                        musicPlayerRef.current.loadVideoById(prevTrack.videoId);
                    }
                } catch {
                    // Previous track error
                }
            }
        }
    };

    const handleAddMusicTrack = () => {
        if (newMusicUrl) {
            const videoId = getYouTubeVideoId(newMusicUrl);
            if (videoId) {
                const newTrack: MusicTrack = {
                    id: Date.now().toString(),
                    title: `Track ${musicPlayer.playlist.length + 1}`,
                    videoId,
                    duration: 0,
                };
                onUpdateMusicPlayer({
                    playlist: [...musicPlayer.playlist, newTrack],
                    currentTrack: musicPlayer.currentTrack || newTrack,
                });
                onSetNewMusicUrl("");
            }
        }
    };

    const handlePlayTrack = (track: MusicTrack, index: number) => {
        onUpdateMusicPlayer({
            currentTrack: track,
            currentIndex: index,
        });

        if (musicPlayerRef.current) {
            try {
                if (
                    typeof musicPlayerRef.current.loadVideoById === "function"
                ) {
                    // loadVideoById auto-plays the video, no need for setTimeout
                    musicPlayerRef.current.loadVideoById(track.videoId);
                }
            } catch {
                // Track play error
            }
        }
    };

    // Derive the actual playing state from YouTube player
    const isActuallyPlaying =
        typeof window !== "undefined" &&
        actualPlayerState === window.YT?.PlayerState?.PLAYING;
    const shouldShowPause = musicPlayer.isPlaying && isActuallyPlaying;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        Music Player
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleQueue}
                        className="h-8 w-8 p-0"
                    >
                        {showMusicQueue ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronUp className="h-4 w-4" />
                        )}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-3">
                {/* Music Player Controls */}
                <div className="bg-muted p-4 rounded-lg">
                    <div className="text-center mb-3">
                        <h3 className="font-medium mb-1 truncate">
                            {musicPlayer.currentTrack?.title ||
                                "No track selected"}
                        </h3>
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Button
                            onClick={playPreviousTrack}
                            variant="outline"
                            size="sm"
                            disabled={musicPlayer.playlist.length === 0}
                            className="h-8 w-8 p-0"
                        >
                            <SkipBack className="w-4 h-4" />
                        </Button>

                        <Button
                            onClick={
                                musicPlayer.isPlaying ? pauseMusic : playMusic
                            }
                            size="sm"
                            disabled={!musicPlayer.currentTrack}
                            className="h-10 w-10 rounded-full p-0"
                        >
                            {shouldShowPause ? (
                                <Pause className="w-4 h-4" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                        </Button>

                        <Button
                            onClick={playNextTrack}
                            variant="outline"
                            size="sm"
                            disabled={musicPlayer.playlist.length === 0}
                            className="h-8 w-8 p-0"
                        >
                            <SkipForward className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() =>
                                onUpdateMusicPlayer({
                                    isMuted: !musicPlayer.isMuted,
                                })
                            }
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            {musicPlayer.isMuted ? (
                                <VolumeX className="w-4 h-4" />
                            ) : (
                                <Volume2 className="w-4 h-4" />
                            )}
                        </Button>

                        <Slider
                            value={[musicPlayer.volume]}
                            onValueChange={([value]) =>
                                onUpdateMusicPlayer({ volume: value })
                            }
                            max={100}
                            min={0}
                            className="flex-1"
                        />
                    </div>
                </div>

                {/* Music Queue - Revealed on scroll */}
                {showMusicQueue && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Queue</h4>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() =>
                                        onUpdateMusicPlayer({
                                            shuffle: !musicPlayer.shuffle,
                                        })
                                    }
                                    variant={
                                        musicPlayer.shuffle
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                >
                                    <Shuffle className="w-4 h-4" />
                                </Button>
                                <Button
                                    onClick={() =>
                                        onUpdateMusicPlayer({
                                            repeat: !musicPlayer.repeat,
                                        })
                                    }
                                    variant={
                                        musicPlayer.repeat
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                >
                                    <Repeat className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Add Music Input */}
                        <div className="flex gap-2">
                            <Input
                                value={newMusicUrl}
                                onChange={(e) =>
                                    onSetNewMusicUrl(e.target.value)
                                }
                                placeholder="YouTube URL"
                                size={1}
                            />
                            <Button
                                onClick={handleAddMusicTrack}
                                size="sm"
                                className="shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Music Queue List */}
                        {musicPlayer.playlist.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {musicPlayer.playlist.map((track, index) => (
                                    <div
                                        key={track.id}
                                        className={`flex items-center justify-between p-2 rounded-md border ${
                                            musicPlayer.currentIndex === index
                                                ? "bg-primary/10 border-primary/20"
                                                : "hover:bg-muted"
                                        }`}
                                    >
                                        <div className="flex-1 truncate mr-2">
                                            <p className="font-medium text-sm truncate">
                                                {track.title}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <Button
                                                onClick={() =>
                                                    handlePlayTrack(
                                                        track,
                                                        index,
                                                    )
                                                }
                                                size="sm"
                                                variant={
                                                    musicPlayer.currentIndex ===
                                                    index
                                                        ? "default"
                                                        : "ghost"
                                                }
                                                className="h-7 w-7 p-0"
                                            >
                                                <Play className="w-3 h-3" />
                                            </Button>
                                            {track.id !== "default-lofi" && (
                                                <Button
                                                    onClick={() =>
                                                        onDeleteTrack(track.id)
                                                    }
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 w-7 p-0"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-2">
                                No tracks in queue
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
