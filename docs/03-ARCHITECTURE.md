# 03 — Architecture

Two parts, one data contract:

1. **The Lens** (Lens Studio project, built by CLAD). Thin scene components around a pure TypeScript core.
2. **Purna Family** (`family/`, Cloudflare Worker + static assets + D1). Receives sessions, serves the family and doctor web app.

The contract between them is the session JSON, `purna.session.v1` (§5).

---

## 1. Repo layout

```
purna/                                  ← the Lens Studio project folder = the repo root
├── purna.esproj                        (Lens Studio, created by Harsh with Save As)
├── Assets/
│   ├── Scripts/
│   │   ├── Core/                       ← pure TS, no Lens Studio globals (written before CLAD)
│   │   │   ├── PurnaTypes.ts           types, fields, presets, settings, yawFromForward
│   │   │   ├── Rng.ts                  seeded PRNG
│   │   │   ├── Layout.ts               diya placement
│   │   │   ├── CueEngine.ts            hint timing + beam fading
│   │   │   ├── Drift.ts                warm-up plan (leftward only)
│   │   │   ├── PathMetrics.ts          pearson, segment crossing
│   │   │   ├── Metrics.ts              per-field results, head stats
│   │   │   ├── Report.ts               session JSON, summary sentence, Logger line
│   │   │   └── PurnaEngine.ts          the one object the Lens talks to
│   │   ├── PurnaController.ts          ← CLAD: feeds the engine, draws its output
│   │   ├── FieldView.ts, DiyaView.ts, BeamView.ts, HintAudio.ts,
│   │   ├── ReplayView.ts, SetupPanel.ts, ReportCard.ts, FamilySender.ts
│   │   └── Debug/PurnaSelfTest.ts, Debug/PurnaDemoDirector.ts   (off by default)
│   └── Tests/                          ← CLAD: LEAF scenarios c1–c5 (+ a1, a2)
├── tools/                              ← Node tests for Core (vitest) + patient bench
│   ├── package.json, vitest.config.ts, tsconfig.json (Core, ES2019), tsconfig.test.json
│   ├── test/*.test.ts, test/bench.ts
│   └── scripts/bench-chart.ts         draws docs/img/bench.svg from the bench
├── family/                             ← Purna Family (Cloudflare)
│   ├── wrangler.toml, package.json, tsconfig.json, vitest.config.ts
│   ├── migrations/0001_init.sql
│   ├── src/worker.ts (entry), src/api.ts (all /api/v1 routes), src/lib/{http,crypto,validate}.ts
│   ├── web/     the React app (Vite root): index.html, doctor.html, join.html
│   │   ├── public/   _headers (CSP), favicon.svg, fonts/ (Mukta, OFL), demo/sessions.json
│   │   └── src/      pages/ (Landing, Dashboard, Doctor, Join), components/{ui (shadcn/ui), reactbits, aceternity, purna},
│   │                 lib/ (api, csv, format, session, types), hooks/, styles.css (Tailwind v4 tokens)
│   ├── dist/    build output the Worker serves (git-ignored)
│   ├── scripts/make-sample.ts         demo sessions from the real engine + simulated players
│   ├── samples/*.json                 the same demo sessions, one file each (also used by tests)
│   ├── test/      Worker tests: api, validate, crypto, contract (+ helpers, migrations setup)
│   ├── web-test/  React component, page and library tests in jsdom
│   └── e2e/       Playwright specs (real Chrome vs wrangler dev, phone + desktop)
├── devpost/                            design-brief.md, plan-lens-answers.md
├── docs/                               this pack
├── .github/workflows/ci.yml            core, family, e2e and script checks on every push / PR
├── .github/workflows/deploy.yml        after CI passes on main: D1 migrations, wrangler deploy, smoke test
├── docs/img/                           README visuals (bench chart, GIFs, doctor view)
├── AGENTS.md, README.md, LICENSE (MIT), .gitignore
```

