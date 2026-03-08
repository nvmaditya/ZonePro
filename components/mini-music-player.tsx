"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Music,
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Volume2,
    VolumeX,
    Plus,
    Trash2,
    Shuffle,
    Repeat,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import type { MusicPlayer as MusicPlayerType, MusicTrack } from "@/types";
import { getYouTubeVideoId } from "@/utils/youtube";
import { DEFAULT_LOFI_VIDEO_ID, DEFAULT_LOFI_TITLE } from "@/lib/constants";

interface MiniMusicPlayerProps {
    musicPlayer: MusicPlayerType;
    isActuallyPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    showMusicQueue: boolean;
    newMusicUrl: string;
    onToggleQueue: () => void;
    onUpdateMusicPlayer: (updates: Partial<MusicPlayerType>) => void;
    onSetNewMusicUrl: (url: string) => void;
    onPlayTrack: (track: MusicTrack, index: number) => void;
    onDeleteTrack: (trackId: string) => void;
    onActivate: () => void;
}

export function MiniMusicPlayer({
    musicPlayer,
    isActuallyPlaying,
    onPlay,
    onPause,
    onNext,
    onPrev,
    showMusicQueue,
    newMusicUrl,
    onToggleQueue,
    onUpdateMusicPlayer,
    onSetNewMusicUrl,
    onPlayTrack,
    onDeleteTrack,
    onActivate,
}: MiniMusicPlayerProps) {
    const defaultInitRef = useRef(false);

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

    const shouldShowPause = musicPlayer.isPlaying && isActuallyPlaying;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2 py-1 hover:bg-muted transition-colors cursor-pointer">
                    <Music className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs truncate max-w-[80px] hidden sm:inline">
                        {musicPlayer.currentTrack?.title || "No track"}
                    </span>
                    {shouldShowPause ? (
                        <Pause className="h-3 w-3 shrink-0" />
                    ) : (
                        <Play className="h-3 w-3 shrink-0" />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                <div className="p-4 space-y-4">
                    {/* Track Title */}
                    <div className="text-center">
                        <h3 className="font-medium truncate">
                            {musicPlayer.currentTrack?.title ||
                                "No track selected"}
                        </h3>
                    </div>

                    {/* Transport Controls */}
                    <div className="flex items-center justify-center gap-3">
                        <Button
                            onClick={() => { onActivate(); onUpdateMusicPlayer({ isMuted: false }); onPrev(); }}
                            variant="outline"
                            size="sm"
                            disabled={musicPlayer.playlist.length === 0}
                            className="h-8 w-8 p-0"
                        >
                            <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={shouldShowPause ? onPause : () => { onActivate(); onUpdateMusicPlayer({ isMuted: false }); onPlay(); }}
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
                            onClick={() => { onActivate(); onUpdateMusicPlayer({ isMuted: false }); onNext(); }}
                            variant="outline"
                            size="sm"
                            disabled={musicPlayer.playlist.length === 0}
                            className="h-8 w-8 p-0"
                        >
                            <SkipForward className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                if (musicPlayer.isMuted) onActivate();
                                onUpdateMusicPlayer({
                                    isMuted: !musicPlayer.isMuted,
                                });
                            }}
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

                    {/* Queue Toggle */}
                    <div className="flex items-center justify-between border-t pt-3">
                        <span className="text-sm font-medium">Queue</span>
                        <div className="flex items-center gap-1">
                            <Button
                                onClick={() =>
                                    onUpdateMusicPlayer({
                                        shuffle: !musicPlayer.shuffle,
                                    })
                                }
                                variant={
                                    musicPlayer.shuffle ? "default" : "outline"
                                }
                                size="sm"
                                className="h-7 w-7 p-0"
                            >
                                <Shuffle className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                onClick={() =>
                                    onUpdateMusicPlayer({
                                        repeat: !musicPlayer.repeat,
                                    })
                                }
                                variant={
                                    musicPlayer.repeat ? "default" : "outline"
                                }
                                size="sm"
                                className="h-7 w-7 p-0"
                            >
                                <Repeat className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onToggleQueue}
                                className="h-7 w-7 p-0"
                            >
                                {showMusicQueue ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                    <ChevronUp className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Queue List */}
                    {showMusicQueue && (
                        <div className="space-y-3">
                            {/* Add Track */}
                            <div className="flex gap-2">
                                <Input
                                    value={newMusicUrl}
                                    onChange={(e) =>
                                        onSetNewMusicUrl(e.target.value)
                                    }
                                    placeholder="YouTube URL"
                                    size={1}
                                    className="text-xs"
                                />
                                <Button
                                    onClick={handleAddMusicTrack}
                                    size="sm"
                                    className="shrink-0 h-8 w-8 p-0"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </Button>
                            </div>

                            {/* Track List */}
                            {musicPlayer.playlist.length > 0 ? (
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                    {musicPlayer.playlist.map(
                                        (track, index) => (
                                            <div
                                                key={track.id}
                                                className={`flex items-center justify-between p-1.5 rounded-md border ${
                                                    musicPlayer.currentIndex ===
                                                    index
                                                        ? "bg-primary/10 border-primary/20"
                                                        : "hover:bg-muted"
                                                }`}
                                            >
                                                <p className="flex-1 text-xs font-medium truncate mr-2">
                                                    {track.title}
                                                </p>
                                                <div className="flex gap-0.5 shrink-0">
                                                    <Button
                                                        onClick={() => {
                                                            onActivate();
                                                            onUpdateMusicPlayer({ isMuted: false });
                                                            onPlayTrack(
                                                                track,
                                                                index,
                                                            );
                                                        }}
                                                        size="sm"
                                                        variant={
                                                            musicPlayer.currentIndex ===
                                                            index
                                                                ? "default"
                                                                : "ghost"
                                                        }
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Play className="w-2.5 h-2.5" />
                                                    </Button>
                                                    {track.id !==
                                                        "default-lofi" && (
                                                        <Button
                                                            onClick={() =>
                                                                onDeleteTrack(
                                                                    track.id,
                                                                )
                                                            }
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <Trash2 className="w-2.5 h-2.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                    No tracks in queue
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
