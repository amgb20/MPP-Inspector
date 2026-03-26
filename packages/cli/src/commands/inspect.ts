import { Command } from "commander";
import chalk from "chalk";
import { rawRequest } from "../utils/http.js";
import { parseChallengeHeader } from "../utils/parser.js";
import { verifyChallengeFields } from "../utils/crypto.js";
import { displayChallenge, challengeToJson } from "../display/challenge.js";

export const inspectCommand = new Command("inspect")
  .description("Inspect a 402 challenge from an MPP endpoint")
  .argument("<url>", "URL to inspect")
  .option("-m, --method <method>", "HTTP method", "GET")
  .option("-H, --header <headers...>", "Additional headers")
  .option("-d, --data <body>", "Request body (for POST)")
  .option("--json", "Output raw JSON instead of formatted display")
  .option("--curl", "Output equivalent curl command")
  .option("--timeout <ms>", "Request timeout in milliseconds", "30000")
  .action(async (url: string, options) => {
    const response = await rawRequest(url, {
      method: options.method,
      headers: options.header,
      body: options.data,
      timeout: parseInt(options.timeout),
    });

    if (response.status !== 402) {
      if (options.json) {
        console.log(JSON.stringify({ error: `Server returned ${response.status}, not 402`, status: response.status }));
        return;
      }
      console.log(`\n  ${chalk.yellow("!")} Server returned ${chalk.bold(String(response.status))}, not 402.`);
      console.log(`  This endpoint may not be MPP-enabled.`);
      if (response.status === 200) {
        console.log(`  The endpoint returned content without requiring payment.`);
      }
      return;
    }

    const wwwAuth = response.headers.get("www-authenticate");
    if (!wwwAuth || !wwwAuth.toLowerCase().startsWith("payment ")) {
      if (options.json) {
        console.log(JSON.stringify({ error: "402 returned but no WWW-Authenticate: Payment header found" }));
        return;
      }
      console.log(`\n  ${chalk.yellow("!")} 402 returned but no ${chalk.bold("WWW-Authenticate: Payment")} header found.`);
      console.log("  This may be a standard 402, not MPP.");
      return;
    }

    const challenge = parseChallengeHeader(wwwAuth);
    const verification = verifyChallengeFields(challenge);

    if (options.json) {
      console.log(JSON.stringify(challengeToJson(url, challenge, verification), null, 2));
    } else {
      displayChallenge(url, challenge, verification);
    }

    if (options.curl) {
      console.log(`  ${chalk.dim("curl equivalent:")}`);
      console.log(`  curl -v "${url}"`);
      console.log();
    }
  });
