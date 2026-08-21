import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { getLesson } from "@/app/lib/data";
import { getCurrentUser } from "@/app/lib/auth";
import { hasPermission } from "@/app/lib/rbac";
import VideoProgressTracker from "@/app/components/video-progress";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const found = getLesson(slug, Number(id));
  if (!found) return { title: "课时 - 梦之城AI赋能中心" };
  return {
    title: `${found.lesson.title} - ${found.course.title} - 梦之城AI赋能中心`,
    description: found.lesson.summary,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const found = getLesson(slug, Number(id));
  if (!found) notFound();
  const { course, lesson } = found;

  const user = await getCurrentUser();

  // RBAC 守卫：需具备 lesson:watch 权限（付费会员角色默认拥有），否则引导开通会员
  if (!user || !hasPermission(user.permissions, "lesson:watch")) {
    const redirectTo = `/courses/${course.slug}/lessons/${lesson.id}`;
    redirect(`/membership?redirect=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <>
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-soft py-14 text-white">
        <div className="container-page">
          <Link
            href={`/courses/${course.slug}`}
            className="mb-5 inline-block text-[14px] text-white/60 hover:text-gold-bright"
          >
            ← 返回课程大纲
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gold/20 px-3 py-1 text-[12px] font-bold text-gold-bright">
              第 {lesson.sort + 1} 课时
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] text-white/70">
              {lesson.duration}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold">{lesson.title}</h1>
          <p className="mt-2 text-[15px] text-white/70">{course.title}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* 播放区 */}
            <div>
              <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-line bg-brand-dark">
                {lesson.videoUrl ? (
                  <VideoProgressTracker
                    courseSlug={course.slug}
                    lessonId={lesson.id}
                    videoUrl={lesson.videoUrl}
                    poster={course.cover}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 px-6 text-center text-white/70">
                    <span className="text-5xl">🎬</span>
                    <p className="text-[15px]">视频制作中，敬请期待</p>
                    <p className="max-w-md text-[13px] text-white/40">
                      本节课程视频正在由 AI 生产流水线制作，完成后将在此处播放。
                    </p>
                  </div>
                )}
              </div>

              <div className="card mt-6 p-8">
                <h2 className="mb-3 text-lg font-bold text-ink">本课要点</h2>
                <p className="text-[15px] leading-relaxed text-ink-soft">{lesson.summary}</p>
              </div>

              {lesson.resourceUrl && (
                <div className="mt-4 rounded-2xl border border-gold/40 bg-gold-soft/30 p-6">
                  <span className="font-semibold text-ink">课程资源：</span>
                  <a href={lesson.resourceUrl} className="text-gold hover:underline">
                    下载资源包
                  </a>
                </div>
              )}
            </div>

            {/* 课时列表 */}
            <aside className="card h-fit p-6">
              <h3 className="mb-4 text-[15px] font-bold text-ink">全部课时</h3>
              <ol className="space-y-2">
                {course.lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/courses/${course.slug}/lessons/${l.id}`}
                      className={`block rounded-lg px-3 py-2 text-[14px] transition-colors ${
                        l.id === lesson.id
                          ? "bg-brand-soft text-white"
                          : "text-ink-soft hover:bg-bg hover:text-gold"
                      }`}
                    >
                      <span className="mr-2 opacity-70">{l.sort + 1}.</span>
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