Core files are imported by Lens scripts with relative paths (`import { PurnaEngine } from "./Core/PurnaEngine"`) and by tests as `../../Assets/Scripts/Core/...`. Lens Studio creates `.meta` files next to them; commit those.

**Core code rules** (so it compiles in Lens Studio and Node): no `window`, `document`, `require`, Node APIs or Lens globals; no `Array.prototype.at`, `structuredClone`, `Object.hasOwn`; no top-level side effects; numbers in cm, seconds, degrees.

---

## 2. Coordinates

- 1 unit = 1 cm. Head starts at (0, 0, 0) looking down −z. +x right, +y up.
- **Field-relative coordinates** `(x, u)`: `x` along the field's width (left negative); `u` along its depth. On the flat table, world = (center.x + x, center.y, center.z + u) (u negative = farther away). On the upright board, world = (center.x + x, center.y + u, center.z).
- **Yaw:** `yawFromForward(fx, fz) = atan2(−fx, −fz)` in degrees; 0 = straight ahead, **positive = turned left**. In Lens Studio the camera looks down its local −Z, so the forward direction is `cameraTransform.back` (verify the sign once in the preview: turning left must give positive yaw).
- **Left / right:** an item is "left" if x < −3 cm, "right" if x > 3 cm (the band between is always empty).

| Field | Centre (cm) | Size (cm) | Lies | Margin | Band |
|---|---|---|---|---|---|
| `NEAR_FIELD` (table) | (0, −30, −65) | 70 × 45 | flat | 4 | 3 |
| `FAR_FIELD` (board) | (0, 0, −200) | 200 × 90 | upright | 12 | 9 |

| Preset | Table whole + chipped | Diya | Min gap | Board whole + chipped |
|---|---|---|---|---|
| easy | 8 + 8 | 6 cm | 8 cm | 6 + 6 |
| standard | 12 + 12 | 6 cm | 8 cm | 8 + 8 |
| hard | 16 + 16 | 5 cm | 7 cm | 10 + 10 |

Board diyas are 18 cm with a 22 cm gap for every preset (24 cm could not fit Hard reliably).

---

## 3. Core API (`Assets/Scripts/Core`)

