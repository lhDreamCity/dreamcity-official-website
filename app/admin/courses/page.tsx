import Link from "next/link";
import { courses } from "@/app/lib/data";

export default function AdminCoursesPage() {
  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">课程管理</h1>
          <p className="mt-1 text-[13px] text-ink-soft">共 {courses.length} 门课程</p>
        </div>
        <button className="btn btn-primary !py-2 text-[13px]">+ 新建课程</button>
      </header>

      <div className="flex flex-col gap-4">
        {courses.map((course) => {
          const published = course.lessons.filter((l) => l.videoUrl).length;
          return (
            <div key={course.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-ink">{course.title}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        course.status === "published"
                          ? "bg-gold-soft text-gold"
                          : "bg-bg text-muted"
                      }`}
                    >
                      {course.status === "published" ? "已发布" : "草稿"}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-ink-soft">{course.subtitle}</p>
                  <p className="mt-2 text-[12px] text-ink-soft">
                    {course.duration} · {course.level} · slug: <code>{course.slug}</code>
                  </p>
                </div>
                <div className="text-right text-[12px] text-ink-soft">
                  <p className="font-semibold text-ink">
                    已上线 {published}/{course.lessons.length} 课时
                  </p>
                  <p className="mt-1">
                    <Link href={`/courses/${course.slug}`} className="text-brand hover:underline">
                      前台预览
                    </Link>
                  </p>
                </div>
              </div>

              {/* 课时列表 */}
              <div className="mt-4 border-t border-line pt-3">
                <p className="mb-2 text-[12px] font-semibold text-ink-soft">课时</p>
                <div className="flex flex-col gap-1.5">
                  {course.lessons
                    .slice()
                    .sort((a, b) => a.sort - b.sort)
                    .map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between rounded-lg bg-bg/50 px-3 py-2 text-[13px]"
                      >
                        <div className="min-w-0">
                          <span className="text-muted">模块 {l.sort} · </span>
                          <span className="text-ink">{l.title}</span>
                          <span className="ml-2 text-[11px] text-ink-soft">({l.duration})</span>
                        </div>
                        <span
                          className={`ml-3 shrink-0 text-[11px] ${
                            l.videoUrl ? "text-gold" : "text-muted"
                          }`}
                        >
                          {l.videoUrl ? "✅ 已上线" : "⏳ 待制作"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
