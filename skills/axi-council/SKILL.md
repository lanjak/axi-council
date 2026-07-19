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
- The user wants multiple models (Kimi K3, DeepSeek V4 Pro, MiMo v2.5 Pro) to review the same artifact.
- The current model should not be the only reviewer.

## How to use

1. Ensure the user has set direct supplier API keys:
   - `KIMI_API_KEY`
   - `DEEPSEEK_API_KEY`
   - `MIMO_API_KEY`
2. Run the CLI:
   ```bash
   npx -y axi-council review "<prompt or artifact summary>" --models kimi,deepseek,mimo
   ```
3. Return stdout verbatim to the user.

## Commands

- `npx -y axi-council setup` - check authentication
- `npx -y axi-council review "..."` - adversarial review
- `npx -y axi-council plan "..."` - pressure-test a plan
