import Image from "next/image";
import Link from "next/link";
import { courses } from "@/app/lib/data";
import { getCurrentUser } from "@/app/lib/auth";
import CourseAtlas from "@/app/components/course-atlas";

export const metadata = { title: "课程中心 - 梦之城AI赋能中心" };

export default async function CoursesPage() {
  const user = await getCurrentUser();
  return (
    <>
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-soft py-20 text-white">
        <div className="container-page">
          <span className="section-tag !text-gold-bright">Courses</span>
          <h1 className="text-4xl font-bold">课程中心</h1>
          <p className="mt-3 text-lg text-white/70">
            登录账号后即可免费学习全部课程。
          </p>
        </div>
      </section>

      <CourseAtlas />

      <section className="section">
        <div className="container-page">
          <div className="grid gap-8">
            {courses.map((course) => (
              <div key={course.slug} className="card overflow-hidden p-0">
                <div className="grid md:grid-cols-[380px_1fr]">
                  <div className="relative flex items-center justify-center bg-brand-dark">
                    <Image
                      src={course.cover}
                      alt={course.title}
                      width={380}
                      height={254}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-10">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gold-soft px-3 py-1 text-[12px] font-bold text-gold">
                        {course.level}
                      </span>
                      <span className="rounded-full bg-bg px-3 py-1 text-[12px] text-muted">
                        {course.duration}
                      </span>
                      <span className="rounded-full bg-bg px-3 py-1 text-[12px] text-muted">
                        {course.lessons.length} 个课时
                      </span>
                    </div>
                    <h2 className="mb-1 text-2xl font-bold text-ink">{course.title}</h2>
                    <p className="mb-3 text-[15px] text-muted">{course.subtitle}</p>
                    <p className="mb-6 text-[14px] leading-relaxed text-ink-soft">
                      {course.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/courses/${course.slug}`} className="btn btn-primary">
                        查看课程大纲
                      </Link>
                      {user ? (
                        <Link href={`/courses/${course.slug}`} className="btn btn-gold">
                          立即学习
                        </Link>
                      ) : (
                        <Link href={`/login?redirect=${encodeURIComponent(`/courses/${course.slug}`)}`} className="btn btn-gold">
                          登录学习
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
