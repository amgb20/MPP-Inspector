import Table from "cli-table3";
import boxen from "boxen";
import chalk from "chalk";
import type { CompareEntry, MppEndpoint, BenchmarkResult, LatencyStats } from "../types.js";
import { formatDuration, formatPaymentMethod, section, label } from "../utils/format.js";

export function displayPriceComparison(entries: readonly CompareEntry[]): void {
  const header = boxen(`  ${chalk.bold("MPP Price Comparison")}`, {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    borderStyle: "round",
    borderColor: "cyan",
  });
  console.log("\n" + header);
  console.log();

  const table = new Table({
    head: ["Service", "Price", "Method", "Intent", "Currency", "Chain"].map((h) => chalk.bold(h)),
    style: { head: [], border: [] },
  });

  for (const entry of entries) {
    if (entry.error) {
      table.push([entry.service, chalk.red(entry.error), "-", "-", "-", "-"]);
    } else {
      table.push([
        entry.service,
        chalk.green(`$${entry.price}`),
        formatPaymentMethod(entry.paymentMethod),
        entry.intent,
        entry.currency,
        entry.chain,
      ]);
    }
  }

  console.log(table.toString());

  const valid = entries.filter((e) => !e.error);
  if (valid.length > 0) {
    const cheapest = valid.reduce((min, e) =>
      parseFloat(e.price) < parseFloat(min.price) ? e : min,
    );
    console.log();
    console.log(
      `  ${chalk.green("Cheapest:")} ${cheapest.service} ($${cheapest.price}/query via ${formatPaymentMethod(cheapest.paymentMethod)})`,
    );

    const sessionEnabled = valid.filter((e) => e.intent === "session");
    if (sessionEnabled.length > 0) {
      console.log(
        `  ${chalk.blue("Session-enabled:")} ${sessionEnabled.map((e) => e.service).join(", ")} (cheaper at volume)`,
      );
    }

    // Group by payment method
    const byMethod = new Map<string, CompareEntry[]>();
    for (const entry of valid) {
      const list = byMethod.get(entry.paymentMethod) ?? [];
      list.push(entry);
      byMethod.set(entry.paymentMethod, list);
    }
    if (byMethod.size > 1) {
      console.log();
      console.log(`  ${chalk.dim("Payment methods available:")}`);
      for (const [method, entries] of byMethod) {
        console.log(
          `    ${formatPaymentMethod(method)}: ${entries.map((e) => e.service).join(", ")}`,
        );
      }
    }
  }
  console.log();
}

export function displayEndpointTable(endpoints: readonly MppEndpoint[], domain: string): void {
  console.log(`\n  Discovered ${chalk.bold(String(endpoints.length))} MPP-enabled endpoints:\n`);

  const table = new Table({
    head: ["Endpoint", "Price", "Method", "Description"].map((h) => chalk.bold(h)),
    style: { head: [], border: [] },
  });

  for (const ep of endpoints) {
    table.push([
      `${ep.method} ${ep.path}`,
      ep.price ? chalk.green(`$${ep.price}`) : chalk.dim("unknown"),
      ep.paymentMethod ? formatPaymentMethod(ep.paymentMethod) : chalk.dim("-"),
      ep.description ?? "",
    ]);
  }

  console.log(table.toString());
  console.log();
  console.log(`  ${chalk.dim("Service manifest:")} https://${domain}/.well-known/mpp.json`);
  console.log(`  ${chalk.dim("Agent discovery:")}  https://${domain}/llms.txt`);
  console.log();
}

function formatLatency(stats: LatencyStats): string {
  return [
    label("p50:", formatDuration(stats.p50)),
    label("p95:", formatDuration(stats.p95)),
    label("p99:", formatDuration(stats.p99)),
    label("avg:", formatDuration(stats.avg)),
  ].join("\n");
}

export function displayBenchmarkResults(result: BenchmarkResult, url: string): void {
  const header = boxen(
    `  ${chalk.bold("MPP Benchmark")}\n  ${chalk.dim("Target:")} ${url}\n  ${chalk.dim("Requests:")} ${result.totalRequests} | ${chalk.dim("Successful:")} ${result.successful}`,
    {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderStyle: "round",
      borderColor: "cyan",
    },
  );
  console.log("\n" + header);

  const successRate = ((result.successful / result.totalRequests) * 100).toFixed(0);
  const statusLine = `${result.successful}/${result.totalRequests} (${successRate}%)`;
  const failLine =
    result.failed > 0
      ? `${result.failed}/${result.totalRequests} (${result.errors.join(", ")})`
      : "0";

  const details = [
    label("Successful:", chalk.green(statusLine)),
    label("Failed:", result.failed > 0 ? chalk.red(failLine) : failLine),
    "",
    chalk.dim("  Latency (total round-trip including payment):"),
    formatLatency(result.latencyTotal),
    "",
    chalk.dim("  Latency (payment only):"),
    formatLatency(result.latencyPayment),
    "",
    label("Total spent:", `${result.totalSpent}`),
    label("Total gas:", `${result.totalGas}`),
    label("Throughput:", `${result.throughput.toFixed(1)} req/s`),
  ].join("\n");

  console.log("\n" + section("Results", details));
  console.log();
}

export function compareToJson(entries: readonly CompareEntry[]): object {
  return { entries };
}

export function endpointsToJson(endpoints: readonly MppEndpoint[], domain: string): object {
  return { domain, endpoints };
}

export function benchmarkToJson(result: BenchmarkResult, url: string): object {
  return { url, result };
}
