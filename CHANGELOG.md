# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-27

### Added

- `inspect` command — parse and display 402 Payment Required challenges
- `scan` command — discover MPP endpoints on a domain
- `compare` command — side-by-side pricing comparison across endpoints
- `validate` command — decode and verify receipts and credentials
- `flow` command — dry-run the full MPP payment cycle
- `benchmark` command — load test MPP endpoints (preview)
- `session` command — payment channel testing (preview)
- Spec-compliant challenge parsing (`id`, `realm`, `method`, `request` base64url)
- RFC 9457 Problem Details body parsing with challengeId cross-reference
- Payment method detection: Tempo, Stripe, Lightning, Solana, Card, Custom
- Tempo chain resolution (mainnet 42431, testnet 4218)
- `description` field extraction from both header and Problem Details
- `@mpp-inspector/mock-server` — local mock server with 4 demo endpoints
- `@mpp-inspector/plugin` — Claude Code MCP plugin with 5 tools
- JSON output mode (`--json`) for all commands
- 121 unit tests with vitest
- CI pipeline (GitHub Actions) on Node 18/20/22
