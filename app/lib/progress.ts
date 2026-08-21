/**
 * 学习进度本地存储（localStorage）
 *
 * 当前使用浏览器本地存储，后续接入数据库时：
 * 1. 添加 /api/progress 接口读写服务端数据
 * 2. 登录用户优先读服务端，未登录读 localStorage
 * 3. 登录时合并本地进度到服务端
 */

const COMPLETED_KEY = "dcw_completed";
const VIDEO_KEY = "dcw_video_progress";

/* ---------- completed lessons ---------- */

function getCompletedMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCompletedMap(map: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(map));
}

function makeKey(courseSlug: string, lessonId: number | string): string {
  return `${courseSlug}::${lessonId}`;
}

export function markLessonComplete(courseSlug: string, lessonId: number) {
  const map = getCompletedMap();
  map[makeKey(courseSlug, lessonId)] = true;
  setCompletedMap(map);
}

export function isLessonCompleted(courseSlug: string, lessonId: number): boolean {
  return !!getCompletedMap()[makeKey(courseSlug, lessonId)];
}

export function getCompletedCount(courseSlug: string, totalLessons: number): number {
  const map = getCompletedMap();
  let count = 0;
  for (let i = 1; i <= totalLessons; i++) {
    if (map[makeKey(courseSlug, i)]) count++;
  }
  return count;
}

export function getCourseProgressPercent(courseSlug: string, totalLessons: number): number {
  if (totalLessons === 0) return 0;
  return Math.round((getCompletedCount(courseSlug, totalLessons) / totalLessons) * 100);
}

/* ---------- video playback position ---------- */

interface VideoProgress {
  currentTime: number;
  updatedAt: string;
}

function getVideoMap(): Record<string, VideoProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(VIDEO_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setVideoMap(map: Record<string, VideoProgress>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VIDEO_KEY, JSON.stringify(map));
}

export function saveVideoProgress(courseSlug: string, lessonId: number, currentTime: number) {
  const map = getVideoMap();
  map[makeKey(courseSlug, lessonId)] = {
    currentTime: Math.floor(currentTime),
    updatedAt: new Date().toISOString(),
  };
  setVideoMap(map);
}

export function getVideoProgress(courseSlug: string, lessonId: number): number {
  const entry = getVideoMap()[makeKey(courseSlug, lessonId)];
  return entry?.currentTime ?? 0;
}

/* ---------- all progress summary ---------- */

export interface ProgressSummary {
  courseSlug: string;
  completed: number;
  total: number;
  percent: number;
  lastWatchedLessonId?: number;
}

export function getAllProgress(courseSlugs: string[]): ProgressSummary[] {
  return courseSlugs.map((slug) => {
    const completed = getCompletedCount(slug, 20); // generous upper bound
    // find last watched lesson
    const vMap = getVideoMap();
    let lastId: number | undefined;
    let lastTime = 0;
    for (const key of Object.keys(vMap)) {
      if (key.startsWith(`${slug}::`)) {
        const id = parseInt(key.split("::")[1], 10);
        const t = new Date(vMap[key].updatedAt).getTime();
        if (t > lastTime) {
          lastTime = t;
          lastId = id;
        }
      }
    }
    return { courseSlug: slug, completed, total: 0, percent: 0, lastWatchedLessonId: lastId };
  });
}