```ts
// PurnaTypes.ts
export type Side = "L" | "R";
export type ItemKind = "whole" | "chipped";
export type Space = "near" | "far";
export type Phase = "setup" | "drift" | "near" | "far" | "replay" | "report";
export type Cue = "none" | "hint1" | "hint2";
export type PinchKind = "lit" | "chipped" | "revisit" | "drift-hit" | "drift-miss" | "ignored";

export interface Item { id: number; space: Space; x: number; u: number;
  kind: ItemKind; chip: Side | null; side: Side; sizeCm: number; }
export interface Settings { seed: number; preset: "easy"|"standard"|"hard"; hintDelayS: number;
  beamStart: number /*0..3*/; drift: boolean; far: boolean; share: boolean;
  driftS: number /*45*/; nearS: number /*90*/; farS: number /*60*/; }
export const DEFAULT_SETTINGS: Settings; export function withDefaults(s?: Partial<Settings>): Settings;
export const NEAR_FIELD: Field; export const FAR_FIELD: Field; export const PRESETS: {...};
export function yawFromForward(fx: number, fz: number): number;

// Layout.ts
export function generateLayout(field: Field, whole: number, chipped: number, seed: number,
  sizeCm: number, gapCm: number): Item[];   // deterministic; throws only if 20 reseeds fail

// CueEngine.ts
export function cueLevel(idleS: number, darkLeftWhole: number, delayS: number): 0 | 1 | 2;
export class CueTracker {
  constructor(delayS: number, beamStart: number);
  startTask(t: number): void;             // resets the spell
  onLit(t: number, side: Side): void;     // ends the spell; counts un-hinted left finds; may dim beam
  update(t: number, darkLeftWhole: number): Cue;   // "hint1"/"hint2" only on the frame it fires
  readonly beamLevel: number; readonly hint1Count: number; readonly hint2Count: number;
}

// Drift.ts
export const DRIFT_SPEED_CMS = 10; export const DRIFT_DIRECTION = -1;   // leftward, never change
export function planDrift(seed: number, durationS: number): DriftPlan;
export function driftX(item: DriftItem, t: number): number;            // x at time t
export function flickering(plan: DriftPlan, id: number, t: number): boolean;

// PathMetrics.ts
export function pearson(a: number[], b: number[]): number;            // 0 when undefined
export function segmentsIntersect(p1, p2, p3, p4): boolean;          // proper crossings only
export function countCrossings(points: {x:number;u:number}[]): number;

// Metrics.ts
export function fieldResult(field: Field, items: Item[], events: PinchEvent[], endedBy: EndedBy): FieldResult;
export function headStats(samples: {t:number; yaw:number}[]): HeadStats;

// Report.ts
export const SESSION_SCHEMA = "purna.session.v1";
export function summarySentence(s: SessionJson): string;
export function logLine(s: SessionJson): string;                     // "PURNA_SESSION {json}"

// PurnaEngine.ts — the only object the Lens needs
export class PurnaEngine {
  constructor(settings?: Partial<Settings>);
  readonly settings: Settings; readonly phase: Phase;
  start(t: number): EngineFrame;                       // leaves setup, enters drift|near
  tick(t: number, yawDeg: number): EngineFrame;        // call every frame
  pinch(t: number, itemId: number, yawDeg: number): PinchKind;
  finish(t: number): EngineFrame;                      // ends the current task early (Finish/Done)
  items(space: Space): Item[];                          // current layout
  litIds(space: Space): number[];                       // lit whole + nothing else
  replay(): { order: number[]; missed: number[] };      // table only
  report(startedAtIso: string, sessionId: string): SessionJson;   // valid once phase is replay/report
}
export interface EngineFrame {
  phase: Phase; phaseChanged: boolean; cue: Cue; beamLevel: number;
  drift?: { id: number; x: number; u: number; flicker: boolean }[];
}
```

Engine rules (match `01-PRD.md` L2–L14):
- `tick` ends a task when every whole item in it is lit (`endedBy: "complete"`) or its time limit passes (`"timeout"`); `finish` gives `"finish"`. After the last task the phase goes to `replay`; the Lens moves to `report` when the replay ends (`engine.showReport()` is not needed: the Lens just shows the card).
- Hints run only in `near` and `far`. `darkLeftWhole` counts whole items with `side === "L"` not yet lit in the current field.
- Yaw samples are recorded at most 10 times a second.

---

## 4. Lens scene and components (CLAD builds these)

```
Scene
├── Camera Object                        (Base Template)
├── SpectaclesInteractionKit             (keep; delete SIKExamples)
├── PreviewTable (stand-in)              70×45×2 cm box, light matte, hidden on device
├── PreviewBoard (stand-in)              200×90×2 cm, hidden on device (add-on)
└── Purna                                PurnaController
    ├── Field                            FieldView: spawns Diya prefabs from engine.items()
    ├── Beam                             BeamView: setLevel(0..3), pulse(), sweep()
    ├── HintSpeaker                      AudioComponent (spatial) at (−35, −27, −65) + HintAudio
    ├── Replay                           ReplayView: play(orderPositions, missedIds)
    ├── SetupPanel                       UI Kit frame → engine settings → Start
    ├── ReportCard                       UI Kit frame: 4 tiles + Replay / Send to family / Done
    ├── FamilySender                     InternetModule fetch → /api/v1/sessions
    └── Debug (disabled)                 PurnaSelfTest, PurnaDemoDirector
Prefab Diya = clay mesh (whole | chipped-left | chipped-right) + Flame (disabled) + Collider + SIK Interactable + DiyaView
```

