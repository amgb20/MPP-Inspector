import type { ChainConfig, TokenInfo } from "../types.js";

export const CHAINS: Record<number, ChainConfig> = {
  4217: {
    name: "Tempo Mainnet",
    rpcUrl: "https://rpc.tempo.xyz",
    testnet: false,
    explorerUrl: "https://explorer.tempo.xyz",
  },
  4218: {
    name: "Tempo Testnet",
    rpcUrl: "https://rpc-testnet.tempo.xyz",
    testnet: true,
    explorerUrl: "https://explorer-testnet.tempo.xyz",
  },
};

export const KNOWN_TOKENS: Record<string, TokenInfo> = {
  "0x20c03e252fabf5e4c8441db12068e97c833ab572000000000000000000000000": {
    symbol: "pathUSD",
    decimals: 6,
    name: "Path USD",
  },
};

export function getChainName(chainId: number): string {
  return CHAINS[chainId]?.name ?? `Chain ${chainId}`;
}

export function getChainRpc(chainId: number): string | undefined {
  return CHAINS[chainId]?.rpcUrl;
}

export function getTokenSymbol(address: string): string | undefined {
  const lower = address.toLowerCase();
  for (const [addr, info] of Object.entries(KNOWN_TOKENS)) {
    if (addr.toLowerCase() === lower) return info.symbol;
  }
  return undefined;
}

export function getTokenInfo(address: string): TokenInfo | undefined {
  const lower = address.toLowerCase();
  for (const [addr, info] of Object.entries(KNOWN_TOKENS)) {
    if (addr.toLowerCase() === lower) return info;
  }
  return undefined;
}
