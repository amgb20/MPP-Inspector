# Implementation Plan: mpp-inspector CLI

## Task Type
- [x] Backend (CLI tool)
- [ ] Frontend (web dashboard — Phase 2, not tonight)
- [ ] Fullstack

## Deadline
Ship CLI by end of day 2026-03-25.

## Scope Decision: What Ships Tonight vs Later

### TONIGHT (Phase 1 — all 7 commands + npm-ready)
All 7 CLI commands, polished output, `--json` on every command, `npx mpp-inspector` works.

### Priority Tiers Within Tonight

**Tier 1 — Core (no wallet needed, highest demo value):**
1. `inspect` — the hero command, works against any 402 endpoint
2. `validate` — paste a receipt, see it decoded
3. `scan` — discover MPP endpoints on a domain
4. `compare` — price comparison table

**Tier 2 — Wallet-dependent (need viem, more complex):**
5. `flow` — full challenge-pay-receipt cycle
6. `benchmark` — load testing with concurrent payments
7. `session` — payment channel lifecycle

### LATER (Phase 2 — web dashboard)
- Vite + React app
- FlowVisualizer, ChallengeDecoder, etc.
- Shared parser logic from CLI

---

## Technical Solution

### Architecture
- **Monorepo** with `packages/cli/` (single package for now, web added later)
- **Build**: tsup for bundling to single ESM output
- **Runtime**: Node.js 18+, ESM-only (`"type": "module"`)
- **No mppx dependency** — standalone HTTP client + header parser

### Key Design Decisions

1. **ESM-only** — chalk v5, ora v8, boxen v7 are all ESM-only. Use `"type": "module"` throughout.

2. **viem for crypto** — provides EVM address validation, signature verification, ABI encoding/decoding, wallet client for transactions. Already listed in deps.

3. **undici for HTTP** — Node.js native fetch alternative with more control over raw responses. Gives us access to exact headers for protocol inspection.

4. **Immutable data flow** — parse headers into readonly typed objects, pass through display pipeline without mutation.

5. **Every command has `--json`** — outputs machine-readable JSON for CI/CD pipelines.

6. **Nonce sequencing for benchmark** — use a mutex/queue pattern for wallet nonces. Each concurrent worker acquires next nonce before signing.

---

## Implementation Steps

### Step 1: Monorepo scaffolding
**Deliverable**: Project builds with `npm run build`, `npx .` prints help.

Files to create:
| File | Description |
|------|-------------|
| `package.json` | Root workspace config |
| `packages/cli/package.json` | CLI package with bin, deps, scripts |
| `packages/cli/tsconfig.json` | TypeScript config (ESM, strict) |
| `packages/cli/tsup.config.ts` | Build config (ESM, entry points) |
| `packages/cli/bin/mpp-inspector.ts` | Shebang entry `#!/usr/bin/env node` |
| `packages/cli/src/index.ts` | Commander program setup, register all commands |
| `.gitignore` | node_modules, dist, .env |
| `LICENSE` | MIT |

### Step 2: Types + Parser (the core protocol brain)
**Deliverable**: Can parse any `WWW-Authenticate: Payment ...` header into typed objects.

Files to create:
| File | Description |
|------|-------------|
| `packages/cli/src/types.ts` | `MppChallenge`, `MppReceipt`, `MppVerification`, `MppEndpoint`, `BenchmarkResult`, `SessionResult`, `FlowStep` interfaces |
| `packages/cli/src/utils/parser.ts` | `parseChallengeHeader(raw: string): MppChallenge` — RFC 7235 auth-param parser. Also `parseReceiptHeader()`, `parseMppManifest()` |

Key types:
```typescript
interface MppChallenge {
  readonly challengeId: string;
  readonly intent: 'charge' | 'session';
  readonly amount: string;
  readonly currency: string;      // hex address
  readonly recipient: string;     // hex address
  readonly chainId: number;
  readonly expiresAt: number;     // unix timestamp
  readonly signature: string;
  readonly description?: string;
  readonly raw: string;           // original header value
}

interface MppVerification {
  readonly signatureValid: boolean;
  readonly expiryValid: boolean;
  readonly currencyKnown: boolean;
  readonly recipientValid: boolean;
  readonly amountParseable: boolean;
  readonly errors: readonly string[];
}

interface MppReceipt {
  readonly receiptId: string;
  readonly timestamp: number;
  readonly credential: string;
  readonly challengeId?: string;
  readonly amount?: string;
  readonly raw: string;
}
```

