import boxen from "boxen";
import chalk from "chalk";
import type { FlowStep } from "../types.js";
import { formatDuration, label, section } from "../utils/format.js";

export function displayFlowHeader(url: string, walletAddress: string, balance?: string): void {
  const lines = [`  ${chalk.bold("MPP Payment Flow")}`, `  ${chalk.dim("URL:")} ${url}`, `  ${chalk.dim("Wallet:")} ${walletAddress}`];
  if (balance) lines.push(`  ${chalk.dim("Balance:")} ${balance}`);

  console.log(
    "\n" +
      boxen(lines.join("\n"), {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        borderStyle: "round",
        borderColor: "cyan",
      }),
  );
}

export function displayFlowStep(step: FlowStep, index: number, total: number): void {
  const timing = chalk.dim(`[${formatDuration(step.timing)}]`);
  const statusIcon =
    step.status === "success" ? chalk.green("\u2713") : step.status === "failure" ? chalk.red("\u2717") : chalk.yellow("-");

  console.log();
  console.log(`  ${statusIcon} ${chalk.bold(`Step ${index + 1}/${total}`)} \u2500 ${step.name}  ${timing}`);

  for (const [key, value] of Object.entries(step.details)) {
    if (value !== undefined && value !== null) {
      console.log(`    ${chalk.dim(key + ":")} ${value}`);
    }
  }
}

export function displayFlowSummary(steps: readonly FlowStep[], totalCost?: { amount: string; gas: string }): void {
  const totalTime = steps.reduce((sum, s) => sum + s.timing, 0);
  const paymentSteps = steps.filter((s) => s.name.toLowerCase().includes("sign") || s.name.toLowerCase().includes("retry"));
  const paymentTime = paymentSteps.reduce((sum, s) => sum + s.timing, 0);
  const paymentPct = totalTime > 0 ? ((paymentTime / totalTime) * 100).toFixed(1) : "0";

  const lines = [
    label("Total time:", formatDuration(totalTime)),
    label("Payment time:", `${formatDuration(paymentTime)} (${paymentPct}% of total)`),
  ];

  if (totalCost) {
    const total = (parseFloat(totalCost.amount) + parseFloat(totalCost.gas)).toFixed(4);
    lines.push(label("Amount paid:", `${totalCost.amount}`));
    lines.push(label("Gas cost:", `${totalCost.gas}`));
    lines.push(label("Total cost:", `${total}`));
  }

  console.log("\n" + section("Summary", lines.join("\n")));
  console.log();
}

export function flowToJson(steps: readonly FlowStep[], summary: Record<string, unknown>): object {
  return { steps, summary };
}
