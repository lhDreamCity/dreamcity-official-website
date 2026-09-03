import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/app/lib/data";
import { getCurrentUser } from "@/app/lib/auth";
import { LessonProgressBadge, CourseProgressBar } from "@/app/components/lesson-progress";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();
  const user = await getCurrentUser();

  return (
    <>
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-soft py-20 text-white">
        <div className="container-page">
          <Link href="/courses" className="mb-6 inline-block text-[14px] text-white/60 hover:text-gold-bright">
            ← 返回课程中心
          </Link>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-gold/20 px-3 py-1 text-[12px] font-bold text-gold-bright">
              {course.level}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] text-white/70">
              {course.duration}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] text-white/70">
              {course.lessons.length} 个课时
            </span>
          </div>
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <p className="mt-2 text-lg text-white/70">{course.subtitle}</p>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/70">
            {course.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {user ? (
              <Link href={`/courses/${course.slug}/lessons/${course.lessons[0].id}`} className="btn btn-gold">
                立即学习
              </Link>
            ) : (
              <Link href={`/login?redirect=${encodeURIComponent(`/courses/${course.slug}`)}`} className="btn btn-gold">
                登录后免费学习
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 课程大纲 */}
      <section className="section">
        <div className="container-page">
          <div className="mb-8">
            <span className="section-tag">Syllabus</span>
            <h2 className="section-title">课程大纲</h2>
            <p className="section-desc">{course.description}</p>
          </div>

          {/* 课程总进度 */}
          <CourseProgressBar courseSlug={course.slug} totalLessons={course.lessons.length} />

          <div className="mt-6 space-y-3">
            {course.lessons.map((lesson) => (
              <div key={lesson.id} className="card flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[14px] font-bold text-white">
                  {lesson.sort + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[15px] font-semibold text-ink">{lesson.title}</h3>
                    <LessonProgressBadge courseSlug={course.slug} lessonId={lesson.id} />
                  </div>
                  <p className="mt-1 line-clamp-1 text-[13px] text-muted">{lesson.summary}</p>
                </div>
                <span className="shrink-0 rounded-full bg-bg px-3 py-1 text-[12px] text-muted">
                  {lesson.duration}
                </span>
                <Link
                  href={`/courses/${course.slug}/lessons/${lesson.id}`}
                  className="btn btn-ghost shrink-0 !py-1.5 text-[13px]"
                >
                  开始学习
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-gold/40 bg-gold-soft/30 p-8 text-center">
            <h3 className="mb-2 text-lg font-bold text-ink">登录后即可免费学习全部课程</h3>
            <p className="mb-5 text-[14px] text-ink-soft">
              注册学员账号，畅学全部 {course.lessons.length} 个课时。
            </p>
            {user ? (
              <Link href={`/courses/${course.slug}/lessons/${course.lessons[0].id}`} className="btn btn-gold">
                开始学习
              </Link>
            ) : (
              <Link href={`/login?redirect=${encodeURIComponent(`/courses/${course.slug}`)}`} className="btn btn-gold">
                登录学习
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
