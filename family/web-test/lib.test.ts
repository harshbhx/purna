import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, clearKey, getKey, parseImport, setKey, takeFragment } from "@/lib/api";
import { csvCell, toCsv } from "@/lib/csv";
import { fix, fmtWhen, pct } from "@/lib/format";
import { measures, progress, therapistRows, toCard } from "@/lib/session";
import type { SessionJson } from "@/lib/types";
import demoJson from "../web/public/demo/sessions.json";

const demo = demoJson as unknown as SessionJson[];
const newestFirst = demo.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt));

describe("csv", () => {
  it("quotes everything and neutralises formulas, but keeps numbers", () => {
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell(null)).toBe('""');
    for (const evil of ['=HYPERLINK("x")', "+cmd", "-cmd|' /C calc'!A0", "@SUM(A1)", "\tx", "\rx"]) expect(csvCell(evil).startsWith("\"'")).toBe(true);
    expect(csvCell(-0.21)).toBe('"-0.21"');
  });
  it("has one header and one 33-column row per session, ending in CRLF", () => {
    const csv = toCsv(demo);
    const rows = csv.trimEnd().split("\r\n");
    expect(rows).toHaveLength(demo.length + 1);
    expect(rows[0].split(",")).toHaveLength(33);
    for (const r of rows.slice(1)) expect(r.match(/","/g)!.length + 1).toBe(33);
    expect(csv.endsWith("\r\n")).toBe(true);
  });
});

describe("api client", () => {
  beforeEach(() => { clearKey(); history.replaceState(null, "", "/"); });
  afterEach(() => vi.unstubAllGlobals());

  it("parses raw JSON or a Logger line, and rejects anything else", () => {
    const s = { schema: "purna.session.v1", n: [1] };
    expect(parseImport(JSON.stringify(s))).toEqual(s);
    expect(parseImport("12:01 [Lens] PURNA_SESSION " + JSON.stringify(s))).toEqual(s);
    expect(parseImport("PURNA_SESSION {broken")).toBeNull();
    expect(parseImport("")).toBeNull();
  });

  it("stores the key and lifts it out of the URL fragment", () => {
    setKey("abc");
    expect(getKey()).toBe("abc");
    const key = "A".repeat(43);
    history.replaceState(null, "", "/join#k=" + key);
    expect(takeFragment("k")).toBe(key);
    expect(location.hash).toBe("");
    history.replaceState(null, "", "/#k=short");
    expect(takeFragment("k")).toBeNull();
  });

  it("sends JSON with the bearer key; turns errors into plain ApiErrors", async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", f);
    expect(await api("/me", { auth: "KEY", method: "POST", body: { a: 1 } })).toEqual({ ok: true });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/v1/me");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer KEY");

    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ error: { code: "expired", message: "This link has expired." } }), { status: 410 }));
    const e: any = await api("/doctor").catch((x) => x);
    expect(e).toBeInstanceOf(ApiError);
    expect([e.status, e.code, e.message]).toEqual([410, "expired", "This link has expired."]);

    vi.stubGlobal("fetch", async () => { throw new TypeError("Failed to fetch"); });
    expect(((await api("/me").catch((x) => x)) as any).code).toBe("offline");
    vi.stubGlobal("fetch", async () => new Response(null, { status: 204 }));
    expect(await api("/me", { method: "DELETE" })).toBeNull();
  });
});

describe("session helpers", () => {
  const s = newestFirst.find((x) => x.near.leftHits < x.near.leftTotal)!;
  it("cards carry the summary and per-side shares", () => {
    const c = toCard(s);
    expect(c.summary).toBe(s.summary);
    expect(c.leftPct).toBeCloseTo(s.near.leftHits / s.near.leftTotal);
    expect(c.hints).toBe(s.cues.hint1 + s.cues.hint2);
  });
  it("gives the four report tiles in plain words", () => {
    expect(measures(s).map((m) => m.label)).toEqual(["Left vs right", "Chipped diyas", "Search order", "Head turn"]);
    expect(measures(s)[0].value).toBe(`Left ${s.near.leftHits}/${s.near.leftTotal}, right ${s.near.rightHits}/${s.near.rightTotal}`);
  });
  it("lists every therapist number", () => {
    const rows = Object.fromEntries(therapistRows(s));
    expect(rows["Centre of Cancellation"]).toBe(fix(s.near.coc));
    expect(rows["Session id"]).toBe(s.sessionId);
    expect(rows["Far board found"]).toBeUndefined();
  });
  it("compares the first three sessions with the last three", () => {
    const p = progress(newestFirst)!;
    expect(p.k).toBe(3);
    expect(p.left[0]).toBeCloseTo(8 / 18);
    expect(p.left[1]).toBeCloseTo(17 / 18);
    expect(progress(newestFirst.slice(0, 3))).toBeNull();
  });
  it("formats numbers and times plainly", () => {
    expect(pct(0.834)).toBe("83%");
    expect(fix(-0.013)).toBe("−0.01");
    expect(fmtWhen(new Date().toISOString())).toMatch(/^Today, /);
  });
});
