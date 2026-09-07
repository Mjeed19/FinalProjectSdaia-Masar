export default function ErrorBox({ error }) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
      ⚠️ تعذّر تحميل البيانات: {error?.message || "خطأ غير معروف"}
    </div>
  );
}
