import type {
  MppChallenge,
  MppRequestParams,
  MppProblemDetails,
  MppEndpoint,
  MppManifest,
  MppReceipt,
  MppSettlement,
  ReceiptValidation,
  MppCredential,
  CredentialValidation,
} from "../types.js";

const KNOWN_CHALLENGE_FIELDS = new Set(["id", "realm", "method", "intent", "expires", "request"]);

// Legacy field names from our old format — mapped to spec equivalents
const LEGACY_FIELD_MAP: Record<string, string> = {
  challengeId: "id",
  expiresAt: "expires",
};

// --- Base64url helpers ---

function decodeBase64url(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const paddedLength = padded + "=".repeat((4 - (padded.length % 4)) % 4);
  return Buffer.from(paddedLength, "base64").toString("utf-8");
}

// --- Auth-param parser (RFC 7235 compliant) ---

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

// --- Decode the request param (base64url-encoded JSON) ---

function decodeRequestParam(encoded: string): MppRequestParams | null {
  if (!encoded) return null;
  try {
    const json = decodeBase64url(encoded);
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return null;

    const result = parsed as MppRequestParams;

    // The real protocol nests chainId inside methodDetails for tempo
    // e.g. { amount, currency, recipient, methodDetails: { chainId: 42431, feePayer: true } }
    // Hoist chainId to top level for convenience if not already present
    if (
      !result.chainId &&
      typeof result.methodDetails === "object" &&
      result.methodDetails !== null
    ) {
      const md = result.methodDetails as Record<string, unknown>;
      if (typeof md.chainId === "number") {
        return { ...result, chainId: md.chainId };
      }
    }

    return result;
  } catch {
    return null;
  }
}

// --- Challenge parser ---

export function parseChallengeHeader(raw: string): MppChallenge {
  const prefixed = raw.startsWith("Payment ") ? raw.slice(8) : raw;
  const params = parseAuthParams(prefixed);

  // Normalize legacy field names to spec names
  for (const [legacy, spec] of Object.entries(LEGACY_FIELD_MAP)) {
    if (params[legacy] && !params[spec]) {
      params[spec] = params[legacy];
    }
  }

  // If legacy format has amount/currency/recipient/chainId as top-level params
  // but no `request` field, synthesize a request param for backward compat
  const hasLegacyFields = params.amount || params.currency || params.recipient || params.chainId;
  const hasRequest = !!params.request;

  let requestEncoded = params.request ?? "";
  let requestDecoded: MppRequestParams | null = null;

  if (hasRequest) {
    requestDecoded = decodeRequestParam(requestEncoded);
  } else if (hasLegacyFields) {
    // Build requestDecoded from legacy top-level fields
    requestDecoded = {
      amount: params.amount,
      currency: params.currency,
      recipient: params.recipient,
      ...(params.chainId ? { chainId: parseInt(params.chainId, 10) } : {}),
    };
    // Synthesize the encoded request for display
    requestEncoded = Buffer.from(JSON.stringify(requestDecoded)).toString("base64url");
  }

  const extra: Record<string, string> = {};
  const allKnownFields = new Set([
    ...KNOWN_CHALLENGE_FIELDS,
    ...Object.keys(LEGACY_FIELD_MAP),
    "amount",
    "currency",
    "recipient",
    "chainId",
    "signature",
    "description",
  ]);
  for (const [key, value] of Object.entries(params)) {
    if (!allKnownFields.has(key)) {
      extra[key] = value;
    }
  }

  // Normalize expires: if it looks like a unix timestamp, convert to ISO 8601
  let expires = params.expires ?? "";
  if (expires && /^\d+$/.test(expires)) {
    expires = new Date(parseInt(expires, 10) * 1000).toISOString();
  }

  return {
    id: params.id ?? "",
    realm: params.realm ?? "",
    method: params.method ?? (hasLegacyFields ? "tempo" : ""),
    intent: params.intent ?? "charge",
    expires,
    request: requestEncoded,
    requestDecoded,
    description: params.description,
    extra,
    raw,
  };
}

// --- Problem Details parser (RFC 9457) ---

export function parseProblemDetails(body: string): MppProblemDetails | null {
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed !== "object" || parsed === null) return null;

    // RFC 9457 requires `type` field for Problem Details
    // But also accept bodies with `status: 402` as MPP problem details
    const hasType = typeof parsed.type === "string";
    const hasStatus = parsed.status === 402;
    if (!hasType && !hasStatus) return null;

    const knownKeys = new Set(["type", "title", "status", "detail", "challengeId", "instance"]);
    const extra: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!knownKeys.has(key)) extra[key] = value;
    }

    return {
      type: typeof parsed.type === "string" ? parsed.type : undefined,
      title: typeof parsed.title === "string" ? parsed.title : undefined,
      status: typeof parsed.status === "number" ? parsed.status : undefined,
      detail: typeof parsed.detail === "string" ? parsed.detail : undefined,
      challengeId: typeof parsed.challengeId === "string" ? parsed.challengeId : undefined,
      extra,
    };
  } catch {
    return null;
  }
}

