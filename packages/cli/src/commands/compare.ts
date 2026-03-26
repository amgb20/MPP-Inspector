import { Command } from "commander";
import chalk from "chalk";
import { rawRequest } from "../utils/http.js";
import { parseChallengeHeader } from "../utils/parser.js";
import { displayPriceComparison, compareToJson } from "../display/table.js";
import { getTokenSymbol, getChainName } from "../utils/chains.js";
import type { CompareEntry } from "../types.js";

export const compareCommand = new Command("compare")
  .description("Compare pricing across MPP services")
  .argument("<urls...>", "URLs to compare (2 or more)")
  .option("--json", "Output raw JSON instead of formatted display")
  .option("--timeout <ms>", "Request timeout in milliseconds", "15000")
  .action(async (urls: string[], options) => {
    if (urls.length < 2) {
      console.error("Error: Provide at least 2 URLs to compare");
      process.exit(1);
    }

    const timeout = parseInt(options.timeout);

    const results = await Promise.all(
      urls.map(async (url): Promise<CompareEntry> => {
        const hostname = new URL(url).hostname;
        try {
          const response = await rawRequest(url, { timeout });

          if (response.status !== 402) {
            return {
              url,
              service: hostname,
              price: "0",
              intent: "-",
              currency: "-",
              chain: "-",
              error: `HTTP ${response.status}`,
            };
          }

          const wwwAuth = response.headers.get("www-authenticate");
          if (!wwwAuth?.toLowerCase().startsWith("payment ")) {
            return {
              url,
              service: hostname,
              price: "0",
              intent: "-",
              currency: "-",
              chain: "-",
              error: "No MPP header",
            };
          }

          const challenge = parseChallengeHeader(wwwAuth);

          return {
            url,
            service: hostname,
            price: challenge.amount,
            intent: challenge.intent,
            currency: getTokenSymbol(challenge.currency) ?? "unknown",
            chain: getChainName(challenge.chainId),
          };
        } catch (err) {
          return {
            url,
            service: hostname,
            price: "0",
            intent: "-",
            currency: "-",
            chain: "-",
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }
      }),
    );

    if (options.json) {
      console.log(JSON.stringify(compareToJson(results), null, 2));
    } else {
      displayPriceComparison(results);
    }
  });
