"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Trash2 } from "lucide-react"
import type { CourseProgress } from "@/types"
import { formatTime } from "@/utils/youtube"

interface CourseListProps {
  courses: CourseProgress[]
  onSelectCourse: (course: CourseProgress) => void
  onDeleteCourse: (courseId: string) => void
}

export function CourseList({ courses, onSelectCourse, onDeleteCourse }: CourseListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length > 0 ? (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{course.title}</h4>
                  <Progress
                    value={course.duration > 0 ? (course.currentTime / course.duration) * 100 : 0}
                    className="mb-2"
                  />
                  {course.duration > 0 ? (
                    <p className="text-sm text-gray-600">
                      {formatTime(Math.floor(course.currentTime))} / {formatTime(Math.floor(course.duration))}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">Ready to start</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Last watched: {new Date(course.lastWatched).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button onClick={() => onSelectCourse(course)} size="sm">
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => onDeleteCourse(course.id)} variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No courses added yet</p>
        )}
      </CardContent>
    </Card>
  )
}
