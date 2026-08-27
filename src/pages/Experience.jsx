import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../lib/api";
import KpiCard from "../components/KpiCard";
import Loading from "../components/Loading";
import SectionTitle from "../components/SectionTitle";
const fmt = n => n ? `$${Math.round(n/1000)}K` : "—";
export default function Experience() {
  const [data, setData] = useState(null);
  useEffect(() => { api.experience().then(setData); }, []);
  if (!data) return <Loading/>;
  const growth = data[0]?.median ? Math.round(((data[2]?.median - data[0]?.median) / data[0]?.median)*100) : null;
  return (
    <div>
      <SectionTitle title="تحليل الخبرة" subtitle="كيف يتأثر الراتب بمستوى الخبرة"/>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
        {data.map(d => <KpiCard key={d.level} label={d.label} value={fmt(d.median)} sub={`${d.records?.toLocaleString("en")} سجل`}/>)}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">الراتب المتوسط حسب مستوى الخبرة</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="label" fontSize={12}/>
            <YAxis tickFormatter={fmt} fontSize={11}/>
            <Tooltip formatter={v => [fmt(v), "Median"]}/>
            <Bar dataKey="median" fill="#16A34A" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
        {growth !== null && <p className="mt-3 text-xs text-slate-500">نمو الراتب من مبتدئ إلى أول: <b className="text-primary">+{growth}%</b></p>}
      </div>
    </div>
  );
}
