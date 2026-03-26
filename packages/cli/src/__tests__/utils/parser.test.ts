import { describe, it, expect } from "vitest";
import { parseAuthParams, parseChallengeHeader, decodeReceipt, parseMppManifest, decodeCredential } from "../../utils/parser.js";

describe("parseAuthParams", () => {
  it("parses simple key=value pairs", () => {
    const result = parseAuthParams('intent=charge, amount=0.001');
    expect(result).toEqual({ intent: "charge", amount: "0.001" });
  });

  it("parses quoted values", () => {
    const result = parseAuthParams('description="Pay for API access"');
    expect(result).toEqual({ description: "Pay for API access" });
  });

  it("handles escaped characters in quoted values", () => {
    const result = parseAuthParams('description="includes \\"quotes\\" inside"');
    expect(result).toEqual({ description: 'includes "quotes" inside' });
  });

  it("handles mixed quoted and unquoted values", () => {
    const result = parseAuthParams('intent=charge, description="A test", amount=0.5');
    expect(result).toEqual({ intent: "charge", description: "A test", amount: "0.5" });
  });

  it("returns empty object for empty string", () => {
    expect(parseAuthParams("")).toEqual({});
  });

  it("handles leading/trailing whitespace", () => {
    const result = parseAuthParams("  intent=charge  ,  amount=0.1  ");
    expect(result).toEqual({ intent: "charge", amount: "0.1" });
  });

  it("handles value without equals sign", () => {
    const result = parseAuthParams("noequals");
    expect(result).toEqual({});
  });

  it("handles multiple commas between pairs", () => {
    const result = parseAuthParams("intent=charge,,, amount=0.1");
    expect(result).toEqual({ intent: "charge", amount: "0.1" });
  });
});

describe("parseChallengeHeader — spec-compliant format", () => {
  const requestPayload = { amount: "1000", currency: "usd", recipient: "0xrecip", chainId: 4217 };
  const requestEncoded = Buffer.from(JSON.stringify(requestPayload)).toString("base64url");
  const specHeader = `Payment id="abc123", realm="example.com", method="tempo", intent=charge, expires="2099-01-15T12:00:00Z", request="${requestEncoded}"`;

  it("parses spec-compliant challenge with id, realm, method, request", () => {
    const result = parseChallengeHeader(specHeader);
    expect(result.id).toBe("abc123");
    expect(result.realm).toBe("example.com");
    expect(result.method).toBe("tempo");
    expect(result.intent).toBe("charge");
    expect(result.expires).toBe("2099-01-15T12:00:00Z");
    expect(result.request).toBe(requestEncoded);
  });

  it("decodes base64url request param into requestDecoded", () => {
    const result = parseChallengeHeader(specHeader);
    expect(result.requestDecoded).toBeDefined();
    expect(result.requestDecoded!.amount).toBe("1000");
    expect(result.requestDecoded!.currency).toBe("usd");
    expect(result.requestDecoded!.recipient).toBe("0xrecip");
    expect(result.requestDecoded!.chainId).toBe(4217);
  });

  it("preserves raw header", () => {
    const result = parseChallengeHeader(specHeader);
    expect(result.raw).toBe(specHeader);
  });

  it("collects unknown fields into extra", () => {
    const result = parseChallengeHeader("Payment intent=charge, customField=hello");
    expect(result.extra).toEqual({ customField: "hello" });
  });
});

