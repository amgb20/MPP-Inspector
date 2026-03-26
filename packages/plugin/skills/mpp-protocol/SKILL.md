---
name: mpp-protocol
description: Machine Payments Protocol expertise — spec-compliant 402 challenge parsing, payment method detection, Tempo/Stripe/Lightning/Solana support, and MPP debugging. Use when working with HTTP 402, WWW-Authenticate Payment headers, MPP endpoints, payment channels, or Tempo blockchain integration.
---

# Machine Payments Protocol (MPP)

## When to Use

Use when: debugging 402 Payment Required responses, implementing MPP client or server code, parsing WWW-Authenticate headers, working with any MPP payment method (Tempo, Stripe, Lightning, Solana, Card), inspecting payment channels, comparing MPP service pricing, or validating payment receipts and credentials.

## Protocol Overview

MPP enables machine-to-machine payments over HTTP. When a resource requires payment, the server returns a spec-compliant challenge:

```
HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment id="qB3wErTyU7iOpAsD9fGhJk",
    realm="mpp.dev",
    method="tempo",
    intent="charge",
    expires="2025-01-15T12:05:00Z",
    request="eyJhbW91bnQiOiIxMDAwIiwiY3VycmVuY3kiOiJ1c2QifQ"
```

The `request` param is base64url-encoded JSON containing method-specific payment details. The client decodes it, fulfills payment, then retries with a credential:

```
GET /v1/data
Authorization: Payment <credential>
```

## Challenge Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique challenge identifier |
| `realm` | string | Domain scope (e.g. "mpp.dev") |
| `method` | string | Payment method: `"tempo"`, `"stripe"`, `"lightning"`, `"solana"`, `"card"`, `"custom"` |
| `intent` | string | `"charge"` (one-time) or `"session"` (streaming) |
| `expires` | string | ISO 8601 timestamp for challenge expiry |
| `request` | string | Base64url-encoded JSON with payment details |

## Request Payload (decoded from `request`)

Varies by payment method. Common fields:

| Field | Type | Description |
|-------|------|-------------|
| `amount` | string | Payment amount in smallest unit |
| `currency` | string | Currency code or token address |
| `recipient` | string | Payee address (blockchain methods) |
| `methodDetails` | object | Method-specific details (e.g. `{ chainId: 42431, feePayer: true }`) |

## Payment Methods

| Method | Type | Description |
|--------|------|-------------|
| `tempo` | Blockchain | Tempo chain stablecoin payments (chainId 42431/42432) |
| `stripe` | Card | SPT-based card payments via Stripe |
| `lightning` | Blockchain | Bitcoin via Lightning Network (BOLT11 invoices) |
| `solana` | Blockchain | SOL + SPL token payments |
| `card` | Card | Encrypted network tokens (Visa Intelligent Commerce) |
| `custom` | Framework | Any payment rail via Method.from() |

## Receipt Format

```json
{
  "challengeId": "qB3wErTyU7iOpAsD9fGhJk",
  "method": "tempo",
  "reference": "0xtx789abc...",
  "settlement": { "amount": "1000", "currency": "usd" },
  "status": "success",
  "timestamp": "2025-01-15T12:00:00Z"
}
```

## Credential Format

```json
{
  "challenge": { "id": "...", "realm": "...", "method": "...", "intent": "...", "request": "..." },
  "source": "0x1234...",
  "payload": { "signature": "0x..." }
}
```

## Chain Configuration

- **Tempo Mainnet**: Chain ID `42431`, RPC `https://rpc.tempo.xyz`
- **Tempo Testnet**: Chain ID `42432`, RPC `https://rpc-testnet.tempo.xyz`
- **Primary token**: pathUSD (6 decimals)
- Legacy chain IDs `4217`/`4218` are also recognized

## Available MCP Tools

Use the MCP tools from this plugin to inspect and debug MPP endpoints:

- **`mpp_inspect`** — Parse and verify a 402 challenge from any URL. Decodes `request` base64url payload, identifies payment method, returns verification results.
- **`mpp_scan`** — Discover MPP endpoints on a domain via `/.well-known/mpp.json`, `/llms.txt`, and path probing.
- **`mpp_compare`** — Compare pricing across multiple MPP endpoints side by side, grouped by payment method.
- **`mpp_validate`** — Decode and verify a base64-encoded MPP receipt or credential.
- **`mpp_flow`** — Dry-run the full 402 payment flow (request, parse, verify) without making real transactions.

## Live Test Endpoint

The official MPP docs provide a live test endpoint:
```
https://mpp.dev/api/ping/paid
```

## Service Discovery

MPP servers expose endpoint metadata at:
- `/.well-known/mpp.json` — structured manifest with endpoints, pricing, and payment methods
- `/llms.txt` — agent-readable discovery file

## Common Debugging Patterns

**Challenge not parsing**: Check that the `WWW-Authenticate` header starts with `Payment ` (with space). Field values should be quoted (`key="value"`).

**Can't decode request**: The `request` field is base64url-encoded (not standard base64). Use `-` instead of `+` and `_` instead of `/`.

**Unknown chain ID**: Real Tempo Mainnet uses chain ID `42431` (not `4217`). Check `methodDetails.chainId` inside the decoded request payload.

**Expiry issues**: `expires` is an ISO 8601 string (e.g. `"2025-01-15T12:05:00Z"`), not a Unix timestamp.

**Recipient validation**: Only applies to blockchain methods (Tempo, Lightning, Solana). Stripe and Card methods don't have blockchain addresses.

**Unknown payment method**: The `method` field identifies the payment rail. Known methods: `tempo`, `stripe`, `lightning`, `solana`, `card`, `custom`.
