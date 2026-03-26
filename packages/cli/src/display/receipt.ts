import chalk from "chalk";
import type { MppReceipt, ReceiptValidation } from "../types.js";
import { check, label, section } from "../utils/format.js";
import { truncateAddress } from "../utils/format.js";

export function displayReceipt(receipt: MppReceipt, validation: ReceiptValidation): void {
  const details = [
    label("Receipt ID:", receipt.receiptId || chalk.dim("(none)")),
    label("Timestamp:", receipt.timestamp ? new Date(receipt.timestamp * 1000).toISOString() : chalk.dim("(none)")),
    label("Credential:", receipt.credential ? truncateAddress(receipt.credential, 8, 4) : chalk.dim("(none)")),
    receipt.challengeId ? label("Challenge ID:", truncateAddress(receipt.challengeId, 8, 4)) : "",
    receipt.amount ? label("Amount:", receipt.amount) : "",
  ]
    .filter(Boolean)
    .join("\n");

  const checks = [
    check(validation.base64Valid, "Base64 decoding valid"),
    check(validation.jsonValid, "JSON structure valid"),
    check(validation.requiredFieldsPresent, "Required fields present"),
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

export function receiptToJson(receipt: MppReceipt, validation: ReceiptValidation): object {
  return { receipt, validation };
}
