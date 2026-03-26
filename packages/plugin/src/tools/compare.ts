import {
  rawRequest,
  parseChallengeHeader,
  getTokenSymbol,
  getChainName,
  compareToJson,
  type CompareEntry,
} from "mpp-inspector";

export interface CompareInput {
  urls: string[];
  timeout?: number;
}

export async function comparePricing(input: CompareInput): Promise<object> {
  if (input.urls.length < 2) {
    return { error: "Provide at least 2 URLs to compare" };
  }

  const timeout = input.timeout ?? 15_000;

  const results = await Promise.all(
    input.urls.map(async (url): Promise<CompareEntry> => {
      const hostname = new URL(url).hostname;
      try {
        const response = await rawRequest(url, { timeout });

        if (response.status !== 402) {
          return {
            url,
            service: hostname,
            price: "0",
            intent: "-",
            currency: "-",
            chain: "-",
            error: `HTTP ${response.status}`,
          };
        }

        const wwwAuth = response.headers.get("www-authenticate");
        if (!wwwAuth?.toLowerCase().startsWith("payment ")) {
          return {
            url,
            service: hostname,
            price: "0",
            intent: "-",
            currency: "-",
            chain: "-",
            error: "No MPP header",
          };
        }

        const challenge = parseChallengeHeader(wwwAuth);

        return {
          url,
          service: hostname,
          price: challenge.amount,
          intent: challenge.intent,
          currency: getTokenSymbol(challenge.currency) ?? "unknown",
          chain: getChainName(challenge.chainId),
        };
      } catch (err) {
        return {
          url,
          service: hostname,
          price: "0",
          intent: "-",
          currency: "-",
          chain: "-",
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }),
  );

  const valid = results.filter((e) => !e.error);
  const cheapest =
    valid.length > 0
      ? valid.reduce((min, e) => (parseFloat(e.price) < parseFloat(min.price) ? e : min))
      : undefined;

  return {
    ...compareToJson(results),
    summary: cheapest
      ? { cheapest: cheapest.service, price: cheapest.price }
      : { cheapest: null },
  };
}
