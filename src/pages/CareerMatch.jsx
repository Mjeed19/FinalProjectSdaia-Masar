import { useState } from "react";
import { api } from "../lib/api";
import SectionTitle from "../components/SectionTitle";
import Loading from "../components/Loading";

const EXPERIENCE = ["Student", "0-2 years", "2-5 years", "5+ years"];
const INTERESTS = ["data analysis", "programming", "machine learning", "ai", "business", "research", "product"];
const SKILLS = ["python", "sql", "statistics", "mathematics", "programming", "cloud", "communication"];
const GOALS = [["highest_salary","أعلى راتب"],["remote_work","العمل عن بُعد"],["fastest_entry","أسرع دخول"],["research","البحث العلمي"]];
const fmt = n => n ? `$${Math.round(n / 1000)}K` : "—";

export default function CareerMatch() {
  const [exp, setExp] = useState("0-2 years");
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState(Object.fromEntries(SKILLS.map(s => [s, 2])));
  const [goal, setGoal] = useState("highest_salary");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = i => setInterests(a => a.includes(i) ? a.filter(x => x !== i) : [...a, i]);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.careerMatch({ experience: exp, interests, skills, goal });
      setResults(res.results);
    } finally { setLoading(false); }
  };

  const SCORE_COLORS = ["text-primary", "text-emerald-500", "text-info", "text-ai", "text-warn"];

  return (
    <div>
      <SectionTitle title="اكتشف مسارك المهني" subtitle="درجة محسوبة بناءً على اهتماماتك، مهاراتك، وأهدافك المهنية" />

      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">مستوى الخبرة</p>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE.map(e => (
              <button key={e} onClick={() => setExp(e)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${exp === e ? "bg-primary text-white" : "border border-slate-300 text-slate-600 hover:border-primary"}`}>{e}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">اهتماماتك</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(i => (
              <button key={i} onClick={() => toggle(i)} className={`rounded-full px-3 py-1.5 text-sm transition-colors ${interests.includes(i) ? "bg-ai text-white" : "border border-slate-300 text-slate-600 hover:border-ai"}`}>{i}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">مهاراتك (0–5)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SKILLS.map(s => (
              <label key={s} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 text-slate-600">{s}</span>
                <input type="range" min="0" max="5" value={skills[s]}
                  onChange={e => setSkills(sk => ({ ...sk, [s]: Number(e.target.value) }))}
                  className="flex-1 accent-primary" />
                <span className="w-4 text-center font-semibold text-primary">{skills[s]}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">هدفك الأساسي</p>
          <div className="flex flex-wrap gap-2">
            {GOALS.map(([v, l]) => (
              <button key={v} onClick={() => setGoal(v)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${goal === v ? "bg-dark text-white" : "border border-slate-300 text-slate-600 hover:border-dark"}`}>{l}</button>
            ))}
          </div>
        </div>

        <button onClick={submit} disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? "جاري الحساب…" : "احسب المسار المناسب لي ←"}
        </button>
      </div>

      {loading && <div className="mt-6"><Loading /></div>}

      {results && (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">النتائج</h2>
          {results.map((r, idx) => (
            <div key={r.title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">#{idx + 1}</p>
                <p className="font-bold text-dark">{r.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">متوسط الراتب: <b>{fmt(r.median_salary)}</b> · {r.records?.toLocaleString("en")} سجل</p>
              </div>
              <div className={`text-3xl font-bold ${SCORE_COLORS[idx]}`}>{r.score}%</div>
            </div>
          ))}
          <p className="text-xs text-slate-400 pt-1">الدرجة مبنية على: مطابقة الاهتمامات (30%) + المهارات (25%) + الخبرة (20%) + الراتب (10%) + العمل عن بُعد (10%) + طلب السوق (5%)</p>
        </div>
      )}
    </div>
  );
}
