---
description: Inspect an MPP (Machine Payments Protocol) 402 challenge from a URL. Parses the WWW-Authenticate header, decodes the base64url request payload, identifies the payment method, and runs verification checks.
---

# MPP Inspect

Inspect a 402 Payment Required challenge from an MPP endpoint.

## Usage

```
/mpp-inspect <url>
/mpp-inspect https://mpp.dev/api/ping/paid
```

## What to do

1. Use the `mpp_inspect` MCP tool with the URL provided by the user
2. Present the results clearly:
   - Challenge ID, realm, method, intent
   - Decoded request payload (amount, currency, recipient, chainId)
   - Problem Details body if present (RFC 9457)
   - Verification results (expiry, method known, amount parseable, recipient valid)
3. Explain any issues found in plain language

If no URL is provided, use the default test endpoint: `https://mpp.dev/api/ping/paid`

## Example output format

```
MPP Challenge at https://mpp.dev/api/ping/paid
- Method: Tempo (blockchain stablecoin)
- Amount: 100,000 units
- Chain: Tempo Mainnet (42431)
- Expires in: 5 minutes
- All verification checks passed ✓
```
