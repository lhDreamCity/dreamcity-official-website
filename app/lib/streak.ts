/**
 * 学习打卡系统（localStorage）
 *
 * 记录每日学习行为，计算连续学习天数。
 * 数据格式：YYYY-MM-DD → boolean
 */

const STREAK_KEY = "dcw_streak";

function getStreakMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStreakMap(map: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STREAK_KEY, JSON.stringify(map));
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 记录今天已学习 */
export function markTodayStudied() {
  const map = getStreakMap();
  map[todayKey()] = true;
  setStreakMap(map);
}

/** 今天是否已学习 */
export function isTodayStudied(): boolean {
  return !!getStreakMap()[todayKey()];
}

/** 获取连续学习天数 */
export function getCurrentStreak(): number {
  const map = getStreakMap();
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (map[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/** 获取本月打卡日历数据 */
export function getMonthCalendar(): {
  date: string;
  studied: boolean;
  isToday: boolean;
}[] {
  const map = getStreakMap();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const tKey = todayKey();

  const result: { date: string; studied: boolean; isToday: boolean }[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const key = d.toISOString().slice(0, 10);
    result.push({
      date: `${day}日`,
      studied: !!map[key],
      isToday: key === tKey,
    });
  }
  return result;
}
