export interface MppChallenge {
  readonly challengeId: string;
  readonly intent: string;
  readonly amount: string;
  readonly currency: string;
  readonly recipient: string;
  readonly chainId: number;
  readonly expiresAt: number;
  readonly signature: string;
  readonly description?: string;
  readonly extra: Readonly<Record<string, string>>;
  readonly raw: string;
}

export interface MppVerification {
  readonly signatureValid: boolean | null;
  readonly expiryValid: boolean;
  readonly currencyKnown: boolean;
  readonly recipientValid: boolean;
  readonly amountParseable: boolean;
  readonly errors: readonly string[];
}

export interface MppReceipt {
  readonly receiptId: string;
  readonly timestamp: number;
  readonly credential: string;
  readonly challengeId?: string;
  readonly amount?: string;
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

export interface MppEndpoint {
  readonly method: string;
  readonly path: string;
  readonly price?: string;
  readonly description?: string;
  readonly intent?: string;
  readonly currency?: string;
}

export interface MppManifest {
  readonly endpoints: readonly MppEndpoint[];
  readonly name?: string;
  readonly description?: string;
  readonly raw: unknown;
}

export interface HttpResponse {
  readonly status: number;
  readonly headers: Headers;
  readonly body: string;
  readonly timing: number;
}

export interface FlowStep {
  readonly name: string;
  readonly status: "success" | "failure" | "skipped";
  readonly timing: number;
  readonly details: Record<string, unknown>;
}

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

export interface CompareEntry {
  readonly url: string;
  readonly service: string;
  readonly price: string;
  readonly intent: string;
  readonly currency: string;
  readonly chain: string;
  readonly error?: string;
}

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
