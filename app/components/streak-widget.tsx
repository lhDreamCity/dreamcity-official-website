"use client";

import { useEffect, useState } from "react";
import { getCurrentStreak, getMonthCalendar, isTodayStudied } from "@/app/lib/streak";

export default function StreakWidget() {
  const [streak, setStreak] = useState(0);
  const [todayDone, setTodayDone] = useState(false);
  const [calendar, setCalendar] = useState<{ date: string; studied: boolean; isToday: boolean }[]>([]);

  useEffect(() => {
    setStreak(getCurrentStreak());
    setTodayDone(isTodayStudied());
    setCalendar(getMonthCalendar());
  }, []);

  return (
    <div className="card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-ink">学习打卡</h3>
          <p className="text-[13px] text-muted">坚持每日学习，养成AI思维习惯</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-gold">{streak}</div>
          <div className="text-[12px] text-muted">连续天数</div>
        </div>
      </div>

      {/* 今日状态 */}
      <div
        className={`mb-5 flex items-center gap-2 rounded-xl px-4 py-3 text-[14px] font-semibold ${
          todayDone
            ? "bg-green-50 text-green-700"
            : "bg-gold-soft text-gold"
        }`}
      >
        {todayDone ? (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            今日已打卡，继续保持！
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            今日尚未打卡，去学习一个课时吧
          </>
        )}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1.5">
        {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
          <div key={d} className="py-1 text-center text-[11px] font-semibold text-muted">
            {d}
          </div>
        ))}
        {/* 占位，让1号对齐正确的星期 */}
        {(() => {
          const firstDayWeek = new Date().getDay(); // 0=日
          const offset = firstDayWeek === 0 ? 6 : firstDayWeek - 1;
          return Array.from({ length: offset }).map((_, i) => (
            <div key={`pad-${i}`} />
          ));
        })()}
        {calendar.map((day) => (
          <div
            key={day.date}
            className={`flex h-8 items-center justify-center rounded-lg text-[12px] font-semibold ${
              day.isToday
                ? "ring-2 ring-gold"
                : ""
            } ${
              day.studied
                ? "bg-green-500 text-white"
                : "bg-bg text-muted"
            }`}
            title={day.date}
          >
            {day.date.replace("日", "")}
          </div>
        ))}
      </div>
    </div>
  );
}
