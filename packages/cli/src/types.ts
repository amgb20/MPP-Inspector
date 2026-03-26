// --- Payment Methods ---

export type PaymentMethod = "tempo" | "stripe" | "lightning" | "solana" | "card" | "custom";

export const KNOWN_PAYMENT_METHODS: readonly PaymentMethod[] = [
  "tempo",
  "stripe",
  "lightning",
  "solana",
  "card",
  "custom",
];

// --- Challenge (spec-compliant) ---
// Real protocol: WWW-Authenticate: Payment id="...", realm="...", method="...", intent="...", expires="...", request="<base64url>"

export interface MppRequestParams {
  readonly amount?: string;
  readonly currency?: string;
  readonly recipient?: string;
  readonly chainId?: number;
  readonly invoice?: string;
  readonly token?: string;
  readonly [key: string]: unknown;
}

export interface MppChallenge {
  readonly id: string;
  readonly realm: string;
  readonly method: string;
  readonly intent: string;
  readonly expires: string;
  readonly request: string;
  readonly requestDecoded: MppRequestParams | null;
  readonly description?: string;
  readonly extra: Readonly<Record<string, string>>;
  readonly raw: string;
}

// --- Problem Details (RFC 9457) ---
// The 402 response body may contain RFC 9457 Problem Details JSON

export interface MppProblemDetails {
  readonly type?: string;
  readonly title?: string;
  readonly status?: number;
  readonly detail?: string;
  readonly challengeId?: string;
  readonly extra: Readonly<Record<string, unknown>>;
}

// --- Receipt (spec-compliant) ---

export interface MppSettlement {
  readonly amount: string;
  readonly currency: string;
}

export interface MppReceipt {
  readonly challengeId: string;
  readonly method: string;
  readonly reference: string;
  readonly settlement: MppSettlement | null;
  readonly status: string;
  readonly timestamp: string;
  readonly extra: Readonly<Record<string, unknown>>;
  readonly raw: string;
}

export interface ReceiptValidation {
  readonly base64Valid: boolean;
  readonly jsonValid: boolean;
  readonly requiredFieldsPresent: boolean;
  readonly timestampValid: boolean;
  readonly errors: readonly string[];
}

// --- Credential (spec-compliant) ---

export interface MppCredentialChallenge {
  readonly id: string;
  readonly realm: string;
  readonly method: string;
  readonly intent: string;
  readonly request: string;
}

export interface MppCredential {
  readonly challenge: MppCredentialChallenge;
  readonly source: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly raw: string;
}

export interface CredentialValidation {
  readonly base64Valid: boolean;
  readonly jsonValid: boolean;
  readonly structureValid: boolean;
  readonly challengePresent: boolean;
  readonly sourcePresent: boolean;
  readonly payloadPresent: boolean;
  readonly errors: readonly string[];
}

// --- Verification ---

export interface MppVerification {
  readonly signatureValid: boolean | null;
  readonly expiryValid: boolean;
  readonly methodKnown: boolean;
  readonly amountParseable: boolean;
  readonly recipientValid: boolean | null;
  readonly currencyKnown: boolean | null;
  readonly errors: readonly string[];
}

// --- Discovery ---

export interface MppEndpoint {
  readonly method: string;
  readonly path: string;
  readonly price?: string;
  readonly description?: string;
  readonly intent?: string;
  readonly currency?: string;
  readonly paymentMethod?: string;
}

export interface MppManifest {
  readonly endpoints: readonly MppEndpoint[];
  readonly name?: string;
  readonly description?: string;
  readonly raw: unknown;
}

// --- HTTP ---

export interface HttpResponse {
  readonly status: number;
  readonly headers: Headers;
  readonly body: string;
  readonly timing: number;
}

// --- Flow ---

export interface FlowStep {
  readonly name: string;
  readonly status: "success" | "failure" | "skipped";
  readonly timing: number;
  readonly details: Record<string, unknown>;
}

// --- Benchmark ---

export interface BenchmarkResult {
  readonly totalRequests: number;
  readonly successful: number;
  readonly failed: number;
  readonly errors: readonly string[];
  readonly latencyTotal: LatencyStats;
  readonly latencyPayment: LatencyStats;
  readonly totalSpent: string;
  readonly totalGas: string;
  readonly throughput: number;
}

export interface LatencyStats {
  readonly p50: number;
  readonly p95: number;
  readonly p99: number;
  readonly avg: number;
  readonly min: number;
  readonly max: number;
}

// --- Session ---

export interface SessionResult {
  readonly channelId: string;
  readonly deposit: string;
  readonly vouchersCount: number;
  readonly totalTime: number;
  readonly avgVoucherTime: number;
  readonly onChainTxns: number;
  readonly gasSpent: string;
  readonly channelUtilization: number;
}

// --- Compare ---

export interface CompareEntry {
  readonly url: string;
  readonly service: string;
  readonly price: string;
  readonly intent: string;
  readonly currency: string;
  readonly chain: string;
  readonly paymentMethod: string;
  readonly error?: string;
}

// --- Chain/Token Config ---

export interface ChainConfig {
  readonly name: string;
  readonly rpcUrl: string;
  readonly testnet: boolean;
  readonly explorerUrl?: string;
}

export interface TokenInfo {
  readonly symbol: string;
  readonly decimals: number;
  readonly name: string;
}
