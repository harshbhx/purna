// Makes demo sessions from the real Purna engine driven by the simulated players in tools/test/bench.ts.
// Output: samples/*.json (one purna.session.v1 each). Simulated players, not patients.
// Usage: npm run sample            (writes files)
//        npm run sample -- --post https://purna.dualmindlab.tech <deviceId>   (also sends them)

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runPlayer, type Player } from "../../tools/test/bench";
import { makeSessionId } from "../../Assets/Scripts/Core/PurnaEngine";

// A two-week demo story (picked seeds, labelled as simulated): left finds climb 2 → 5, then a
// steadier week. Every number below still comes from the real engine and the bench players.
const plan: { day: number; player: Player; seed: number; hintDelayS: number }[] = [
  { day: 13, player: "leftNeglect", seed: 6, hintDelayS: 6 },
  { day: 12, player: "leftNeglect", seed: 1, hintDelayS: 6 },
  { day: 10, player: "leftNeglect", seed: 5, hintDelayS: 6 },
  { day: 9, player: "leftNeglect", seed: 2, hintDelayS: 6 },
  { day: 7, player: "leftNeglect", seed: 4, hintDelayS: 6 },
  { day: 6, player: "leftNeglect", seed: 3, hintDelayS: 6 },
  { day: 4, player: "objectNeglect", seed: 17, hintDelayS: 6 },
  { day: 2, player: "leftNeglect", seed: 7, hintDelayS: 6 },
  { day: 1, player: "healthy", seed: 19, hintDelayS: 6 },
];

const dir = join(process.cwd(), "samples");
mkdirSync(dir, { recursive: true });
const base = Date.UTC(2026, 11, 3, 4, 0, 0); // 3 Dec 2026, 09:30 IST
const out = plan.map((p, i) => {
  const s = runPlayer(p.player, p.seed, { hintDelayS: p.hintDelayS });
  const t = base - p.day * 86400000;
  s.startedAt = new Date(t).toISOString();
  s.sessionId = makeSessionId(t, (i + 1) / 10);
  const file = join(dir, `${String(i + 1).padStart(2, "0")}-${p.player}.json`);
  writeFileSync(file, JSON.stringify(s, null, 2) + "\n");
  return s;
});
// The web app's "See an example" and hero replay read this copy.
mkdirSync(join(process.cwd(), "web", "public", "demo"), { recursive: true });
writeFileSync(join(process.cwd(), "web", "public", "demo", "sessions.json"), JSON.stringify(out) + "\n");
console.log(`wrote ${out.length} sessions to samples/ and web/public/demo/sessions.json`);

// The landing's explainer: one table (seed 23), three simulated searchers. Bundled with the app.
const THREE_SEED = 23;
const three = (["healthy", "leftNeglect", "objectNeglect"] as const).map((player, i) => {
  const s = runPlayer(player, THREE_SEED, { hintDelayS: 6 });
  s.startedAt = new Date(base).toISOString();
  s.sessionId = makeSessionId(base, (i + 1) / 10);
  return { player, session: s };
});
mkdirSync(join(process.cwd(), "web", "src", "data"), { recursive: true });
writeFileSync(join(process.cwd(), "web", "src", "data", "three.json"), JSON.stringify(three) + "\n");
console.log("wrote web/src/data/three.json (seed " + THREE_SEED + ", three players)");

const i = process.argv.indexOf("--post");
if (i > 0) {
  const origin = process.argv[i + 1];
  const deviceId = process.argv[i + 2];
  if (!origin || !/^[0-9a-f]{32}$/.test(deviceId ?? "")) throw new Error("usage: --post <origin> <32-hex deviceId>");
  for (const s of out) {
    const r = await fetch(origin + "/api/v1/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ deviceId, session: s }),
    });
    console.log(r.status, await r.text());
  }
}
