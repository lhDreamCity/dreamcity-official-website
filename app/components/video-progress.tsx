"use client";

import { useEffect, useRef } from "react";
import { saveVideoProgress, getVideoProgress, markLessonComplete } from "@/app/lib/progress";
import { markTodayStudied } from "@/app/lib/streak";

export default function VideoProgressTracker({
  courseSlug,
  lessonId,
  videoUrl,
  poster,
}: {
  courseSlug: string;
  lessonId: number;
  videoUrl: string;
  poster?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 恢复进度
    const saved = getVideoProgress(courseSlug, lessonId);
    if (saved > 0 && saved < video.duration - 10) {
      video.currentTime = saved;
    }

    // 播放开始时打卡
    const onPlay = () => markTodayStudied();
    video.addEventListener("play", onPlay);

    // 定期保存（每 5 秒）
    saveTimer.current = setInterval(() => {
      if (video.currentTime > 0) {
        saveVideoProgress(courseSlug, lessonId, video.currentTime);
      }
    }, 5000);

    // 播放结束时标记完成
    const onEnded = () => {
      markLessonComplete(courseSlug, lessonId);
      saveVideoProgress(courseSlug, lessonId, 0); // 重置为0表示看完
    };
    video.addEventListener("ended", onEnded);

    return () => {
      if (saveTimer.current) clearInterval(saveTimer.current);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("ended", onEnded);
    };
  }, [courseSlug, lessonId]);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      className="h-full w-full"
      preload="metadata"
      poster={poster}
    />
  );
}
