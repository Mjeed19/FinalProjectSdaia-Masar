import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import KpiCard from "../components/KpiCard";
import Loading from "../components/Loading";
import ErrorBox from "../components/ErrorBox";

const fmt = n => n ? `$${Math.round(n / 1000)}K` : "—";
const EL = { EN:"مبتدئ", MI:"متوسط", SE:"أول", EX:"تنفيذي" };

export default function JobDetail() {
  const { title } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { setJob(null); api.jobDetail(title).then(setJob).catch(setError); }, [title]);

  if (error) return <ErrorBox error={error}/>;
  if (!job) return <Loading/>;

  return (
    <div>
      <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary mb-3">
        <ArrowRight size={14}/> رجوع
      </Link>
      <h1 className="text-xl font-bold mb-4">{job.title}</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="الوسيط" value={fmt(job.median)} tone="primary"/>
        <KpiCard label="المعدل" value={fmt(job.average)}/>
        <KpiCard label="السجلات" value={job.records?.toLocaleString("en")}/>
        <KpiCard label="العمل عن بُعد" value={`${job.remote_pct}%`}/>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">الراتب حسب الخبرة</h2>
          {job.experience_distribution?.filter(e => e.records > 0).map(e => (
            <div key={e.level} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-sm">
              <span className="text-slate-600">{EL[e.level]} <span className="text-slate-400">({e.records})</span></span>
              <span className="font-semibold">{fmt(e.median)}</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">أهم الدول</h2>
          {job.top_locations?.map(l => (
            <div key={l.country} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-sm">
              <span className="text-slate-600">{l.country} <span className="text-slate-400">({l.records})</span></span>
              <span className="font-semibold">{fmt(l.median)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
