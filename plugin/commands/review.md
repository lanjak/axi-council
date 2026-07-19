---
description: Run a multi-LLM adversarial review of an artifact or question
argument-hint: '<prompt> [--models kimi,deepseek,mimo]'
disable-model-invocation: true
allowed-tools: Bash(node:*)
---

Run an adversarial review through the axi-council CLI.

Raw arguments: `$ARGUMENTS`

Run:
```bash
node /home/rufi/projects/axi-council/dist/cli.js review "$ARGUMENTS"
```

Return stdout verbatim.
