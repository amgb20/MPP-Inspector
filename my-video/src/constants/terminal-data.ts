import { COLORS } from "./theme";

export type TerminalLine = {
  text: string;
  color?: string;
  indent?: number;
};

export const INSPECT_COMMAND =
  "mpp-inspector inspect https://mpp.dev/api/ping/paid";

export const INSPECT_OUTPUT: TerminalLine[] = [
  { text: "" },
  {
    text: "+--------------------------------------+",
    color: COLORS.cyan,
  },
  {
    text: "|   MPP Challenge Inspection           |",
    color: COLORS.cyan,
  },
  {
    text: "|   URL: https://mpp.dev/api/ping/paid |",
    color: COLORS.cyan,
  },
  {
    text: "+--------------------------------------+",
    color: COLORS.cyan,
  },
  { text: "" },
  {
    text: "  Status:          402 Payment Required",
    color: COLORS.textPrimary,
  },
  {
    text: "  Protocol:        MPP (Payment HTTP Authentication Scheme)",
    color: COLORS.textPrimary,
  },
  { text: "" },
  { text: "  -- Challenge Details --", color: COLORS.yellow },
  {
    text: "  Challenge ID:    nVAXFzJOH0jx...",
    color: COLORS.textPrimary,
  },
  { text: "  Realm:           mpp.sh", color: COLORS.textPrimary },
  { text: "  Method:          Tempo", color: COLORS.cyan },
  {
    text: "  Intent:          charge (one-time payment)",
    color: COLORS.textPrimary,
  },
  {
    text: "  Amount:          100000.00 ($100000)",
    color: COLORS.green,
  },
  {
    text: "  Currency:        0x20c0...0000",
    color: COLORS.textPrimary,
  },
  {
    text: "  Recipient:       0xf39F...2266",
    color: COLORS.textPrimary,
  },
  {
    text: "  Chain:           Tempo Mainnet (42431)",
    color: COLORS.cyan,
  },
  {
    text: "  Expires:         2026-03-26T23:02:55.506Z (5m 01s remaining)",
    color: COLORS.textPrimary,
  },
  { text: "" },
  {
    text: "  -- Request Params (decoded) --",
    color: COLORS.yellow,
  },
  {
    text: "  amount:          100000",
    color: COLORS.textPrimary,
  },
  {
    text: "  currency:        0x20c0000000000000000000000000000000000000",
    color: COLORS.textPrimary,
  },
  {
    text: "  methodDetails:   { chainId: 42431, feePayer: true }",
    color: COLORS.textPrimary,
  },
  {
    text: "  recipient:       0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    color: COLORS.textPrimary,
  },
  {
    text: "  chainId:         42431",
    color: COLORS.textPrimary,
  },
  { text: "" },
  { text: "  -- Verification --", color: COLORS.yellow },
  {
    text: "  ? Challenge signature valid (unverifiable)",
    color: COLORS.yellow,
  },
  { text: "  v Expiry in future", color: COLORS.green },
  {
    text: "  v Payment method known (Tempo)",
    color: COLORS.green,
  },
  { text: "  v Amount parseable", color: COLORS.green },
  { text: "  v Recipient valid", color: COLORS.green },
  { text: "  v Currency recognized", color: COLORS.green },
];

export const SCAN_COMMAND = "mpp-inspector scan localhost:3402";

export const SCAN_OUTPUT: TerminalLine[] = [
  { text: "" },
  {
    text: "  Scanning localhost:3402 for MPP endpoints...",
    color: COLORS.textMuted,
  },
  { text: "" },
  {
    text: "  v Checking /.well-known/mpp.json     v Found",
    color: COLORS.green,
  },
  {
    text: "  v Checking /llms.txt                 v Found",
    color: COLORS.green,
  },
  {
    text: "  v Checking /health                   v 200 OK",
    color: COLORS.green,
  },
  { text: "" },
  {
    text: "  Discovered 4 MPP-enabled endpoints:",
    color: COLORS.cyan,
  },
  { text: "" },
  {
    text: "  +------------------+-------+--------+---------------------------------+",
    color: COLORS.textPrimary,
  },
  {
    text: "  | Endpoint         | Price | Method | Description                     |",
    color: COLORS.textPrimary,
  },
  {
    text: "  +------------------+-------+--------+---------------------------------+",
    color: COLORS.textPrimary,
  },
  {
    text: "  | GET /v1/query    | $1000 | Tempo  | Financial data query            |",
    color: COLORS.textPrimary,
  },
  {
    text: "  | POST /v1/search  | $5000 | Tempo  | Full-text search across datasets|",
    color: COLORS.textPrimary,
  },
  {
    text: "  | GET /v1/stream   | $100  | Tempo  | Real-time data streaming channel|",
    color: COLORS.textPrimary,
  },
  {
    text: "  | GET /v1/premium  | $500  | Stripe | Premium API endpoint (Stripe)   |",
    color: COLORS.textPrimary,
  },
  {
    text: "  +------------------+-------+--------+---------------------------------+",
    color: COLORS.textPrimary,
  },
];

