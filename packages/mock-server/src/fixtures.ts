const PATHUSD_ADDRESS = "0x20c03e252fabf5e4c8441db12068e97c833ab572000000000000000000000000";
const DEMO_RECIPIENT = "0x1234567890abcdef1234567890abcdef12345678";

export interface DemoEndpoint {
  httpMethod: string;
  path: string;
  price: string;
  intent: string;
  description: string;
  currency: string;
  paymentMethod: string;
}

export const DEMO_ENDPOINTS: DemoEndpoint[] = [
  {
    httpMethod: "GET",
    path: "/v1/query",
    price: "1000",
    intent: "charge",
    description: "Financial data query",
    currency: "usd",
    paymentMethod: "tempo",
  },
  {
    httpMethod: "POST",
    path: "/v1/search",
    price: "5000",
    intent: "charge",
    description: "Full-text search across datasets",
    currency: "usd",
    paymentMethod: "tempo",
  },
  {
    httpMethod: "GET",
    path: "/v1/stream",
    price: "100",
    intent: "session",
    description: "Real-time data streaming channel",
    currency: "usd",
    paymentMethod: "tempo",
  },
  {
    httpMethod: "GET",
    path: "/v1/premium",
    price: "500",
    intent: "charge",
    description: "Premium API endpoint (Stripe)",
    currency: "usd",
    paymentMethod: "stripe",
  },
];

export const DEMO_MANIFEST = {
  name: "MPP Mock Server",
  description: "Demo MPP-enabled API for testing mpp-inspector",
  endpoints: DEMO_ENDPOINTS.map((ep) => ({
    method: ep.httpMethod,
    path: ep.path,
    price: ep.price,
    intent: ep.intent,
    description: ep.description,
    currency: ep.currency,
    paymentMethod: ep.paymentMethod,
  })),
};

function generateChallengeId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 22; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function encodeBase64url(data: string): string {
  return Buffer.from(data).toString("base64url");
}

export function buildChallengeHeader(endpoint: DemoEndpoint): string {
  const challengeId = generateChallengeId();
  const expiresDate = new Date(Date.now() + 3600_000).toISOString();

  // Build the request param as base64url-encoded JSON (spec-compliant)
  const requestPayload: Record<string, unknown> = {
    amount: endpoint.price,
    currency: endpoint.currency,
  };

  if (endpoint.paymentMethod === "tempo") {
    requestPayload.recipient = DEMO_RECIPIENT;
    requestPayload.methodDetails = { chainId: 42431, feePayer: true };
    requestPayload.token = PATHUSD_ADDRESS;
  }

  const requestEncoded = encodeBase64url(JSON.stringify(requestPayload));

  return [
    `Payment id="${challengeId}"`,
    `realm="mock.mpp-inspector.dev"`,
    `method="${endpoint.paymentMethod}"`,
    `intent="${endpoint.intent}"`,
    `expires="${expiresDate}"`,
    `request="${requestEncoded}"`,
  ].join(",");
}

export function buildDemoReceipt(challengeId: string, method: string, amount: string): string {
  const receipt = {
    challengeId,
    method,
    reference: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
    settlement: { amount, currency: "usd" },
    status: "success",
    timestamp: new Date().toISOString(),
  };
  return Buffer.from(JSON.stringify(receipt)).toString("base64url");
}

export function buildDemoCredential(challengeId: string, method: string): string {
  const credential = {
    challenge: {
      id: challengeId,
      realm: "mock.mpp-inspector.dev",
      method,
      intent: "charge",
      request: encodeBase64url(JSON.stringify({ amount: "1000", currency: "usd" })),
    },
    source: DEMO_RECIPIENT,
    payload: {
      signature: `0x${Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
    },
  };
  return Buffer.from(JSON.stringify(credential)).toString("base64url");
}

export const LLMS_TXT = `# MPP Mock Server
> Demo MPP-enabled API for testing mpp-inspector

This server implements the Machine Payments Protocol (MPP) for development and testing.

## Endpoints

- /v1/query: Financial data query (GET, 1000 units, Tempo)
- /v1/search: Full-text search across datasets (POST, 5000 units, Tempo)
- /v1/stream: Real-time data streaming channel (GET, 100 units/voucher, Tempo session)
- /v1/premium: Premium API endpoint (GET, 500 units, Stripe)

## Protocol

All endpoints return HTTP 402 with spec-compliant WWW-Authenticate: Payment challenge headers.
Challenge format: id, realm, method, intent, expires, request (base64url-encoded JSON).
Payment methods: tempo (Tempo Mainnet, chain ID 4217), stripe (card payments).
`;