`PurnaController` per frame:
1. `yaw = yawOverrideDeg ?? yawFromForward(camera.back.x, camera.back.z)`.
2. `f = engine.tick(getTime(), yaw)`.
3. If `f.phaseChanged`: FieldView rebuilds from `engine.items(...)`; show/hide stand-ins; on `replay` call ReplayView with `engine.replay()`; then ReportCard.
4. `BeamView.setLevel(f.beamLevel)`. If `f.cue === "hint1"`: `HintAudio.play()` + `BeamView.pulse(2)`. If `"hint2"`: `BeamView.sweep(3)`.
5. Drift: move drift diyas to `f.drift[i].x`; flicker the one with `flicker: true`.

On a SIK trigger on a diya: `kind = engine.pinch(getTime(), id, yaw)` → `lit`: DiyaView.light() + tone; `chipped`: tick sound; `revisit`: nothing.

On report: `json = engine.report(new Date().toISOString(), newSessionId())`; `print(logLine(json))`; fill tiles; if `settings.share`, show Send to family.

**Inputs for tests** on `PurnaController`: `yawOverrideDeg: number` (NaN = off), `seed: number`, `autoStart: boolean`, `fastHints: boolean` (hint delay 1 s, for LEAF speed). Public `getState()` returns `{ phase, beamLevel, hint1Count, hint2Count, items, litIds, lastCue }` for LEAF.

---

## 5. Data contract: `purna.session.v1`

Printed to the Logger as one line `PURNA_SESSION {json}` and POSTed to Purna Family. All coordinates are field-relative cm, rounded to 0.1. Max size 64 KB.

```json
{
  "schema": "purna.session.v1",
  "sessionId": "s_lx3k9q_8f2a",
  "lensVersion": "0.1.0",
  "startedAt": "2026-12-03T09:30:12.000Z",
  "durationS": 131.4,
  "settings": { "preset": "standard", "hintDelayS": 6, "beamStart": 3, "drift": false, "far": false, "seed": 4127 },
  "near": {
    "endedBy": "complete",
    "items": [ { "id": 0, "x": -24.6, "u": 8.2, "kind": "whole", "chip": null, "side": "L" } ],
    "events": [ { "t": 3.42, "id": 7, "r": "lit", "yaw": 3.1 } ],
    "leftHits": 9, "leftTotal": 12, "rightHits": 12, "rightTotal": 12,
    "fpChipLeft": 2, "fpChipRight": 0, "revisits": 1,
    "egoAsym": 0.143, "alloAsym": 2, "coc": 0.21,
    "bestR": 0.82, "crossings": 1, "meanStepCm": 14.3,
    "timeByColumnS": [9.8, 3.1, 2.4]
  },
  "far": null,
  "drift": null,
  "head": { "maxLeftDeg": 24.1, "maxRightDeg": 17.9, "pctTimeLeft": 0.38 },
  "cues": { "hint1": 2, "hint2": 1, "beamEnd": 2 },
  "summary": "Found 9 of 12 on the left and 12 of 12 on the right. 3 hints. Turned up to 24° left."
}
```

Field definitions:
- `events[].r`: `lit` | `chipped` | `revisit`. `t` = seconds since that task started.
- `leftHits/rightHits`: lit whole diyas per side; `*Total`: whole diyas per side.
- `fpChipLeft/Right`: chipped diyas pinched, by the side the **gap** is on (object-centred).
- `egoAsym = (rightHits − leftHits) / (leftHits + rightHits)`, 0 if no hits. Positive = right bias.
- `alloAsym = fpChipLeft − fpChipRight`. Positive = missing the left of objects.
- `coc` (Centre of Cancellation) = mean over lit whole diyas of `2·(x − xmin)/(xmax − xmin) − 1`, where xmin/xmax are the field's usable edges. −1..+1; positive = found mostly on the right. `null` if nothing lit.
- `bestR` = max(|pearson(order, x)|, |pearson(order, u)|) over lit whole diyas; `null` if fewer than 3.
- `crossings` = proper intersections between non-adjacent segments of the lit path.
- `meanStepCm` = mean distance between consecutive lit diyas.
- `timeByColumnS` = mean seconds to find a lit diya in the left / centre / right third (time since the previous lit, or task start); `null` entries if none.
- `drift` (add-on): `{ "flickers": 12, "hits": 9, "misses": 2 }`.
- `head.pctTimeLeft` = share of yaw samples during tasks with yaw > 5°.

