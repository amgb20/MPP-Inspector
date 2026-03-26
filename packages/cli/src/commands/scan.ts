import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { fetchJson, rawRequest } from "../utils/http.js";
import { parseChallengeHeader, parseMppManifest } from "../utils/parser.js";
import { displayEndpointTable, endpointsToJson } from "../display/table.js";
import type { MppEndpoint } from "../types.js";

export const scanCommand = new Command("scan")
  .description("Discover MPP endpoints on a domain")
  .argument("<domain>", "Domain to scan (e.g., findata.example.com)")
  .option("--json", "Output raw JSON instead of formatted display")
  .option("--probe", "Also probe common API paths with HEAD requests")
  .option("--timeout <ms>", "Request timeout in milliseconds", "10000")
  .action(async (domain: string, options) => {
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    const baseUrl = cleanDomain.includes("localhost") || cleanDomain.includes("127.0.0.1")
      ? `http://${cleanDomain}`
      : `https://${cleanDomain}`;
    const endpoints: MppEndpoint[] = [];
    const timeout = parseInt(options.timeout);

    if (!options.json) {
      console.log(`\n  Scanning ${chalk.bold(cleanDomain)} for MPP endpoints...\n`);
    }

    // Check /.well-known/mpp.json
    const manifestSpinner = options.json ? null : ora("  Checking /.well-known/mpp.json").start();
    try {
      const { data, status } = await fetchJson(`${baseUrl}/.well-known/mpp.json`, timeout);
      if (status === 200 && data) {
        manifestSpinner?.succeed(`  Checking /.well-known/mpp.json     ${chalk.green("\u2713 Found")}`);
        const manifest = parseMppManifest(data);
        for (const ep of manifest.endpoints) {
          endpoints.push(ep);
        }
      } else {
        manifestSpinner?.fail(`  Checking /.well-known/mpp.json     ${chalk.dim("Not found")}`);
      }
    } catch {
      manifestSpinner?.fail(`  Checking /.well-known/mpp.json     ${chalk.dim("Error")}`);
    }

    // Check /llms.txt
    const llmsSpinner = options.json ? null : ora("  Checking /llms.txt").start();
    try {
      const response = await rawRequest(`${baseUrl}/llms.txt`, { timeout });
      if (response.status === 200 && response.body.length > 0) {
        llmsSpinner?.succeed(`  Checking /llms.txt                 ${chalk.green("\u2713 Found")}`);
      } else {
        llmsSpinner?.fail(`  Checking /llms.txt                 ${chalk.dim("Not found")}`);
      }
    } catch {
      llmsSpinner?.fail(`  Checking /llms.txt                 ${chalk.dim("Error")}`);
    }

    // Check /health
    const healthSpinner = options.json ? null : ora("  Checking /health").start();
    try {
      const response = await rawRequest(`${baseUrl}/health`, { timeout });
      if (response.status === 200) {
        healthSpinner?.succeed(`  Checking /health                   ${chalk.green("\u2713 200 OK")}`);
      } else {
        healthSpinner?.info(`  Checking /health                   ${chalk.dim(String(response.status))}`);
      }
    } catch {
      healthSpinner?.fail(`  Checking /health                   ${chalk.dim("Error")}`);
    }

    // Probe common API paths
    if (options.probe) {
      const probePaths = [
        "/v1/", "/api/", "/api/v1/",
        "/v1/search", "/v1/data", "/v1/query",
      ];

      for (const path of probePaths) {
        try {
          const response = await rawRequest(`${baseUrl}${path}`, { method: "HEAD", timeout: 5000 });
          if (response.status === 402) {
            const wwwAuth = response.headers.get("www-authenticate");
            if (wwwAuth?.toLowerCase().startsWith("payment ")) {
              const challenge = parseChallengeHeader(wwwAuth);
              const req = challenge.requestDecoded;
              endpoints.push({
                method: "GET",
                path,
                price: req?.amount,
                intent: challenge.intent,
                description: challenge.extra.description,
                paymentMethod: challenge.method,
              });
            }
          }
        } catch {
          // skip unreachable paths
        }
      }
    }

    if (options.json) {
      console.log(JSON.stringify(endpointsToJson(endpoints, cleanDomain), null, 2));
    } else {
      if (endpoints.length === 0) {
        console.log(`\n  ${chalk.yellow("No MPP endpoints discovered.")}`);
        console.log(`  Try --probe to check common API paths.\n`);
      } else {
        displayEndpointTable(endpoints, cleanDomain);
      }
    }
  });
