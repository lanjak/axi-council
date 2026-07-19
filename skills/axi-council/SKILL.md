---
name: axi-council
description: Run a multi-LLM adversarial review council via the axi-council CLI
metadata:
  type: tool
  user-invocable: false
---

Use this skill when the user wants adversarial feedback on a plan, decision, design, or code change from multiple independent LLMs.

## When to use

- The user asks for a "second opinion", "red team", "pressure test", or "council review".
- The user wants multiple models to review the same artifact.
- The current model should not be the only reviewer.

## How to use

1. Configure providers through environment variables:
   - `COUNCIL_PROVIDERS=openai,groq`
   - `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`
   - `GROQ_API_KEY`, `GROQ_BASE_URL`, `GROQ_MODEL`
   - Any OpenAI-compatible provider works the same way.
2. Run the CLI:
   ```bash
   npx -y axi-council review "<prompt or artifact summary>" --models openai,groq
   ```
3. Return stdout verbatim to the user.

## Commands

- `npx -y axi-council setup` - check authentication
- `npx -y axi-council review "..."` - adversarial review
- `npx -y axi-council plan "..."` - pressure-test a plan
