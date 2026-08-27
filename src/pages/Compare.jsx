import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Loading from "../components/Loading";
import SectionTitle from "../components/SectionTitle";
const fmt = n => n ? `$${Math.round(n/1000)}K` : "—";
const ROWS = [["median","الوسيط",fmt],["records","السجلات",n=>n?.toLocaleString("en")],["remote_pct","نسبة العمل عن بُعد",n=>`${n}%`],["senior_median","راتب المستوى الأول",fmt]];
export default function Compare() {
  const [titles, setTitles] = useState([]);
  const [a, setA] = useState(""); const [b, setB] = useState("");
  const [result, setResult] = useState(null);
  useEffect(() => { api.jobs({}).then(d=>setTitles(d.titles)); }, []);
  useEffect(() => { if(a&&b) api.compare(a,b).then(setResult).catch(()=>setResult(null)); else setResult(null); }, [a,b]);
  const sel = "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none";
  return (
    <div>
      <SectionTitle title="مقارنة المسارات المهنية" subtitle="قارن بين وظيفتين على نفس المؤشرات"/>
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <select className={sel} value={a} onChange={e=>setA(e.target.value)}><option value="">الوظيفة الأولى</option>{titles.map(t=><option key={t} value={t}>{t}</option>)}</select>
        <span className="text-slate-400 font-bold">VS</span>
        <select className={sel} value={b} onChange={e=>setB(e.target.value)}><option value="">الوظيفة الثانية</option>{titles.map(t=><option key={t} value={t}>{t}</option>)}</select>
      </div>
      {a&&b&&!result && <Loading/>}
      {result && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-right text-xs text-slate-500">
              <tr><th className="px-4 py-3 font-medium">المؤشر</th><th className="px-4 py-3 font-medium text-primary">{result.a.title}</th><th className="px-4 py-3 font-medium text-ai">{result.b.title}</th></tr>
            </thead>
            <tbody>
              {ROWS.map(([key,label,f])=>(
                <tr key={key} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-500">{label}</td>
                  <td className="px-4 py-3 font-semibold">{f(result.a[key])}</td>
                  <td className="px-4 py-3 font-semibold">{f(result.b[key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
