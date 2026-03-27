import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import {
  DEMO_ENDPOINTS,
  DEMO_MANIFEST,
  LLMS_TXT,
  buildChallengeHeader,
  buildDemoReceipt,
} from "./fixtures.js";

export interface MockServerOptions {
  port?: number;
  host?: string;
  silent?: boolean;
}

function log(silent: boolean, ...args: unknown[]) {
  if (!silent) console.log(...args);
}

function json(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "Access-Control-Allow-Origin": "*",
  });
  res.end(payload);
}

function text(res: ServerResponse, status: number, body: string, contentType = "text/plain") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function handleRequest(req: IncomingMessage, res: ServerResponse, silent: boolean) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const method = (req.method ?? "GET").toUpperCase();
  const path = url.pathname;

  log(silent, `  ${method} ${path} →`);

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    });
    res.end();
    return;
  }

  if (path === "/health") {
    log(silent, `    200 OK`);
    json(res, 200, { status: "ok", server: "mpp-mock-server", timestamp: Date.now() });
    return;
  }

  if (path === "/.well-known/mpp.json") {
    log(silent, `    200 manifest (${DEMO_MANIFEST.endpoints.length} endpoints)`);
    json(res, 200, DEMO_MANIFEST);
    return;
  }

  if (path === "/llms.txt") {
    log(silent, `    200 llms.txt`);
    text(res, 200, LLMS_TXT);
    return;
  }

  if (path === "/v1/validate-receipt") {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      log(silent, `    200 receipt accepted`);
      json(res, 200, { valid: true, received: body.length > 0 });
    });
    return;
  }

  const endpoint = DEMO_ENDPOINTS.find((ep) => ep.path === path);
  if (endpoint) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Payment ") || authHeader?.startsWith("Bearer ")) {
      log(silent, `    200 OK (authorized)`);

      // Generate a spec-compliant receipt
      const receiptBase64 = buildDemoReceipt(
        "demo-challenge",
        endpoint.paymentMethod,
        endpoint.price,
      );

      json(res, 200, {
        data: { message: `Authorized access to ${endpoint.description}`, endpoint: path },
        meta: { server: "mpp-mock-server", demo: true },
        receipt: receiptBase64,
      });
      return;
    }

    const challengeHeader = buildChallengeHeader(endpoint);
    log(silent, `    402 Payment Required (method: ${endpoint.paymentMethod})`);
    res.writeHead(402, {
      "WWW-Authenticate": challengeHeader,
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(
      JSON.stringify({
        error: "Payment Required",
        message: `This endpoint requires payment of ${endpoint.price} ${endpoint.currency} via ${endpoint.paymentMethod}`,
        protocol: "MPP",
        docs: "https://mpp.dev/overview",
      }),
    );
    return;
  }

  log(silent, `    404 Not Found`);
  json(res, 404, { error: "Not Found", path });
}

export function createMockServer(options: MockServerOptions = {}) {
  const { port = 3402, host = "0.0.0.0", silent = false } = options;

  const server = createServer((req, res) => {
    handleRequest(req, res, silent);
  });

  function start(): Promise<void> {
    return new Promise((resolve) => {
      server.listen(port, host, () => {
        if (!silent) {
          console.log();
          console.log(`  MPP Mock Server running on http://localhost:${port}`);
          console.log(`  Protocol: spec-compliant (id, realm, method, request base64url)`);
          console.log();
          console.log(`  Endpoints:`);
          for (const ep of DEMO_ENDPOINTS) {
            console.log(
              `    ${ep.httpMethod.padEnd(5)} ${ep.path.padEnd(20)} ${ep.price.padEnd(8)} ${ep.currency}  (${ep.paymentMethod}, ${ep.intent})`,
            );
          }
          console.log();
          console.log(`  Discovery:`);
          console.log(`    GET  /.well-known/mpp.json`);
          console.log(`    GET  /llms.txt`);
          console.log(`    GET  /health`);
          console.log();
          console.log(`  Try it:`);
          console.log(`    npx mpp-inspector inspect http://localhost:${port}/v1/query`);
          console.log(`    npx mpp-inspector scan localhost:${port}`);
          console.log();
        }
        resolve();
      });
    });
  }

  function stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }

  return { server, start, stop };
}
