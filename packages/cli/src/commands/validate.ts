import { Command } from "commander";
import { readFileSync } from "node:fs";
import { decodeReceipt } from "../utils/parser.js";
import { displayReceipt, receiptToJson } from "../display/receipt.js";

export const validateCommand = new Command("validate")
  .description("Validate a receipt or credential")
  .argument("[receipt]", "Base64-encoded receipt string")
  .option("--file <path>", "Read receipt from file")
  .option("--json", "Output raw JSON instead of formatted display")
  .action(async (receiptArg: string | undefined, options) => {
    let input: string;

    if (options.file) {
      input = readFileSync(options.file, "utf-8").trim();
    } else if (receiptArg) {
      input = receiptArg.trim();
    } else {
      console.error("Error: Provide a receipt string or use --file <path>");
      process.exit(1);
    }

    const { receipt, validation } = decodeReceipt(input);

    if (options.json) {
      console.log(JSON.stringify(receiptToJson(receipt, validation), null, 2));
    } else {
      displayReceipt(receipt, validation);
    }
  });
