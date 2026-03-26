<p align="center">
  <br />
  <code>&nbsp;███╗&nbsp;&nbsp;&nbsp;███╗&nbsp;██████╗&nbsp;██████╗&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><br />
  <code>&nbsp;████╗&nbsp;████║&nbsp;██╔══██╗██╔══██╗&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><br />
  <code>&nbsp;██╔████╔██║&nbsp;██████╔╝██████╔╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><br />
  <code>&nbsp;██║╚██╔╝██║&nbsp;██╔═══╝&nbsp;██╔═══╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><br />
  <code>&nbsp;██║&nbsp;╚═╝&nbsp;██║&nbsp;██║&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██║&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██╗███╗&nbsp;&nbsp;&nbsp██╗███████╗██████╗&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><br />
  <code>&nbsp;╚═╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;╚═╝&nbsp;╚═╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;╚═╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██║████╗&nbsp;&nbsp;██║██╔════╝██╔══██╗&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><br />
  <code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██║██╔██╗&nbsp;██║███████╗██████╔╝█████╗&nbsp;&nbsp;&nbsp;</code><br />
  <code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██║██║╚██╗██║╚════██║██╔═══╝&nbsp;██╔══╝&nbsp;&nbsp;&nbsp;</code><br />
  <code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;██║██║&nbsp;╚████║███████║██║&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;███████╗</code><br />
  <code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;╚═╝╚═╝&nbsp;&nbsp;╚═══╝╚══════╝╚═╝&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;╚══════╝</code><br />
  <br />
</p>

<p align="center">
  <strong>Postman for HTTP 402</strong> — the missing devtool for the <a href="https://www.machinepayments.com/">Machine Payments Protocol</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/mpp-inspector"><img src="https://img.shields.io/npm/v/mpp-inspector?style=flat-square&color=00e5ff&labelColor=0d1117" alt="npm" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/mpp-inspector?style=flat-square&color=00e5ff&labelColor=0d1117" alt="license" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/mpp-inspector?style=flat-square&color=00e5ff&labelColor=0d1117" alt="node" /></a>
  <a href="https://www.tempo.xyz"><img src="https://img.shields.io/badge/chain-Tempo_(4217)-00e5ff?style=flat-square&labelColor=0d1117" alt="chain" /></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402"><img src="https://img.shields.io/badge/HTTP-402_Payment_Required-00e5ff?style=flat-square&labelColor=0d1117" alt="402" /></a>
</p>

<br />

---

<br />

## `> whoami`

