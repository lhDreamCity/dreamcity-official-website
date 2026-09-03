import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import { hasRole } from "@/app/lib/rbac";
import { courses } from "@/app/lib/data";
import CourseProgressCard from "@/app/components/course-progress-card";
import StreakWidget from "@/app/components/streak-widget";

export const metadata = { title: "个人中心 - 梦之城AI赋能中心" };

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent("/account")}`);
  }

  return (
    <>
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-soft py-16 text-white">
        <div className="container-page">
          <span className="section-tag !text-gold-bright">Account</span>
          <h1 className="text-3xl font-bold">个人中心</h1>
          <p className="mt-2 text-[15px] text-white/70">你好，{user.nickname || user.email}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            {/* 账号信息卡片 */}
            <aside className="card h-fit p-8">
              <h3 className="mb-5 text-[15px] font-bold text-ink">我的账号</h3>
              <dl className="space-y-3 text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-muted">昵称</dt>
                  <dd className="font-medium text-ink">{user.nickname}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">手机号</dt>
                  <dd className="max-w-[160px] truncate font-medium text-ink">{user.email}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">角色</dt>
                  <dd>
                    {user.roles.includes("admin") ? (
                      <span className="rounded-full bg-brand-soft px-3 py-1 text-[12px] font-semibold text-white">
                        超级管理员
                      </span>
                    ) : (
                      <span className="rounded-full bg-gold-soft px-3 py-1 text-[12px] font-semibold text-gold">
                        学员
                      </span>
                    )}
                  </dd>
                </div>
              </dl>

              {hasRole(user.roles, "admin") && (
                <div className="mt-6 rounded-xl border border-brand/30 bg-brand-soft/10 p-4">
                  <p className="mb-3 text-[13px] font-medium text-ink">管理后台</p>
                  <Link href="/admin" className="btn btn-primary w-full !py-2 text-[13px]">
                    进入管理后台
                  </Link>
                </div>
              )}
            </aside>

            {/* 我的课程 */}
            <div className="space-y-6">
              <StreakWidget />

              <h3 className="text-lg font-bold text-ink">我的课程</h3>
              <div className="grid gap-6">
                {courses.map((course) => (
                  <CourseProgressCard key={course.slug} course={course} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
