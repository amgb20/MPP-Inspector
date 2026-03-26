import boxen from "boxen";
import chalk from "chalk";
import type { MppChallenge, MppVerification } from "../types.js";
import { truncateAddress, formatAmount, formatTimeRemaining, formatChainName, check, label, section } from "../utils/format.js";
import { getTokenSymbol } from "../utils/chains.js";

export function displayChallenge(url: string, challenge: MppChallenge, verification: MppVerification): void {
  const header = boxen(
    `  ${chalk.bold("MPP Challenge Inspection")}\n  ${chalk.dim("URL:")} ${url}`,
    {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderStyle: "round",
      borderColor: "cyan",
    },
  );
  console.log("\n" + header);

  console.log();
  console.log(label("Status:", chalk.yellow("402 Payment Required")));
  console.log(label("Protocol:", "MPP (Payment HTTP Authentication Scheme)"));

  const intentDesc = challenge.intent === "charge" ? "charge (one-time payment)" : `${challenge.intent} (streaming)`;
  const tokenSymbol = getTokenSymbol(challenge.currency);
  const currencyDisplay = tokenSymbol
    ? `${truncateAddress(challenge.currency)} (${tokenSymbol})`
    : truncateAddress(challenge.currency);
  const expiresDisplay = challenge.expiresAt
    ? `${new Date(challenge.expiresAt * 1000).toISOString()} (${formatTimeRemaining(challenge.expiresAt)})`
    : "none";

  const details = [
    label("Intent:", intentDesc),
    label("Amount:", `${formatAmount(challenge.amount, challenge.currency)} (${chalk.green("$" + challenge.amount)})`),
    label("Currency:", currencyDisplay),
    label("Recipient:", truncateAddress(challenge.recipient)),
    label("Chain:", formatChainName(challenge.chainId)),
    label("Expires:", expiresDisplay),
    label("Challenge ID:", challenge.challengeId ? truncateAddress(challenge.challengeId, 12, 0) : "none"),
    challenge.description ? label("Description:", `"${challenge.description}"`) : "",
  ]
    .filter(Boolean)
    .join("\n");

  console.log("\n" + section("Challenge Details", details));

  const rawLines = challenge.raw
    .replace(/,\s*/g, ",\n    ")
    .split("\n")
    .map((l) => `  ${l}`)
    .join("\n");
  console.log("\n" + section("Raw Headers", `  WWW-Authenticate: ${rawLines}`));

  const checks = [
    check(verification.signatureValid, "Challenge signature valid"),
    check(verification.expiryValid, "Expiry in future"),
    check(verification.currencyKnown, "Currency is known token" + (tokenSymbol ? ` (${tokenSymbol})` : "")),
    check(verification.recipientValid, "Recipient is valid address"),
    check(verification.amountParseable, "Amount parseable"),
  ].join("\n");
  console.log("\n" + section("Verification", checks));

  if (verification.errors.length > 0) {
    console.log();
    for (const err of verification.errors) {
      console.log(`  ${chalk.red("!")} ${err}`);
    }
  }

  console.log();
  const method = challenge.intent === "session" ? "Tempo session" : "Tempo charge";
  console.log(label("Payment methods:", method));
  console.log(label("Estimated cost:", `$${challenge.amount} USD + ~$0.0001 gas`));
  console.log();
}

export function challengeToJson(url: string, challenge: MppChallenge, verification: MppVerification): object {
  return { url, challenge, verification };
}
