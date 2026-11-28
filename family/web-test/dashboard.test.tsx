// The family dashboard's tools against a fake server: share and stop sharing, invite, import, delete.
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import { clearKey, setKey } from "@/lib/api";
import { logLine } from "../../Assets/Scripts/Core/Report";
import { toCard } from "@/lib/session";
import type { SessionJson } from "@/lib/types";
import demoJson from "../web/public/demo/sessions.json";
import { setReducedMotion } from "./setup";

const demo = demoJson as unknown as SessionJson[];
const sorted = demo.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt));
const KEY = "K".repeat(43);

type Call = { method: string; path: string; auth: string | null; body: unknown };

function fakeServer(over: Partial<Record<string, (c: Call) => Response>> = {}) {
  const calls: Call[] = [];
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json" } });
  const routes: Record<string, (c: Call) => Response> = {
    "GET /api/v1/me": () => json({ patient: { name: "Nani" }, sessions: sorted.map(toCard), notes: [], shares: [] }),
    "POST /api/v1/me/shares": () => json({ id: "sh_1", token: "T".repeat(43), expiresAt: "2026-12-10T00:00:00.000Z" }, 201),
    "DELETE /api/v1/me/shares/sh_1": () => new Response(null, { status: 204 }),
    "POST /api/v1/me/import": () => json({ sessionId: "s1" }, 201),
    "DELETE /api/v1/me": (c) => ((c.body as { confirm: string }).confirm === "Nani" ? new Response(null, { status: 204 }) : json({ error: { code: "bad_confirm", message: "Type the name exactly as shown." } }, 400)),
    ...over,
  };
  vi.stubGlobal("fetch", async (url: string, init: RequestInit = {}) => {
    const method = (init.method ?? "GET").toUpperCase();
    const path = new URL(url, "https://purna.dualmindlab.tech").pathname;
    const c: Call = { method, path, auth: new Headers(init.headers).get("authorization"), body: init.body ? JSON.parse(String(init.body)) : null };
    calls.push(c);
    const h = routes[`${method} ${path}`];
    return h ? h(c) : json({ error: { code: "not_found", message: "Not found" } }, 404);
  });
  return calls;
}

async function openDash() {
  render(<App demo={demo} />);
  await screen.findByRole("heading", { name: "Nani’s practice" });
}

describe("Dashboard tools", () => {
  beforeEach(() => { clearKey(); setKey(KEY); setReducedMotion(true); history.replaceState(null, "", "/"); });
  afterEach(() => { vi.unstubAllGlobals(); setReducedMotion(false); clearKey(); });

  it("makes a 7-day doctor link with the family key, lists it, and stops it", async () => {
    const calls = fakeServer();
    await openDash();
    fireEvent.click(screen.getByRole("button", { name: /Share with doctor/ }));
    const dialog = await screen.findByRole("dialog", { name: "Share with doctor" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Make a 7-day link" }));
    await waitFor(() => expect(dialog.querySelector("#share-new")!.textContent).toContain("/doctor#t=" + "T".repeat(43)));
    const post = calls.find((c) => c.method === "POST" && c.path === "/api/v1/me/shares")!;
    expect(post.auth).toBe(`Bearer ${KEY}`);
    expect(post.body).toEqual({ days: 7 });

    fireEvent.click(within(dialog).getByRole("button", { name: "Stop sharing" }));
    await waitFor(() => expect(within(dialog).getByText("Stopped. That link no longer works.")).toBeTruthy());
    expect(calls.some((c) => c.method === "DELETE" && c.path === "/api/v1/me/shares/sh_1")).toBe(true);
    expect(within(dialog).queryByRole("button", { name: "Stop sharing" })).toBeNull();
  });

  it("shows the server's words when a link can't be made", async () => {
    fakeServer({ "POST /api/v1/me/shares": () => new Response(JSON.stringify({ error: { code: "x", message: "Too many links. Stop one first." } }), { status: 429 }) });
    await openDash();
    fireEvent.click(screen.getByRole("button", { name: /Share with doctor/ }));
    const dialog = await screen.findByRole("dialog", { name: "Share with doctor" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Make a 7-day link" }));
    expect(await within(dialog).findByText("Too many links. Stop one first.")).toBeTruthy();
  });

  it("gives an invite link that carries the key in the fragment, never the query", async () => {
    fakeServer();
    await openDash();
    fireEvent.click(screen.getByRole("button", { name: /Invite family/ }));
    const dialog = await screen.findByRole("dialog", { name: "Invite family" });
    const link = dialog.querySelector("#invite-link")!.textContent!;
    expect(link).toBe(`${location.origin}/join#k=${KEY}`);
    expect(link).not.toContain("?");
  });

  it("imports a Logger line, refuses anything else, and reloads", async () => {
    const calls = fakeServer();
    await openDash();
    fireEvent.click(screen.getByRole("button", { name: /Import from Logger/ }));
    const dialog = await screen.findByRole("dialog", { name: "Import from Logger" });
    const box = within(dialog).getByLabelText("Session line");

    fireEvent.change(box, { target: { value: "hello" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Import" }));
    expect(await within(dialog).findByText(/doesn't look like a Purna session/)).toBeTruthy();
    expect(calls.some((c) => c.path === "/api/v1/me/import")).toBe(false);

    const before = calls.filter((c) => c.path === "/api/v1/me").length;
    fireEvent.change(box, { target: { value: "12:01:03 " + logLine(demo[0]) } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Import" }));
    expect(await within(dialog).findByText("Imported ✓")).toBeTruthy();
    const imp = calls.find((c) => c.path === "/api/v1/me/import")!;
    expect((imp.body as { session: SessionJson }).session.sessionId).toBe(demo[0].sessionId);
    expect(calls.filter((c) => c.path === "/api/v1/me").length).toBe(before + 1);
  });

  it("deletes only with the exact name, then lands back home with a plain message", async () => {
    const calls = fakeServer();
    await openDash();
    fireEvent.click(screen.getByRole("button", { name: /Delete everything/ }));
    const dialog = await screen.findByRole("dialog", { name: "Delete everything?" });
    const input = within(dialog).getByLabelText("Type “Nani” to confirm");

    fireEvent.change(input, { target: { value: "nani" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete everything" }));
    expect(await within(dialog).findByText("Type the name exactly as shown.")).toBeTruthy();

    fireEvent.change(input, { target: { value: "Nani" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete everything" }));
    expect(await screen.findByText(/Everything is deleted/)).toBeTruthy();
    expect(calls.filter((c) => c.method === "DELETE" && c.path === "/api/v1/me").map((c) => c.body)).toEqual([{ confirm: "nani" }, { confirm: "Nani" }]);
    expect(localStorage.length).toBe(0);
  });

  it("signing out forgets the key on this device only", async () => {
    const calls = fakeServer();
    await openDash();
    fireEvent.click(screen.getByRole("button", { name: /Sign out here/ }));
    expect(await screen.findByText(/Signed out on this device/)).toBeTruthy();
    expect(localStorage.length).toBe(0);
    expect(calls.every((c) => c.method === "GET")).toBe(true);
  });
});
