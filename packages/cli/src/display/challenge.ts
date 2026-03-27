import boxen from "boxen";
import chalk from "chalk";
import type { MppChallenge, MppVerification, MppProblemDetails } from "../types.js";
import {
  truncateAddress,
  formatAmount,
  formatExpiry,
  formatChainName,
  formatPaymentMethod,
  check,
  label,
  section,
} from "../utils/format.js";
import { resolveCurrency, getPaymentMethodInfo } from "../utils/chains.js";

export function displayChallenge(
  url: string,
  challenge: MppChallenge,
  verification: MppVerification,
  problemDetails?: MppProblemDetails | null,
): void {
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

  const req = challenge.requestDecoded;
  const intentDesc =
    challenge.intent === "charge"
      ? "charge (one-time payment)"
      : challenge.intent === "session"
        ? "session (streaming/prepaid)"
        : challenge.intent;

  const currencyDisplay = req?.currency ? resolveCurrency(req.currency) : "N/A";
  const amountDisplay = req?.amount
    ? `${formatAmount(req.amount, req.currency)} (${chalk.green("$" + req.amount)})`
    : chalk.dim("(in request payload)");

  // Resolve description from header or problem details body
  const description = challenge.description ?? problemDetails?.detail;

  const details = [
    label(
      "Challenge ID:",
      challenge.id ? truncateAddress(challenge.id, 12, 0) : chalk.dim("(none)"),
    ),
    label("Realm:", challenge.realm || chalk.dim("(none)")),
    label("Method:", formatPaymentMethod(challenge.method) || chalk.dim("(none)")),
    label("Intent:", intentDesc),
    label("Amount:", amountDisplay),
    label("Currency:", currencyDisplay),
    req?.recipient ? label("Recipient:", truncateAddress(req.recipient)) : "",
    req?.chainId ? label("Chain:", formatChainName(req.chainId)) : "",
    label("Expires:", formatExpiry(challenge.expires)),
    description ? label("Description:", `"${description}"`) : "",
  ]
    .filter(Boolean)
    .join("\n");

  console.log("\n" + section("Challenge Details", details));

  // Show decoded request params
  if (req && Object.keys(req).length > 0) {
    const reqLines = Object.entries(req)
      .map(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          return label(`${key}:`, JSON.stringify(value));
        }
        return label(`${key}:`, String(value));
      })
      .join("\n");
    console.log("\n" + section("Request Params (decoded)", reqLines));
  }

  // Show Problem Details body (RFC 9457) if present
  if (problemDetails) {
    const pdLines = [
      problemDetails.type ? label("type:", problemDetails.type) : "",
      problemDetails.title ? label("title:", problemDetails.title) : "",
      problemDetails.detail ? label("detail:", `"${problemDetails.detail}"`) : "",
      problemDetails.challengeId ? label("challengeId:", problemDetails.challengeId) : "",
    ].filter(Boolean);

    // Cross-reference: does body challengeId match header id?
    if (problemDetails.challengeId && challenge.id) {
      const match = problemDetails.challengeId === challenge.id;
      pdLines.push(
        match
          ? `  ${chalk.green("\u2713")} ${chalk.dim("challengeId matches header id")}`
          : `  ${chalk.red("\u2717")} ${chalk.dim(`challengeId mismatch: body="${truncateAddress(problemDetails.challengeId, 12, 0)}" vs header="${truncateAddress(challenge.id, 12, 0)}"`)}`,
      );
    }

    if (pdLines.length > 0) {
      console.log("\n" + section("Problem Details (RFC 9457)", pdLines.join("\n")));
    }
  }

  // Raw header display
  const rawLines = challenge.raw
    .replace(/,\s*/g, ",\n    ")
    .split("\n")
    .map((l) => `  ${l}`)
    .join("\n");
  console.log("\n" + section("Raw Headers", `  WWW-Authenticate: ${rawLines}`));

  // Verification checks
  const checks = [
    check(verification.signatureValid, "Challenge signature valid"),
    check(verification.expiryValid, "Expiry in future"),
    check(
      verification.methodKnown,
      `Payment method known (${formatPaymentMethod(challenge.method)})`,
    ),
    check(verification.amountParseable, "Amount parseable"),
    check(verification.recipientValid, "Recipient valid"),
    check(
      verification.currencyKnown,
      "Currency recognized" + (currencyDisplay !== "N/A" ? ` (${currencyDisplay})` : ""),
    ),
  ].join("\n");
  console.log("\n" + section("Verification", checks));

  if (verification.errors.length > 0) {
    console.log();
    for (const err of verification.errors) {
      console.log(`  ${chalk.red("!")} ${err}`);
    }
  }

  console.log();
  const methodInfo = getPaymentMethodInfo(challenge.method);
  const methodDesc = methodInfo ? methodInfo.description : `${challenge.method} payment`;
  console.log(label("Payment method:", methodDesc));
  if (req?.amount) {
    console.log(
      label("Estimated cost:", `$${req.amount} USD${methodInfo?.blockchain ? " + gas" : ""}`),
    );
  }
  console.log();
}

export function challengeToJson(
  url: string,
  challenge: MppChallenge,
  verification: MppVerification,
  problemDetails?: MppProblemDetails | null,
): object {
  return {
    url,
    challenge,
    verification,
    ...(problemDetails ? { problemDetails } : {}),
  };
}
