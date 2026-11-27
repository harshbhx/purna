import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Doctor } from "@/pages/Doctor";
import type { SessionJson } from "@/lib/types";
import demoJson from "../web/public/demo/sessions.json";
import { setReducedMotion } from "./setup";

const demo = (demoJson as unknown as SessionJson[]).slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt));
const TOKEN = "T".repeat(43);

function serve(notes: { id: string; text: string; createdAt: string }[] = []) {
  const calls: { url: string; init?: RequestInit }[] = [];
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    if (url.endsWith("/doctor/notes")) {
      notes.push({ id: "n" + notes.length, text: JSON.parse(String(init!.body)).text, createdAt: new Date().toISOString() });
      return new Response(JSON.stringify({ id: "n", createdAt: new Date().toISOString() }), { status: 201 });
    }
    return new Response(JSON.stringify({ patient: { name: "Papa" }, expiresAt: new Date(Date.now() + 6 * 864e5).toISOString(), sessions: demo, notes }), { status: 200 });
  });
  return calls;
}

describe("Doctor view", () => {
  beforeEach(() => { setReducedMotion(true); sessionStorage.clear(); history.replaceState(null, "", "/doctor#t=" + TOKEN); });
  afterEach(() => { vi.unstubAllGlobals(); setReducedMotion(false); });

  it("takes the token out of the URL, sends it as a bearer, and shows every session with the progress tiles", async () => {
    const calls = serve();
    render(<Doctor />);
    expect(await screen.findByRole("heading", { name: "Papa: Purna practice" })).toBeTruthy();
    expect(location.hash).toBe("");
    expect((calls[0].init!.headers as Record<string, string>).authorization).toBe("Bearer " + TOKEN);
    expect(document.querySelectorAll("#table tbody tr")).toHaveLength(demo.length);
    expect(screen.getByText("Left side found").parentElement!.textContent).toContain("44% → 94%");
  });

  it("saves a note and shows it", async () => {
    serve();
    render(<Doctor />);
    await screen.findByRole("heading", { name: "Papa: Purna practice" });
    fireEvent.change(screen.getByLabelText("Add a note for the family"), { target: { value: "Try Hard on Friday." } });
    fireEvent.click(screen.getByRole("button", { name: "Save note" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/Saved/));
    expect(screen.getByText("Try Hard on Friday.")).toBeTruthy();
  });

  it("explains an expired link and a missing key in plain words", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ error: { code: "expired", message: "This link has expired. Ask the family for a new one." } }), { status: 410 }));
    const { unmount } = render(<Doctor />);
    expect((await screen.findByRole("alert")).textContent).toBe("This link has expired. Ask the family for a new one.");
    unmount();
    sessionStorage.clear();
    history.replaceState(null, "", "/doctor");
    render(<Doctor />);
    expect(screen.getByRole("alert").textContent).toMatch(/missing its key/);
  });
});
