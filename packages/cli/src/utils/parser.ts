import type { MppChallenge, MppEndpoint, MppManifest, MppReceipt, ReceiptValidation } from "../types.js";

const KNOWN_CHALLENGE_FIELDS = new Set([
  "challengeId",
  "intent",
  "amount",
  "currency",
  "recipient",
  "chainId",
  "expiresAt",
  "signature",
  "description",
]);

export function parseAuthParams(raw: string): Record<string, string> {
  const params: Record<string, string> = {};
  let remaining = raw.trim();

  while (remaining.length > 0) {
    remaining = remaining.replace(/^[,\s]+/, "");
    if (remaining.length === 0) break;

    const eqIdx = remaining.indexOf("=");
    if (eqIdx === -1) break;

    const key = remaining.slice(0, eqIdx).trim();
    remaining = remaining.slice(eqIdx + 1).trimStart();

    let value: string;
    if (remaining.startsWith('"')) {
      let end = 1;
      while (end < remaining.length) {
        if (remaining[end] === "\\") {
          end += 2;
          continue;
        }
        if (remaining[end] === '"') break;
        end++;
      }
      value = remaining.slice(1, end).replace(/\\(.)/g, "$1");
      remaining = remaining.slice(end + 1);
    } else {
      const nextComma = remaining.indexOf(",");
      if (nextComma === -1) {
        value = remaining.trim();
        remaining = "";
      } else {
        value = remaining.slice(0, nextComma).trim();
        remaining = remaining.slice(nextComma);
      }
    }

    params[key] = value;
  }

  return params;
}

export function parseChallengeHeader(raw: string): MppChallenge {
  const prefixed = raw.startsWith("Payment ") ? raw.slice(8) : raw;
  const params = parseAuthParams(prefixed);

  const extra: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (!KNOWN_CHALLENGE_FIELDS.has(key)) {
      extra[key] = value;
    }
  }

  return {
    challengeId: params.challengeId ?? "",
    intent: params.intent ?? "charge",
    amount: params.amount ?? "0",
    currency: params.currency ?? "",
    recipient: params.recipient ?? "",
    chainId: params.chainId ? parseInt(params.chainId, 10) : 0,
    expiresAt: params.expiresAt ? parseInt(params.expiresAt, 10) : 0,
    signature: params.signature ?? "",
    description: params.description,
    extra,
    raw,
  };
}

export function decodeReceipt(input: string): { receipt: MppReceipt; validation: ReceiptValidation } {
  const errors: string[] = [];
  let base64Valid = false;
  let jsonValid = false;
  let requiredFieldsPresent = false;
  let timestampValid = false;

  let decoded: string;
  try {
    decoded = Buffer.from(input, "base64").toString("utf-8");
    base64Valid = true;
  } catch {
    errors.push("Invalid base64 encoding");
    return {
      receipt: { receiptId: "", timestamp: 0, credential: "", extra: {}, raw: input },
      validation: { base64Valid, jsonValid, requiredFieldsPresent, timestampValid, errors },
    };
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(decoded);
    if (typeof parsed !== "object" || parsed === null) throw new Error("Not an object");
    jsonValid = true;
  } catch {
    errors.push("Invalid JSON structure");
    return {
      receipt: { receiptId: "", timestamp: 0, credential: "", extra: {}, raw: input },
      validation: { base64Valid, jsonValid, requiredFieldsPresent, timestampValid, errors },
    };
  }

  const receiptId = typeof parsed.receiptId === "string" ? parsed.receiptId : "";
  const timestamp = typeof parsed.timestamp === "number" ? parsed.timestamp : 0;
  const credential = typeof parsed.credential === "string" ? parsed.credential : "";

  if (!receiptId) errors.push("Missing receiptId");
  if (!timestamp) errors.push("Missing timestamp");
  if (!credential) errors.push("Missing credential");
  requiredFieldsPresent = receiptId !== "" && timestamp !== 0 && credential !== "";

  if (timestamp > 0 && timestamp <= Date.now() / 1000 + 60) {
    timestampValid = true;
  } else if (timestamp > 0) {
    errors.push("Timestamp is in the future");
  }

  const knownKeys = new Set(["receiptId", "timestamp", "credential", "challengeId", "amount"]);
  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (!knownKeys.has(key)) {
      extra[key] = value;
    }
  }

  return {
    receipt: {
      receiptId,
      timestamp,
      credential,
      challengeId: typeof parsed.challengeId === "string" ? parsed.challengeId : undefined,
      amount: typeof parsed.amount === "string" ? parsed.amount : undefined,
      extra,
      raw: input,
    },
    validation: { base64Valid, jsonValid, requiredFieldsPresent, timestampValid, errors },
  };
}

export function parseMppManifest(json: unknown): MppManifest {
  if (typeof json !== "object" || json === null) {
    return { endpoints: [], raw: json };
  }

  const obj = json as Record<string, unknown>;
  const rawEndpoints = Array.isArray(obj.endpoints) ? obj.endpoints : [];

  const endpoints: MppEndpoint[] = rawEndpoints
    .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
    .map((e) => ({
      method: typeof e.method === "string" ? e.method : "GET",
      path: typeof e.path === "string" ? e.path : String(e.path ?? ""),
      price: typeof e.price === "string" ? e.price : typeof e.price === "number" ? String(e.price) : undefined,
      description: typeof e.description === "string" ? e.description : undefined,
      intent: typeof e.intent === "string" ? e.intent : undefined,
      currency: typeof e.currency === "string" ? e.currency : undefined,
    }));

  return {
    endpoints,
    name: typeof obj.name === "string" ? obj.name : undefined,
    description: typeof obj.description === "string" ? obj.description : undefined,
    raw: json,
  };
}
