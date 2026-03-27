import { describe, it, expect } from "vitest";
import { parseProblemDetails } from "../../utils/parser.js";

describe("parseProblemDetails", () => {
  it("parses a spec-compliant RFC 9457 problem details body", () => {
    const body = JSON.stringify({
      type: "https://paymentauth.org/problems/payment-required",
      title: "Payment Required",
      status: 402,
      detail: "Payment is required (Ping endpoint access).",
      challengeId: "abc123",
    });
    const result = parseProblemDetails(body);

    expect(result).not.toBeNull();
    expect(result!.type).toBe("https://paymentauth.org/problems/payment-required");
    expect(result!.title).toBe("Payment Required");
    expect(result!.status).toBe(402);
    expect(result!.detail).toBe("Payment is required (Ping endpoint access).");
    expect(result!.challengeId).toBe("abc123");
  });

  it("accepts body with status: 402 but no type field", () => {
    const body = JSON.stringify({
      status: 402,
      title: "Payment Required",
      detail: "Pay up",
    });
    const result = parseProblemDetails(body);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(402);
    expect(result!.type).toBeUndefined();
  });

  it("returns null for non-problem-details JSON (no type, wrong status)", () => {
    const body = JSON.stringify({ error: "not found", status: 404 });
    const result = parseProblemDetails(body);
    expect(result).toBeNull();
  });

  it("returns null for non-JSON string", () => {
    const result = parseProblemDetails("not json at all");
    expect(result).toBeNull();
  });

  it("returns null for JSON array", () => {
    const result = parseProblemDetails("[1,2,3]");
    expect(result).toBeNull();
  });

  it("returns null for JSON null", () => {
    const result = parseProblemDetails("null");
    expect(result).toBeNull();
  });

  it("collects unknown fields into extra", () => {
    const body = JSON.stringify({
      type: "https://example.com/problem",
      title: "Error",
      customField: "custom-value",
      another: 42,
    });
    const result = parseProblemDetails(body);

    expect(result).not.toBeNull();
    expect(result!.extra).toEqual({ customField: "custom-value", another: 42 });
  });

  it("handles missing optional fields gracefully", () => {
    const body = JSON.stringify({
      type: "https://example.com/problem",
    });
    const result = parseProblemDetails(body);

    expect(result).not.toBeNull();
    expect(result!.title).toBeUndefined();
    expect(result!.status).toBeUndefined();
    expect(result!.detail).toBeUndefined();
    expect(result!.challengeId).toBeUndefined();
  });

  it("ignores non-string type/title/detail fields", () => {
    const body = JSON.stringify({
      type: 123,
      title: true,
      detail: [],
      status: 402,
    });
    const result = parseProblemDetails(body);

    expect(result).not.toBeNull();
    expect(result!.type).toBeUndefined();
    expect(result!.title).toBeUndefined();
    expect(result!.detail).toBeUndefined();
    expect(result!.status).toBe(402);
  });
});
