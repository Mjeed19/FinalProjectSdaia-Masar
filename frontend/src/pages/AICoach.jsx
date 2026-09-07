import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { api } from "../lib/api";
import SectionTitle from "../components/SectionTitle";

const SUGGESTIONS = [
  "وش أعلى وظيفة راتبًا؟",
  "أي وظيفة أسهل للدخول؟",
  "هل العمل عن بُعد شائع؟",
  "أي دولة فيها أعلى رواتب؟",
];

export default function AICoach() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    text: "أهلًا! أنا مساعد مسار المهني 👋\nاسألني عن الرواتب، الوظائف، أو مسارك المهني — إجاباتي مبنية على بيانات حقيقية من 105,000 سجل وظيفي."
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const q = text ?? input;
    if (!q.trim() || loading) return;
    setMessages(m => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.chat(q);
      const answer = res.answer || formatFallback(res.context);
      setMessages(m => [...m, { role: "assistant", text: answer }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "تعذّر الحصول على إجابة. تحقق من اتصال الإنترنت." }]);
    } finally { setLoading(false); }
  };

  function formatFallback(ctx) {
    if (!ctx?.data) return "البيانات غير متاحة حالياً.";
    if (Array.isArray(ctx.data)) {
      return ctx.data.slice(0, 5).map((d, i) =>
        `${i + 1}. ${d.title || d.country || ""}: $${Math.round((d.median || d.median_salary || 0) / 1000)}K`
      ).join("\n");
    }
    return JSON.stringify(ctx.data, null, 2);
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      <SectionTitle title="المساعد المهني الذكي" subtitle="إجاباتي مبنية على بيانات محسوبة من قاعدة البيانات" />

      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.role === "user" ? "bg-primary/10 text-primary" : "bg-ai/10 text-ai"}`}>
              {m.role === "user" ? <User size={15} /> : <Bot size={15} />}
            </div>
            <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-primary/10 text-dark" : "bg-slate-100 text-dark"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-ai/10 text-ai"><Bot size={15} /></div>
            <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-400">يكتب…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => send(s)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 hover:border-ai hover:text-ai transition-colors">
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={e => { e.preventDefault(); send(); }} className="mt-2 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="اكتب سؤالك هنا…"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-ai focus:outline-none" />
        <button type="submit" disabled={loading || !input.trim()}
          className="grid place-items-center rounded-xl bg-ai px-4 text-white hover:bg-ai/90 disabled:opacity-40 transition-colors">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
