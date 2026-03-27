import chalk from "chalk";
import { getChainName, resolveCurrency } from "./chains.js";

export function truncateAddress(addr: string, start = 6, end = 4): string {
  if (addr.length <= start + end + 3) return addr;
  return `${addr.slice(0, start)}...${addr.slice(-end)}`;
}

export function formatAmount(amount: string | undefined, currency?: string): string {
  if (!amount) return "unknown";
  const symbol = currency ? resolveCurrency(currency) : undefined;
  const num = parseFloat(amount);
  if (isNaN(num)) return `${amount} ${symbol ?? ""}`.trim();
  const formatted = num < 0.01 ? num.toFixed(6) : num < 1 ? num.toFixed(4) : num.toFixed(2);
  return symbol ? `${formatted} ${symbol}` : formatted;
}

export function formatUsd(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return `$${amount}`;
  return `$${num < 0.01 ? num.toFixed(4) : num.toFixed(3)}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function formatExpiry(expires: string): string {
  if (!expires) return chalk.dim("none");
  const expiryDate = new Date(expires);
  if (isNaN(expiryDate.getTime())) return chalk.dim(expires);
  const remaining = expiryDate.getTime() - Date.now();
  if (remaining <= 0) return chalk.red("expired");
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${expires} (${minutes}m ${seconds.toString().padStart(2, "0")}s remaining)`;
}

export function formatChainName(chainId: number | undefined): string {
  if (chainId === undefined || chainId === 0) return "N/A";
  return `${getChainName(chainId)} (${chainId})`;
}

export function formatPaymentMethod(method: string): string {
  const names: Record<string, string> = {
    tempo: "Tempo",
    stripe: "Stripe",
    lightning: "Lightning",
    solana: "Solana",
    card: "Card",
    custom: "Custom",
  };
  return names[method.toLowerCase()] ?? method;
}

export function progressBar(current: number, total: number, width = 40): string {
  const ratio = Math.min(current / total, 1);
  const filled = Math.round(width * ratio);
  const empty = width - filled;
  const bar = chalk.green("\u2588".repeat(filled)) + chalk.gray("\u2591".repeat(empty));
  return `${bar} ${current}/${total}`;
}

export function check(passed: boolean | null, label: string): string {
  if (passed === null) return `  ${chalk.yellow("?")} ${label} ${chalk.dim("(unverifiable)")}`;
  return passed ? `  ${chalk.green("\u2713")} ${label}` : `  ${chalk.red("\u2717")} ${label}`;
}

export function label(key: string, value: string, keyWidth = 16): string {
  return `  ${chalk.dim(key.padEnd(keyWidth))} ${value}`;
}

export function section(title: string, content: string): string {
  const border =
    chalk.dim("\u250C\u2500 ") +
    chalk.bold(title) +
    " " +
    chalk.dim("\u2500".repeat(Math.max(0, 55 - title.length)));
  const bottom = chalk.dim("\u2514" + "\u2500".repeat(60));
  const lines = content
    .split("\n")
    .map((line) => chalk.dim("\u2502") + " " + line)
    .join("\n");
  return `${border}\n${lines}\n${bottom}`;
}