// --- Receipt decoder (spec-compliant) ---

export function decodeReceipt(input: string): {
  receipt: MppReceipt;
  validation: ReceiptValidation;
} {
  const errors: string[] = [];
  let base64Valid = false;
  let jsonValid = false;
  let requiredFieldsPresent = false;
  let timestampValid = false;

  const emptyReceipt: MppReceipt = {
    challengeId: "",
    method: "",
    reference: "",
    settlement: null,
    status: "",
    timestamp: "",
    extra: {},
    raw: input,
  };

  let decoded: string;
  try {
    decoded = decodeBase64url(input);
    base64Valid = true;
  } catch {
    // Try standard base64 as fallback
    try {
      decoded = Buffer.from(input, "base64").toString("utf-8");
      base64Valid = true;
    } catch {
      errors.push("Invalid base64 encoding");
      return {
        receipt: emptyReceipt,
        validation: { base64Valid, jsonValid, requiredFieldsPresent, timestampValid, errors },
      };
    }
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(decoded);
    if (typeof parsed !== "object" || parsed === null) throw new Error("Not an object");
    jsonValid = true;
  } catch {
    errors.push("Invalid JSON structure");
    return {
      receipt: emptyReceipt,
      validation: { base64Valid, jsonValid, requiredFieldsPresent, timestampValid, errors },
    };
  }

  // Spec fields
  const challengeId = typeof parsed.challengeId === "string" ? parsed.challengeId : "";
  const method = typeof parsed.method === "string" ? parsed.method : "";
  const reference = typeof parsed.reference === "string" ? parsed.reference : "";
  const status = typeof parsed.status === "string" ? parsed.status : "";
  const timestamp =
    typeof parsed.timestamp === "string"
      ? parsed.timestamp
      : typeof parsed.timestamp === "number"
        ? new Date(parsed.timestamp * 1000).toISOString()
        : "";

  let settlement: MppSettlement | null = null;
  if (typeof parsed.settlement === "object" && parsed.settlement !== null) {
    const s = parsed.settlement as Record<string, unknown>;
    settlement = {
      amount: typeof s.amount === "string" ? s.amount : String(s.amount ?? ""),
      currency: typeof s.currency === "string" ? s.currency : String(s.currency ?? ""),
    };
  }

  // Legacy receipt format support: receiptId, timestamp (number), credential
  // Detect legacy format by presence of legacy-only fields AND absence of spec fields
  const hasLegacyFields = "receiptId" in parsed || "credential" in parsed;
  const hasSpecFields = !!reference && !!status;
  if (hasLegacyFields && !hasSpecFields) {
    const legacyChallengeId =
      challengeId || (typeof parsed.receiptId === "string" ? parsed.receiptId : "");
    const legacyAmount = typeof parsed.amount === "string" ? parsed.amount : "";
    const legacyCredential = typeof parsed.credential === "string" ? parsed.credential : "";

    if (!legacyChallengeId) errors.push("Missing challengeId");
    if (!timestamp) errors.push("Missing timestamp");
    requiredFieldsPresent = !!legacyChallengeId && !!timestamp;

    // Validate timestamp
    if (timestamp) {
      const ts = new Date(timestamp).getTime();
      timestampValid = !isNaN(ts) && ts <= Date.now() + 60_000;
      if (!timestampValid) errors.push("Timestamp is in the future");
    }

    const knownKeys = new Set([
      "receiptId",
      "timestamp",
      "credential",
      "challengeId",
      "amount",
      "method",
      "reference",
      "settlement",
      "status",
    ]);
    const extra: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!knownKeys.has(key)) extra[key] = value;
    }

    return {
      receipt: {
        challengeId: legacyChallengeId,
        method: method || "unknown",
        reference: legacyCredential || reference,
        settlement: legacyAmount ? { amount: legacyAmount, currency: "unknown" } : settlement,
        status: status || "unknown",
        timestamp,
        extra,
        raw: input,
      },
      validation: { base64Valid, jsonValid, requiredFieldsPresent, timestampValid, errors },
    };
  }

  // Spec-compliant validation
  if (!challengeId) errors.push("Missing challengeId");
  if (!method) errors.push("Missing method");
  if (!reference) errors.push("Missing reference");
  if (!status) errors.push("Missing status");
  if (!timestamp) errors.push("Missing timestamp");
  requiredFieldsPresent = !!challengeId && !!method && !!reference && !!status && !!timestamp;

  if (timestamp) {
    const ts = new Date(timestamp).getTime();
    timestampValid = !isNaN(ts) && ts <= Date.now() + 60_000;
    if (!timestampValid && !isNaN(ts)) errors.push("Timestamp is in the future");
    if (isNaN(ts)) errors.push("Invalid timestamp format");
  }

  const knownKeys = new Set([
    "challengeId",
    "method",
    "reference",
    "settlement",
    "status",
    "timestamp",
  ]);
  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (!knownKeys.has(key)) extra[key] = value;
  }

  return {
    receipt: { challengeId, method, reference, settlement, status, timestamp, extra, raw: input },
    validation: { base64Valid, jsonValid, requiredFieldsPresent, timestampValid, errors },
  };
}

