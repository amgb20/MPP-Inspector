import chalk from "chalk";
import type { MppReceipt, ReceiptValidation, MppCredential, CredentialValidation } from "../types.js";
import { check, label, section, formatPaymentMethod } from "../utils/format.js";
import { truncateAddress } from "../utils/format.js";

export function displayReceipt(receipt: MppReceipt, validation: ReceiptValidation): void {
  const details = [
    label("Challenge ID:", receipt.challengeId || chalk.dim("(none)")),
    label("Method:", receipt.method ? formatPaymentMethod(receipt.method) : chalk.dim("(none)")),
    label("Reference:", receipt.reference ? truncateAddress(receipt.reference, 10, 6) : chalk.dim("(none)")),
    label("Status:", receipt.status ? formatStatus(receipt.status) : chalk.dim("(none)")),
    label("Timestamp:", receipt.timestamp || chalk.dim("(none)")),
    receipt.settlement
      ? label("Settlement:", `${receipt.settlement.amount} ${receipt.settlement.currency.toUpperCase()}`)
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const checks = [
    check(validation.base64Valid, "Base64 decoding valid"),
    check(validation.jsonValid, "JSON structure valid"),
    check(validation.requiredFieldsPresent, "Required fields present (challengeId, method, reference, status, timestamp)"),
    check(validation.timestampValid, "Timestamp not in future"),
  ].join("\n");

  console.log("\n" + section("Receipt Validation", details + "\n\n" + checks));

  if (validation.errors.length > 0) {
    console.log();
    for (const err of validation.errors) {
      console.log(`  ${chalk.red("!")} ${err}`);
    }
  }
  console.log();
}

export function displayCredential(credential: MppCredential, validation: CredentialValidation): void {
  const details = [
    label("Source:", credential.source ? truncateAddress(credential.source, 10, 6) : chalk.dim("(none)")),
    "",
    chalk.dim("  Challenge:"),
    label("  ID:", credential.challenge.id || chalk.dim("(none)")),
    label("  Realm:", credential.challenge.realm || chalk.dim("(none)")),
    label("  Method:", credential.challenge.method ? formatPaymentMethod(credential.challenge.method) : chalk.dim("(none)")),
    label("  Intent:", credential.challenge.intent || chalk.dim("(none)")),
    credential.challenge.request ? label("  Request:", truncateAddress(credential.challenge.request, 16, 8)) : "",
    "",
    chalk.dim("  Payload:"),
    ...Object.entries(credential.payload).map(([key, value]) =>
      label(`  ${key}:`, typeof value === "string" ? truncateAddress(String(value), 16, 8) : JSON.stringify(value)),
    ),
  ]
    .filter(Boolean)
    .join("\n");

  const checks = [
    check(validation.base64Valid, "Base64 decoding valid"),
    check(validation.jsonValid, "JSON structure valid"),
    check(validation.structureValid, "Overall structure valid"),
    check(validation.challengePresent, "Challenge object present"),
    check(validation.sourcePresent, "Source field present"),
    check(validation.payloadPresent, "Payload object present"),
  ].join("\n");

  console.log("\n" + section("Credential Validation", details + "\n\n" + checks));

  if (validation.errors.length > 0) {
    console.log();
    for (const err of validation.errors) {
      console.log(`  ${chalk.red("!")} ${err}`);
    }
  }
  console.log();
}

function formatStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "success":
      return chalk.green("success");
    case "pending":
      return chalk.yellow("pending");
    case "failed":
      return chalk.red("failed");
    default:
      return status;
  }
}

export function receiptToJson(receipt: MppReceipt, validation: ReceiptValidation): object {
  return { receipt, validation };
}

export function credentialToJson(credential: MppCredential, validation: CredentialValidation): object {
  return { credential, validation };
}
