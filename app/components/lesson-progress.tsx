"use client";

import { useEffect, useState } from "react";
import { isLessonCompleted, getCourseProgressPercent } from "@/app/lib/progress";

export function LessonProgressBadge({
  courseSlug,
  lessonId,
}: {
  courseSlug: string;
  lessonId: number;
}) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(isLessonCompleted(courseSlug, lessonId));
  }, [courseSlug, lessonId]);

  if (!completed) return null;

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[12px] font-bold text-green-600">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      已完成
    </span>
  );
}

export function CourseProgressBar({
  courseSlug,
  totalLessons,
}: {
  courseSlug: string;
  totalLessons: number;
}) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    setPercent(getCourseProgressPercent(courseSlug, totalLessons));
  }, [courseSlug, totalLessons]);

  if (percent === 0) return null;

  return (
    <div className="mt-3 flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
        <div
          className="h-full rounded-full bg-green-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="shrink-0 text-[12px] font-semibold text-green-600">{percent}%</span>
    </div>
  );
}
