import { describe, it, expect } from "vitest";
import { getChainName, getChainRpc, getTokenSymbol, getTokenInfo, CHAINS, KNOWN_TOKENS } from "../../utils/chains.js";

describe("getChainName", () => {
  it("returns name for Tempo Mainnet", () => {
    expect(getChainName(4217)).toBe("Tempo Mainnet");
  });

  it("returns name for Tempo Testnet", () => {
    expect(getChainName(4218)).toBe("Tempo Testnet");
  });

  it("returns fallback for unknown chain ID", () => {
    expect(getChainName(1)).toBe("Chain 1");
    expect(getChainName(0)).toBe("Chain 0");
    expect(getChainName(99999)).toBe("Chain 99999");
  });
});

describe("getChainRpc", () => {
  it("returns RPC URL for known chains", () => {
    expect(getChainRpc(4217)).toBe("https://rpc.tempo.xyz");
    expect(getChainRpc(4218)).toBe("https://rpc-testnet.tempo.xyz");
  });

  it("returns undefined for unknown chains", () => {
    expect(getChainRpc(1)).toBeUndefined();
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

describe("CHAINS registry", () => {
  it("contains exactly 2 chains", () => {
    expect(Object.keys(CHAINS)).toHaveLength(2);
  });

  it("mainnet is not a testnet", () => {
    expect(CHAINS[4217].testnet).toBe(false);
  });

  it("testnet is a testnet", () => {
    expect(CHAINS[4218].testnet).toBe(true);
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
