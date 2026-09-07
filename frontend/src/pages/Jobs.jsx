import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../lib/api";
import Loading from "../components/Loading";
import SectionTitle from "../components/SectionTitle";

export default function Jobs() {
  const [titles, setTitles] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => { api.jobs({}).then(d => setTitles(d.titles)); }, []);

  if (!titles) return <Loading />;
  const filtered = titles.filter(t => t.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <SectionTitle title="مستكشف الوظائف" subtitle={`${titles.length} مسمى وظيفي في البيانات`} />
      <div className="relative max-w-sm mb-5">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث عن وظيفة..."
          className="w-full rounded-xl border border-slate-300 bg-white py-2 pe-9 ps-3 text-sm focus:border-primary focus:outline-none"/>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(t => (
          <Link key={t} to={`/jobs/${encodeURIComponent(t)}`}
            className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-dark shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-md">
            {t}
          </Link>
        ))}
        {!filtered.length && <p className="text-sm text-slate-400">لا توجد نتائج.</p>}
      </div>
    </div>
  );
}