export const COMPARE_COMMAND =
  "mpp-inspector compare http://localhost:3402/v1/query http://localhost:3402/v1/search http://localhost:3402/v1/premium";

export const COMPARE_OUTPUT: TerminalLine[] = [
  { text: "" },
  {
    text: "  +------------+-------+--------+--------+----------+---------------+",
    color: COLORS.textPrimary,
  },
  {
    text: "  | Service    | Price | Method | Intent | Currency | Chain         |",
    color: COLORS.textPrimary,
  },
  {
    text: "  +------------+-------+--------+--------+----------+---------------+",
    color: COLORS.textPrimary,
  },
  {
    text: "  | localhost  | $1000 | Tempo  | charge | USD      | Tempo Mainnet |",
    color: COLORS.textPrimary,
  },
  {
    text: "  | localhost  | $5000 | Tempo  | charge | USD      | Tempo Mainnet |",
    color: COLORS.textPrimary,
  },
  {
    text: "  | localhost  | $500  | Stripe | charge | USD      | unknown       |",
    color: COLORS.textPrimary,
  },
  {
    text: "  +------------+-------+--------+--------+----------+---------------+",
    color: COLORS.textPrimary,
  },
  { text: "" },
  {
    text: "  Cheapest: localhost ($500/query via Stripe)",
    color: COLORS.green,
  },
  { text: "" },
  {
    text: "  Payment methods available:",
    color: COLORS.cyan,
  },
  {
    text: "    Tempo: localhost, localhost",
    color: COLORS.textPrimary,
  },
  {
    text: "    Stripe: localhost",
    color: COLORS.textPrimary,
  },
];

export const BENCHMARK_COMMAND =
  "mpp-inspector benchmark https://api.example.com/v1/query -c 10 -n 100";

export const BENCHMARK_OUTPUT: TerminalLine[] = [
  { text: "" },
  { text: "  -- Benchmark Results --", color: COLORS.yellow },
  {
    text: "  Total requests:   100",
    color: COLORS.textPrimary,
  },
  {
    text: "  Successful:       98",
    color: COLORS.green,
  },
  {
    text: "  Failed:           2",
    color: COLORS.red,
  },
  {
    text: "  Throughput:       47.3 req/s",
    color: COLORS.cyan,
  },
  { text: "" },
  { text: "  -- Latency --", color: COLORS.yellow },
  {
    text: "  p50:   42ms      p95:  118ms     p99:  203ms",
    color: COLORS.cyan,
  },
  {
    text: "  avg:   51ms      min:   18ms     max:  312ms",
    color: COLORS.textPrimary,
  },
];

export const FLOW_COMMAND =
  "mpp-inspector flow https://mpp.dev/api/ping/paid --dry-run";

export const FLOW_OUTPUT: TerminalLine[] = [
  { text: "" },
  {
    text: "  Step 1: Request resource     v  402 received         97ms",
    color: COLORS.textPrimary,
  },
  {
    text: "  Step 2: Parse challenge      v  Tempo / charge       1ms",
    color: COLORS.textPrimary,
  },
  {
    text: "  Step 3: Sign transaction     -  skipped (dry run)    --",
    color: COLORS.textMuted,
  },
  {
    text: "  Step 4: Retry with cred      -  skipped (dry run)    --",
    color: COLORS.textMuted,
  },
  {
    text: "  Step 5: Verify receipt       -  skipped (dry run)    --",
    color: COLORS.textMuted,
  },
];
