const BASE = import.meta.env.VITE_API_URL || "/api";

async function get(path, params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([,v]) => v !== undefined && v !== ""));
  const res = await fetch(`${BASE}${path}${qs.toString() ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}
async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export const api = {
  health: () => get("/health"),
  dashboard: () => get("/dashboard"),
  highestPaying: (limit=5) => get("/dashboard/highest-paying", {limit}),
  experience: () => get("/dashboard/experience"),
  remote: () => get("/dashboard/remote"),
  countries: (field) => get("/dashboard/countries", field === "residence" ? {field:"residence"} : {}),
  saudi: () => get("/dashboard/saudi"),
  jobs: (f={}) => get("/jobs", f),
  jobDetail: (title) => get(`/jobs/${encodeURIComponent(title)}`),
  compare: (a, b) => get("/compare", {a, b}),
  careerMatch: (profile) => post("/career-match", profile),
  chat: (message) => post("/chat", {message}),
};