---

## 6. Purna Family

### 6.1 Cloudflare setup (`family/wrangler.toml`)

```toml
name = "purna-family"
main = "src/worker.ts"
compatibility_date = "2026-11-01"
routes = [{ pattern = "purna.dualmindlab.tech", custom_domain = true }]

[assets]
directory = "./public"
run_worker_first = ["/api/*"]

[[d1_databases]]
binding = "DB"
database_name = "purna"
database_id = "<filled by the laptop agent>"
migrations_dir = "migrations"
```

The Worker answers `/api/*` only; everything else is static assets (`env.ASSETS.fetch(request)`).

### 6.2 API (`/api/v1`)

Auth: `Authorization: Bearer <familyKey>` for `/me/*`; `Bearer <shareToken>` for `/doctor*`. Keys and tokens are 32 random bytes, base64url; only their SHA-256 is stored.

| Method + path | Auth | Body | Response |
|---|---|---|---|
| `POST /sessions` | none (from the Lens) | `{ deviceId, session }` | `201 { sessionId, linked, pairCode? , pairExpiresAt? }` |
| `POST /pair` | none | `{ code, name }` | `200 { familyKey, patient: { name } }` · `404` bad/expired code · `409` already paired |
| `GET /me` | family | – | `{ patient, sessions: [SessionCard], notes: [Note], shares: [Share] }` |
| `GET /me/sessions/:id` | family | – | `{ session }` (full JSON) |
| `POST /me/import` | family | `{ session }` | `201 { sessionId }` |
| `POST /me/shares` | family | `{ days?: 7 }` (1–14) | `201 { id, token, expiresAt }` (token shown once) |
| `DELETE /me/shares/:id` | family | – | `204` |
| `DELETE /me` | family | `{ confirm: <display name> }` | `204` (everything removed) |
| `GET /doctor` | share | – | `{ patient: { name }, sessions: [full JSON], notes }` · `410` expired/revoked |
| `POST /doctor/notes` | share | `{ text }` (1–1000 chars) | `201 { id, createdAt }` |
| `GET /health` | none | – | `{ ok: true, version }` |

`SessionCard` = `{ id, startedAt, preset, summary, leftPct, rightPct, coc, hints, maxLeftDeg, endedBy }`.

**Pairing flow:** a session from an unknown `deviceId` is stored unlinked; the device gets a code `DIYA-XXXX` (alphabet `23456789ABCDEFGHJKMNPQRSTUVWXYZ`, 72 h). Later sends from the same unpaired device get the same code until it expires, then a fresh one. `POST /pair` accepts the code typed loosely (`diya 7k3p`, `7K3P`), creates the patient, links the device and all its earlier sessions. The code is **kept** on the paired device so a second attempt gets `409 Already paired` rather than `404`. Later sessions from that device link automatically. A resend of the same `sessionId` from the same device is a no-op `200`.

**Known limit:** 4-character codes (31⁴ ≈ 920k) could be guessed by a determined attacker during the 72 h window; the prize would be an unnamed stranger's practice numbers. Add the Workers rate-limiting binding on `/pair` before any real use (§6.4).

**Device ID** (Lens): 16 random bytes hex, stored with persistent storage if the platform provides it (check on device; in the preview it may be new each run, which only means a new pairing code; fine for the demo).

### 6.3 D1 schema (`migrations/0001_init.sql`)

```sql
CREATE TABLE patients (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, key_hash TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL
);
CREATE TABLE devices (
  device_id TEXT PRIMARY KEY, patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
  pair_code TEXT UNIQUE, pair_expires_at INTEGER, created_at INTEGER NOT NULL
);
CREATE TABLE sessions (
  id TEXT PRIMARY KEY, device_id TEXT, patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
  received_at INTEGER NOT NULL, started_at TEXT NOT NULL, preset TEXT NOT NULL,
  left_hits INTEGER, left_total INTEGER, right_hits INTEGER, right_total INTEGER,
  coc REAL, hints INTEGER, max_left_deg REAL, ended_by TEXT, summary TEXT NOT NULL, json TEXT NOT NULL
);
CREATE INDEX sessions_patient ON sessions(patient_id, started_at DESC);
CREATE INDEX sessions_device ON sessions(device_id);
CREATE TABLE shares (
  id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE notes (
  id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  share_id TEXT, text TEXT NOT NULL, created_at INTEGER NOT NULL
);
```

