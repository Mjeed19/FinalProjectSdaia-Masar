import os, csv, json, statistics, httpx
from collections import defaultdict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Masar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load & clean data once at startup ──────────────────────────────────────
EXP_LABEL = {"EN": "Entry Level", "MI": "Mid Level", "SE": "Senior", "EX": "Executive"}
EMP_LABEL = {"FT": "Full-time", "PT": "Part-time", "CT": "Contract", "FL": "Freelance"}
SIZE_LABEL = {"S": "Small", "M": "Medium", "L": "Large"}

def load_data():
    rows = []
    path = os.path.join(os.path.dirname(__file__), "salaries.csv")
    with open(path, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            try:
                sal = int(r["salary_in_usd"])
                year = int(r["work_year"])
                exp = r["experience_level"].strip().upper()
                emp = r["employment_type"].strip().upper()
                size = r["company_size"].strip().upper()
                remote = int(r["remote_ratio"])
                if not (1000 < sal < 2_000_000): continue
                if exp not in EXP_LABEL or emp not in EMP_LABEL or size not in SIZE_LABEL: continue
                rows.append({
                    "job_title": r["job_title"].strip(),
                    "work_year": year,
                    "experience_level": exp,
                    "employment_type": emp,
                    "salary_usd": sal,
                    "employee_residence": r["employee_residence"].strip().upper(),
                    "remote_ratio": 0 if remote < 20 else (100 if remote >= 80 else 50),
                    "company_location": r["company_location"].strip().upper(),
                    "company_size": size,
                })
            except (ValueError, KeyError):
                continue
    return rows

JOBS = load_data()

# ── Helpers ────────────────────────────────────────────────────────────────
def med(vals):
    return int(statistics.median(vals)) if vals else 0

def avg(vals):
    return int(statistics.mean(vals)) if vals else 0

def stats(rows):
    s = [r["salary_usd"] for r in rows]
    if not s:
        return {"records": 0, "median": 0, "average": 0, "min": 0, "max": 0, "p25": 0, "p75": 0}
    s.sort()
    return {
        "records": len(s),
        "median": med(s),
        "average": avg(s),
        "min": s[0],
        "max": s[-1],
        "p25": s[len(s)//4],
        "p75": s[(len(s)*3)//4],
    }

def group(rows, key):
    d = defaultdict(list)
    for r in rows:
        d[r[key]].append(r)
    return d

def filter_rows(q: dict):
    result = JOBS
    if q.get("job_title"):   result = [r for r in result if r["job_title"] == q["job_title"]]
    if q.get("experience_level"): result = [r for r in result if r["experience_level"] == q["experience_level"]]
    if q.get("work_year"):   result = [r for r in result if r["work_year"] == int(q["work_year"])]
    if q.get("company_size"): result = [r for r in result if r["company_size"] == q["company_size"]]
    if q.get("remote_ratio") is not None and q["remote_ratio"] != "":
        result = [r for r in result if r["remote_ratio"] == int(q["remote_ratio"])]
    return result

# ── Routes ─────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"ok": True, "records": len(JOBS)}

@app.get("/api/dashboard")
def dashboard():
    salaries = [r["salary_usd"] for r in JOBS]
    remote_count = sum(1 for r in JOBS if r["remote_ratio"] == 100)
    by_title = group(JOBS, "job_title")
    top_role = max(by_title.items(), key=lambda x: len(x[1]))[0]
    highest_role = max(by_title.items(), key=lambda x: med([r["salary_usd"] for r in x[1]]))[0]
    return {
        "records": len(JOBS),
        "job_titles": len(by_title),
        "median_salary": med(salaries),
        "average_salary": avg(salaries),
        "highest_salary": max(salaries),
        "remote_pct": round(remote_count / len(JOBS) * 100),
        "most_common_role": top_role,
        "highest_paying_role": highest_role,
    }

@app.get("/api/dashboard/highest-paying")
def highest_paying(limit: int = 5):
    by_title = group(JOBS, "job_title")
    result = [
        {"title": t, **stats(rows)}
        for t, rows in by_title.items()
        if len(rows) >= 30
    ]
    result.sort(key=lambda x: x["median"], reverse=True)
    return result[:limit]

@app.get("/api/dashboard/experience")
def experience():
    order = ["EN", "MI", "SE", "EX"]
    return [{"level": lv, "label": EXP_LABEL[lv], **stats([r for r in JOBS if r["experience_level"] == lv])} for lv in order]

@app.get("/api/dashboard/remote")
def remote():
    labels = {0: "حضوري", 50: "هجين", 100: "عن بُعد بالكامل"}
    return [{"ratio": ratio, "label": labels[ratio], **stats([r for r in JOBS if r["remote_ratio"] == ratio])} for ratio in [0, 50, 100]]

@app.get("/api/dashboard/countries")
def countries(field: str = "company_location", limit: int = 15):
    key = "employee_residence" if field == "residence" else "company_location"
    by_country = group(JOBS, key)
    result = []
    for country, rows in by_country.items():
        s = stats(rows)
        s["country"] = country
        s["remote_pct"] = round(sum(1 for r in rows if r["remote_ratio"] == 100) / len(rows) * 100)
        result.append(s)
    result.sort(key=lambda x: x["records"], reverse=True)
    return result[:limit]

@app.get("/api/dashboard/saudi")
def saudi():
    rows = [r for r in JOBS if r["employee_residence"] == "SA" or r["company_location"] == "SA"]
    return {"has_sufficient_data": len(rows) >= 30, "records": len(rows), "stats": stats(rows) if rows else None}

@app.get("/api/jobs")
def jobs(job_title: str = "", experience_level: str = "", work_year: str = "", company_size: str = "", remote_ratio: str = ""):
    filtered = filter_rows({"job_title": job_title, "experience_level": experience_level, "work_year": work_year, "company_size": company_size, "remote_ratio": remote_ratio if remote_ratio != "" else None})
    all_titles = sorted(set(r["job_title"] for r in JOBS))
    # salary distribution buckets
    buckets = defaultdict(int)
    for r in filtered:
        b = (r["salary_usd"] // 25000) * 25000
        buckets[b] += 1
    dist = [{"bucket": k, "count": v} for k, v in sorted(buckets.items())]
    return {"titles": all_titles, "stats": stats(filtered), "distribution": dist}

@app.get("/api/jobs/{title}")
def job_detail(title: str):
    rows = [r for r in JOBS if r["job_title"] == title]
    if not rows:
        raise HTTPException(404, "Job title not found")
    exp_dist = [{"level": lv, "label": EXP_LABEL[lv], **stats([r for r in rows if r["experience_level"] == lv])} for lv in ["EN","MI","SE","EX"]]
    top_exp = max(exp_dist, key=lambda x: x["records"])["level"]
    by_loc = group(rows, "company_location")
    top_locs = sorted([{"country": c, **stats(rs)} for c, rs in by_loc.items()], key=lambda x: x["records"], reverse=True)[:5]
    return {
        "title": title, **stats(rows),
        "remote_pct": round(sum(1 for r in rows if r["remote_ratio"] == 100) / len(rows) * 100),
        "experience_distribution": exp_dist,
        "most_common_experience": top_exp,
        "top_locations": top_locs,
        "company_size_distribution": [{"size": s, "records": sum(1 for r in rows if r["company_size"] == s)} for s in ["S","M","L"]],
    }

@app.get("/api/compare")
def compare(a: str, b: str):
    def detail(title):
        rows = [r for r in JOBS if r["job_title"] == title]
        if not rows: raise HTTPException(404, f"{title} not found")
        senior = [r for r in rows if r["experience_level"] == "SE"]
        return {**stats(rows), "title": title, "senior_median": med([r["salary_usd"] for r in senior]),
                "remote_pct": round(sum(1 for r in rows if r["remote_ratio"] == 100) / len(rows) * 100)}
    return {"a": detail(a), "b": detail(b)}

# ── Career Match ───────────────────────────────────────────────────────────
ROLE_PROFILES = {
    "Data Scientist":             {"interests": ["data analysis","machine learning","research"],  "skills": {"python":5,"sql":4,"statistics":5,"mathematics":4,"programming":3,"cloud":2,"communication":3}},
    "Machine Learning Engineer":  {"interests": ["machine learning","programming","ai"],           "skills": {"python":5,"sql":3,"statistics":3,"mathematics":4,"programming":5,"cloud":4,"communication":2}},
    "AI Engineer":                {"interests": ["ai","machine learning","programming"],           "skills": {"python":5,"sql":2,"statistics":3,"mathematics":4,"programming":5,"cloud":4,"communication":2}},
    "Data Engineer":              {"interests": ["programming","data analysis"],                   "skills": {"python":4,"sql":5,"statistics":2,"mathematics":2,"programming":5,"cloud":5,"communication":2}},
    "Data Analyst":               {"interests": ["data analysis","business"],                      "skills": {"python":2,"sql":5,"statistics":4,"mathematics":2,"programming":2,"cloud":1,"communication":4}},
    "Research Scientist":         {"interests": ["research","ai","machine learning"],              "skills": {"python":4,"sql":2,"statistics":5,"mathematics":5,"programming":3,"cloud":1,"communication":3}},
    "Software Engineer":          {"interests": ["programming","product"],                         "skills": {"python":4,"sql":3,"statistics":2,"mathematics":3,"programming":5,"cloud":4,"communication":3}},
    "Applied Scientist":          {"interests": ["research","machine learning","ai"],              "skills": {"python":5,"sql":2,"statistics":5,"mathematics":5,"programming":4,"cloud":2,"communication":2}},
}
EXP_MAP = {"Student":"EN","0-2 years":"EN","2-5 years":"MI","5+ years":"SE"}

class CareerProfile(BaseModel):
    experience: str = "0-2 years"
    interests: list[str] = []
    skills: dict = {}
    goal: str = "highest_salary"

@app.post("/api/career-match")
def career_match(profile: CareerProfile):
    by_title = group(JOBS, "job_title")
    total = len(JOBS)
    exp_level = EXP_MAP.get(profile.experience, "EN")
    results = []
    for title, role in ROLE_PROFILES.items():
        rows = by_title.get(title, [])
        s = stats(rows)
        interest_score = len(set(profile.interests) & set(role["interests"])) / max(len(role["interests"]), 1)
        # cosine-like skill match
        keys = list(role["skills"])
        dot = sum(profile.skills.get(k, 0) * role["skills"][k] for k in keys)
        mag_u = sum((profile.skills.get(k,0))**2 for k in keys) ** 0.5
        mag_r = sum(v**2 for v in role["skills"].values()) ** 0.5
        skill_score = dot / (mag_u * mag_r) if mag_u and mag_r else 0
        exp_rows = [r for r in rows if r["experience_level"] == exp_level]
        exp_score = len(exp_rows) / len(rows) if rows else 0
        salary_score = min(s["median"] / 200000, 1) if s["median"] else 0
        remote_rows = sum(1 for r in rows if r["remote_ratio"] == 100)
        remote_score = remote_rows / len(rows) if rows else 0
        demand_score = len(rows) / total if total else 0
        sw = 0.20 if profile.goal == "highest_salary" else 0.10
        rw = 0.20 if profile.goal == "remote_work" else 0.10
        raw = interest_score*0.30 + skill_score*0.25 + exp_score*0.20 + salary_score*sw + remote_score*rw + demand_score*0.05
        results.append({"title": title, "score": round(min(raw,1)*100), "median_salary": s["median"], "records": s["records"]})
    results.sort(key=lambda x: x["score"], reverse=True)
    return {"results": results[:5]}

# ── AI Chat ────────────────────────────────────────────────────────────────
class ChatMsg(BaseModel):
    message: str

def detect_intent(q: str) -> str:
    q = q.lower()
    if any(w in q for w in ["highest","top","أعلى","راتب"]): return "highest_salary"
    if any(w in q for w in ["entry","easiest","أسهل","مبتدئ"]): return "easiest_entry"
    if any(w in q for w in ["remote","بعد","ريموت"]): return "remote"
    if any(w in q for w in ["country","countries","دولة","بلد"]): return "countries"
    return "general"

def build_context(intent: str) -> dict:
    if intent == "highest_salary":
        by_title = group(JOBS, "job_title")
        top = sorted([{"title":t,"median":med([r["salary_usd"] for r in rows])} for t,rows in by_title.items() if len(rows)>=30], key=lambda x:x["median"], reverse=True)[:5]
        return {"intent": intent, "data": top}
    if intent == "easiest_entry":
        by_title = group(JOBS, "job_title")
        result = sorted([{"title":t,"entry_pct":round(sum(1 for r in rows if r["experience_level"]=="EN")/len(rows)*100),"records":len(rows)} for t,rows in by_title.items() if len(rows)>=50], key=lambda x:x["entry_pct"], reverse=True)[:5]
        return {"intent": intent, "data": result}
    if intent == "remote":
        return {"intent": intent, "data": [{"ratio":ratio,"median":med([r["salary_usd"] for r in JOBS if r["remote_ratio"]==ratio]),"count":sum(1 for r in JOBS if r["remote_ratio"]==ratio)} for ratio in [0,50,100]]}
    if intent == "countries":
        by_c = group(JOBS, "company_location")
        top = sorted([{"country":c,"median":med([r["salary_usd"] for r in rows]),"records":len(rows)} for c,rows in by_c.items()], key=lambda x:x["records"], reverse=True)[:8]
        return {"intent": intent, "data": top}
    salaries = [r["salary_usd"] for r in JOBS]
    return {"intent":"general","data":{"records":len(JOBS),"median":med(salaries),"job_titles":len(set(r["job_title"] for r in JOBS))}}

SYSTEM = """أنت مساعد مهني ذكي لمنصة مسار (Masar) لتحليل رواتب الذكاء الاصطناعي وعلوم البيانات.
أجب بإيجاز وبالعربية بناءً على بيانات JSON المرفقة فقط. لا تخترع أرقامًا.
وضّح دائمًا أن الأرقام مبنية على بيانات Kaggle العالمية وليست بيانات سعودية محققة."""

@app.post("/api/chat")
async def chat(msg: ChatMsg):
    intent = detect_intent(msg.message)
    context = build_context(intent)
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        return {"intent": intent, "context": context, "answer": None, "note": "OPENROUTER_API_KEY غير مضبوط — البيانات الخام متاحة."}
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": "openai/gpt-4o-mini", "max_tokens": 400,
                  "messages": [
                      {"role": "system", "content": SYSTEM},
                      {"role": "user", "content": f"السؤال: {msg.message}\n\nالبيانات:\n{json.dumps(context, ensure_ascii=False)}"}
                  ]}
        )
    data = r.json()
    answer = data.get("choices", [{}])[0].get("message", {}).get("content")
    return {"intent": intent, "context": context, "answer": answer}
