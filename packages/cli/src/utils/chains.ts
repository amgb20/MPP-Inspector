import type { ChainConfig, TokenInfo, PaymentMethod } from "../types.js";
import { KNOWN_PAYMENT_METHODS } from "../types.js";

// --- Chain configs ---

export const CHAINS: Record<number, ChainConfig> = {
  42431: {
    name: "Tempo Mainnet",
    rpcUrl: "https://rpc.tempo.xyz",
    testnet: false,
    explorerUrl: "https://explorer.tempo.xyz",
  },
  42432: {
    name: "Tempo Testnet",
    rpcUrl: "https://rpc-testnet.tempo.xyz",
    testnet: true,
    explorerUrl: "https://explorer-testnet.tempo.xyz",
  },
  // Legacy chain IDs (may appear in older integrations)
  4217: {
    name: "Tempo Mainnet (legacy)",
    rpcUrl: "https://rpc.tempo.xyz",
    testnet: false,
    explorerUrl: "https://explorer.tempo.xyz",
  },
  4218: {
    name: "Tempo Testnet (legacy)",
    rpcUrl: "https://rpc-testnet.tempo.xyz",
    testnet: true,
    explorerUrl: "https://explorer-testnet.tempo.xyz",
  },
  1: {
    name: "Ethereum Mainnet",
    rpcUrl: "https://eth.llamarpc.com",
    testnet: false,
    explorerUrl: "https://etherscan.io",
  },
};

// --- Token registry ---

export const KNOWN_TOKENS: Record<string, TokenInfo> = {
  "0x20c03e252fabf5e4c8441db12068e97c833ab572000000000000000000000000": {
    symbol: "pathUSD",
    decimals: 6,
    name: "Path USD",
  },
};

// --- Currency string resolution ---
// The `currency` field in request params can be:
// - A token address (0x...)
// - A currency code like "usd", "btc", "sol"
// - A token symbol like "pathUSD"

const CURRENCY_CODES: Record<string, string> = {
  usd: "USD",
  eur: "EUR",
  btc: "BTC",
  sol: "SOL",
  pathusd: "pathUSD",
};

export function resolveCurrency(currency: string | undefined): string {
  if (!currency) return "unknown";
  const lower = currency.toLowerCase();
  if (CURRENCY_CODES[lower]) return CURRENCY_CODES[lower];
  const tokenInfo = getTokenInfo(currency);
  if (tokenInfo) return tokenInfo.symbol;
  if (currency.startsWith("0x") && currency.length > 10) {
    return `${currency.slice(0, 6)}...${currency.slice(-4)}`;
  }
  return currency;
}

// --- Payment method info ---

export interface PaymentMethodInfo {
  readonly name: string;
  readonly description: string;
  readonly blockchain: boolean;
}

const PAYMENT_METHOD_INFO: Record<string, PaymentMethodInfo> = {
  tempo: { name: "Tempo", description: "Tempo blockchain stablecoin payments", blockchain: true },
  stripe: { name: "Stripe", description: "SPT-based card payments via Stripe", blockchain: false },
  lightning: {
    name: "Lightning",
    description: "Bitcoin via Lightning Network (BOLT11)",
    blockchain: true,
  },
  solana: { name: "Solana", description: "SOL + SPL token payments", blockchain: true },
  card: {
    name: "Card",
    description: "Encrypted network tokens (Visa Intelligent Commerce)",
    blockchain: false,
  },
  custom: {
    name: "Custom",
    description: "Custom payment rail via Method.from()",
    blockchain: false,
  },
};

export function getPaymentMethodInfo(method: string): PaymentMethodInfo | undefined {
  return PAYMENT_METHOD_INFO[method.toLowerCase()];
}

export function isKnownPaymentMethod(method: string): method is PaymentMethod {
  return (KNOWN_PAYMENT_METHODS as readonly string[]).includes(method.toLowerCase());
}

export function isBlockchainMethod(method: string): boolean {
  return PAYMENT_METHOD_INFO[method.toLowerCase()]?.blockchain ?? false;
}

// --- Chain helpers ---

export function getChainName(chainId: number | undefined): string {
  if (chainId === undefined || chainId === 0) return "unknown";
  return CHAINS[chainId]?.name ?? `Chain ${chainId}`;
}

export function getChainRpc(chainId: number): string | undefined {
  return CHAINS[chainId]?.rpcUrl;
}

// --- Token helpers ---

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
