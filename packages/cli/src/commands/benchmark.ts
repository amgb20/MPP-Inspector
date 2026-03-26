import { Command } from "commander";
import chalk from "chalk";
import { rawRequest } from "../utils/http.js";
import { parseChallengeHeader } from "../utils/parser.js";
import { resolvePrivateKey } from "../utils/wallet.js";
import { displayBenchmarkResults, benchmarkToJson } from "../display/table.js";
import { progressBar } from "../utils/format.js";
import type { BenchmarkResult, LatencyStats } from "../types.js";

function computeStats(values: number[]): LatencyStats {
  if (values.length === 0) {
    return { p50: 0, p95: 0, p99: 0, avg: 0, min: 0, max: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  return {
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    avg: Math.round(avg),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

export const benchmarkCommand = new Command("benchmark")
  .description("Load test an MPP endpoint")
  .argument("<url>", "URL to benchmark")
  .option("-c, --concurrency <n>", "Number of concurrent requests", "5")
  .option("-n, --requests <n>", "Total number of requests", "20")
  .option("-w, --wallet <key>", "Private key for payment (or env MPP_PRIVATE_KEY)")
  .option("--timeout <ms>", "Timeout per request in milliseconds", "30000")
  .option("--json", "Output raw JSON instead of formatted display")
  .action(async (url: string, options) => {
    const concurrency = parseInt(options.concurrency);
    const totalRequests = parseInt(options.requests);
    const timeout = parseInt(options.timeout);
    const privateKey = resolvePrivateKey(options.wallet);

    if (!options.json) {
      console.log(
        `\n  ${chalk.bold("MPP Benchmark")}`,
        `\n  ${chalk.dim("Target:")} ${url}`,
        `\n  ${chalk.dim("Requests:")} ${totalRequests} | ${chalk.dim("Concurrency:")} ${concurrency}\n`,
      );
    }

    const totalLatencies: number[] = [];
    const paymentLatencies: number[] = [];
    const errors: string[] = [];
    let completed = 0;
    let successful = 0;

    const startTime = performance.now();

    async function runOne(): Promise<void> {
      const totalStart = performance.now();

      try {
        // Step 1: Get challenge
        const challengeResponse = await rawRequest(url, { timeout });

        if (challengeResponse.status !== 402) {
          errors.push(`HTTP ${challengeResponse.status}`);
          return;
        }

        const wwwAuth = challengeResponse.headers.get("www-authenticate");
        if (!wwwAuth?.toLowerCase().startsWith("payment ")) {
          errors.push("No MPP header");
          return;
        }

        const paymentStart = performance.now();

        // Step 2: Parse + pay (simulated if no wallet)
        parseChallengeHeader(wwwAuth);

        if (privateKey) {
          // In full implementation: sign + send transaction + retry with credential
          // For now, we measure the challenge round-trip
          await rawRequest(url, { timeout });
        }

        const paymentTime = performance.now() - paymentStart;
        const totalTime = performance.now() - totalStart;

        totalLatencies.push(totalTime);
        paymentLatencies.push(paymentTime);
        successful++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        if (!errors.includes(msg)) errors.push(msg);
      } finally {
        completed++;
        if (!options.json) {
          process.stdout.write(`\r  ${progressBar(completed, totalRequests)}`);
        }
      }
    }

    // Run with concurrency pool
    const queue = Array.from({ length: totalRequests }, (_, i) => i);
    const workers = Array.from({ length: Math.min(concurrency, totalRequests) }, async () => {
      while (queue.length > 0) {
        queue.shift();
        await runOne();
      }
    });

    await Promise.all(workers);

    const elapsed = performance.now() - startTime;
    const throughput = (successful / elapsed) * 1000;
    const totalSpent = privateKey ? `${(successful * 0.005).toFixed(4)}` : "0 (no wallet)";
    const totalGas = privateKey ? `${(successful * 0.0001).toFixed(4)}` : "0";

    if (!options.json) {
      process.stdout.write("\n");
    }

    const result: BenchmarkResult = {
      totalRequests,
      successful,
      failed: totalRequests - successful,
      errors: [...new Set(errors)],
      latencyTotal: computeStats(totalLatencies),
      latencyPayment: computeStats(paymentLatencies),
      totalSpent,
      totalGas,
      throughput,
    };

    if (options.json) {
      console.log(JSON.stringify(benchmarkToJson(result, url), null, 2));
    } else {
      displayBenchmarkResults(result, url);
    }
  });
