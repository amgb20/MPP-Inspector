import { decodeReceipt, receiptToJson } from "mpp-inspector";

export interface ValidateInput {
  receipt: string;
}

export async function validateReceipt(input: ValidateInput): Promise<object> {
  if (!input.receipt || input.receipt.trim().length === 0) {
    return { error: "Provide a base64-encoded receipt string" };
  }

  const { receipt, validation } = decodeReceipt(input.receipt.trim());
  return receiptToJson(receipt, validation);
}
