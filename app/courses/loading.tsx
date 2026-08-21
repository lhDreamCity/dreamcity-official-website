export default function CoursesLoading() {
  return (
    <div className="section">
      <div className="container-page">
        {/* 标题骨架 */}
        <div className="mb-10 space-y-3">
          <div className="h-4 w-20 animate-pulse rounded bg-line" />
          <div className="h-10 w-48 animate-pulse rounded bg-line" />
          <div className="h-5 w-72 animate-pulse rounded bg-line" />
        </div>

        {/* 课程卡片骨架 */}
        <div className="grid gap-8 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="card overflow-hidden p-0">
              <div className="grid md:grid-cols-[1fr_1.2fr]">
                <div className="h-48 animate-pulse bg-brand-dark md:h-auto" />
                <div className="flex flex-col justify-center p-8 space-y-4">
                  <div className="h-5 w-24 animate-pulse rounded bg-line" />
                  <div className="h-7 w-48 animate-pulse rounded bg-line" />
                  <div className="h-4 w-full animate-pulse rounded bg-line" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-line" />
                  <div className="h-6 w-20 animate-pulse rounded bg-line" />
                  <div className="flex gap-3">
                    <div className="h-9 w-28 animate-pulse rounded-full bg-line" />
                    <div className="h-9 w-28 animate-pulse rounded-full bg-line" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