D1 enforces foreign keys; `DELETE /me` still deletes child rows explicitly in one batch so nothing depends on cascade behaviour.

### 6.4 Validation and limits

- Body ≤ 64 KB; `Content-Type: application/json`.
- `session.schema === "purna.session.v1"`; ≤ 64 items and ≤ 600 events per field; every number finite; strings ≤ 300 chars; `preset` in the enum; `startedAt` parses as a date.
- `deviceId` = 32 hex chars. `name` 1–40 chars, trimmed. Note text 1–1000 chars.
- `POST /sessions` allows CORS `*` (no cookies are ever used). All other routes are same-origin.
- Rate limiting: use Cloudflare's Workers rate-limiting binding if available on the account (check the docs when deploying); otherwise rely on the size limits.
- Responses never echo raw input in HTML; the web app renders all text with `textContent`.

### 6.5 Web app (`family/public`)

React 18 + Vite + Tailwind v4, built to `family/dist` and served by the same Worker (`[assets] directory = "./dist"`). Components: shadcn/ui patterns over Radix primitives, React Bits (BlurText, CountUp, SpotlightCard, ShinyText, Magnet), and Aceternity-style effects (lamp, spotlight, scroll timeline, dot background). Fonts are bundled (Geist) or self-hosted (Mukta). CSP keeps `script-src 'self'` with no inline scripts; `style-src` allows `'unsafe-inline'` because Radix's scroll lock and motion set inline styles. All user text is rendered by React as text.

| Page | Purpose |
|---|---|
| `/` | Hero (what Purna is, for judges and families) with a live replay of an example session → "Have a code from the glasses?" form (code + name) and **See an example** (dashboard from `demo/sessions.json`, labelled simulated) → dashboard when a key is in localStorage: nudge, session cards, trend chart, notes, Share with doctor, Invite family, Import, Delete everything |
| `/#s=<id>` (dialog on `/`) | Session detail: plain summary, 2D table replay (SVG: lit order thread, missed diyas), four measures, therapist numbers |
| `/join#k=<key>` | Saves the family key, redirects to `/` |
| `/doctor#t=<token>` | Read-only: patient name, every measure per session, trends, CSV download (formula-safe), print layout, notes box (≤ 50 notes per link). The token moves from the URL to sessionStorage on load |

Charts are hand-drawn SVG (`assets/charts.js`): trend = two lines (left %, right %) over session dates; replay = table rectangle, diyas as circles (whole/chipped icons), thread in lit order.

---

## 7. Tests and CI

- `tools/`: vitest on Core + patient bench, coverage ≥ 85% on `Assets/Scripts/Core`.
- `family/`: vitest 4 with `@cloudflare/vitest-plugin` (the renamed `vitest-pool-workers`): real Worker + local D1, migrations applied in setup; jsdom unit tests for the browser code; Playwright end-to-end in Chrome.
- LEAF scenarios in `Assets/Tests` run in Lens Studio (not in CI).
- `.github/workflows/ci.yml`: every suite on push to `main` and on PRs, read-only permissions, coverage in the job summary, stale-artifact checks for the bench chart and demo data.
- `.github/workflows/deploy.yml` (CD): runs when CI passes on `main` (or by hand). Applies D1 migrations, deploys the Worker, smoke-tests `/api/v1/health` and the CSP header. Needs secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `PURNA_D1_DATABASE_ID`; skips with a notice without them. The Lens has no CD: it ships from Lens Studio.

Details: `06-TESTING.md`.
