/**
 * Integration tests against the real MPP endpoint at mpp.dev.
 *
 * These tests verify our parser works against production MPP challenges.
 * They require network access and are skipped if MPP_REAL_ENDPOINT_TESTS
 * is not set (to avoid flaky CI on network issues).
 */
import { describe, it, expect } from "vitest";
import { parseChallengeHeader } from "../../utils/parser.js";
import { verifyChallengeFields } from "../../utils/crypto.js";
import { rawRequest } from "../../utils/http.js";

const REAL_ENDPOINT = "https://mpp.dev/api/ping/paid";
const shouldRun = process.env.MPP_REAL_ENDPOINT_TESTS === "true";

describe.skipIf(!shouldRun)("real endpoint: mpp.dev/api/ping/paid", () => {
  it("returns 402 with WWW-Authenticate header", async () => {
    const { status, headers } = await rawRequest(REAL_ENDPOINT, {
      timeout: 15_000,
    });

    expect(status).toBe(402);
    expect(headers.get("www-authenticate")).toBeDefined();
    expect(headers.get("www-authenticate")).toContain("Payment");
  });

  it("parses a spec-compliant challenge", async () => {
    const { headers } = await rawRequest(REAL_ENDPOINT, { timeout: 15_000 });
    const challenge = parseChallengeHeader(headers.get("www-authenticate")!);

    // Core spec fields
    expect(challenge.id).toBeTruthy();
    expect(challenge.id!.length).toBeGreaterThan(10);
    expect(challenge.realm).toBeTruthy();
    expect(challenge.method).toBe("tempo");
    expect(challenge.intent).toBe("charge");
    expect(challenge.expires).toBeTruthy();
    expect(challenge.request).toBeTruthy();
  });

  it("decodes the request payload correctly", async () => {
    const { headers } = await rawRequest(REAL_ENDPOINT, { timeout: 15_000 });
    const challenge = parseChallengeHeader(headers.get("www-authenticate")!);

    expect(challenge.requestDecoded).toBeDefined();
    expect(challenge.requestDecoded!.amount).toBeTruthy();
    expect(challenge.requestDecoded!.currency).toBeTruthy();
    expect(challenge.requestDecoded!.recipient).toBeTruthy();

    // Tempo-specific: methodDetails with chainId
    expect(challenge.requestDecoded!.methodDetails).toBeDefined();
    const details = challenge.requestDecoded!.methodDetails as Record<string, unknown>;
    expect(details.chainId).toBe(42431);
  });

  it("passes verification checks", async () => {
    const { headers } = await rawRequest(REAL_ENDPOINT, { timeout: 15_000 });
    const challenge = parseChallengeHeader(headers.get("www-authenticate")!);
    const result = verifyChallengeFields(challenge);

    expect(result.expiryValid).toBe(true);
    expect(result.methodKnown).toBe(true);
    expect(result.amountParseable).toBe(true);
    expect(result.recipientValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns RFC 9457 Problem Details body", async () => {
    const res = await fetch(REAL_ENDPOINT);
    expect(res.status).toBe(402);

    const body = await res.json();
    expect(body.type).toContain("paymentauth.org");
    expect(body.title).toBe("Payment Required");
    expect(body.status).toBe(402);
    expect(body.detail).toBeTruthy();
    expect(body.challengeId).toBeTruthy();
  });

  it("description field is present in challenge header", async () => {
    const { headers } = await rawRequest(REAL_ENDPOINT, { timeout: 15_000 });
    const challenge = parseChallengeHeader(headers.get("www-authenticate")!);

    expect(challenge.description).toBeTruthy();
    expect(challenge.description).toContain("Ping");
  });
});
