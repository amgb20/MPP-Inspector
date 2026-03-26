import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rawRequest, fetchJson } from "../../utils/http.js";

describe("rawRequest", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("makes a GET request by default", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      headers: new Headers({ "content-type": "text/plain" }),
      text: () => Promise.resolve("ok"),
    });

    const result = await rawRequest("https://example.com/api");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://example.com/api");
    expect(options.method).toBe("GET");
    expect(result.status).toBe(200);
    expect(result.body).toBe("ok");
    expect(result.timing).toBeGreaterThanOrEqual(0);
  });

  it("uses custom method and body", async () => {
    mockFetch.mockResolvedValue({
      status: 201,
      headers: new Headers(),
      text: () => Promise.resolve("created"),
    });

    await rawRequest("https://example.com/api", {
      method: "POST",
      body: '{"key": "value"}',
    });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.body).toBe('{"key": "value"}');
  });

  it("sends User-Agent header", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      headers: new Headers(),
      text: () => Promise.resolve(""),
    });

    await rawRequest("https://example.com/api");

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["User-Agent"]).toBe("mpp-inspector/0.1.0");
  });

  it("parses custom header args", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      headers: new Headers(),
      text: () => Promise.resolve(""),
    });

    await rawRequest("https://example.com/api", {
      headers: ["Authorization: Bearer token123", "X-Custom: value"],
    });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Authorization"]).toBe("Bearer token123");
    expect(options.headers["X-Custom"]).toBe("value");
  });

  it("returns response headers", async () => {
    const responseHeaders = new Headers({ "x-request-id": "abc" });
    mockFetch.mockResolvedValue({
      status: 200,
      headers: responseHeaders,
      text: () => Promise.resolve(""),
    });

    const result = await rawRequest("https://example.com/api");
    expect(result.headers.get("x-request-id")).toBe("abc");
  });
});

describe("fetchJson", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses JSON response body", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      headers: new Headers(),
      text: () => Promise.resolve('{"key": "value"}'),
    });

    const result = await fetchJson("https://example.com/api");
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ key: "value" });
  });

  it("returns null data for non-JSON response", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      headers: new Headers(),
      text: () => Promise.resolve("not json"),
    });

    const result = await fetchJson("https://example.com/api");
    expect(result.data).toBeNull();
    expect(result.status).toBe(200);
  });

  it("returns status from response", async () => {
    mockFetch.mockResolvedValue({
      status: 404,
      headers: new Headers(),
      text: () => Promise.resolve('{"error": "not found"}'),
    });

    const result = await fetchJson("https://example.com/api");
    expect(result.status).toBe(404);
    expect(result.data).toEqual({ error: "not found" });
  });
});
