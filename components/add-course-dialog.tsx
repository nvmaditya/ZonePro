"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

interface AddCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newCourseTitle: string
  newCourseUrl: string
  onTitleChange: (title: string) => void
  onUrlChange: (url: string) => void
  onAddCourse: () => void
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>Add a YouTube course or video to your learning collection.</DialogDescription>
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
              placeholder="https://youtube.com/watch?v=..."
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={onAddCourse}>Add Course</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
