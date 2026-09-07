import { NavLink, Outlet } from "react-router-dom";
import { LayoutGrid, Briefcase, DollarSign, TrendingUp, Wifi, Globe2, GitCompare, Target, Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to:"/", label:"لوحة التحكم", icon:LayoutGrid, end:true },
  { to:"/jobs", label:"الوظائف", icon:Briefcase },
  { to:"/salaries", label:"الرواتب", icon:DollarSign },
  { to:"/experience", label:"الخبرة", icon:TrendingUp },
  { to:"/remote", label:"عن بُعد", icon:Wifi },
  { to:"/countries", label:"الدول", icon:Globe2 },
  { to:"/compare", label:"مقارنة", icon:GitCompare },
  { to:"/career-match", label:"مسارك المهني", icon:Target },
  { to:"/ai-coach", label:"المساعد الذكي", icon:Sparkles },
];
const MOBILE_NAV = [NAV[0], NAV[1], NAV[6], NAV[7], NAV[8]];

function NavItem({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink to={to} end={end} onClick={onClick}
      className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-dark"}`}>
      <Icon size={17} />{label}
    </NavLink>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-white font-bold text-lg shadow">م</div>
          <div>
            <p className="text-sm font-bold leading-tight text-dark">مسار</p>
            <p className="text-[11px] text-slate-400 leading-tight">AI & Data Career Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/ai-coach" className="hidden sm:flex items-center gap-1.5 rounded-full bg-ai/10 px-3 py-1.5 text-xs font-semibold text-ai hover:bg-ai/20 transition-colors">
            <Sparkles size={13} /> المساعد الذكي
          </NavLink>
          <button className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-y-0 right-0 w-64 bg-white shadow-xl p-4 pt-16 flex flex-col gap-0.5" onClick={e => e.stopPropagation()}>
            {NAV.map(n => <NavItem key={n.to} {...n} onClick={() => setOpen(false)} />)}
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-56 shrink-0 flex-col gap-0.5 overflow-y-auto border-l border-slate-200 bg-white p-3 md:flex">
          {NAV.map(n => <NavItem key={n.to} {...n} />)}
        </aside>
        <main className="min-w-0 flex-1 p-4 pb-24 md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-slate-200 bg-white py-2 md:hidden">
        {MOBILE_NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium ${isActive ? "text-primary" : "text-slate-400"}`}>
            <n.icon size={19} />{n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
