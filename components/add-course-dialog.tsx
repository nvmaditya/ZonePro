"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Download, List, Video } from "lucide-react";
import { getYouTubeVideoId, getPlaylistId } from "@/utils/youtube";

interface AddCourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    newCourseTitle: string;
    newCourseUrl: string;
    onTitleChange: (title: string) => void;
    onUrlChange: (url: string) => void;
    onAddCourse: () => void;
}

export function AddCourseDialog({
    open,
    onOpenChange,
    newCourseTitle,
    newCourseUrl,
    onTitleChange,
    onUrlChange,
    onAddCourse,
}: AddCourseDialogProps) {
    // Detect URL type for user feedback
    const videoId = getYouTubeVideoId(newCourseUrl);
    const playlistId = getPlaylistId(newCourseUrl);
    const isValidUrl = videoId || playlistId;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                    <DialogDescription>
                        Add a YouTube course or video to your learning
                        collection.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="course-title">Course Title</Label>
                        <Input
                            id="course-title"
                            value={newCourseTitle}
                            onChange={(e) => onTitleChange(e.target.value)}
                            placeholder="Enter course title"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="course-url">YouTube URL</Label>
                        <Input
                            id="course-url"
                            value={newCourseUrl}
                            onChange={(e) => onUrlChange(e.target.value)}
                            placeholder="https://youtube.com/watch?v=... or https://youtube.com/playlist?list=..."
                            className="mt-1"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={onAddCourse}
                            disabled={!newCourseTitle || !isValidUrl}
                        >
                            Add Course
                            {playlistId && (
                                <>
                                    <Download className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
