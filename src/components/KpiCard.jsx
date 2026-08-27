export default function KpiCard({ label, value, sub, tone = "default" }) {
  const tones = { default:"text-dark", primary:"text-primary", ai:"text-ai", info:"text-info" };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${tones[tone]}`}>{value ?? "—"}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
