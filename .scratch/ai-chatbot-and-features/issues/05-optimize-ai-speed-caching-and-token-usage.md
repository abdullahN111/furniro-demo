# 05: Optimize AI Response Speed, In-Memory Caching & Token/Quota Efficiency

Status: resolved

## Objective
Make the AI Chatbot, Visual Search, and Review Insights 3x–5x faster while reducing free-tier Gemini token/RPM consumption by 60%–80%, keeping 100% of existing features:
1. Switch default model in `ai/config/constants.ts` to `gemini-3.5-flash-lite` with `thinking_level: "minimal"` and a compact, token-efficient system instruction.
2. Add a 60-second in-memory Sanity catalog cache in `ai/services/catalogService.ts` to eliminate repeated network round-trips.
3. Upgrade `ai/services/agentEngine.ts` to:
   - Handle deterministic intents (quick prompts, cart/wishlist commands, order tracking, direct price/sale/category searches) instantaneously via the local tool engine (0 LLM wait, 0 quota spent).
   - For open-ended or complex requests that invoke Gemini tools, execute the tool and format the response in **1 single Gemini call** instead of 2 sequential Gemini calls (cutting LLM latency and RPM in half).
4. Add a 5-minute in-memory cache for product review insights in `ai/services/reviewInsightsEngine.ts`.
