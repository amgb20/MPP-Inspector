import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { inspectChallenge } from "./tools/inspect.js";
import { scanDomain } from "./tools/scan.js";
import { comparePricing } from "./tools/compare.js";
import { validateReceipt } from "./tools/validate.js";
import { dryRunFlow } from "./tools/flow.js";

const server = new McpServer({
  name: "mpp-inspector",
  version: "0.1.0",
});

function jsonContent(data: object): { content: { type: "text"; text: string }[] } {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

server.tool(
  "mpp_inspect",
  "Send a request to a URL and parse the 402 Payment Required challenge. Returns parsed challenge fields, verification results, and timing.",
  {
    url: z.string().describe("The URL to inspect for a 402 MPP challenge"),
    method: z.string().default("GET").describe("HTTP method to use"),
    headers: z.array(z.string()).optional().describe("Additional headers as 'Key: Value' strings"),
    timeout: z.number().default(30000).describe("Request timeout in milliseconds"),
  },
  async (input) => {
    try {
      const result = await inspectChallenge(input);
      return jsonContent(result);
    } catch (err) {
      return jsonContent({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
);

server.tool(
  "mpp_scan",
  "Discover MPP endpoints on a domain by checking /.well-known/mpp.json, /llms.txt, /health, and optionally probing common API paths.",
  {
    domain: z.string().describe("Domain to scan (e.g. findata.example.com)"),
    probe: z.boolean().default(false).describe("Also probe common API paths with HEAD requests to find 402 endpoints"),
    timeout: z.number().default(10000).describe("Request timeout in milliseconds"),
  },
  async (input) => {
    try {
      const result = await scanDomain(input);
      return jsonContent(result);
    } catch (err) {
      return jsonContent({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
);

server.tool(
  "mpp_compare",
  "Compare pricing across multiple MPP endpoints. Sends a request to each URL, parses the 402 challenge, and returns a side-by-side comparison with the cheapest option highlighted.",
  {
    urls: z.array(z.string()).min(2).describe("Two or more URLs to compare pricing for"),
    timeout: z.number().default(15000).describe("Request timeout per URL in milliseconds"),
  },
  async (input) => {
    try {
      const result = await comparePricing(input);
      return jsonContent(result);
    } catch (err) {
      return jsonContent({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
);

server.tool(
  "mpp_validate",
  "Decode and verify a base64-encoded MPP receipt. Checks base64 decoding, JSON structure, required fields (receiptId, timestamp, credential), and timestamp validity.",
  {
    receipt: z.string().describe("Base64-encoded MPP receipt string"),
  },
  async (input) => {
    try {
      const result = await validateReceipt(input);
      return jsonContent(result);
    } catch (err) {
      return jsonContent({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
);

server.tool(
  "mpp_flow",
  "Execute a dry-run of the full MPP payment flow: request resource, parse 402 challenge, and show what the sign/pay/receipt steps would do. No actual transactions are made.",
  {
    url: z.string().describe("The URL to test the payment flow against"),
    method: z.string().default("GET").describe("HTTP method to use"),
    timeout: z.number().default(30000).describe("Request timeout in milliseconds"),
  },
  async (input) => {
    try {
      const result = await dryRunFlow(input);
      return jsonContent(result);
    } catch (err) {
      return jsonContent({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
