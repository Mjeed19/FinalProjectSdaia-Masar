# AGENTS.md — Masar Platform

## AI Engineering Rules

### Role
Claude (Anthropic) was used as the primary AI assistant for code generation, architecture design, and documentation during this project.

### Rules Applied During Development

1. **Never expose secrets** — API keys are stored in environment variables only, never in code.
2. **Separation of concerns** — Data observations, derived insights, forecasts, and Saudi context are always kept distinct. Never mix them.
3. **Deterministic before LLM** — Career Match scoring is fully deterministic. The LLM explains results, it does not decide rankings.
4. **Minimal token usage** — The AI chat uses intent detection + aggregated DB context, never raw CSV data.
5. **Schema validation first** — The ETL pipeline validates CSV columns before processing, failing loudly on mismatches.
6. **No false Saudi data claims** — The global Kaggle dataset is never presented as representative of the Saudi labor market.
7. **Backend-only API keys** — OPENROUTER_API_KEY is read server-side only, never sent to the client.
8. **Data integrity** — Raw data files are never modified; processing always produces new output files.

### Models Used
- OpenRouter → openai/gpt-4o-mini (chat explanations only)
- Claude (Anthropic) — development assistant

### Prompt Engineering Patterns Used
- System prompt with clear role + data disclaimer
- Compact JSON context injection (never raw CSV)
- Keyword-based intent detection before LLM call
