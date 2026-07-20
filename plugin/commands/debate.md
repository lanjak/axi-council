---
description: Run a sequential adversarial debate between LLM judges until consensus
argument-hint: '<prompt> [--models <providers>] [--max-rounds <n>] [--participate]'
disable-model-invocation: true
allowed-tools: Bash(node:*)
---

Run a council debate through the council-axi CLI.

Raw arguments: `$ARGUMENTS`

If the arguments reference a file to debate, attach it with --file instead of
inlining the path into the prompt.

Run:
```bash
node /home/rufi/projects/council-axi/dist/cli.js debate "$ARGUMENTS"
```

If the output ends with `status: awaiting-caller`, you are a participant:
read the transcript, form your own position, and continue with the printed
`debate turn <session-id> --stdin` command, ending your turn with
`VERDICT: AGREE` or `VERDICT: DISAGREE`. Repeat until the debate prints a
final synthesis.

Return the final output verbatim.