### Step 3: Utility layer
**Deliverable**: HTTP client, crypto verification, display formatting all work.

Files to create:
| File | Description |
|------|-------------|
| `packages/cli/src/utils/http.ts` | `rawRequest(url, opts)` — uses native fetch (or undici). Returns `{status, headers, body, timing}`. No auto-payment. Supports custom method/headers/body. |
| `packages/cli/src/utils/crypto.ts` | `verifyChallengeSignature(challenge): MppVerification` — uses viem for address validation, expiry check, amount parsing. Signature verification if possible (EIP-712 typed data). Also `decodeReceipt(base64: string): MppReceipt`. |
| `packages/cli/src/utils/format.ts` | `truncateAddress(addr)`, `formatAmount(amount, currency)`, `formatDuration(ms)`, `progressBar(current, total)`. Wraps chalk for consistent color scheme. |
| `packages/cli/src/utils/wallet.ts` | `createWalletFromKey(key): WalletClient` — wraps viem wallet. `signPayment(wallet, challenge)`. `getBalance(wallet, chainId)`. Nonce manager for concurrent use. |

### Step 4: Display layer
**Deliverable**: Beautiful terminal output for all data types.

Files to create:
| File | Description |
|------|-------------|
| `packages/cli/src/display/challenge.ts` | `displayChallenge(url, challenge, verification)` — boxen header, challenge details table, raw headers section, verification checklist |
| `packages/cli/src/display/receipt.ts` | `displayReceipt(receipt, checks)` — receipt details with pass/fail indicators |
| `packages/cli/src/display/flow.ts` | `displayFlowStep(step, index, total)` — step-by-step with timing. `displayFlowSummary(steps)` — summary table |
| `packages/cli/src/display/table.ts` | `displayPriceComparison(results)` — cli-table3 table. `displayBenchmarkResults(results)`. `displayEndpointTable(endpoints)` |

### Step 5: Commands — Tier 1 (no wallet)
**Deliverable**: `inspect`, `validate`, `scan`, `compare` all work.

| File | Description |
|------|-------------|
| `packages/cli/src/commands/inspect.ts` | GET → parse 402 → display challenge + verification. Options: `--method`, `--header`, `--data`, `--json`, `--curl` |
| `packages/cli/src/commands/validate.ts` | Decode base64 receipt → validate structure → check fields → display. Argument: receipt string or `--file`. Options: `--json` |
| `packages/cli/src/commands/scan.ts` | Fetch `/.well-known/mpp.json` + `/llms.txt` → parse manifest → display table. Options: `--json`, `--probe` (also try OPTIONS on common paths) |
| `packages/cli/src/commands/compare.ts` | Parallel inspect multiple URLs → extract pricing → display comparison table. Options: `--json` |

### Step 6: Commands — Tier 2 (wallet-dependent)
**Deliverable**: `flow`, `benchmark`, `session` all work.

| File | Description |
|------|-------------|
| `packages/cli/src/commands/flow.ts` | 5-step flow: request → parse → sign → retry → verify. Options: `--wallet`, `--testnet`, `--dry-run`, `--save`, `--timeout`, `--json` |
| `packages/cli/src/commands/benchmark.ts` | Concurrent flow execution with stats. Options: `--concurrency`, `--requests`, `--wallet`, `--json`. Nonce queue for sequential wallet nonces. |
| `packages/cli/src/commands/session.ts` | Channel open → stream vouchers → close. Options: `--deposit`, `--requests`, `--wallet`, `--json` |

### Step 7: Known token registry + chain config
**Deliverable**: Human-readable currency names, chain names, RPC URLs.

| File | Description |
|------|-------------|
| `packages/cli/src/utils/chains.ts` | Chain ID → name/RPC mapping. Token address → symbol/decimals mapping. At minimum: Tempo Mainnet (4217), pathUSD, USDC. |

### Step 8: Tests
**Deliverable**: Core parser + crypto + display logic tested.

| File | Description |
|------|-------------|
| `packages/cli/src/__tests__/parser.test.ts` | Parse various WWW-Authenticate header formats |
| `packages/cli/src/__tests__/crypto.test.ts` | Verify address validation, amount parsing, expiry checks |
| `packages/cli/src/__tests__/display.test.ts` | Snapshot tests for formatted output |

### Step 9: Polish + publish prep
**Deliverable**: `npm publish` ready.