describe("parseChallengeHeader — legacy format backward compat", () => {
  const legacyHeader =
    'Payment challengeId="abc123", intent=charge, amount=0.001, currency=0xtoken, recipient=0xrecip, chainId=4217, expiresAt=9999999999, signature=0xsig';

  it("maps legacy challengeId to id", () => {
    const result = parseChallengeHeader(legacyHeader);
    expect(result.id).toBe("abc123");
  });

  it("synthesizes requestDecoded from legacy top-level fields", () => {
    const result = parseChallengeHeader(legacyHeader);
    expect(result.requestDecoded).toBeDefined();
    expect(result.requestDecoded!.amount).toBe("0.001");
    expect(result.requestDecoded!.currency).toBe("0xtoken");
    expect(result.requestDecoded!.recipient).toBe("0xrecip");
    expect(result.requestDecoded!.chainId).toBe(4217);
  });

  it("defaults method to tempo for legacy format", () => {
    const result = parseChallengeHeader(legacyHeader);
    expect(result.method).toBe("tempo");
  });

  it("converts numeric expiresAt to ISO 8601", () => {
    const result = parseChallengeHeader(legacyHeader);
    expect(result.expires).toContain("2286"); // year of timestamp 9999999999
  });

  it("works without Payment prefix", () => {
    const result = parseChallengeHeader("intent=session, amount=0.5");
    expect(result.intent).toBe("session");
    expect(result.requestDecoded!.amount).toBe("0.5");
  });

  it("applies defaults for missing fields", () => {
    const result = parseChallengeHeader("");
    expect(result.id).toBe("");
    expect(result.intent).toBe("charge");
    expect(result.method).toBe("");
    expect(result.expires).toBe("");
    expect(result.requestDecoded).toBeNull();
  });
});

describe("decodeReceipt — spec-compliant format", () => {
  function encode(obj: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(obj)).toString("base64url");
  }

  it("decodes a spec-compliant receipt", () => {
    const now = new Date(Date.now() - 10_000).toISOString();
    const input = encode({
      challengeId: "ch1",
      method: "tempo",
      reference: "0xtx789abc",
      settlement: { amount: "1000", currency: "usd" },
      status: "success",
      timestamp: now,
    });
    const { receipt, validation } = decodeReceipt(input);

    expect(validation.base64Valid).toBe(true);
    expect(validation.jsonValid).toBe(true);
    expect(validation.requiredFieldsPresent).toBe(true);
    expect(validation.timestampValid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    expect(receipt.challengeId).toBe("ch1");
    expect(receipt.method).toBe("tempo");
    expect(receipt.reference).toBe("0xtx789abc");
    expect(receipt.settlement).toEqual({ amount: "1000", currency: "usd" });
    expect(receipt.status).toBe("success");
  });

  it("handles legacy receipt format with receiptId/credential", () => {
    const now = new Date(Date.now() - 5000).toISOString();
    const input = encode({
      receiptId: "r2",
      timestamp: now,
      credential: "cred-abc",
      challengeId: "ch1",
      amount: "0.01",
    });
    const { receipt } = decodeReceipt(input);

    expect(receipt.challengeId).toBe("ch1");
    expect(receipt.reference).toBe("cred-abc"); // credential mapped to reference
  });

  it("collects unknown fields into extra", () => {
    const now = new Date(Date.now() - 5000).toISOString();
    const input = encode({
      challengeId: "ch3",
      method: "tempo",
      reference: "0xref",
      status: "success",
      timestamp: now,
      custom: "val",
    });
    const { receipt } = decodeReceipt(input);
    expect(receipt.extra).toEqual({ custom: "val" });
  });

  it("returns errors for invalid JSON", () => {
    const input = Buffer.from("not json at all").toString("base64");
    const { validation } = decodeReceipt(input);
    expect(validation.base64Valid).toBe(true);
    expect(validation.jsonValid).toBe(false);
    expect(validation.errors).toContain("Invalid JSON structure");
  });

  it("reports missing required fields for spec format", () => {
    const input = encode({ challengeId: "" });
    const { validation } = decodeReceipt(input);
    expect(validation.requiredFieldsPresent).toBe(false);
  });

  it("flags future timestamps", () => {
    const future = new Date(Date.now() + 3_600_000).toISOString();
    const input = encode({
      challengeId: "ch4",
      method: "tempo",
      reference: "0xref",
      status: "success",
      timestamp: future,
    });
    const { validation } = decodeReceipt(input);
    expect(validation.timestampValid).toBe(false);
    expect(validation.errors.some((e) => e.includes("future"))).toBe(true);
  });

  it("preserves raw input", () => {
    const input = encode({
      challengeId: "ch5",
      method: "tempo",
      reference: "0xref",
      status: "success",
      timestamp: new Date().toISOString(),
    });
    const { receipt } = decodeReceipt(input);
    expect(receipt.raw).toBe(input);
  });
});