**MPP Inspector** is a zero-dependency CLI toolkit that speaks the Machine Payments Protocol natively. It intercepts `402 Payment Required` responses, parses `WWW-Authenticate: Payment` challenge headers per [RFC 7235](https://tools.ietf.org/html/rfc7235), and drives the full payment lifecycle on the [Tempo](https://www.tempo.xyz) chain — all from your terminal.

No browser. No GUI. No friction. Just raw protocol inspection.

```
GET /v1/data HTTP/1.1
Host: api.example.com

HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment challengeId="c_abc123",
    intent="charge",
    amount="0.01",
    currency="0x20c03e...b572",
    recipient="0xDEAD...BEEF",
    chainId="4217",
    expiresAt="1735689600",
    signature="0x..."
```

MPP Inspector catches that. Parses it. Verifies it. Pays it.

<br />

## `> mpp-inspector --help`

| Command | What it does |
|:--|:--|
| `inspect <url>` | Dissect a `402` challenge — decode fields, verify signature, validate expiry |
| `flow <url>` | Run the full `402 → sign → pay → receipt` cycle end-to-end |
| `validate [receipt]` | Decode and verify a base64-encoded MPP receipt or credential |
| `scan <domain>` | Discover endpoints via `/.well-known/mpp.json` and `/llms.txt` |
| `compare <urls...>` | Side-by-side pricing diff across multiple MPP services |
| `benchmark <url>` | Load-test an MPP endpoint with configurable concurrency |
| `session <url>` | Test payment-channel / streaming session lifecycle |

Every command supports `--json` for machine-readable output and `--timeout <ms>`.

<br />

## `> quickstart`

```bash
# install globally
npm install -g mpp-inspector

# ...or run without installing
npx mpp-inspector <command>
```

<br />

## `> protocol_flow`

The core interaction model MPP Inspector drives:

```
 Client                          MPP Server                     Tempo Chain
   │                                 │                              │
   │  GET /v1/data                   │                              │
   ├────────────────────────────────►│                              │
   │                                 │                              │
   │  402 Payment Required           │                              │
   │  WWW-Authenticate: Payment ...  │                              │
   │◄────────────────────────────────┤                              │
   │                                 │                              │
   │        ┌──────────────────┐     │                              │
   │        │ mpp-inspector    │     │                              │
   │        │ parses challenge │     │                              │
   │        │ verifies fields  │     │                              │
   │        │ signs payment    │     │                              │
   │        └──────────────────┘     │                              │
   │                                 │                              │
   │  ERC-20 transfer (pathUSD)      │                              │
   ├─────────────────────────────────┼─────────────────────────────►│
   │                                 │                              │
   │  GET /v1/data                   │         tx confirmed         │
   │  Authorization: Bearer <receipt>│◄─────────────────────────────┤
   ├────────────────────────────────►│                              │
   │                                 │                              │
   │  200 OK { data }               │                              │
   │◄────────────────────────────────┤                              │
   │                                 │                              │
```

<br />

## `> examples`

<details>
<summary><code>inspect</code> — Dissect a 402 challenge</summary>

<br />

```bash
$ mpp-inspector inspect https://api.findata.example.com/v1/query

╭──────────────────────────────────────────────────────╮
│   MPP Challenge Inspection                           │
│   URL: https://api.findata.example.com/v1/query      │
╰──────────────────────────────────────────────────────╯

  Status:       402 Payment Required
  Protocol:     MPP (Payment HTTP Authentication Scheme)

  ── Challenge Details ──────────────────────────────────
  Intent:       charge (one-time payment)
  Amount:       0.01 pathUSD ($0.01)
  Currency:     0x20c0...b572 (pathUSD)
  Recipient:    0xDEAD...BEEF
  Chain:        Tempo Mainnet (4217)
  Expires:      2025-01-01T00:00:00.000Z (in 23h 14m)
  Challenge ID: c_abc123def4...
  Description:  "Financial data query"

  ── Verification ───────────────────────────────────────
  ○ Challenge signature valid         (pending EIP-712)
  ✓ Expiry in future
  ✓ Currency is known token (pathUSD)
  ✓ Recipient is valid address
  ✓ Amount parseable

  Payment methods:  Tempo charge
  Estimated cost:   $0.01 USD + ~$0.0001 gas
```

```bash
# machine-readable output
$ mpp-inspector inspect https://api.example.com/v1/query --json | jq .challenge.amount
"0.01"
```

</details>

<details>
<summary><code>flow</code> — Execute the full payment lifecycle</summary>

<br />

```bash
# dry-run (no actual tx)
$ mpp-inspector flow https://api.example.com/v1/query --dry-run

  ── Payment Flow (dry run) ─────────────────────────────
  Step 1: Request         ✓  402 received        12ms
  Step 2: Parse challenge ✓  charge / 0.01 USD   <1ms
  Step 3: Sign payment    ✓  tx prepared          3ms
  Step 4: Submit tx       ○  skipped (dry run)     —
  Step 5: Get receipt     ○  skipped (dry run)     —

# live execution against testnet
$ MPP_PRIVATE_KEY=0x... mpp-inspector flow https://api.example.com/v1/query --testnet
```

</details>

<details>
<summary><code>scan</code> — Discover MPP endpoints on a domain</summary>

<br />

```bash
$ mpp-inspector scan findata.example.com --probe

  Scanning findata.example.com for MPP endpoints...

  ✓ Checking /.well-known/mpp.json     ✓ Found
  ✓ Checking /llms.txt                 ✓ Found
  ✓ Checking /health                   ✓ 200 OK

  ── Discovered Endpoints ───────────────────────────────
  ┌──────────┬──────────────────┬────────┬──────────────┐
  │  Method  │  Path            │  Price │  Intent      │
  ├──────────┼──────────────────┼────────┼──────────────┤
  │  GET     │  /v1/query       │  0.01  │  charge      │
  │  POST    │  /v1/search      │  0.05  │  charge      │
  │  GET     │  /v1/stream      │  0.001 │  session     │
  └──────────┴──────────────────┴────────┴──────────────┘
```

</details>

<details>
<summary><code>compare</code> — Price diff across providers</summary>

<br />

```bash
$ mpp-inspector compare \
    https://api-a.example.com/v1/query \
    https://api-b.example.com/v1/query \
    https://api-c.example.com/v1/query

  ── Price Comparison ───────────────────────────────────
  ┌────────────────────────────────┬────────┬──────────┐
  │  Service                       │  Price │  Chain   │
  ├────────────────────────────────┼────────┼──────────┤
  │  api-a.example.com             │  $0.01 │  Tempo   │
  │  api-b.example.com             │  $0.02 │  Tempo   │
  │  api-c.example.com             │  $0.05 │  Tempo   │
  └────────────────────────────────┴────────┴──────────┘
```

</details>

<details>
<summary><code>benchmark</code> — Load test MPP endpoints</summary>

<br />

```bash
$ mpp-inspector benchmark https://api.example.com/v1/query -c 10 -n 100

  ── Benchmark Results ──────────────────────────────────
  Total requests:   100
  Successful:       98
  Failed:           2
  Throughput:       47.3 req/s

  ── Latency ────────────────────────────────────────────
  p50:   42ms      p95:  118ms     p99:  203ms
  avg:   51ms      min:   18ms     max:  312ms

  ── Cost ───────────────────────────────────────────────
  Total spent:      $0.98 pathUSD
  Total gas:        0.0098 TEMPO
```

</details>

<br />

## `> architecture`

```
mpp-inspector/
├── packages/
│   └── cli/                          # published npm package
│       ├── bin/
│       │   └── mpp-inspector.ts      # node shebang entry
│       ├── src/
│       │   ├── commands/
│       │   │   ├── inspect.ts        # 402 challenge dissector
│       │   │   ├── flow.ts           # challenge → sign → pay → receipt
│       │   │   ├── validate.ts       # receipt decoder / verifier
│       │   │   ├── scan.ts           # .well-known/mpp.json + /llms.txt
│       │   │   ├── compare.ts        # multi-endpoint price diff
│       │   │   ├── benchmark.ts      # concurrent load testing
│       │   │   └── session.ts        # payment channel lifecycle
│       │   ├── display/
│       │   │   ├── challenge.ts      # boxen + chalk terminal output
│       │   │   ├── receipt.ts        # receipt display formatting
│       │   │   ├── flow.ts           # step-by-step flow rendering
│       │   │   └── table.ts          # cli-table3 endpoint tables
│       │   ├── utils/
│       │   │   ├── parser.ts         # RFC 7235 auth-param parser
│       │   │   ├── http.ts           # fetch wrapper with timeout
│       │   │   ├── crypto.ts         # viem address/amount validation
│       │   │   ├── wallet.ts         # viem wallet + public client
│       │   │   ├── chains.ts         # Tempo mainnet/testnet config
│       │   │   └── format.ts         # address truncation, formatting
│       │   ├── types.ts              # MppChallenge, MppReceipt, etc.
│       │   └── index.ts              # commander program setup
│       ├── tsup.config.ts            # dual entry build (bin + lib)
│       └── vitest.config.ts          # test runner config
└── package.json                      # npm workspaces root
```

<br />

## `> internals`

<details>
<summary><strong>Challenge Parser</strong> — RFC 7235 auth-param extraction</summary>

<br />

The parser handles the `WWW-Authenticate: Payment` header as defined by the MPP spec, implementing RFC 7235-style `auth-param` parsing with support for both quoted and unquoted values:

```
WWW-Authenticate: Payment challengeId="c_abc",intent="charge",amount="0.01",...
                  ^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                  scheme   auth-params (comma-separated key=value / key="value")
```

Parsed into a typed `MppChallenge`:

```typescript
interface MppChallenge {
  challengeId: string;    // unique challenge identifier
  intent: string;         // "charge" | "session"
  amount: string;         // payment amount (human-readable)
  currency: string;       // ERC-20 token contract address
  recipient: string;      // payee wallet address
  chainId: number;        // 4217 (Tempo Mainnet) | 4218 (Testnet)
  expiresAt: number;      // unix timestamp
  signature: string;      // server signature over challenge fields
  description?: string;   // optional human-readable description
  extra: Record<string, string>;  // forward-compat for new fields
  raw: string;            // original header value
}
```

</details>

<details>
<summary><strong>Verification Engine</strong> — field-level challenge validation</summary>

<br />

Each parsed challenge runs through a verification pipeline:

```
┌─────────────────────────────────────────────────┐
│                Verification Pipeline             │
├─────────────────────────────────────────────────┤
│  ✓  recipientValid    →  viem.isAddress()       │
│  ✓  amountParseable   →  parseFloat() + range   │
│  ✓  expiryValid       →  expiresAt > Date.now() │
│  ✓  currencyKnown     →  KNOWN_TOKENS registry  │
│  ○  signatureValid    →  EIP-712 (planned)      │
└─────────────────────────────────────────────────┘
```

</details>

<details>
<summary><strong>Chain Registry</strong> — Tempo network configuration</summary>

<br />

```typescript
// Built-in chain support
CHAINS = {
  4217: { name: "Tempo Mainnet",  rpc: "https://rpc.tempo.xyz",         testnet: false },
  4218: { name: "Tempo Testnet",  rpc: "https://rpc-testnet.tempo.xyz", testnet: true  },
}

// Known token registry
KNOWN_TOKENS = {
  "0x20c03e...b572": { symbol: "pathUSD", decimals: 6, name: "Path USD" },
}
```

</details>

<br />

## `> stack`

| Layer | Technology | Why |
|:--|:--|:--|
| Runtime | Node.js 18+ (ESM) | Native `fetch`, top-level `await` |
| CLI Framework | [Commander](https://github.com/tj/commander.js) v13 | Declarative command/option tree |
| Chain Interaction | [viem](https://viem.sh) | Type-safe Ethereum client, wallet ops, address validation |
| Terminal UI | [chalk](https://github.com/chalk/chalk) + [boxen](https://github.com/sindresorhus/boxen) + [ora](https://github.com/sindresorhus/ora) + [cli-table3](https://github.com/cli-table/cli-table3) | Styled output, spinners, tables |
| Build | [tsup](https://tsup.egoist.dev) | Dual-entry ESM bundles with shebang banner |
| Tests | [Vitest](https://vitest.dev) | Fast unit tests with native ESM support |
| Types | TypeScript 5.x | Strict, readonly interfaces throughout |

<br />

## `> env`

| Variable | Scope | Description |
|:--|:--|:--|
| `MPP_PRIVATE_KEY` | `flow` `benchmark` `session` | Wallet private key for signing transactions. Overridden by `-w` flag. |

<br />

## `> chains`

```
┌──────────────────┬────────┬────────────┬──────────────────────────────────┐
│  Chain           │  ID    │  Type      │  RPC                             │
├──────────────────┼────────┼────────────┼──────────────────────────────────┤
│  Tempo Mainnet   │  4217  │  prod      │  https://rpc.tempo.xyz           │
│  Tempo Testnet   │  4218  │  testnet   │  https://rpc-testnet.tempo.xyz   │
└──────────────────┴────────┴────────────┴──────────────────────────────────┘
```

Use `--testnet` for testnet. Use `--rpc <url>` to override.

<br />

## `> dev`

```bash
git clone https://github.com/AlexandreBenoit/mpp-inspector.git
cd mpp-inspector && npm install

npm run build          # compile
npm run dev            # watch mode (rebuild on change)
npm run test           # run test suite
npm run test:watch     # watch mode (re-run on change)
npm run lint           # type-check (tsc --noEmit)
npm run check          # lint + test + build (all gates)
```

<br />

## `> roadmap`

- [ ] EIP-712 signature verification for challenge fields
- [ ] Web dashboard (React + Vite) as `packages/web`
- [ ] Additional chain support beyond Tempo
- [ ] Receipt persistence and history
- [ ] Plugin system for custom payment flows

<br />

## `> license`

[MIT](./LICENSE) — build whatever you want.

<br />

---

<p align="center">
  <sub>Built for the <a href="https://www.machinepayments.com/">Machine Payments Protocol</a> ecosystem on <a href="https://www.tempo.xyz">Tempo</a></sub>
</p>
