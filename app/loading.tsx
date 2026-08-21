export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
      <div className="relative h-12 w-12">
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-gold-soft border-t-gold" />
      </div>
      <p className="text-[15px] font-medium text-muted">页面加载中…</p>
    </div>
  );
}
