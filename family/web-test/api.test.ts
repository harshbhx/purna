import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, clearKey, getKey, parseImport, setKey, takeFragment } from "../public/assets/api.js";

describe("parseImport", () => {
  const session = { schema: "purna.session.v1", sessionId: "s_1", nested: { a: [1, 2] } };

  it("accepts raw JSON", () => {
    expect(parseImport(JSON.stringify(session))).toEqual(session);
  });

  it("accepts a whole Logger line with a timestamp before the prefix", () => {
    expect(parseImport("12:01:03.442 [Lens] PURNA_SESSION " + JSON.stringify(session) + "\n")).toEqual(session);
  });

  it("returns null for anything that isn't a JSON object", () => {
    expect(parseImport("")).toBeNull();
    expect(parseImport("hello")).toBeNull();
    expect(parseImport("PURNA_SESSION {broken")).toBeNull();
    expect(parseImport(null)).toBeNull();
  });
});

describe("family key storage and URL fragments", () => {
  beforeEach(() => {
    clearKey();
    history.replaceState(null, "", "/");
  });

  it("stores and clears the key", () => {
    expect(getKey()).toBeNull();
    setKey("abc");
    expect(getKey()).toBe("abc");
    clearKey();
    expect(getKey()).toBeNull();
  });

  it("takes the key from the fragment and removes it from the address bar", () => {
    const key = "A".repeat(43);
    history.replaceState(null, "", "/join#k=" + key);
    expect(takeFragment("k")).toBe(key);
    expect(location.hash).toBe("");
    expect(location.pathname).toBe("/join");
  });

  it("ignores short or malformed fragments", () => {
    history.replaceState(null, "", "/#k=short");
    expect(takeFragment("k")).toBeNull();
    history.replaceState(null, "", "/#t=" + "x".repeat(43));
    expect(takeFragment("k")).toBeNull();
  });
});

describe("api()", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends JSON with the bearer key and returns the body", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await api("/me", { auth: "KEY", method: "POST", body: { a: 1 } })).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/v1/me");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer KEY");
    expect((init.headers as Record<string, string>)["content-type"]).toBe("application/json");
    expect(init.body).toBe('{"a":1}');
  });

  it("returns null for 204", async () => {
    vi.stubGlobal("fetch", async () => new Response(null, { status: 204 }));
    expect(await api("/me", { method: "DELETE" })).toBeNull();
  });

  it("turns server errors into ApiError with the server's plain message", async () => {
    vi.stubGlobal("fetch", async () =>
      new Response(JSON.stringify({ error: { code: "expired", message: "This link has expired." } }), { status: 410 }));
    const e = await api("/doctor").catch((x) => x);
    expect(e).toBeInstanceOf(ApiError);
    expect(e.status).toBe(410);
    expect(e.code).toBe("expired");
    expect(e.message).toBe("This link has expired.");
  });

  it("explains a network failure in plain words", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("Failed to fetch");
    });
    const e = await api("/me").catch((x) => x);
    expect(e.code).toBe("offline");
    expect(e.message).toMatch(/Couldn't reach Purna/);
  });
});
