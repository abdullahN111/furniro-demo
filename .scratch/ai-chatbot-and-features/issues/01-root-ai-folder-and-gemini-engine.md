# 01: Root `/ai` Architecture, `@google/genai` SDK & Server Engines

Status: resolved

## Objective
1. Install `@google/genai` and add `"@ai/*": ["./ai/*"]` to `tsconfig.json`.
2. Create `/ai/types/index.ts`, `/ai/config/constants.ts`, `/ai/config/tools.ts`.
3. Create `/ai/services/catalogService.ts`, `/ai/services/agentEngine.ts`, `/ai/services/visualSearchEngine.ts`, and `/ai/services/reviewInsightsEngine.ts`.
4. Create Next.js API route handlers `/api/ai/chat`, `/api/ai/visual-search`, and `/api/ai/review-insights`.
