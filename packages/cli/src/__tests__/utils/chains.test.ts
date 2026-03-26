import { describe, it, expect } from "vitest";
import {
  getChainName,
  getChainRpc,
  getTokenSymbol,
  getTokenInfo,
  getPaymentMethodInfo,
  isKnownPaymentMethod,
  isBlockchainMethod,
  resolveCurrency,
  CHAINS,
  KNOWN_TOKENS,
} from "../../utils/chains.js";

describe("getChainName", () => {
  it("returns name for Tempo Mainnet", () => {
    expect(getChainName(42431)).toBe("Tempo Mainnet");
  });

  it("returns name for Tempo Testnet", () => {
    expect(getChainName(42432)).toBe("Tempo Testnet");
  });

  it("returns name for legacy Tempo chain IDs", () => {
    expect(getChainName(4217)).toBe("Tempo Mainnet (legacy)");
    expect(getChainName(4218)).toBe("Tempo Testnet (legacy)");
  });

  it("returns name for Ethereum Mainnet", () => {
    expect(getChainName(1)).toBe("Ethereum Mainnet");
  });

  it("returns fallback for unknown chain ID", () => {
    expect(getChainName(99999)).toBe("Chain 99999");
  });

  it("returns unknown for zero or undefined", () => {
    expect(getChainName(0)).toBe("unknown");
    expect(getChainName(undefined)).toBe("unknown");
  });
});

describe("getChainRpc", () => {
  it("returns RPC URL for known chains", () => {
    expect(getChainRpc(42431)).toBe("https://rpc.tempo.xyz");
    expect(getChainRpc(42432)).toBe("https://rpc-testnet.tempo.xyz");
  });

  it("returns undefined for unknown chains", () => {
    expect(getChainRpc(99999)).toBeUndefined();
    expect(getChainRpc(0)).toBeUndefined();
  });
});

describe("getTokenSymbol", () => {
  const knownAddress = "0x20c03e252fabf5e4c8441db12068e97c833ab572000000000000000000000000";

  it("returns symbol for known token", () => {
    expect(getTokenSymbol(knownAddress)).toBe("pathUSD");
  });

  it("is case-insensitive", () => {
    expect(getTokenSymbol(knownAddress.toUpperCase())).toBe("pathUSD");
  });

  it("returns undefined for unknown token", () => {
    expect(getTokenSymbol("0xunknown")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getTokenSymbol("")).toBeUndefined();
  });
});

describe("getTokenInfo", () => {
  const knownAddress = "0x20c03e252fabf5e4c8441db12068e97c833ab572000000000000000000000000";

  it("returns full token info for known token", () => {
    const info = getTokenInfo(knownAddress);
    expect(info).toBeDefined();
    expect(info!.symbol).toBe("pathUSD");
    expect(info!.decimals).toBe(6);
    expect(info!.name).toBe("Path USD");
  });

  it("is case-insensitive", () => {
    expect(getTokenInfo(knownAddress.toUpperCase())).toBeDefined();
  });

  it("returns undefined for unknown token", () => {
    expect(getTokenInfo("0xunknown")).toBeUndefined();
  });
});

describe("payment method helpers", () => {
  it("getPaymentMethodInfo returns info for known methods", () => {
    expect(getPaymentMethodInfo("tempo")?.name).toBe("Tempo");
    expect(getPaymentMethodInfo("stripe")?.name).toBe("Stripe");
    expect(getPaymentMethodInfo("lightning")?.name).toBe("Lightning");
    expect(getPaymentMethodInfo("solana")?.name).toBe("Solana");
    expect(getPaymentMethodInfo("card")?.name).toBe("Card");
    expect(getPaymentMethodInfo("custom")?.name).toBe("Custom");
  });

  it("getPaymentMethodInfo returns undefined for unknown methods", () => {
    expect(getPaymentMethodInfo("banana")).toBeUndefined();
  });

  it("isKnownPaymentMethod identifies known methods", () => {
    expect(isKnownPaymentMethod("tempo")).toBe(true);
    expect(isKnownPaymentMethod("stripe")).toBe(true);
    expect(isKnownPaymentMethod("banana")).toBe(false);
  });

  it("isBlockchainMethod identifies blockchain-based methods", () => {
    expect(isBlockchainMethod("tempo")).toBe(true);
    expect(isBlockchainMethod("lightning")).toBe(true);
    expect(isBlockchainMethod("solana")).toBe(true);
    expect(isBlockchainMethod("stripe")).toBe(false);
    expect(isBlockchainMethod("card")).toBe(false);
    expect(isBlockchainMethod("custom")).toBe(false);
  });
});

describe("resolveCurrency", () => {
  it("resolves known currency codes", () => {
    expect(resolveCurrency("usd")).toBe("USD");
    expect(resolveCurrency("btc")).toBe("BTC");
    expect(resolveCurrency("sol")).toBe("SOL");
  });

  it("resolves known token addresses", () => {
    const knownAddress = "0x20c03e252fabf5e4c8441db12068e97c833ab572000000000000000000000000";
    expect(resolveCurrency(knownAddress)).toBe("pathUSD");
  });

  it("truncates unknown token addresses", () => {
    const result = resolveCurrency("0x1234567890abcdef1234567890abcdef12345678");
    expect(result).toBe("0x1234...5678");
  });

  it("returns unknown for undefined", () => {
    expect(resolveCurrency(undefined)).toBe("unknown");
  });

  it("passes through unknown strings", () => {
    expect(resolveCurrency("EUR")).toBe("EUR");
  });
});

describe("CHAINS registry", () => {
  it("contains Tempo, legacy Tempo, and Ethereum chains", () => {
    expect(Object.keys(CHAINS).length).toBeGreaterThanOrEqual(5);
  });

  it("mainnet is not a testnet", () => {
    expect(CHAINS[42431].testnet).toBe(false);
  });

  it("testnet is a testnet", () => {
    expect(CHAINS[42432].testnet).toBe(true);
  });

  it("all chains have explorer URLs", () => {
    for (const chain of Object.values(CHAINS)) {
      expect(chain.explorerUrl).toBeDefined();
    }
  });
});

describe("KNOWN_TOKENS registry", () => {
  it("contains at least one token", () => {
    expect(Object.keys(KNOWN_TOKENS).length).toBeGreaterThanOrEqual(1);
  });

  it("all tokens have required fields", () => {
    for (const token of Object.values(KNOWN_TOKENS)) {
      expect(token.symbol).toBeTruthy();
      expect(typeof token.decimals).toBe("number");
      expect(token.name).toBeTruthy();
    }
  });
});
