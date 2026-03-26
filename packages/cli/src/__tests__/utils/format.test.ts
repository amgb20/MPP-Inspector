import { describe, it, expect, beforeAll } from "vitest";
import chalk from "chalk";
import {
  truncateAddress,
  formatAmount,
  formatUsd,
  formatDuration,
  progressBar,
  check,
  label,
  section,
} from "../../utils/format.js";

beforeAll(() => {
  chalk.level = 0;
});

describe("truncateAddress", () => {
  it("truncates long addresses with default params", () => {
    const addr = "0x1234567890abcdef1234567890abcdef12345678";
    expect(truncateAddress(addr)).toBe("0x1234...5678");
  });

  it("returns short addresses unchanged", () => {
    expect(truncateAddress("0x1234")).toBe("0x1234");
  });

  it("respects custom start and end lengths", () => {
    const addr = "0x1234567890abcdef1234567890abcdef12345678";
    expect(truncateAddress(addr, 10, 6)).toBe("0x12345678...345678");
  });

  it("handles empty string", () => {
    expect(truncateAddress("")).toBe("");
  });
});

describe("formatAmount", () => {
  it("formats large amounts with 2 decimal places", () => {
    expect(formatAmount("1.23456")).toBe("1.23");
  });

  it("formats sub-1 amounts with 4 decimal places", () => {
    expect(formatAmount("0.12345")).toBe("0.1235");
  });

  it("formats very small amounts with 6 decimal places", () => {
    expect(formatAmount("0.001234")).toBe("0.001234");
  });

  it("handles NaN gracefully", () => {
    expect(formatAmount("not-a-number")).toBe("not-a-number");
  });

  it("appends token symbol when currency is provided and known", () => {
    const knownToken = "0x20c03e252fabf5e4c8441db12068e97c833ab572000000000000000000000000";
    const result = formatAmount("1.5", knownToken);
    expect(result).toContain("pathUSD");
  });
});

describe("formatUsd", () => {
  it("formats with dollar sign and 3 decimals", () => {
    expect(formatUsd("1.2345")).toBe("$1.234");
  });

  it("formats very small amounts with 4 decimals", () => {
    expect(formatUsd("0.001234")).toBe("$0.0012");
  });

  it("handles NaN", () => {
    expect(formatUsd("abc")).toBe("$abc");
  });
});

describe("formatDuration", () => {
  it("formats sub-second as ms", () => {
    expect(formatDuration(450)).toBe("450ms");
  });

  it("formats seconds with one decimal", () => {
    expect(formatDuration(2500)).toBe("2.5s");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(125000)).toBe("2m 5s");
  });

  it("handles zero", () => {
    expect(formatDuration(0)).toBe("0ms");
  });

  it("handles exact second boundary", () => {
    expect(formatDuration(1000)).toBe("1.0s");
  });

  it("handles exact minute boundary", () => {
    expect(formatDuration(60000)).toBe("1m 0s");
  });
});

describe("progressBar", () => {
  it("shows full bar at 100%", () => {
    const result = progressBar(10, 10, 10);
    expect(result).toContain("10/10");
  });

  it("shows partial progress", () => {
    const result = progressBar(5, 10, 10);
    expect(result).toContain("5/10");
  });

  it("caps at 100% when current exceeds total", () => {
    const result = progressBar(15, 10, 10);
    expect(result).toContain("15/10");
  });
});

describe("check", () => {
  it("shows checkmark for passed", () => {
    const result = check(true, "Test passed");
    expect(result).toContain("Test passed");
  });

  it("shows X for failed", () => {
    const result = check(false, "Test failed");
    expect(result).toContain("Test failed");
  });

  it("shows ? for null (unverifiable)", () => {
    const result = check(null, "Unknown");
    expect(result).toContain("Unknown");
    expect(result).toContain("unverifiable");
  });
});

describe("label", () => {
  it("formats key-value pair with padding", () => {
    const result = label("Key:", "Value");
    expect(result).toContain("Key:");
    expect(result).toContain("Value");
  });
});

describe("section", () => {
  it("wraps content with title and borders", () => {
    const result = section("Title", "Line 1\nLine 2");
    expect(result).toContain("Title");
    expect(result).toContain("Line 1");
    expect(result).toContain("Line 2");
  });
});
