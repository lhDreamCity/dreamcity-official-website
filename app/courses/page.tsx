import Image from "next/image";
import Link from "next/link";
import { courses, MEMBERSHIP_PRICE } from "@/app/lib/data";

export const metadata = { title: "课程中心 - 梦之城AI赋能中心" };

export default function CoursesPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-soft py-20 text-white">
        <div className="container-page">
          <span className="section-tag !text-gold-bright">Courses</span>
          <h1 className="text-4xl font-bold">课程中心</h1>
          <p className="mt-3 text-lg text-white/70">
            全站会员制课程，一次开通永久学习全部课程。
          </p>
        </div>
      </section>

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
                    <div className="mb-6 flex items-center gap-3">
                      <span className="text-xl font-bold text-gold">
                        ¥{MEMBERSHIP_PRICE.toLocaleString()}
                      </span>
                      <span className="text-[13px] text-muted">/ 永久全站会员</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/courses/${course.slug}`} className="btn btn-primary">
                        查看课程大纲
                      </Link>
                      <Link href="/membership" className="btn btn-gold">
                        开通会员
                      </Link>
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
