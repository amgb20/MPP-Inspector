---
description: Scan a domain for MPP (Machine Payments Protocol) endpoints. Checks /.well-known/mpp.json, /llms.txt, /health, and optionally probes common API paths.
---

# MPP Scan

Discover MPP endpoints on a domain.

## Usage

```
/mpp-scan <domain>
/mpp-scan mpp.dev
```

## What to do

1. Use the `mpp_scan` MCP tool with the domain provided by the user
2. Present discovered endpoints:
   - Which discovery files exist (mpp.json, llms.txt, health)
   - List of endpoints found with their payment methods and pricing
3. Suggest follow-up actions (e.g., inspect specific endpoints)

If the user adds `--probe`, set `probe: true` to also check common API paths.
