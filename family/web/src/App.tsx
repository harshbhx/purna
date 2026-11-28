// "/" is the landing page until a family key exists; then it's that family's dashboard.
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { ApiError, api, clearKey, getKey, setKey, takeFragment } from "@/lib/api";
import { toCard } from "@/lib/session";
import type { Me, SessionJson } from "@/lib/types";
// The dashboard is only needed after pairing or "See an example", so it loads then, not with the landing page.
const Dashboard = lazy(() => import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })));
import { Landing } from "@/pages/Landing";

type View = { kind: "landing" } | { kind: "loading" } | { kind: "dash"; me: Me; demo: boolean };

export function App({ demo }: { demo: SessionJson[] }) {
  const [key, setFamilyKey] = useState<string | null>(() => {
    const k = takeFragment("k");
    if (k) setKey(k);
    return getKey();
  });
  const [view, setView] = useState<View>(key ? { kind: "loading" } : { kind: "landing" });
  const [flash, setFlash] = useState<{ kind: "success" | "danger"; text: string } | null>(null);
  const sessions = useRef(new Map<string, SessionJson>());

  const load = useCallback(async (k: string) => {
    try {
      const me = await api<Me>("/me", { auth: k });
      setView({ kind: "dash", me, demo: false });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        clearKey();
        setFamilyKey(null);
        setView({ kind: "landing" });
        setFlash({ kind: "danger", text: "This family link isn't valid any more. Ask your family for a new invite link, or pair again with a code from the glasses." });
      } else {
        setView({ kind: "landing" });
        setFlash({ kind: "danger", text: (e as Error).message });
      }
    }
  }, []);

  useEffect(() => { if (key) void load(key); }, [key, load]);

  const openExample = () => {
    const sorted = demo.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    for (const s of sorted) sessions.current.set(s.sessionId, s);
    setView({
      kind: "dash",
      demo: true,
      me: {
        patient: { name: "Papa" },
        sessions: sorted.map(toCard),
        notes: [{ id: "demo", text: "Good progress on the left side. Keep the hint delay at 6 s and try Hard on Friday.", createdAt: sorted[1]?.startedAt ?? new Date().toISOString() }],
        shares: [],
      },
    });
  };

  const toLanding = (text: string | null, kind: "success" | "danger" = "success") => {
    clearKey();
    setFamilyKey(null);
    sessions.current.clear();
    setView({ kind: "landing" });
    setFlash(text ? { kind, text } : null);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const loading = <p className="p-8 text-muted-foreground">Loading…</p>;
  if (view.kind === "loading") return loading;
  if (view.kind === "dash") {
    return (
      <Suspense fallback={loading}>
      <Dashboard
        me={view.me}
        demo={view.demo}
        familyKey={key}
        sessionsById={sessions.current}
        onReload={() => (key ? load(key) : Promise.resolve())}
        onSignOut={() => toLanding("Signed out on this device. Use your invite link to come back.")}
        onDeleted={() => toLanding("Everything is deleted. To start again, send a session from the glasses for a new code.")}
      />
      </Suspense>
    );
  }
  return (
    <>
      {flash && <div id="flash" className="mx-auto max-w-6xl px-5 pt-4"><Alert variant={flash.kind}>{flash.text}</Alert></div>}
      <Landing demo={demo} onExample={openExample} onPaired={(k) => { setKey(k); setFamilyKey(k); setFlash(null); }} />
    </>
  );
}
