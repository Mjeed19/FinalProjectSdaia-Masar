# SECURITY_RULES.md — Masar Platform

## Key Security Rules

### 1. Never Expose Secrets
- API keys (OPENROUTER_API_KEY) are stored in environment variables only.
- `.env` files are never committed to Git.
- `.gitignore` excludes all `.env` files.

### 2. Never Hardcode API Keys
- All secrets use `os.environ.get("KEY_NAME")` in Python.
- Frontend uses `import.meta.env.VITE_*` for build-time variables only.
- No API key is ever embedded in frontend JavaScript.

### 3. Validate User Input
- All query parameters are typed and validated by FastAPI/Pydantic.
- Numeric fields (salary, year) are validated before use.
- Malformed CSV rows are silently dropped, not crashed on.

### 4. Sanitize User Input
- Job title parameters used in responses are sourced from the dataset, not echoed from user input directly.
- Chat messages are passed as strings to the LLM, not executed.

### 5. Use Environment Variables
- `OPENROUTER_API_KEY` — LLM access
- `VITE_API_URL` — Frontend API endpoint (build-time)
- All secrets documented in README, never in code.

### 6. CORS Policy
- Backend allows all origins in MVP for simplicity.
- Production: restrict to frontend domain only.

### 7. Data Privacy
- No user data is stored or logged.
- Chat messages are sent to OpenRouter per their privacy policy.
- No authentication system in MVP — all data is public dataset.
