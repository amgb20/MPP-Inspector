import { Command } from "commander";
import { readFileSync } from "node:fs";
import { decodeReceipt, decodeCredential } from "../utils/parser.js";
import {
  displayReceipt,
  displayCredential,
  receiptToJson,
  credentialToJson,
} from "../display/receipt.js";

export const validateCommand = new Command("validate")
  .description("Validate a receipt or credential")
  .argument("[input]", "Base64-encoded receipt or credential string")
  .option("--file <path>", "Read input from file")
  .option("--credential", "Parse as credential instead of receipt")
  .option("--json", "Output raw JSON instead of formatted display")
  .action(async (inputArg: string | undefined, options) => {
    let input: string;

    if (options.file) {
      input = readFileSync(options.file, "utf-8").trim();
    } else if (inputArg) {
      input = inputArg.trim();
    } else {
      console.error("Error: Provide an input string or use --file <path>");
      process.exit(1);
    }

    if (options.credential) {
      const { credential, validation } = decodeCredential(input);

      if (options.json) {
        console.log(JSON.stringify(credentialToJson(credential, validation), null, 2));
      } else {
        displayCredential(credential, validation);
      }
    } else {
      const { receipt, validation } = decodeReceipt(input);

      if (options.json) {
        console.log(JSON.stringify(receiptToJson(receipt, validation), null, 2));
      } else {
        displayReceipt(receipt, validation);
      }
    }
  });