// --- Credential decoder ---

export function decodeCredential(input: string): {
  credential: MppCredential;
  validation: CredentialValidation;
} {
  const errors: string[] = [];
  let base64Valid = false;
  let jsonValid = false;
  let structureValid = false;
  let challengePresent = false;
  let sourcePresent = false;
  let payloadPresent = false;

  const emptyCredential: MppCredential = {
    challenge: { id: "", realm: "", method: "", intent: "", request: "" },
    source: "",
    payload: {},
    raw: input,
  };

  let decoded: string;
  try {
    decoded = decodeBase64url(input);
    base64Valid = true;
  } catch {
    try {
      decoded = Buffer.from(input, "base64").toString("utf-8");
      base64Valid = true;
    } catch {
      errors.push("Invalid base64 encoding");
      return {
        credential: emptyCredential,
        validation: {
          base64Valid,
          jsonValid,
          structureValid,
          challengePresent,
          sourcePresent,
          payloadPresent,
          errors,
        },
      };
    }
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(decoded);
    if (typeof parsed !== "object" || parsed === null) throw new Error("Not an object");
    jsonValid = true;
  } catch {
    // Maybe the input is already a JSON string, not base64
    try {
      parsed = JSON.parse(input);
      if (typeof parsed !== "object" || parsed === null) throw new Error("Not an object");
      jsonValid = true;
      base64Valid = true; // mark as valid since we got JSON
    } catch {
      errors.push("Invalid JSON structure");
      return {
        credential: emptyCredential,
        validation: {
          base64Valid,
          jsonValid,
          structureValid,
          challengePresent,
          sourcePresent,
          payloadPresent,
          errors,
        },
      };
    }
  }

  const challengeObj = parsed.challenge;
  challengePresent = typeof challengeObj === "object" && challengeObj !== null;
  if (!challengePresent) errors.push("Missing challenge object");

  sourcePresent = typeof parsed.source === "string" && parsed.source.length > 0;
  if (!sourcePresent) errors.push("Missing source field");

  payloadPresent = typeof parsed.payload === "object" && parsed.payload !== null;
  if (!payloadPresent) errors.push("Missing payload object");

  structureValid = challengePresent && sourcePresent && payloadPresent;

  const ch = (challengeObj ?? {}) as Record<string, unknown>;
  const challenge = {
    id: typeof ch.id === "string" ? ch.id : "",
    realm: typeof ch.realm === "string" ? ch.realm : "",
    method: typeof ch.method === "string" ? ch.method : "",
    intent: typeof ch.intent === "string" ? ch.intent : "",
    request: typeof ch.request === "string" ? ch.request : "",
  };

  const payload =
    typeof parsed.payload === "object" && parsed.payload !== null
      ? (parsed.payload as Record<string, unknown>)
      : {};

  return {
    credential: {
      challenge,
      source: typeof parsed.source === "string" ? parsed.source : "",
      payload,
      raw: input,
    },
    validation: {
      base64Valid,
      jsonValid,
      structureValid,
      challengePresent,
      sourcePresent,
      payloadPresent,
      errors,
    },
  };
}

// --- Manifest parser ---

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
      price:
        typeof e.price === "string"
          ? e.price
          : typeof e.price === "number"
            ? String(e.price)
            : undefined,
      description: typeof e.description === "string" ? e.description : undefined,
      intent: typeof e.intent === "string" ? e.intent : undefined,
      currency: typeof e.currency === "string" ? e.currency : undefined,
      paymentMethod: typeof e.paymentMethod === "string" ? e.paymentMethod : undefined,
    }));

  return {
    endpoints,
    name: typeof obj.name === "string" ? obj.name : undefined,
    description: typeof obj.description === "string" ? obj.description : undefined,
    raw: json,
  };
}
