# Contributing to MPP Inspector

Thanks for your interest in contributing. This guide covers the setup, workflow, and conventions used in this project.

## Prerequisites

- **Node.js 18+** (we use native `fetch` and top-level `await`)
- **npm 9+** (workspaces support)
- **Git**

## Setup

```bash
git clone https://github.com/amgb20/MPP-Inspector.git
cd mpp-inspector
npm install
npm run build
```

## Project Structure

This is an npm workspaces monorepo:

```
mpp-inspector/
+-- packages/
|   +-- cli/              # Main CLI tool (published as `mpp-inspector`)
|   |   +-- bin/           # CLI entry point
|   |   +-- src/
|   |   |   +-- commands/  # One file per CLI command (inspect, flow, validate, scan, compare, benchmark, session)
|   |   |   +-- display/   # Terminal formatting (chalk, boxen, tables)
|   |   |   +-- utils/     # Shared utilities (parser, http, crypto, chains, format)
|   |   |   +-- types.ts   # TypeScript interfaces (MppChallenge, MppReceipt, MppCredential, etc.)
|   |   |   +-- __tests__/ # Vitest test files
|   |   +-- vitest.config.ts
|   +-- mock-server/      # Mock MPP server for demos and testing
|   |   +-- bin/           # Server entry point
|   |   +-- src/           # Server logic and spec-compliant fixtures
|   +-- plugin/           # Claude Code plugin + MCP server
|       +-- src/           # MCP server, tools, hooks
|       +-- skills/        # MPP protocol knowledge skill
|       +-- hooks/         # Session start detection
+-- package.json          # Workspace root
```

## Development Workflow

<!-- AUTO-GENERATED: scripts -->
| Command | Description |
|---------|-------------|
| `npm run build` | Build CLI package |
| `npm run dev` | Watch mode — rebuilds CLI on change |
| `npm run test` | Run test suite (121 tests) |
| `npm run lint` | Type-check (tsc --noEmit) |
| `npm run check` | Full gate: lint + test + build |
| `npm run mock` | Start the mock MPP server on :3402 |
| `npm run build:plugin` | Build the Claude Code plugin |
<!-- /AUTO-GENERATED -->

### Building the mock server

The mock server has its own tsup build (not covered by `npm run build`):

```bash
cd packages/mock-server && npx tsup && cd ../..
```

### Testing with the mock server

Start the mock server in one terminal, then use the CLI against it:

```bash
# Terminal 1: start the mock server (must be built first)
node packages/mock-server/dist/bin/mpp-mock-server.js

# Terminal 2: test CLI commands
mpp-inspector inspect http://localhost:3402/v1/query      # Tempo challenge
mpp-inspector inspect http://localhost:3402/v1/premium    # Stripe challenge
mpp-inspector scan localhost:3402                         # discover endpoints
mpp-inspector compare http://localhost:3402/v1/query http://localhost:3402/v1/search http://localhost:3402/v1/premium
mpp-inspector flow http://localhost:3402/v1/query --dry-run
```

### Testing against the real MPP endpoint

```bash
mpp-inspector inspect https://mpp.dev/api/ping/paid
mpp-inspector scan mpp.dev
```

### Linking the CLI globally (for convenience)

```bash
cd packages/cli && npm link && cd ../..
mpp-inspector inspect https://mpp.dev/api/ping/paid
```

## Protocol Format

MPP Inspector parses the **spec-compliant** challenge format:

```
WWW-Authenticate: Payment id="...", realm="...", method="tempo", intent="charge",
    expires="2025-01-15T12:05:00Z", request="<base64url-encoded JSON>"
```

The `request` param is a base64url-encoded JSON containing method-specific payment details (amount, currency, recipient, chainId, methodDetails, etc.).

The parser also supports the **legacy** format (`challengeId`, `amount`, `currency` as top-level params) for backward compatibility.

## Adding a New Command

1. Create `packages/cli/src/commands/your-command.ts`
2. Export a Commander `Command` instance
3. Register it in `packages/cli/src/index.ts`
4. Add display formatting in `packages/cli/src/display/` if needed
5. Add tests in `packages/cli/src/__tests__/`
6. Update the command table in `README.md`

Follow the pattern of existing commands like `inspect.ts` or `scan.ts`.

## Adding a New Payment Method

1. Add the method name to `KNOWN_PAYMENT_METHODS` in `types.ts`
2. Add method info to `PAYMENT_METHOD_INFO` in `chains.ts`
3. Set `blockchain: true` or `false` (affects address validation in `crypto.ts`)
4. Add a demo endpoint in `mock-server/src/fixtures.ts`
5. Add tests

## Pull Request Guidelines

### Branch naming

Use descriptive branch names:
- `feat/lightning-method-support`
- `fix/parser-base64url-padding`
- `docs/update-chain-ids`

### Commit messages

Write clear, imperative commit messages:
- `add Lightning payment method parsing`
- `fix base64url decoding for request param`
- `update Tempo chain ID to 42431`

### Before submitting

1. Run `npm run check` — all three gates (lint, test, build) must pass
2. Add tests for new functionality
3. Update the README if you're adding commands or changing behavior
4. Keep PRs focused — one feature or fix per PR

### What makes a good first contribution

Look for issues labeled `good first issue`. Some areas that welcome contributions:

- **Signature verification** — implement method-specific signature validation
- **`/llms.txt` parsing** — parse the text format into structured endpoints in `scan.ts`
- **New chain registry entries** — add chains to `chains.ts`
- **MCP transport support** — parse JSON-RPC error codes and `_meta` fields for AI agent tool calls
- **Test coverage** — add tests for command handlers in `packages/cli/src/__tests__/commands/`

## Code Style

- TypeScript strict mode with `readonly` interfaces
- ESM throughout (`import`/`export`, `.js` extensions in imports)
- No unnecessary comments — code should be self-documenting
- Use `chalk` for terminal colors, `ora` for spinners, `boxen` for boxes, `cli-table3` for tables
- Immutable data patterns — never mutate, always return new objects

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
