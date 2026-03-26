import {
  rawRequest,
  parseChallengeHeader,
  verifyChallengeFields,
  flowToJson,
  truncateAddress,
  formatAmount,
  type FlowStep,
} from "mpp-inspector";

export interface FlowInput {
  url: string;
  method?: string;
  timeout?: number;
}

export async function dryRunFlow(input: FlowInput): Promise<object> {
  const steps: FlowStep[] = [];
  const timeout = input.timeout ?? 30_000;

  const step1Start = performance.now();
  const response = await rawRequest(input.url, {
    method: input.method ?? "GET",
    timeout,
  });
  const step1Time = performance.now() - step1Start;

  steps.push({
    name: "Request resource",
    status: response.status === 402 ? "success" : "failure",
    timing: step1Time,
    details: {
      method: `${input.method ?? "GET"} ${new URL(input.url).pathname}`,
      response: `${response.status} ${response.status === 402 ? "Payment Required" : ""}`.trim(),
    },
  });

  if (response.status !== 402) {
    return flowToJson(steps, {
      error: `Expected 402, got ${response.status}`,
      dryRun: true,
    });
  }

  const wwwAuth = response.headers.get("www-authenticate") ?? "";
  if (!wwwAuth.toLowerCase().startsWith("payment ")) {
    steps.push({
      name: "Parse challenge",
      status: "failure",
      timing: 0,
      details: { error: "No WWW-Authenticate: Payment header found" },
    });
    return flowToJson(steps, { error: "Not an MPP endpoint", dryRun: true });
  }

  const step2Start = performance.now();
  const challenge = parseChallengeHeader(wwwAuth);
  const verification = verifyChallengeFields(challenge);
  const step2Time = performance.now() - step2Start;

  steps.push({
    name: "Parse challenge",
    status: "success",
    timing: step2Time,
    details: {
      intent: challenge.intent,
      amount: challenge.amount,
      recipient: truncateAddress(challenge.recipient),
      expires: challenge.expiresAt
        ? `${Math.floor(challenge.expiresAt - Date.now() / 1000)}s`
        : "none",
      verification: {
        recipientValid: verification.recipientValid,
        amountParseable: verification.amountParseable,
        expiryValid: verification.expiryValid,
        currencyKnown: verification.currencyKnown,
        errors: verification.errors,
      },
    },
  });

  steps.push({
    name: "Sign transaction (dry-run)",
    status: "skipped",
    timing: 0,
    details: {
      note: `Would sign transaction for ${formatAmount(challenge.amount, challenge.currency)}`,
      gasEstimate: "~21000 (~$0.0001)",
    },
  });

  steps.push({
    name: "Retry with credential (dry-run)",
    status: "skipped",
    timing: 0,
    details: { note: "Would retry request with Authorization: Payment <credential>" },
  });

  steps.push({
    name: "Verify receipt (dry-run)",
    status: "skipped",
    timing: 0,
    details: { note: "Would verify receipt from server response" },
  });

  return flowToJson(steps, {
    totalTime: steps.reduce((s, st) => s + st.timing, 0),
    amount: challenge.amount,
    dryRun: true,
  });
}
