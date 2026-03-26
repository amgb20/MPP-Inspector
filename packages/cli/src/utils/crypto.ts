import { isAddress } from "viem";
import type { MppChallenge, MppVerification } from "../types.js";
import { isKnownPaymentMethod, isBlockchainMethod, resolveCurrency } from "./chains.js";

export function verifyChallengeFields(challenge: MppChallenge): MppVerification {
  const errors: string[] = [];
  const req = challenge.requestDecoded;

  // Method validation
  const methodKnown = isKnownPaymentMethod(challenge.method);
  if (!methodKnown && challenge.method) {
    errors.push(`Unknown payment method: ${challenge.method}`);
  }
  if (!challenge.method) {
    errors.push("Missing payment method");
  }

  // Expiry validation (ISO 8601 string)
  let expiryValid = false;
  if (challenge.expires) {
    const expiryDate = new Date(challenge.expires);
    if (isNaN(expiryDate.getTime())) {
      errors.push(`Invalid expires format: ${challenge.expires}`);
    } else {
      expiryValid = expiryDate.getTime() > Date.now();
      if (!expiryValid) {
        errors.push(`Challenge expired at ${challenge.expires}`);
      }
    }
  } else {
    errors.push("Missing expires field");
  }

  // Amount validation (from decoded request params)
  let amountParseable = false;
  if (req?.amount) {
    const num = parseFloat(req.amount);
    amountParseable = !isNaN(num) && num >= 0;
    if (!amountParseable) errors.push(`Invalid amount: ${req.amount}`);
  } else if (challenge.request) {
    // request exists but we couldn't find amount — might be method-specific
    amountParseable = true; // don't flag as error, method might use different field
  }

  // Recipient validation (only for blockchain methods)
  let recipientValid: boolean | null = null;
  if (req?.recipient) {
    if (isBlockchainMethod(challenge.method)) {
      recipientValid = isAddress(req.recipient);
      if (!recipientValid) errors.push(`Invalid recipient address: ${req.recipient}`);
    } else {
      recipientValid = true; // non-blockchain methods don't need address validation
    }
  }

  // Currency validation (method-specific)
  let currencyKnown: boolean | null = null;
  if (req?.currency) {
    const resolved = resolveCurrency(req.currency);
    currencyKnown = resolved !== "unknown";
    if (!currencyKnown) {
      // Not an error — just unknown to our registry
      currencyKnown = null;
    }
  }

  // Signature verification requires knowing the signing scheme.
  // MPP uses method-specific signatures — without the full spec
  // we mark as null (unverifiable) rather than false.
  const signatureValid: boolean | null = null;

  return {
    signatureValid,
    expiryValid,
    methodKnown,
    amountParseable,
    recipientValid,
    currencyKnown,
    errors,
  };
}
