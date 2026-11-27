// The app shell: landing until there's a key, the example dashboard, and the dashboard's dialogs.
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import { clearKey, setKey } from "@/lib/api";
import { toCard } from "@/lib/session";
import type { SessionJson } from "@/lib/types";
import demoJson from "../web/public/demo/sessions.json";
import { setReducedMotion } from "./setup";

const demo = demoJson as unknown as SessionJson[];
const sorted = demo.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt));

describe("App", () => {
  beforeEach(() => { clearKey(); setReducedMotion(true); history.replaceState(null, "", "/"); });
  afterEach(() => { vi.unstubAllGlobals(); setReducedMotion(false); });

  it("shows the landing page with the hero, the steps and the code form", () => {
    render(<App demo={demo} />);
    expect(screen.getByRole("heading", { level: 1, name: "Practice that makes the world whole again." })).toBeTruthy();
    expect(screen.getAllByText(/Step \d/)).toHaveLength(5);
    expect(screen.getByLabelText("Code")).toBeTruthy();
    expect(screen.getByLabelText("What do you call them?")).toBeTruthy();
  });

  it("opens a labelled example dashboard with every demo session", async () => {
    render(<App demo={demo} />);
    fireEvent.click(screen.getAllByRole("button", { name: "See an example" })[0]);
    expect(await screen.findByRole("heading", { name: "Papa’s practice" })).toBeTruthy();
    expect(screen.getByText(/simulated data/)).toBeTruthy();
    expect(document.querySelectorAll("#dash .session-card")).toHaveLength(demo.length);
    expect(screen.queryByRole("button", { name: /Share with doctor/ })).toBeNull();
  });

  it("asks for a code before pairing, and shows the server's message on a bad one", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ error: { code: "unknown_code", message: "We couldn't find that code. Check it on the glasses." } }), { status: 404 }));
    render(<App demo={demo} />);
    fireEvent.click(screen.getByRole("button", { name: "See their practice" }));
    expect(screen.getByRole("alert").textContent).toMatch(/Type the code/);
    fireEvent.change(screen.getByLabelText("Code"), { target: { value: "DIYA-2222" } });
    fireEvent.change(screen.getByLabelText("What do you call them?"), { target: { value: "Papa" } });
    fireEvent.click(screen.getByRole("button", { name: "See their practice" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("We couldn't find that code. Check it on the glasses."));
  });

  it("with a key, loads the family dashboard; a dead key goes back to the landing with a reason", async () => {
    setKey("K".repeat(43));
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ patient: { name: "Nani" }, sessions: sorted.map(toCard), notes: [], shares: [] }), { status: 200 }));
    const { unmount } = render(<App demo={demo} />);
    expect(await screen.findByRole("heading", { name: "Nani’s practice" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Share with doctor/ })).toBeTruthy();
    unmount();

    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ error: { code: "bad_key", message: "x" } }), { status: 401 }));
    render(<App demo={demo} />);
    expect(await screen.findByText(/isn't valid any more/)).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });

  it("opens a session with its replay and four measures", async () => {
    render(<App demo={demo} />);
    fireEvent.click(screen.getAllByRole("button", { name: "See an example" })[0]);
    await screen.findByRole("heading", { name: "Papa’s practice" });
    fireEvent.click(screen.getAllByRole("button", { name: /Open session from/ })[3]);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("img", { name: /Table seen from above/ })).toBeTruthy();
    expect(dialog.querySelectorAll(".measure")).toHaveLength(4);
    fireEvent.click(within(dialog).getByRole("button", { name: /Details for the therapist/ }));
    expect(within(dialog).getByText("Centre of Cancellation")).toBeTruthy();
  });
});
