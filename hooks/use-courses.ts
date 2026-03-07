"use client";

import { useState, useCallback } from "react";
import type { CourseProgress } from "@/types";
import { getYouTubeVideoId, getPlaylistId } from "@/utils/youtube";

export function useCourses(initial?: CourseProgress[]) {
    const [courses, setCourses] = useState<CourseProgress[]>(initial || []);
    const [currentCourse, setCurrentCourse] = useState<CourseProgress | null>(
        null,
    );
    const [newCourseUrl, setNewCourseUrl] = useState("");
    const [newCourseTitle, setNewCourseTitle] = useState("");
    const [showAddCourse, setShowAddCourse] = useState(false);

    const addCourse = useCallback(() => {
        if (newCourseUrl && newCourseTitle) {
            const videoId = getYouTubeVideoId(newCourseUrl);
            const playlistId = getPlaylistId(newCourseUrl);

            if (videoId || playlistId) {
                const newCourse: CourseProgress = {
                    id: Date.now().toString(),
                    title: newCourseTitle,
                    url: newCourseUrl,
                    videoId: videoId || "",
                    currentTime: 0,
                    duration: 0,
                    completed: false,
                    lastWatched: new Date(),
                    playlistId: playlistId || undefined,
                    playlistIndex: 0,
                    notes: [],
                    playlistProgress: {},
                };

                setCourses((prev) => [...prev, newCourse]);
                setNewCourseUrl("");
                setNewCourseTitle("");
                setShowAddCourse(false);
            }
        }
    }, [newCourseUrl, newCourseTitle]);

    const selectCourse = useCallback((course: CourseProgress) => {
        setCurrentCourse(course);
    }, []);

    const updateCourse = useCallback(
        (courseId: string, updates: Partial<CourseProgress>) => {
            setCourses((prev) =>
                prev.map((course) =>
                    course.id === courseId ? { ...course, ...updates } : course,
                ),
            );

            setCurrentCourse((prev) =>
                prev && prev.id === courseId ? { ...prev, ...updates } : prev,
            );
        },
        [],
    );

    const deleteCourse = useCallback((courseId: string) => {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        setCurrentCourse((prev) => (prev?.id === courseId ? null : prev));
    }, []);

    return {
        courses,
        setCourses,
        currentCourse,
        setCurrentCourse,
        newCourseUrl,
        setNewCourseUrl,
        newCourseTitle,
        setNewCourseTitle,
        showAddCourse,
        setShowAddCourse,
        addCourse,
        selectCourse,
        updateCourse,
        deleteCourse,
    };
}
