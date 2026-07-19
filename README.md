<h1 align="center">axi-council</h1>

<p align="center">Multi-LLM adversarial review council - an <a href="https://github.com/kunchenguid/axi">AXI</a>.</p>

---

`axi-council` sends a single prompt to several independent LLM judges and returns a synthesized review. It is useful when you want more than one model to look at a plan, decision, or code change before you act. Output is in [TOON](https://toonformat.dev/) so agents can read it cheaply.

Supported judges:

- Moonshot Kimi
- DeepSeek
- Xiaomi MiMo

You bring your own API keys for each provider. If one judge is down or not authenticated, the council continues with whoever is available.

## Install

```sh
npm install -g axi-council
```

Or run without installing:

```sh
npx -y axi-council <command>
```

## Usage

Set the supplier keys you want to use:

```sh
export KIMI_API_KEY=...
export DEEPSEEK_API_KEY=...
export MIMO_API_KEY=...
```

Check which providers are authenticated:

```sh
$ axi-council setup
providers[3]{name,authenticated,detail}:
  kimi,true,Moonshot Kimi API key is set
  deepseek,true,DeepSeek API key is set
  mimo,false,Xiaomi MiMo API key is not set
help[1]: Set KIMI_API_KEY, DEEPSEEK_API_KEY, and MIMO_API_KEY to authenticate providers
```

Run an adversarial review:

```sh
$ axi-council review "Should we add a caching layer here?" --models kimi,deepseek
```

Pressure-test a plan:

```sh
$ axi-council plan "Should we migrate auth to a separate service?" --models kimi,deepseek,mimo
```

Example output:

```
council[review]: "Should we add a caching layer here?"
judges: 2 of 2 responded
judges[2]{provider,model,status,verdict}:
  kimi,kimi-k3,success,Ship after adding cache invalidation
  deepseek,deepseek-v4-pro,success,Ship but measure hit ratio first
synthesis:
  ## Council review synthesis (2 judges)

  ### kimi (kimi-k3)
  Ship after adding cache invalidation.

  ### deepseek (deepseek-v4-pro)
  Ship but measure hit ratio first.

  **Key points:**
  - Ship after adding cache invalidation
  - Ship but measure hit ratio first
help[1]: Run `npx -y axi-council review "<prompt>" --models kimi,deepseek,mimo`
```

## Configuration

Per-provider base URLs and models can be overridden with environment variables:

```sh
export KIMI_BASE_URL=https://api.moonshot.ai/v1
export KIMI_MODEL=kimi-k3
```

## Exit codes

- `0` - at least one judge responded
- `1` - runtime error or no providers available
- `2` - unknown flag or argument

## Agent integration

`axi-council` ships with an installable Agent Skill in `skills/axi-council/SKILL.md`. Copy it into your agent's skill directory, or point your agent at the CLI directly:

```sh
npx -y axi-council review "..." --models kimi,deepseek,mimo
```

Session hooks are planned but not implemented yet.

## Development

```sh
npm install
npm test          # vitest
npm run build     # tsc -> dist
npm run dev -- review "..." --models kimi
```

## License

[MIT](LICENSE)
