import chalk from "chalk";
import { getTokenSymbol, getChainName } from "./chains.js";

export function truncateAddress(addr: string, start = 6, end = 4): string {
  if (addr.length <= start + end + 3) return addr;
  return `${addr.slice(0, start)}...${addr.slice(-end)}`;
}

export function formatAmount(amount: string, currency?: string): string {
  const symbol = currency ? getTokenSymbol(currency) : undefined;
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

export function formatTimeRemaining(expiresAt: number): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = expiresAt - now;
  if (remaining <= 0) return chalk.red("expired");
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s remaining`;
}

export function formatChainName(chainId: number): string {
  return `${getChainName(chainId)} (${chainId})`;
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
  const border = chalk.dim("\u250C\u2500 ") + chalk.bold(title) + " " + chalk.dim("\u2500".repeat(Math.max(0, 55 - title.length)));
  const bottom = chalk.dim("\u2514" + "\u2500".repeat(60));
  const lines = content
    .split("\n")
    .map((line) => chalk.dim("\u2502") + " " + line)
    .join("\n");
  return `${border}\n${lines}\n${bottom}`;
}
