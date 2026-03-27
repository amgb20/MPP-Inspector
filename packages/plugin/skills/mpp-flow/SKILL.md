---
description: Dry-run the full MPP (Machine Payments Protocol) payment flow against a URL. Steps through request, parse, sign, retry, and verify without making real transactions.
---

# MPP Flow

Dry-run the full MPP payment flow against an endpoint.

## Usage

```
/mpp-flow <url>
/mpp-flow https://mpp.dev/api/ping/paid
```

## What to do

1. Use the `mpp_flow` MCP tool with the URL provided by the user
2. Present each step of the flow:
   - Step 1: Request resource (GET/POST)
   - Step 2: Parse 402 challenge
   - Step 3: Sign transaction (dry-run — shows what would happen)
   - Step 4: Retry with credential (dry-run)
   - Step 5: Verify receipt (dry-run)
3. Show timing breakdown and total flow time

If no URL is provided, use the default: `https://mpp.dev/api/ping/paid`