describe("decodeCredential", () => {
  function encode(obj: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(obj)).toString("base64url");
  }

  it("decodes a valid spec-compliant credential", () => {
    const input = encode({
      challenge: { id: "ch1", realm: "example.com", method: "tempo", intent: "charge", request: "base64data" },
      source: "0x1234567890abcdef",
      payload: { signature: "0xsig" },
    });
    const { credential, validation } = decodeCredential(input);

    expect(validation.base64Valid).toBe(true);
    expect(validation.jsonValid).toBe(true);
    expect(validation.structureValid).toBe(true);
    expect(validation.challengePresent).toBe(true);
    expect(validation.sourcePresent).toBe(true);
    expect(validation.payloadPresent).toBe(true);
    expect(validation.errors).toHaveLength(0);

    expect(credential.challenge.id).toBe("ch1");
    expect(credential.challenge.realm).toBe("example.com");
    expect(credential.source).toBe("0x1234567890abcdef");
    expect(credential.payload.signature).toBe("0xsig");
  });

  it("reports missing challenge object", () => {
    const input = encode({ source: "0x123", payload: {} });
    const { validation } = decodeCredential(input);
    expect(validation.challengePresent).toBe(false);
    expect(validation.structureValid).toBe(false);
  });

  it("reports missing source", () => {
    const input = encode({ challenge: { id: "ch1" }, payload: {} });
    const { validation } = decodeCredential(input);
    expect(validation.sourcePresent).toBe(false);
  });

  it("reports missing payload", () => {
    const input = encode({ challenge: { id: "ch1" }, source: "0x123" });
    const { validation } = decodeCredential(input);
    expect(validation.payloadPresent).toBe(false);
  });

  it("also accepts raw JSON string (not base64)", () => {
    const raw = JSON.stringify({
      challenge: { id: "ch1", realm: "test", method: "tempo", intent: "charge", request: "" },
      source: "0x123",
      payload: { sig: "0x" },
    });
    const { validation } = decodeCredential(raw);
    expect(validation.jsonValid).toBe(true);
    expect(validation.structureValid).toBe(true);
  });
});

describe("parseMppManifest", () => {
  it("parses a valid manifest with endpoints", () => {
    const input = {
      name: "Test API",
      description: "A test API",
      endpoints: [
        { method: "POST", path: "/api/query", price: "0.001", description: "Query endpoint" },
        { method: "GET", path: "/api/data", price: 42 },
      ],
    };
    const result = parseMppManifest(input);

    expect(result.name).toBe("Test API");
    expect(result.description).toBe("A test API");
    expect(result.endpoints).toHaveLength(2);
    expect(result.endpoints[0]).toEqual({
      method: "POST",
      path: "/api/query",
      price: "0.001",
      description: "Query endpoint",
      intent: undefined,
      currency: undefined,
      paymentMethod: undefined,
    });
    expect(result.endpoints[1].price).toBe("42");
  });

  it("returns empty endpoints for null input", () => {
    const result = parseMppManifest(null);
    expect(result.endpoints).toEqual([]);
    expect(result.raw).toBeNull();
  });

  it("returns empty endpoints for non-object input", () => {
    const result = parseMppManifest("string");
    expect(result.endpoints).toEqual([]);
  });

  it("filters out non-object endpoint entries", () => {
    const result = parseMppManifest({ endpoints: ["bad", 42, null, { path: "/ok" }] });
    expect(result.endpoints).toHaveLength(1);
    expect(result.endpoints[0].path).toBe("/ok");
  });

  it("defaults method to GET if missing", () => {
    const result = parseMppManifest({ endpoints: [{ path: "/test" }] });
    expect(result.endpoints[0].method).toBe("GET");
  });

  it("preserves raw input", () => {
    const input = { endpoints: [] };
    const result = parseMppManifest(input);
    expect(result.raw).toBe(input);
  });
});
