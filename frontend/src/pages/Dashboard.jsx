import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { api } from "../lib/api";
import KpiCard from "../components/KpiCard";
import SourceNote from "../components/SourceNote";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import SectionTitle from "../components/SectionTitle";

const fmt = n => n ? `$${Math.round(n / 1000)}K` : "—";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [topPaying, setTopPaying] = useState([]);
  const [experience, setExperience] = useState([]);
  const [remote, setRemote] = useState([]);
  const [saudi, setSaudi] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.dashboard(), api.highestPaying(8), api.experience(), api.remote(), api.saudi()])
      .then(([s, tp, exp, rem, sa]) => { setSummary(s); setTopPaying(tp); setExperience(exp); setRemote(rem); setSaudi(sa); })
      .catch(setError);
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!summary) return <Loading />;

  return (
    <div>
      <SectionTitle title="نظرة عامة على سوق AI والبيانات" subtitle={`${summary.records?.toLocaleString("en")} سجل وظيفي محلل من بيانات 2020–2025`} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="الراتب المتوسط" value={fmt(summary.median_salary)} tone="primary" />
        <KpiCard label="متوسط الراتب" value={fmt(summary.average_salary)} />
        <KpiCard label="أعلى راتب" value={fmt(summary.highest_salary)} />
        <KpiCard label="العمل عن بُعد بالكامل" value={`${summary.remote_pct}%`} tone="info" />
        <KpiCard label="إجمالي السجلات" value={summary.records?.toLocaleString("en")} />
        <KpiCard label="المسميات الوظيفية" value={summary.job_titles} />
        <KpiCard label="الأكثر شيوعًا" value={summary.most_common_role} tone="ai" sub="بناءً على عدد السجلات" />
        <KpiCard label="الأعلى أجرًا" value={summary.highest_paying_role} tone="primary" sub="بناءً على الوسيط" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">أعلى 8 وظائف أجرًا (Median)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topPaying} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={fmt} fontSize={11} />
              <YAxis type="category" dataKey="title" width={160} fontSize={11} />
              <Tooltip formatter={v => [fmt(v), "Median"]} />
              <Bar dataKey="median" fill="#16A34A" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">الراتب المتوسط حسب مستوى الخبرة</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={experience}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" fontSize={11} />
              <YAxis tickFormatter={fmt} fontSize={11} />
              <Tooltip formatter={v => [fmt(v), "Median"]} />
              <Bar dataKey="median" fill="#7C3AED" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">متوسط الراتب حسب نمط العمل</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={remote}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis tickFormatter={fmt} fontSize={11} />
              <Tooltip formatter={v => [fmt(v), "Median"]} />
              <Bar dataKey="median" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">السياق السعودي 🇸🇦</h2>
          {saudi?.has_sufficient_data ? (
            <div className="space-y-2 text-sm">
              <p className="text-slate-600">عدد السجلات: <b>{saudi.records}</b></p>
              <p className="text-slate-600">الراتب المتوسط: <b className="text-primary">{fmt(saudi.stats?.median)}</b></p>
            </div>
          ) : (
            <div className="rounded-xl bg-warn/10 p-3 text-sm text-warn leading-relaxed">
              بيانات غير كافية ({saudi?.records ?? 0} سجل). لا يمكن استخلاص استنتاجات موثوقة عن رواتب السوق السعودي من هذا المصدر.
            </div>
          )}
        </div>
      </div>

      <SourceNote />
    </div>
  );
}
