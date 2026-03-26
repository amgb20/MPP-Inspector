import { Command } from "commander";
import { inspectCommand } from "./commands/inspect.js";
import { flowCommand } from "./commands/flow.js";
import { validateCommand } from "./commands/validate.js";
import { benchmarkCommand } from "./commands/benchmark.js";
import { sessionCommand } from "./commands/session.js";
import { compareCommand } from "./commands/compare.js";
import { scanCommand } from "./commands/scan.js";

const program = new Command();

program
  .name("mpp-inspector")
  .description("Testing and debugging toolkit for Machine Payments Protocol")
  .version("0.1.0");

program.addCommand(inspectCommand);
program.addCommand(flowCommand);
program.addCommand(validateCommand);
program.addCommand(benchmarkCommand);
program.addCommand(sessionCommand);
program.addCommand(compareCommand);
program.addCommand(scanCommand);

export function run(): void {
  program.parse();
}

export {
  parseChallengeHeader,
  parseAuthParams,
  parseProblemDetails,
  decodeReceipt,
  decodeCredential,
  parseMppManifest,
} from "./utils/parser.js";
export { rawRequest, fetchJson } from "./utils/http.js";
export type { RequestOptions } from "./utils/http.js";
export { verifyChallengeFields } from "./utils/crypto.js";
export {
  CHAINS,
  KNOWN_TOKENS,
  getChainName,
  getChainRpc,
  getTokenSymbol,
  getTokenInfo,
  getPaymentMethodInfo,
  isKnownPaymentMethod,
  isBlockchainMethod,
  resolveCurrency,
} from "./utils/chains.js";
export { truncateAddress, formatAmount, formatUsd, formatExpiry, formatPaymentMethod } from "./utils/format.js";

export { challengeToJson } from "./display/challenge.js";
export { receiptToJson, credentialToJson } from "./display/receipt.js";
export { compareToJson, endpointsToJson, benchmarkToJson } from "./display/table.js";
export { flowToJson } from "./display/flow.js";

export type {
  PaymentMethod,
  MppChallenge,
  MppRequestParams,
  MppVerification,
  MppReceipt,
  MppSettlement,
  ReceiptValidation,
  MppCredential,
  MppCredentialChallenge,
  CredentialValidation,
  MppProblemDetails,
  MppEndpoint,
  MppManifest,
  HttpResponse,
  FlowStep,
  BenchmarkResult,
  LatencyStats,
  SessionResult,
  CompareEntry,
  ChainConfig,
  TokenInfo,
} from "./types.js";

export { KNOWN_PAYMENT_METHODS } from "./types.js";