| Action | Description |
|--------|-------------|
| Update `README.md` | Usage examples, all 7 commands documented, install instructions |
| Verify `npx mpp-inspector --help` works | Test bin entry |
| Verify `--json` on all commands | CI/CD integration |
| Verify bundle size `< 100KB` (own code) | Note: deps like viem are large but tree-shaken |
| Add `.npmignore` or `files` field | Only ship dist/ |

---

## Critical Implementation Details

### WWW-Authenticate Parser
The header format is RFC 7235 auth-params:
```
Payment challengeId="abc", intent="charge", amount="0.005", ...
```
Parser must handle:
- Quoted string values with possible escapes
- Numeric values
- Missing optional fields (graceful degradation)
- Multiple challenges in one header (separated by commas outside quotes)

### Wallet Nonce Management (for benchmark)
```typescript
class NonceManager {
  private nextNonce: number;
  private queue: Array<() => void> = [];

  async acquireNonce(): Promise<number> {
    // Sequential nonce allocation even under concurrency
    // Each worker: acquireNonce() → sign tx → send tx → release
  }
}
```

### Chain Configuration
```typescript
const CHAINS: Record<number, ChainConfig> = {
  4217: { name: 'Tempo Mainnet', rpcUrl: 'https://rpc.tempo.xyz', ... },
  // Testnet variant
};

const KNOWN_TOKENS: Record<string, TokenInfo> = {
  '0x20c0...': { symbol: 'pathUSD', decimals: 6, name: 'Path USD' },
  // Add more as discovered
};
```

### Dry-run Mode (flow command)
When `--dry-run` is set:
- Steps 1-2 execute normally (real HTTP + parse)
- Step 3 shows "would sign" with estimated gas
- Steps 4-5 skipped with explanation
- No actual payment occurs

---

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| MPP protocol spec is undocumented / evolving | Parser breaks on real endpoints | Parse liberally, display unknown fields as "extra params", test against real endpoints before shipping |
| viem bundle size bloats npm package | Exceeds 100KB own-code target | Tree-shake via tsup, viem is peer-dep heavy but `isAddress`, `verifyMessage` are small imports. Own code will be <100KB; total with deps is larger. |
| No real MPP endpoint to test against | Can't validate inspect/scan work | Build a mock MPP server (tiny express app) for development, or use known test endpoints if available |
| Tempo chain RPC may not be publicly documented | flow/benchmark/session commands fail | Make RPC URL configurable via `--rpc` flag and env var `MPP_RPC_URL`. Hardcode known default. |
| Session/channel commands require smart contract ABI | session command can't work without contract details | Ship session as `experimental` if contract ABI unavailable. Focus on charge intent commands. |
| ESM-only deps on older Node versions | CLI fails to run | Require Node 18+ in engines field. chalk/ora/boxen all need ESM. |

---

## File Count Summary

| Category | Files | Lines (est.) |
|----------|-------|-------------|
| Config/scaffolding | 7 | ~150 |
| Types | 1 | ~100 |
| Utils | 5 | ~400 |
| Display | 4 | ~350 |
| Commands | 7 | ~700 |
| Tests | 3 | ~300 |
| Docs | 1 (README) | ~200 |
| **Total** | **28 files** | **~2,200 lines** |

---

## Execution Order (for /ccg:execute or manual implementation)

```
1. Scaffolding (Step 1)           — 15 min
2. Types (Step 2a)                — 10 min
3. Parser (Step 2b)               — 20 min
4. HTTP client (Step 3a)          — 10 min
5. Crypto utils (Step 3b)         — 15 min
6. Chain config (Step 7)          — 5 min
7. Format utils (Step 3c)         — 10 min
8. Display layer (Step 4)         — 25 min
9. inspect command (Step 5a)      — 15 min
10. validate command (Step 5b)    — 10 min
11. scan command (Step 5c)        — 15 min
12. compare command (Step 5d)     — 10 min
13. Wallet utils (Step 3d)        — 15 min
14. flow command (Step 6a)        — 20 min
15. benchmark command (Step 6b)   — 20 min
16. session command (Step 6c)     — 20 min
17. Tests (Step 8)                — 20 min
18. README + publish prep (Step 9)— 15 min
```

**Total estimated: ~4.5 hours of implementation**

---

## SESSION_ID
- CODEX_SESSION: N/A (codeagent-wrapper not available)
- GEMINI_SESSION: N/A (codeagent-wrapper not available)

## Notes
- Multi-model tooling not installed; plan created by Claude Opus directly
- Web dashboard explicitly deferred to Phase 2
- All 7 commands included in tonight's scope with tier prioritization
