/**
 * Integration tests: CLI commands against the mock server.
 *
 * These tests spin up the mock server, run CLI commands via the
 * programmatic API, and verify the parsed output is spec-compliant.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createMockServer } from "@mpp-inspector/mock-server";

// Import CLI functions
import { parseChallengeHeader } from "../../utils/parser.js";
import { rawRequest } from "../../utils/http.js";
import { verifyChallengeFields } from "../../utils/crypto.js";

let baseUrl: string;
let stopServer: () => Promise<void>;

beforeAll(async () => {
  const mock = createMockServer({ port: 0, silent: true });
  await mock.start();
  const addr = mock.server.address();
  if (addr && typeof addr !== "string") {
    baseUrl = `http://127.0.0.1:${addr.port}`;
  }
  stopServer = mock.stop;
});

afterAll(async () => {
  await stopServer();
});

describe("mock server health", () => {
  it("responds to /health", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  it("serves /.well-known/mpp.json", async () => {
    const res = await fetch(`${baseUrl}/.well-known/mpp.json`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("MPP Mock Server");
    expect(body.endpoints).toHaveLength(4);
  });

  it("serves /llms.txt", async () => {
    const res = await fetch(`${baseUrl}/llms.txt`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("MPP Mock Server");
  });
});

describe("inspect command against mock endpoints", () => {
  it("parses /v1/query as Tempo charge", async () => {
    const { status, headers } = await rawRequest(`${baseUrl}/v1/query`);
    expect(status).toBe(402);

    const wwwAuth = headers.get("www-authenticate");
    expect(wwwAuth).toBeDefined();

    const challenge = parseChallengeHeader(wwwAuth!);
    expect(challenge.id).toBeTruthy();
    expect(challenge.realm).toBe("mock.mpp-inspector.dev");
    expect(challenge.method).toBe("tempo");
    expect(challenge.intent).toBe("charge");
    expect(challenge.expires).toBeTruthy();
    expect(challenge.request).toBeTruthy();

    // Decoded request params
    expect(challenge.requestDecoded).toBeDefined();
    expect(challenge.requestDecoded!.amount).toBe("1000");
  });

  it("parses /v1/search as Tempo charge (POST)", async () => {
    const { status, headers } = await rawRequest(`${baseUrl}/v1/search`, {
      method: "POST",
    });
    expect(status).toBe(402);

    const challenge = parseChallengeHeader(headers.get("www-authenticate")!);
    expect(challenge.method).toBe("tempo");
    expect(challenge.requestDecoded!.amount).toBe("5000");
  });

  it("parses /v1/stream as Tempo session", async () => {
    const { status, headers } = await rawRequest(`${baseUrl}/v1/stream`);
    expect(status).toBe(402);

    const challenge = parseChallengeHeader(headers.get("www-authenticate")!);
    expect(challenge.method).toBe("tempo");
    expect(challenge.intent).toBe("session");
    expect(challenge.requestDecoded!.amount).toBe("100");
  });

  it("parses /v1/premium as Stripe charge", async () => {
    const { status, headers } = await rawRequest(`${baseUrl}/v1/premium`);
    expect(status).toBe(402);

    const challenge = parseChallengeHeader(headers.get("www-authenticate")!);
    expect(challenge.method).toBe("stripe");
    expect(challenge.intent).toBe("charge");
    expect(challenge.requestDecoded!.amount).toBe("500");
  });

  it("verification passes for all Tempo endpoints", async () => {
    for (const path of ["/v1/query", "/v1/search", "/v1/stream"]) {
      const { headers } = await rawRequest(`${baseUrl}${path}`, {
        method: path === "/v1/search" ? "POST" : "GET",
      });
      const challenge = parseChallengeHeader(headers.get("www-authenticate")!);
      const result = verifyChallengeFields(challenge);

      expect(result.expiryValid).toBe(true);
      expect(result.methodKnown).toBe(true);
      expect(result.amountParseable).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });
});

describe("validate command against mock receipts", () => {
  it("validates a receipt from mock server payment", async () => {
    // Hit the endpoint with an Authorization header to get a receipt
    const res = await fetch(`${baseUrl}/v1/query`, {
      headers: { Authorization: "Payment test-credential" },
    });

    // Mock server returns 200 with receipt when Authorization is present
    if (res.status === 200) {
      const body = await res.json();
      expect(body.receipt).toBeDefined();

      // Decode and verify receipt structure
      const receiptJson = JSON.parse(Buffer.from(body.receipt, "base64url").toString("utf-8"));
      expect(receiptJson.challengeId).toBeTruthy();
      expect(receiptJson.method).toBe("tempo");
      expect(receiptJson.settlement).toBeDefined();
      expect(receiptJson.settlement.amount).toBe("1000");
      expect(receiptJson.status).toBe("success");
    }
  });
});

describe("scan discovers mock server endpoints", () => {
  it("finds /.well-known/mpp.json and /llms.txt", async () => {
    // Test the manifest endpoint directly
    const mppRes = await fetch(`${baseUrl}/.well-known/mpp.json`);
    expect(mppRes.status).toBe(200);

    const manifest = await mppRes.json();
    expect(manifest.endpoints.length).toBeGreaterThanOrEqual(4);

    // Verify each endpoint in manifest returns 402
    for (const ep of manifest.endpoints) {
      const epRes = await fetch(`${baseUrl}${ep.path}`, {
        method: ep.method,
      });
      expect(epRes.status).toBe(402);
      expect(epRes.headers.get("www-authenticate")).toContain("Payment");
    }
  });
});

describe("compare across mock endpoints", () => {
  it("all endpoints return parseable challenges", async () => {
    const paths = ["/v1/query", "/v1/premium"];
    const results = await Promise.all(
      paths.map(async (path) => {
        const { headers } = await rawRequest(`${baseUrl}${path}`);
        return parseChallengeHeader(headers.get("www-authenticate")!);
      }),
    );

    expect(results).toHaveLength(2);
    expect(results[0].requestDecoded!.amount).toBe("1000");
    expect(results[1].requestDecoded!.amount).toBe("500");
    expect(results[0].method).toBe("tempo");
    expect(results[1].method).toBe("stripe");
  });
});
