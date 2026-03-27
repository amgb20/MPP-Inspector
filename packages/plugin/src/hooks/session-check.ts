import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();

const MPP_SIGNALS = [
  ".well-known/mpp.json",
  "402",
  "WWW-Authenticate",
  "Payment Required",
  "mpp-inspector",
  "machine-payments",
  "machinepayments",
  "challengeId",
  "pathUSD",
];

function checkFile(path: string): boolean {
  try {
    if (!existsSync(path)) return false;
    const content = readFileSync(path, "utf-8");
    return MPP_SIGNALS.some((signal) => content.includes(signal));
  } catch {
    return false;
  }
}

function detectMpp(): boolean {
  if (existsSync(join(cwd, ".well-known", "mpp.json"))) return true;
  if (existsSync(join(cwd, "public", ".well-known", "mpp.json"))) return true;

  const filesToCheck = ["package.json", "README.md", "llms.txt"];

  for (const file of filesToCheck) {
    if (checkFile(join(cwd, file))) return true;
  }

  return false;
}

if (detectMpp()) {
  const message = [
    "This project appears to use the Machine Payments Protocol.",
    "MPP Inspector tools are available: mpp_inspect, mpp_scan, mpp_compare, mpp_validate, mpp_flow.",
  ].join(" ");

  process.stdout.write(message);
}
