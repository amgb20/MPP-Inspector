import { describe, it, expect, vi, afterEach } from "vitest";
import {
  resolvePrivateKey,
  createMppWallet,
  getBalance,
  NonceManager,
} from "../../utils/wallet.js";

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

describe("getBalance", () => {
  it("returns formatted balance on success", async () => {
    const fakeWallet = {
      publicClient: {
        getBalance: vi.fn().mockResolvedValue(1000000000000000000n), // 1 ETH in wei
      },
      account: { address: "0x1234" },
    } as any;

    const result = await getBalance(fakeWallet);
    expect(result).toBe("1");
  });

  it("returns 'unknown' when getBalance throws", async () => {
    const fakeWallet = {
      publicClient: {
        getBalance: vi.fn().mockRejectedValue(new Error("network error")),
      },
      account: { address: "0x1234" },
    } as any;

    const result = await getBalance(fakeWallet);
    expect(result).toBe("unknown");
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

  it("queues concurrent callers while fetching initial nonce", async () => {
    let resolveFetch: (value: number) => void;
    const fetchPromise = new Promise<number>((resolve) => {
      resolveFetch = resolve;
    });
    const mockGetTransactionCount = vi.fn().mockReturnValue(fetchPromise);
    const fakeWallet = {
      publicClient: {
        getTransactionCount: mockGetTransactionCount,
      },
      account: { address: "0x1234" },
    } as any;

    const manager = new NonceManager(fakeWallet);

    // Start 3 concurrent acquireNonce calls
    const p1 = manager.acquireNonce();
    const p2 = manager.acquireNonce();
    const p3 = manager.acquireNonce();

    // Resolve the initial fetch
    resolveFetch!(10);

    const [n1, n2, n3] = await Promise.all([p1, p2, p3]);

    // Pending waiters (p2, p3) get nonces first (10, 11), then p1 gets 12
    const nonces = [n1, n2, n3].sort((a, b) => a - b);
    expect(nonces).toEqual([10, 11, 12]);
    expect(mockGetTransactionCount).toHaveBeenCalledOnce();
  });
});
