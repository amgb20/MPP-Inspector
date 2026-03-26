import { describe, it, expect } from "vitest";
import { verifyChallengeFields } from "../../utils/crypto.js";
import type { MppChallenge } from "../../types.js";

function makeChallenge(overrides: Partial<MppChallenge> = {}): MppChallenge {
  return {
    challengeId: "test-challenge-1",
    intent: "charge",
    amount: "0.001",
    currency: "0x20c03e252fabf5e4c8441db12068e97c833ab572000000000000000000000000",
    recipient: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth — valid address
    chainId: 4217,
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    signature: "0xsig",
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
    expect(result.currencyKnown).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("signature is always null (unverifiable without full spec)", () => {
    const result = verifyChallengeFields(makeChallenge());
    expect(result.signatureValid).toBeNull();
  });

  it("detects invalid recipient address", () => {
    const result = verifyChallengeFields(makeChallenge({ recipient: "not-an-address" }));
    expect(result.recipientValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Invalid recipient"))).toBe(true);
  });

  it("detects empty recipient", () => {
    const result = verifyChallengeFields(makeChallenge({ recipient: "" }));
    expect(result.recipientValid).toBe(false);
  });

  it("detects invalid (NaN) amount", () => {
    const result = verifyChallengeFields(makeChallenge({ amount: "abc" }));
    expect(result.amountParseable).toBe(false);
    expect(result.errors.some((e) => e.includes("Invalid amount"))).toBe(true);
  });

  it("detects negative amount", () => {
    const result = verifyChallengeFields(makeChallenge({ amount: "-1" }));
    expect(result.amountParseable).toBe(false);
  });

  it("accepts zero amount", () => {
    const result = verifyChallengeFields(makeChallenge({ amount: "0" }));
    expect(result.amountParseable).toBe(true);
  });

  it("detects expired challenge", () => {
    const pastTime = Math.floor(Date.now() / 1000) - 3600;
    const result = verifyChallengeFields(makeChallenge({ expiresAt: pastTime }));
    expect(result.expiryValid).toBe(false);
    expect(result.errors.some((e) => e.includes("expired"))).toBe(true);
  });

  it("detects unknown currency", () => {
    const result = verifyChallengeFields(makeChallenge({ currency: "0xunknowntoken" }));
    expect(result.currencyKnown).toBe(false);
    expect(result.errors.some((e) => e.includes("Unknown currency"))).toBe(true);
  });

  it("does not error on empty currency", () => {
    const result = verifyChallengeFields(makeChallenge({ currency: "" }));
    expect(result.currencyKnown).toBe(false);
    expect(result.errors.filter((e) => e.includes("currency"))).toHaveLength(0);
  });

  it("accumulates multiple errors", () => {
    const result = verifyChallengeFields(
      makeChallenge({
        recipient: "bad",
        amount: "NaN",
        expiresAt: 1,
        currency: "0xbad",
      }),
    );
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
