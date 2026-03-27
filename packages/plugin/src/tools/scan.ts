import {
  fetchJson,
  rawRequest,
  parseMppManifest,
  parseChallengeHeader,
  endpointsToJson,
  type MppEndpoint,
} from "mpp-inspector";

export interface ScanInput {
  domain: string;
  probe?: boolean;
  timeout?: number;
}

export async function scanDomain(input: ScanInput): Promise<object> {
  const cleanDomain = input.domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const baseUrl = `https://${cleanDomain}`;
  const endpoints: MppEndpoint[] = [];
  const timeout = input.timeout ?? 10_000;
  const discoveries: Record<string, string> = {};

  try {
    const { data, status } = await fetchJson(`${baseUrl}/.well-known/mpp.json`, timeout);
    if (status === 200 && data) {
      discoveries["/.well-known/mpp.json"] = "found";
      const manifest = parseMppManifest(data);
      for (const ep of manifest.endpoints) {
        endpoints.push(ep);
      }
    } else {
      discoveries["/.well-known/mpp.json"] = "not found";
    }
  } catch {
    discoveries["/.well-known/mpp.json"] = "error";
  }

  try {
    const response = await rawRequest(`${baseUrl}/llms.txt`, { timeout });
    discoveries["/llms.txt"] =
      response.status === 200 && response.body.length > 0 ? "found" : "not found";
  } catch {
    discoveries["/llms.txt"] = "error";
  }

  try {
    const response = await rawRequest(`${baseUrl}/health`, { timeout });
    discoveries["/health"] = response.status === 200 ? "200 OK" : String(response.status);
  } catch {
    discoveries["/health"] = "error";
  }

  if (input.probe) {
    const probePaths = ["/v1/", "/api/", "/api/v1/", "/v1/search", "/v1/data", "/v1/query"];

    for (const path of probePaths) {
      try {
        const response = await rawRequest(`${baseUrl}${path}`, { method: "HEAD", timeout: 5000 });
        if (response.status === 402) {
          const wwwAuth = response.headers.get("www-authenticate");
          if (wwwAuth?.toLowerCase().startsWith("payment ")) {
            const challenge = parseChallengeHeader(wwwAuth);
            endpoints.push({
              method: "GET",
              path,
              price: challenge.amount,
              intent: challenge.intent,
              description: challenge.description,
            });
          }
        }
      } catch {
        // skip unreachable paths
      }
    }
  }

  return {
    ...endpointsToJson(endpoints, cleanDomain),
    discoveries,
  };
}
