"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
    List,
    Play,
    ExternalLink,
    Loader2,
    Clock,
    CheckCircle,
} from "lucide-react";
import type { PlaylistVideoProgress } from "@/types";
import { formatTime } from "@/utils/youtube";
import { YouTubePlaylistExtractor } from "@/utils/youtube-playlist-extractor";

// Helper function to format YouTube duration (PT4M13S -> 4:13)
const formatYouTubeDuration = (duration: string): string => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "Unknown";

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    publishedAt: string;
    channelTitle: string;
}

interface YouTubePlaylistProps {
    playlistId?: string;
    currentVideoIndex?: number;
    onVideoSelect?: (video: YouTubeVideo, index: number) => void;
    playlistProgress?: { [videoId: string]: PlaylistVideoProgress }; // Add playlist progress
    onPlaylistMetadata?: (metadata: { totalVideos: number }) => void; // Callback for playlist metadata
}

export function YouTubePlaylist({
    playlistId,
    currentVideoIndex = 0,
    onVideoSelect,
    playlistProgress = {}, // Default to empty object
    onPlaylistMetadata,
}: YouTubePlaylistProps) {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch playlist videos using the improved extractor
    const fetchPlaylistVideos = async (playlistId: string) => {
        setLoading(true);

        try {
            const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

            if (!apiKey) {
                // Fallback to mock data if no API key
                const mockVideos: YouTubeVideo[] = [
                    {
                        id: "video1",
                        title: "Course Video 1 - Introduction",
                        description: "Introduction to the course",
                        thumbnail: "/placeholder.jpg",
                        duration: "10:30",
                        publishedAt: new Date().toISOString(),
                        channelTitle: "Course Channel",
                    },
                    {
                        id: "video2",
                        title: "Course Video 2 - Fundamentals",
                        description: "Learning the fundamentals",
                        thumbnail: "/placeholder.jpg",
                        duration: "15:45",
                        publishedAt: new Date().toISOString(),
                        channelTitle: "Course Channel",
                    },
                ];
                setVideos(mockVideos);
                return;
            } // Use the optimized extractor with single API call
            const extractor = new YouTubePlaylistExtractor(apiKey);
            const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;

            // Single API call gets both videos and metadata
            const playlistData = await extractor.getPlaylistData(playlistUrl);

            // Notify parent component about playlist metadata
            if (playlistData.metadata && onPlaylistMetadata) {
                onPlaylistMetadata({
                    totalVideos: playlistData.metadata.totalVideos,
                });
            }

            // Convert to our expected format
            const formattedVideos: YouTubeVideo[] = playlistData.videos.map(
                (video: any) => ({
                    id: video.id,
                    title: video.title,
                    description: video.description,
                    thumbnail: video.thumbnail,
                    duration: video.duration,
                    publishedAt: video.publishedAt,
                    channelTitle: video.channelTitle,
                }),
            );

            setVideos(formattedVideos);
        } catch {
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (playlistId) {
            fetchPlaylistVideos(playlistId);
        } else {
            setVideos([]);
        }
    }, [playlistId]);

    const handleVideoClick = (video: YouTubeVideo, index: number) => {
        if (onVideoSelect) {
            onVideoSelect(video, index);
        }
    };
    if (!playlistId) {
        return null;
    }

    // Calculate overall playlist progress
    const completedVideos = videos.filter(
        (video) => playlistProgress[video.id]?.completed,
    ).length;
    const watchedVideos = videos.filter(
        (video) => playlistProgress[video.id],
    ).length;
    const totalDuration = videos.reduce((acc, video) => {
        const progress = playlistProgress[video.id];
        if (progress && progress.duration > 0) {
            return acc + progress.duration;
        }
        // Estimate duration from string if available (e.g., "10:30" -> 630 seconds)
        if (video.duration !== "Unknown") {
            const parts = video.duration.split(":");
            if (parts.length === 2) {
                return acc + (parseInt(parts[0]) * 60 + parseInt(parts[1]));
            }
        }
        return acc;
    }, 0);

    const totalWatchedTime = videos.reduce((acc, video) => {
        const progress = playlistProgress[video.id];
        return progress ? acc + progress.currentTime : acc;
    }, 0);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                    <div className="flex items-center gap-2">
                        <List className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="truncate">Playlist</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                            {currentVideoIndex + 1} of {videos.length}
                        </Badge>
                        {completedVideos > 0 && (
                            <Badge variant="default" className="text-xs">
                                {completedVideos} completed
                            </Badge>
                        )}
                    </div>
                </CardTitle>

                {/* Overall progress bar and stats */}
                {watchedVideos > 0 && (
                    <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                Overall Progress
                            </span>{" "}
                            <span className="text-gray-600">
                                {videos.length > 0
                                    ? Math.round(
                                          (completedVideos / videos.length) *
                                              100,
                                      )
                                    : 0}
                                %
                            </span>
                        </div>
                        <Progress
                            value={
                                videos.length > 0
                                    ? (completedVideos / videos.length) * 100
                                    : 0
                            }
                            className="h-2"
                        />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                                {formatTime(Math.floor(totalWatchedTime))} /{" "}
                                {formatTime(Math.floor(totalDuration))} watched
                            </span>
                            <span>
                                {watchedVideos} of {videos.length} started
                            </span>
                        </div>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {videos.length > 0 ? (
                    <ScrollArea className="h-64">
                        <div className="space-y-2 pr-2">
                            {videos.map((video, index) => (
                                <div
                                    key={video.id}
                                    className={`flex items-start gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                                        index === currentVideoIndex
                                            ? "bg-blue-50 border-blue-200"
                                            : "hover:bg-gray-50"
                                    }`}
                                    onClick={() =>
                                        handleVideoClick(video, index)
                                    }
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-16 h-12 object-cover rounded"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded opacity-0 hover:opacity-100 transition-opacity">
                                            <Play className="w-4 h-4 text-white" />
                                        </div>
                                    </div>{" "}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                                            {video.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {video.channelTitle}
                                        </p>

                                        {/* Progress bar for watched videos */}
                                        {playlistProgress[video.id] && (
                                            <div className="mt-2">
                                                <Progress
                                                    value={
                                                        playlistProgress[
                                                            video.id
                                                        ].duration > 0
                                                            ? (playlistProgress[
                                                                  video.id
                                                              ].currentTime /
                                                                  playlistProgress[
                                                                      video.id
                                                                  ].duration) *
                                                              100
                                                            : 0
                                                    }
                                                    className="h-1"
                                                />
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(
                                                            Math.floor(
                                                                playlistProgress[
                                                                    video.id
                                                                ].currentTime,
                                                            ),
                                                        )}{" "}
                                                        /{" "}
                                                        {formatTime(
                                                            Math.floor(
                                                                playlistProgress[
                                                                    video.id
                                                                ].duration,
                                                            ),
                                                        )}
                                                    </span>
                                                    {playlistProgress[video.id]
                                                        .completed && (
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge
                                                variant="secondary"
                                                className="text-xs px-1 py-0"
                                            >
                                                #{index + 1}
                                            </Badge>
                                            {video.duration !== "Unknown" && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs px-1 py-0 flex items-center gap-1"
                                                >
                                                    <Clock className="w-2 h-2" />
                                                    {video.duration}
                                                </Badge>
                                            )}
                                            {playlistProgress[video.id] && (
                                                <Badge
                                                    variant={
                                                        playlistProgress[
                                                            video.id
                                                        ].completed
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    className="text-xs px-1 py-0"
                                                >
                                                    {" "}
                                                    {playlistProgress[video.id]
                                                        .completed
                                                        ? "✓ Done"
                                                        : `${
                                                              playlistProgress[
                                                                  video.id
                                                              ].duration > 0
                                                                  ? Math.round(
                                                                        (playlistProgress[
                                                                            video
                                                                                .id
                                                                        ]
                                                                            .currentTime /
                                                                            playlistProgress[
                                                                                video
                                                                                    .id
                                                                            ]
                                                                                .duration) *
                                                                            100,
                                                                    )
                                                                  : 0
                                                          }%`}
                                                </Badge>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 w-5 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(
                                                        `https://www.youtube.com/watch?v=${video.id}`,
                                                        "_blank",
                                                    );
                                                }}
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : loading ? (
                    <div className="text-center py-6">
                        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-gray-400" />
                        <p className="text-xs text-gray-500">
                            Loading videos...
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-4 sm:py-6 text-gray-500">
                        <List className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-xs sm:text-sm">
                            No videos found in this playlist
                        </p>
                        <p className="text-xs text-gray-400">
                            Check your API key or playlist URL
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
