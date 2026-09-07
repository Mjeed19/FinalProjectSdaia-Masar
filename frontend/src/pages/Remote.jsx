import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../lib/api";
import KpiCard from "../components/KpiCard";
import Loading from "../components/Loading";
import SectionTitle from "../components/SectionTitle";
const fmt = n => n ? `$${Math.round(n/1000)}K` : "—";
export default function Remote() {
  const [data, setData] = useState(null);
  useEffect(() => { api.remote().then(setData); }, []);
  if (!data) return <Loading/>;
  return (
    <div>
      <SectionTitle title="تحليل العمل عن بُعد" subtitle="مقارنة الرواتب حسب نمط العمل"/>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-6">
        {data.map(d => <KpiCard key={d.ratio} label={d.label} value={fmt(d.median)} sub={`${d.records?.toLocaleString("en")} سجل`} tone={d.ratio===100?"primary":"default"}/>)}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="label" fontSize={12}/>
            <YAxis tickFormatter={fmt} fontSize={11}/>
            <Tooltip formatter={v => [fmt(v), "Median"]}/>
            <Bar dataKey="median" fill="#2563EB" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
