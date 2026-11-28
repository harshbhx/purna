# How it's built

The parts of Purna, how they talk to each other, and how we make sure they keep working. Written for technical readers; nothing here is needed to use Purna.

## One engine, three homes

All of Purna's rules live in one place: plain TypeScript in `Assets/Scripts/Core`, with no Lens Studio, browser or server code in it. The same files run in three places:

| Where | What it does with the engine |
|---|---|
| **The Lens on Spectacles** | Calls it every frame with the time and the head's direction, draws what it returns, and passes on every pinch |
| **The tests** | Run it thousands of times: 500 random layouts at every level, frame-exact hint timing, and the patient bench |
| **The browser table** | Runs it in your browser at [/play](https://purna.dualmindlab.tech/play), in 3D or top-down |

The engine places the diyas, times the hints, fades the beam, records every pinch and head sample, and works out every measure on the report. Because it was written and tested before Lens Studio opened, CLAD built the scene against logic that already worked.

## The Lens

Built in Lens Studio with CLAD from the plan-lens design brief. A single controller feeds the engine and draws its output: the table, the diyas (whole and chipped), the beam on the left edge, the bell placed at the table's left edge as spatial sound, the replay thread, the attention map and the report card. Every diya can be pinched with the Spectacles Interaction Kit's ray from a resting hand. LEAF tests check each done criterion in the preview, using a head-direction override because tests can't turn the preview camera.

## One data contract

A session travels as one versioned JSON document, `purna.session.v1`: the settings, every diya's position, every pinch with its time and head direction, every measure, the hints, the head-turn statistics and the attention map. It's capped at 64 KB. The server checks every field and size before storing anything, and a test runs the engine through every level and add-on to prove that everything it can produce passes those checks.

## The server

A Cloudflare Worker with a D1 database, at purna.dualmindlab.tech:

| Route | Who calls it | What it does |
|---|---|---|
| Send a session | The glasses | Stores it; the first time, returns a pairing code |
| Pair | The family | Turns the code and a display name into a family key |
| The dashboard | The family | Sessions, notes, the next-session plan; invite, import, share, delete |
| The doctor link | The therapist | Every session, notes back to the family, the next session |
| The next session | The glasses | The plan the therapist set, if any |

**Security and privacy:** family keys and doctor links are 32 random bytes, stored only as SHA-256 hashes; doctor links expire and can be stopped; pairing, uploads, notes and plans are rate-limited; data from glasses that are never paired is deleted after 30 days by a daily job; "Delete everything" removes a family's data in one step. See [Privacy](#privacy).

## The website

React 18, Vite and Tailwind, with components after shadcn/ui, motion from React Bits and effects in the style of Aceternity UI, built into static files the same Worker serves. Strict content security policy: scripts only from the site itself, no third-party scripts, no cookies. The 3D table uses three.js, downloaded only when that view opens. Light and dark follow your system or the switch in the header; the family's screens also work in Hindi.

## Tests and releases

| Suite | Tests | What it proves |
|---|---|---|
| Engine and patient bench | 79 | Layout rules, hint timing, beam fading, every measure, the attention map, the next-session choice, the sounds |
| Server and database | 84 | Every route and error, field-by-field checks, the engine-to-server contract, rate limits, clean-up, the therapist plan |
| Website components | 72 | Charts, replays, dashboards, the therapist view, the browser table, docs, Hindi, themes |
| End to end, phone and desktop | 51 | Every family and therapist flow in real Chrome, a keyboard-only walk, accessibility scans in light and dark |

Every change goes through an issue and a pull request; GitHub runs all 286 tests before it can merge. Cloudflare then builds and deploys the site from the main branch, and a check confirms the live site after each release and once a day.

## Tools we used

Snap Spectacles and Lens Studio; CLAD and the Lens Studio MCP; Cloudflare Workers and D1; TypeScript, React, Vite, Tailwind and three.js; Vitest and Playwright with axe for testing; GitHub Actions. Claude wrote most of the code, tests and docs with Harsh directing, reviewing and testing.

Source: [github.com/harshbhx/purna](https://github.com/harshbhx/purna) (MIT licence).

Last reviewed: 28 November 2026.
