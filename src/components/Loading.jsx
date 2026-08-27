export default function Loading() {
  return (
    <div className="grid h-48 place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-primary"/>
        <p className="text-sm text-slate-400">جاري تحميل البيانات…</p>
      </div>
    </div>
  );
}
