import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../lib/api";
import KpiCard from "../components/KpiCard";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";
import SectionTitle from "../components/SectionTitle";

const fmt = n => n ? `$${Math.round(n / 1000)}K` : "—";

export default function Salaries() {
  const [titles, setTitles] = useState([]);
  const [filters, setFilters] = useState({ job_title:"", experience_level:"", company_size:"", remote_ratio:"" });
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.jobs(filters).then(d => { setTitles(d.titles); setData(d); }).catch(setError);
  }, [JSON.stringify(filters)]);

  const onChange = k => e => setFilters(f => ({ ...f, [k]: e.target.value }));
  const sel = "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none";

  return (
    <div>
      <SectionTitle title="مستكشف الرواتب" subtitle="فلترة تفاعلية لأكثر من 105,000 سجل وظيفي" />

      <div className="flex flex-wrap gap-2 mb-5">
        <select className={sel} value={filters.job_title} onChange={onChange("job_title")}>
          <option value="">كل الوظائف</option>
          {titles.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className={sel} value={filters.experience_level} onChange={onChange("experience_level")}>
          <option value="">كل المستويات</option>
          {[["EN","مبتدئ"],["MI","متوسط"],["SE","أول"],["EX","تنفيذي"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className={sel} value={filters.company_size} onChange={onChange("company_size")}>
          <option value="">كل الأحجام</option>
          {[["S","صغيرة"],["M","متوسطة"],["L","كبيرة"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className={sel} value={filters.remote_ratio} onChange={onChange("remote_ratio")}>
          <option value="">كل أنماط العمل</option>
          {[["0","حضوري"],["50","هجين"],["100","عن بُعد بالكامل"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {error && <ErrorBox error={error} />}
      {!data && !error && <Loading />}

      {data && <>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 mb-5">
          <KpiCard label="السجلات" value={data.stats.records?.toLocaleString("en")} />
          <KpiCard label="الوسيط" value={fmt(data.stats.median)} tone="primary" />
          <KpiCard label="المعدل" value={fmt(data.stats.average)} />
          <KpiCard label="الأدنى" value={fmt(data.stats.min)} />
          <KpiCard label="الأعلى" value={fmt(data.stats.max)} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">توزيع الرواتب</h2>
          {data.stats.records === 0
            ? <p className="text-sm text-slate-400 text-center py-8">لا توجد سجلات مطابقة.</p>
            : <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="bucket" tickFormatter={fmt} fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip labelFormatter={fmt} formatter={v => [v, "عدد الوظائف"]} />
                  <Bar dataKey="count" fill="#16A34A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          }
        </div>
      </>}
    </div>
  );
}
