import { isAddress } from "viem";
import type { MppChallenge, MppVerification } from "../types.js";
import { getTokenInfo } from "./chains.js";

export function verifyChallengeFields(challenge: MppChallenge): MppVerification {
  const errors: string[] = [];

  const recipientValid = isAddress(challenge.recipient);
  if (!recipientValid) errors.push(`Invalid recipient address: ${challenge.recipient}`);

  let amountParseable = false;
  try {
    const num = parseFloat(challenge.amount);
    amountParseable = !isNaN(num) && num >= 0;
    if (!amountParseable) errors.push(`Invalid amount: ${challenge.amount}`);
  } catch {
    errors.push(`Cannot parse amount: ${challenge.amount}`);
  }

  const now = Math.floor(Date.now() / 1000);
  const expiryValid = challenge.expiresAt > now;
  if (!expiryValid && challenge.expiresAt > 0) {
    errors.push(`Challenge expired at ${new Date(challenge.expiresAt * 1000).toISOString()}`);
  }

  const tokenInfo = getTokenInfo(challenge.currency);
  const currencyKnown = tokenInfo !== undefined;
  if (!currencyKnown && challenge.currency) {
    errors.push(`Unknown currency token: ${challenge.currency}`);
  }

  // Signature verification requires knowing the signing scheme.
  // MPP uses EIP-712 typed data or similar — without the full spec
  // we mark as null (unverifiable) rather than false.
  const signatureValid = challenge.signature ? null : null;

  return {
    signatureValid,
    expiryValid,
    currencyKnown,
    recipientValid,
    amountParseable,
    errors,
  };
}
