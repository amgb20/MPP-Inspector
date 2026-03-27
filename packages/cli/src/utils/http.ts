import type { HttpResponse } from "../types.js";

export interface RequestOptions {
  readonly method?: string;
  readonly headers?: readonly string[];
  readonly body?: string;
  readonly timeout?: number;
}

function parseHeaderArgs(headerArgs?: readonly string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!headerArgs) return headers;

  for (const h of headerArgs) {
    const colonIdx = h.indexOf(":");
    if (colonIdx === -1) continue;
    const key = h.slice(0, colonIdx).trim();
    const value = h.slice(colonIdx + 1).trim();
    headers[key] = value;
  }
  return headers;
}

export async function rawRequest(url: string, options: RequestOptions = {}): Promise<HttpResponse> {
  const method = options.method ?? "GET";
  const customHeaders = parseHeaderArgs(options.headers);

  const controller = new AbortController();
  const timeoutMs = options.timeout ?? 30_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const start = performance.now();

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "User-Agent": "mpp-inspector/0.1.0",
        ...customHeaders,
      },
      body: options.body ?? undefined,
      signal: controller.signal,
      redirect: "follow",
    });

    const body = await response.text();
    const timing = performance.now() - start;

    return {
      status: response.status,
      headers: response.headers,
      body,
      timing,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson(
  url: string,
  timeout?: number,
): Promise<{ data: unknown; status: number }> {
  const response = await rawRequest(url, { timeout });
  try {
    const data = JSON.parse(response.body);
    return { data, status: response.status };
  } catch {
    return { data: null, status: response.status };
  }
}
