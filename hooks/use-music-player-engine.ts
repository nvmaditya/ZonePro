"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { MusicPlayer, MusicTrack, YTPlayer, YTPlayerEvent } from "@/types";
import { DEFAULT_LOFI_VIDEO_ID } from "@/lib/constants";

interface UseMusicPlayerEngineOptions {
    isYTReady: boolean;
    musicPlayer: MusicPlayer;
    onUpdateMusicPlayer: (updates: Partial<MusicPlayer>) => void;
    activated: boolean;
    onDeactivate: () => void;
}

export function useMusicPlayerEngine({
    isYTReady,
    musicPlayer,
    onUpdateMusicPlayer,
    activated,
    onDeactivate,
}: UseMusicPlayerEngineOptions) {
    const musicPlayerRef = useRef<YTPlayer | null>(null);
    const [actualPlayerState, setActualPlayerState] = useState<number | null>(
        null,
    );

    // Stable refs for callbacks used inside YT player events
    const musicPlayerStateRef = useRef(musicPlayer);
    musicPlayerStateRef.current = musicPlayer;

    const onUpdateRef = useRef(onUpdateMusicPlayer);
    onUpdateRef.current = onUpdateMusicPlayer;

    const onDeactivateRef = useRef(onDeactivate);
    onDeactivateRef.current = onDeactivate;

    // Destroy player after 60s of being muted
    const muteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (muteTimeoutRef.current) {
            clearTimeout(muteTimeoutRef.current);
            muteTimeoutRef.current = null;
        }

        if (activated && musicPlayer.isMuted) {
            muteTimeoutRef.current = setTimeout(() => {
                if (musicPlayerRef.current) {
                    try {
                        musicPlayerRef.current.destroy();
                    } catch {
                        // Destroy error
                    }
                    musicPlayerRef.current = null;
                }
                setActualPlayerState(null);
                onDeactivateRef.current();
            }, 60_000);
        }

        return () => {
            if (muteTimeoutRef.current) {
                clearTimeout(muteTimeoutRef.current);
                muteTimeoutRef.current = null;
            }
        };
    }, [activated, musicPlayer.isMuted]);

    // Initialize YouTube music player (only after user activates)
    useEffect(() => {
        if (
            activated &&
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
                                event.target.setVolume(
                                    musicPlayerStateRef.current.volume,
                                );
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
                                    onUpdateRef.current({ isPlaying: true });
                                } else if (
                                    event.data === window.YT.PlayerState.PAUSED
                                ) {
                                    onUpdateRef.current({ isPlaying: false });
                                } else if (
                                    event.data === window.YT.PlayerState.ENDED
                                ) {
                                    onUpdateRef.current({ isPlaying: false });
                                    // playNextTrack handled by the caller
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
    }, [isYTReady, activated]);

    // Update volume
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

    // Update global controls
    useEffect(() => {
        if (typeof window !== "undefined") {
            window.musicPlayerControls = {
                play: () => playMusic(),
                pause: () => pauseMusic(),
                isPlaying: () => musicPlayerStateRef.current.isPlaying,
            };
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const playMusic = useCallback(() => {
        if (
            musicPlayerRef.current &&
            musicPlayerStateRef.current.currentTrack
        ) {
            try {
                if (typeof musicPlayerRef.current.playVideo === "function") {
                    musicPlayerRef.current.playVideo();
                }
            } catch {
                // Play error
            }
        }
    }, []);

    const pauseMusic = useCallback(() => {
        if (musicPlayerRef.current) {
            try {
                if (typeof musicPlayerRef.current.pauseVideo === "function") {
                    musicPlayerRef.current.pauseVideo();
                }
            } catch {
                // Pause error
            }
        }
    }, []);

    const playNextTrack = useCallback(() => {
        const mp = musicPlayerStateRef.current;
        if (mp.playlist.length > 0) {
            let nextIndex: number;

            if (mp.shuffle) {
                if (mp.playlist.length === 1) {
                    nextIndex = 0;
                } else {
                    do {
                        nextIndex = Math.floor(
                            Math.random() * mp.playlist.length,
                        );
                    } while (nextIndex === mp.currentIndex);
                }
            } else {
                nextIndex = mp.currentIndex + 1;
                if (nextIndex >= mp.playlist.length) {
                    nextIndex = mp.repeat ? 0 : mp.playlist.length - 1;
                }
            }

            const nextTrack = mp.playlist[nextIndex];
            onUpdateRef.current({
                currentTrack: nextTrack,
                currentIndex: nextIndex,
            });

            if (musicPlayerRef.current && nextTrack) {
                try {
                    if (
                        typeof musicPlayerRef.current.loadVideoById ===
                        "function"
                    ) {
                        musicPlayerRef.current.loadVideoById(nextTrack.videoId);
                    }
                } catch {
                    // Next track error
                }
            }
        }
    }, []);

    const playPreviousTrack = useCallback(() => {
        const mp = musicPlayerStateRef.current;
        if (mp.playlist.length > 0) {
            let prevIndex: number;
            if (mp.shuffle && mp.playlist.length > 1) {
                do {
                    prevIndex = Math.floor(Math.random() * mp.playlist.length);
                } while (prevIndex === mp.currentIndex);
            } else {
                prevIndex = mp.currentIndex - 1;
                if (prevIndex < 0) {
                    prevIndex = mp.repeat ? mp.playlist.length - 1 : 0;
                }
            }

            const prevTrack = mp.playlist[prevIndex];
            onUpdateRef.current({
                currentTrack: prevTrack,
                currentIndex: prevIndex,
            });

            if (musicPlayerRef.current && prevTrack) {
                try {
                    if (
                        typeof musicPlayerRef.current.loadVideoById ===
                        "function"
                    ) {
                        musicPlayerRef.current.loadVideoById(prevTrack.videoId);
                    }
                } catch {
                    // Previous track error
                }
            }
        }
    }, []);

    const loadAndPlayTrack = useCallback((track: MusicTrack) => {
        if (musicPlayerRef.current) {
            try {
                if (
                    typeof musicPlayerRef.current.loadVideoById === "function"
                ) {
                    musicPlayerRef.current.loadVideoById(track.videoId);
                }
            } catch {
                // Track play error
            }
        }
    }, []);

    const isActuallyPlaying =
        typeof window !== "undefined" &&
        actualPlayerState === window.YT?.PlayerState?.PLAYING;

    return {
        playMusic,
        pauseMusic,
        playNextTrack,
        playPreviousTrack,
        loadAndPlayTrack,
        isActuallyPlaying,
    };
}
