import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Loading from "../components/Loading";
import SectionTitle from "../components/SectionTitle";
const fmt = n => n ? `$${Math.round(n/1000)}K` : "—";
export default function Countries() {
  const [field, setField] = useState("company_location");
  const [data, setData] = useState(null);
  useEffect(() => { setData(null); api.countries(field==="employee_residence"?"residence":undefined).then(setData); }, [field]);
  const btn = (f,l) => <button onClick={()=>setField(f)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${field===f?"bg-primary text-white":"border border-slate-300 bg-white text-slate-600 hover:border-primary"}`}>{l}</button>;
  return (
    <div>
      <SectionTitle title="التحليل الجغرافي" subtitle="موقع الشركة ومكان إقامة الموظف — فئتان مستقلتان"/>
      <div className="flex gap-2 mb-5">{btn("company_location","موقع الشركة")}{btn("employee_residence","إقامة الموظف")}</div>
      {!data ? <Loading/> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-right text-xs text-slate-500">
              <tr>{["الدولة","السجلات","الوسيط","العمل عن بُعد"].map(h=><th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.map(c=>(
                <tr key={c.country} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2 font-semibold">{c.country}</td>
                  <td className="px-4 py-2">{c.records?.toLocaleString("en")}</td>
                  <td className="px-4 py-2 text-primary font-medium">{fmt(c.median)}</td>
                  <td className="px-4 py-2">{c.remote_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
