import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolvePrivateKey, createMppWallet, NonceManager } from "../../utils/wallet.js";

describe("resolvePrivateKey", () => {
  const originalEnv = process.env.MPP_PRIVATE_KEY;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.MPP_PRIVATE_KEY = originalEnv;
    } else {
      delete process.env.MPP_PRIVATE_KEY;
    }
  });

  it("returns option value when provided", () => {
    expect(resolvePrivateKey("0xabc")).toBe("0xabc");
  });

  it("falls back to env variable when no option", () => {
    process.env.MPP_PRIVATE_KEY = "0xfromenv";
    expect(resolvePrivateKey()).toBe("0xfromenv");
  });

  it("returns undefined when neither option nor env is set", () => {
    delete process.env.MPP_PRIVATE_KEY;
    expect(resolvePrivateKey()).toBeUndefined();
  });

  it("prefers option value over env variable", () => {
    process.env.MPP_PRIVATE_KEY = "0xenv";
    expect(resolvePrivateKey("0xoption")).toBe("0xoption");
  });
});

describe("createMppWallet", () => {
  const testPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  it("creates wallet with correct address for known private key", () => {
    const wallet = createMppWallet(testPrivateKey, 4217);
    expect(wallet.address).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  });

  it("handles private key without 0x prefix", () => {
    const wallet = createMppWallet(testPrivateKey.slice(2), 4217);
    expect(wallet.address).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  });

  it("exposes client, publicClient, and account", () => {
    const wallet = createMppWallet(testPrivateKey, 4217);
    expect(wallet.client).toBeDefined();
    expect(wallet.publicClient).toBeDefined();
    expect(wallet.account).toBeDefined();
  });
});

describe("NonceManager", () => {
  it("increments nonce on sequential calls", async () => {
    const mockGetTransactionCount = vi.fn().mockResolvedValue(5);
    const fakeWallet = {
      publicClient: {
        getTransactionCount: mockGetTransactionCount,
      },
      account: { address: "0x1234" },
    } as any;

    const manager = new NonceManager(fakeWallet);

    const n1 = await manager.acquireNonce();
    const n2 = await manager.acquireNonce();
    const n3 = await manager.acquireNonce();

    expect(n1).toBe(5);
    expect(n2).toBe(6);
    expect(n3).toBe(7);
    expect(mockGetTransactionCount).toHaveBeenCalledOnce();
  });
});
