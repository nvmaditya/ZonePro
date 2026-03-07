"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Play, Trash2, List } from "lucide-react";
import type { CourseProgress } from "@/types";
import { formatTime } from "@/utils/youtube";

interface CourseListProps {
    courses: CourseProgress[];
    onSelectCourse: (course: CourseProgress) => void;
    onDeleteCourse: (courseId: string) => void;
}

export function CourseList({
    courses,
    onSelectCourse,
    onDeleteCourse,
}: CourseListProps) {
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

    // Calculate playlist progress
    const getPlaylistProgress = (course: CourseProgress) => {
        if (!course.playlistId || !course.playlistProgress) {
            return {
                totalDuration: course.duration,
                totalWatched: course.currentTime,
                completedVideos: 0,
                totalVideos: 0,
                actualTotalVideos: course.playlistMetadata?.totalVideos || 0,
            };
        }

        const playlistVideos = Object.values(course.playlistProgress);
        const totalDuration = playlistVideos.reduce(
            (acc, video) => acc + video.duration,
            0,
        );
        const totalWatched = playlistVideos.reduce(
            (acc, video) => acc + video.currentTime,
            0,
        );
        const completedVideos = playlistVideos.filter(
            (video) => video.completed,
        ).length;
        const totalVideos = playlistVideos.length;
        const actualTotalVideos =
            course.playlistMetadata?.totalVideos || totalVideos;

        return {
            totalDuration,
            totalWatched,
            completedVideos,
            totalVideos,
            actualTotalVideos,
        };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent>
                {courses.length > 0 ? (
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {courses.map((course) => {
                            const {
                                totalDuration,
                                totalWatched,
                                completedVideos,
                                totalVideos,
                                actualTotalVideos,
                            } = getPlaylistProgress(course);
                            const progressPercentage =
                                totalDuration > 0
                                    ? (totalWatched / totalDuration) * 100
                                    : 0;

                            return (
                                <div
                                    key={course.id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium">
                                                {course.title}
                                            </h4>
                                            {course.playlistId && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    <List className="w-3 h-3 mr-1" />
                                                    Playlist
                                                </Badge>
                                            )}
                                        </div>
                                        <Progress
                                            value={
                                                isNaN(progressPercentage)
                                                    ? 0
                                                    : progressPercentage
                                            }
                                            className="mb-2"
                                        />
                                        {totalDuration > 0 ? (
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-600">
                                                    {formatTime(
                                                        Math.floor(
                                                            totalWatched,
                                                        ),
                                                    )}{" "}
                                                    /{" "}
                                                    {formatTime(
                                                        Math.floor(
                                                            totalDuration,
                                                        ),
                                                    )}
                                                    {course.playlistId &&
                                                        actualTotalVideos >
                                                            0 && (
                                                            <span className="ml-2 text-xs">
                                                                (
                                                                {
                                                                    completedVideos
                                                                }
                                                                /
                                                                {
                                                                    actualTotalVideos
                                                                }{" "}
                                                                videos
                                                                completed)
                                                            </span>
                                                        )}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-600">
                                                {course.playlistId
                                                    ? "Playlist course - select video to start"
                                                    : "Ready to start"}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Last watched:{" "}
                                            {new Date(
                                                course.lastWatched,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            onClick={() =>
                                                onSelectCourse(course)
                                            }
                                            size="sm"
                                        >
                                            <Play className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                setCourseToDelete(course.id)
                                            }
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-600 text-center py-8">
                        No courses added yet
                    </p>
                )}
                <AlertDialog
                    open={!!courseToDelete}
                    onOpenChange={(open) => !open && setCourseToDelete(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Course</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this course and all
                                its notes. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (courseToDelete) {
                                        onDeleteCourse(courseToDelete);
                                        setCourseToDelete(null);
                                    }
                                }}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
