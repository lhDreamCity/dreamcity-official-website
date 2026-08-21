"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCompletedCount } from "@/app/lib/progress";
import type { Course } from "@/app/lib/types";

export default function CourseProgressCard({ course }: { course: Course }) {
  const [completed, setCompleted] = useState(0);
  const total = course.lessons.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // 找到第一个未完成的课时，作为"继续学习"目标
  const [continueLessonId, setContinueLessonId] = useState(course.lessons[0]?.id);

  useEffect(() => {
    const done = getCompletedCount(course.slug, total);
    setCompleted(done);

    // 找到第一个未完成的课时
    for (const lesson of course.lessons) {
      if (!getCompletedCount(course.slug, lesson.id)) {
        setContinueLessonId(lesson.id);
        break;
      }
    }
  }, [course.slug, total, course.lessons]);

  return (
    <div className="card flex flex-col gap-6 p-6 sm:flex-row">
      <Image
        src={course.cover}
        alt={course.title}
        width={192}
        height={128}
        className="h-32 w-full rounded-xl object-cover sm:w-48"
        loading="lazy"
      />
      <div className="flex flex-1 flex-col justify-center">
        <h4 className="mb-1 text-lg font-bold text-ink">{course.title}</h4>
        <p className="mb-3 text-[13px] text-muted">{course.subtitle}</p>

        {/* 进度条 */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-[13px] font-semibold text-green-600">
            {completed}/{total}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/courses/${course.slug}`}
            className="btn btn-primary !py-1.5 text-[13px]"
          >
            查看大纲
          </Link>
          <Link
            href={`/courses/${course.slug}/lessons/${continueLessonId}`}
            className="btn btn-gold !py-1.5 text-[13px]"
          >
            {completed === 0 ? "开始学习" : completed === total ? "复习" : "继续学习"}
          </Link>
        </div>
      </div>
    </div>
  );
}
