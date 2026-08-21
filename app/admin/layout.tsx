import { requireRole } from "@/app/lib/guard";
import { AdminNav } from "./nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 双保险守卫：仅 admin 可进入后台
  const user = await requireRole("admin");

  return (
    <div className="section min-h-screen bg-bg">
      <div className="container-page grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* 侧边导航 */}
        <AdminNav email={user.email} />

        {/* 内容区 */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
