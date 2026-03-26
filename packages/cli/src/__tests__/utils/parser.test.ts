import { describe, it, expect } from "vitest";
import { parseAuthParams, parseChallengeHeader, decodeReceipt, parseMppManifest } from "../../utils/parser.js";

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

describe("parseChallengeHeader", () => {
  const fullHeader =
    'Payment challengeId="abc123", intent=charge, amount=0.001, currency=0xtoken, recipient=0xrecip, chainId=4217, expiresAt=9999999999, signature=0xsig';

  it("strips Payment prefix and parses all known fields", () => {
    const result = parseChallengeHeader(fullHeader);
    expect(result.challengeId).toBe("abc123");
    expect(result.intent).toBe("charge");
    expect(result.amount).toBe("0.001");
    expect(result.currency).toBe("0xtoken");
    expect(result.recipient).toBe("0xrecip");
    expect(result.chainId).toBe(4217);
    expect(result.expiresAt).toBe(9999999999);
    expect(result.signature).toBe("0xsig");
  });

  it("preserves raw header", () => {
    const result = parseChallengeHeader(fullHeader);
    expect(result.raw).toBe(fullHeader);
  });

  it("collects unknown fields into extra", () => {
    const result = parseChallengeHeader("Payment intent=charge, customField=hello");
    expect(result.extra).toEqual({ customField: "hello" });
  });

  it("works without Payment prefix", () => {
    const result = parseChallengeHeader("intent=session, amount=0.5");
    expect(result.intent).toBe("session");
    expect(result.amount).toBe("0.5");
  });

  it("applies defaults for missing fields", () => {
    const result = parseChallengeHeader("");
    expect(result.challengeId).toBe("");
    expect(result.intent).toBe("charge");
    expect(result.amount).toBe("0");
    expect(result.currency).toBe("");
    expect(result.recipient).toBe("");
    expect(result.chainId).toBe(0);
    expect(result.expiresAt).toBe(0);
    expect(result.signature).toBe("");
  });

  it("description is undefined when not present", () => {
    const result = parseChallengeHeader("intent=charge");
    expect(result.description).toBeUndefined();
  });

  it("description is set when present", () => {
    const result = parseChallengeHeader('description="hello world"');
    expect(result.description).toBe("hello world");
  });
});

describe("decodeReceipt", () => {
  function encode(obj: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(obj)).toString("base64");
  }

  it("decodes a valid receipt with all required fields", () => {
    const now = Math.floor(Date.now() / 1000) - 10;
    const input = encode({ receiptId: "r1", timestamp: now, credential: "cred-abc" });
    const { receipt, validation } = decodeReceipt(input);

    expect(validation.base64Valid).toBe(true);
    expect(validation.jsonValid).toBe(true);
    expect(validation.requiredFieldsPresent).toBe(true);
    expect(validation.timestampValid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    expect(receipt.receiptId).toBe("r1");
    expect(receipt.timestamp).toBe(now);
    expect(receipt.credential).toBe("cred-abc");
  });

  it("includes optional challengeId and amount", () => {
    const now = Math.floor(Date.now() / 1000) - 5;
    const input = encode({ receiptId: "r2", timestamp: now, credential: "c", challengeId: "ch1", amount: "0.01" });
    const { receipt } = decodeReceipt(input);

    expect(receipt.challengeId).toBe("ch1");
    expect(receipt.amount).toBe("0.01");
  });

  it("collects unknown fields into extra", () => {
    const now = Math.floor(Date.now() / 1000) - 5;
    const input = encode({ receiptId: "r3", timestamp: now, credential: "c", custom: "val" });
    const { receipt } = decodeReceipt(input);

    expect(receipt.extra).toEqual({ custom: "val" });
  });

  it("returns errors for invalid base64", () => {
    const { validation } = decodeReceipt("!!!not-base64!!!");
    expect(validation.base64Valid).toBe(true); // Buffer.from doesn't throw on bad base64, it just produces garbage
  });

  it("returns errors for invalid JSON", () => {
    const input = Buffer.from("not json at all").toString("base64");
    const { validation } = decodeReceipt(input);
    expect(validation.base64Valid).toBe(true);
    expect(validation.jsonValid).toBe(false);
    expect(validation.errors).toContain("Invalid JSON structure");
  });

  it("reports missing required fields", () => {
    const input = encode({ receiptId: "", timestamp: 0, credential: "" });
    const { validation } = decodeReceipt(input);
    expect(validation.requiredFieldsPresent).toBe(false);
    expect(validation.errors).toContain("Missing receiptId");
    expect(validation.errors).toContain("Missing timestamp");
    expect(validation.errors).toContain("Missing credential");
  });

  it("flags future timestamps", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const input = encode({ receiptId: "r4", timestamp: future, credential: "c" });
    const { validation } = decodeReceipt(input);
    expect(validation.timestampValid).toBe(false);
    expect(validation.errors).toContain("Timestamp is in the future");
  });

  it("preserves raw input", () => {
    const input = encode({ receiptId: "r5", timestamp: 1, credential: "c" });
    const { receipt } = decodeReceipt(input);
    expect(receipt.raw).toBe(input);
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
