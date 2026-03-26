import {
  rawRequest,
  parseChallengeHeader,
  verifyChallengeFields,
  challengeToJson,
} from "mpp-inspector";

export interface InspectInput {
  url: string;
  method?: string;
  headers?: string[];
  timeout?: number;
}

export async function inspectChallenge(input: InspectInput): Promise<object> {
  const response = await rawRequest(input.url, {
    method: input.method ?? "GET",
    headers: input.headers,
    timeout: input.timeout ?? 30_000,
  });

  if (response.status !== 402) {
    return {
      error: `Server returned ${response.status}, not 402`,
      status: response.status,
      hint:
        response.status === 200
          ? "The endpoint returned content without requiring payment."
          : "This endpoint may not be MPP-enabled.",
    };
  }

  const wwwAuth = response.headers.get("www-authenticate");
  if (!wwwAuth || !wwwAuth.toLowerCase().startsWith("payment ")) {
    return {
      error: "402 returned but no WWW-Authenticate: Payment header found",
      hint: "This may be a standard 402, not MPP.",
    };
  }

  const challenge = parseChallengeHeader(wwwAuth);
  const verification = verifyChallengeFields(challenge);

  return {
    ...challengeToJson(input.url, challenge, verification),
    timing: `${Math.round(response.timing)}ms`,
  };
}
