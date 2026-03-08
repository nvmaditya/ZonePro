"use client";

import { useState, useCallback } from "react";
import type { MusicPlayer, MusicTrack } from "@/types";

export const DEFAULT_MUSIC_PLAYER: MusicPlayer = {
    currentTrack: null,
    playlist: [],
    volume: 50,
    isPlaying: false,
    isMuted: true,
    currentTime: 0,
    shuffle: false,
    repeat: false,
    currentIndex: 0,
};

export function useMusicPlayer() {
    const [musicPlayer, setMusicPlayer] =
        useState<MusicPlayer>(DEFAULT_MUSIC_PLAYER);
    const [musicWasPlaying, setMusicWasPlaying] = useState(false);
    const [activated, setActivated] = useState(false);

    const activate = useCallback(() => {
        setActivated(true);
    }, []);

    const deactivate = useCallback(() => {
        setActivated(false);
    }, []);

    const updateMusicPlayer = useCallback((updates: Partial<MusicPlayer>) => {
        setMusicPlayer((prev) => ({ ...prev, ...updates }));
    }, []);

    const handleMusicControl = useCallback((action: "pause" | "play") => {
        try {
            if (typeof window !== "undefined" && window.musicPlayerControls) {
                if (action === "pause") {
                    window.musicPlayerControls.pause();
                } else {
                    window.musicPlayerControls.play();
                }
            }
        } catch {
            // Music controls not available
        }
    }, []);

    const playTrack = useCallback((track: MusicTrack, index: number) => {
        setMusicPlayer((prev) => ({
            ...prev,
            currentTrack: track,
            currentIndex: index,
        }));
    }, []);

    const deleteTrack = useCallback((trackId: string) => {
        setMusicPlayer((prev) => ({
            ...prev,
            playlist: prev.playlist.filter((t) => t.id !== trackId),
            currentTrack:
                prev.currentTrack?.id === trackId ? null : prev.currentTrack,
        }));
    }, []);

    return {
        musicPlayer,
        setMusicPlayer,
        musicWasPlaying,
        setMusicWasPlaying,
        updateMusicPlayer,
        handleMusicControl,
        playTrack,
        deleteTrack,
        activated,
        activate,
        deactivate,
    };
}
