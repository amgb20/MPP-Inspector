import { describe, it, expect } from "vitest";
import { verifyChallengeFields } from "../../utils/crypto.js";
import type { MppChallenge, MppRequestParams } from "../../types.js";

function makeChallenge(overrides: Partial<MppChallenge> = {}, reqOverrides: Partial<MppRequestParams> = {}): MppChallenge {
  const requestDecoded: MppRequestParams = {
    amount: "0.001",
    currency: "usd",
    recipient: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth — valid address
    chainId: 42431,
    ...reqOverrides,
  };

  return {
    id: "test-challenge-1",
    realm: "example.com",
    method: "tempo",
    intent: "charge",
    expires: new Date(Date.now() + 3_600_000).toISOString(),
    request: Buffer.from(JSON.stringify(requestDecoded)).toString("base64url"),
    requestDecoded,
    extra: {},
    raw: "raw-header",
    ...overrides,
  };
}

describe("verifyChallengeFields", () => {
  it("validates a fully correct challenge", () => {
    const result = verifyChallengeFields(makeChallenge());
    expect(result.recipientValid).toBe(true);
    expect(result.amountParseable).toBe(true);
    expect(result.expiryValid).toBe(true);
    expect(result.methodKnown).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("signature is always null (unverifiable without full spec)", () => {
    const result = verifyChallengeFields(makeChallenge());
    expect(result.signatureValid).toBeNull();
  });

  it("detects invalid recipient address (blockchain method)", () => {
    const result = verifyChallengeFields(makeChallenge({}, { recipient: "not-an-address" }));
    expect(result.recipientValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Invalid recipient"))).toBe(true);
  });

  it("recipient is null when not present", () => {
    const result = verifyChallengeFields(makeChallenge({}, { recipient: undefined }));
    expect(result.recipientValid).toBeNull();
  });

  it("detects invalid (NaN) amount", () => {
    const result = verifyChallengeFields(makeChallenge({}, { amount: "abc" }));
    expect(result.amountParseable).toBe(false);
    expect(result.errors.some((e) => e.includes("Invalid amount"))).toBe(true);
  });

  it("detects negative amount", () => {
    const result = verifyChallengeFields(makeChallenge({}, { amount: "-1" }));
    expect(result.amountParseable).toBe(false);
  });

  it("accepts zero amount", () => {
    const result = verifyChallengeFields(makeChallenge({}, { amount: "0" }));
    expect(result.amountParseable).toBe(true);
  });

  it("detects expired challenge (ISO 8601)", () => {
    const pastTime = new Date(Date.now() - 3_600_000).toISOString();
    const result = verifyChallengeFields(makeChallenge({ expires: pastTime }));
    expect(result.expiryValid).toBe(false);
    expect(result.errors.some((e) => e.includes("expired"))).toBe(true);
  });

  it("detects unknown payment method", () => {
    const result = verifyChallengeFields(makeChallenge({ method: "banana" }));
    expect(result.methodKnown).toBe(false);
    expect(result.errors.some((e) => e.includes("Unknown payment method"))).toBe(true);
  });

  it("validates known payment methods", () => {
    for (const method of ["tempo", "stripe", "lightning", "solana", "card", "custom"]) {
      const result = verifyChallengeFields(makeChallenge({ method }));
      expect(result.methodKnown).toBe(true);
    }
  });

  it("skips address validation for non-blockchain methods", () => {
    const result = verifyChallengeFields(
      makeChallenge({ method: "stripe" }, { recipient: "acct_1234567890" }),
    );
    expect(result.recipientValid).toBe(true); // non-blockchain = always valid
  });

  it("accumulates multiple errors", () => {
    const result = verifyChallengeFields(
      makeChallenge(
        { method: "unknown_method", expires: new Date(Date.now() - 1000).toISOString() },
        { recipient: "bad", amount: "NaN" },
      ),
    );
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
