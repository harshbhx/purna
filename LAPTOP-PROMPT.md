# LAPTOP-PROMPT: one prompt for the laptop agent

The code, tests, CI and deploy workflow are already on [github.com/harshbhx/purna](https://github.com/harshbhx/purna). What's left needs your laptop: the Lens Studio project, CLAD, and the Cloudflare secrets.

**You do three things:** install Lens Studio 5.23.2 and sign in, approve logins when asked (GitHub, Cloudflare, Snap), and paste the prompt below into Claude Code (any folder).

---

```
You're finishing Purna, my entry for Learn AR with SPECS Round 2 (deadline Tue 8 Dec 03:30 IST; live review Thu 3 Dec 22:30 IST). The repo is github.com/harshbhx/purna. Read its AGENTS.md and docs/00-RUNBOOK.md first and follow AGENTS.md throughout. Above all: every commit has author AND committer "Harsh Bhanushali <bhanushaliharsh434@gmail.com>", signed with my own key if git signing is set up on this laptop; never Claude or a bot as author or committer, no Co-Authored-By lines. Work issue → branch → PR → green CI → merge commit → delete branch; no PR left open. Tell me after each part what passed and what's blocked; only wait for me when you need a login.

PART A: Lens Studio project in the repo (Snap's CLAD setup; the order matters)
1. Install Lens Studio 5.23.2 (ar.snap.com/download/v5-23-2) if missing. If I'm not signed in, ask me to sign in.
2. Clone the repo to ~/purna.
3. Lens Studio → SPECS → Base Template → File > Save As into a temp folder, then move the project files (the .esproj, Assets/ content, Packages, etc.) into ~/purna so Assets/ merges with the existing Assets/Scripts/Core. If you can't drive the Lens Studio UI, ask me to do just this step. Reopen ~/purna in Lens Studio and check it opens and runs in the Preview with Device Type Override = Spectacles.
4. With Lens Studio open on ~/purna, start Claude Code there. /plugin marketplace add https://github.com/lens-studio-devs/ls-extensions.git ; install the CLAD plugin (ls-clad) per developers.specs.com/docs/clad/setup/setup-ai/claude-code-setup ; check /mcp shows lens-studio connected.
5. Back up devpost/, run: npx skills add challengepost/learn-specs --all -y , then restore devpost/design-brief.md and devpost/plan-lens-answers.md if the pack touched them. Tell me if the installed plan-lens template's headings differ from our brief's.
6. Open issue "Add the SPECS Lens Studio project", commit the project files on a branch (respect .gitignore; keep .meta files), PR, wait for CI, merge.

PART B: turn on CD (Purna Family → purna.dualmindlab.tech, my Cloudflare account; dualmindlab.tech is a zone there)
1. npx wrangler d1 create purna (in family/) → note the database id. Don't commit it.
2. Create a Cloudflare API token with Workers Scripts:Edit, D1:Edit, Workers Routes:Edit and Zone:Read for dualmindlab.tech.
3. gh secret set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID and PURNA_D1_DATABASE_ID on harshbhx/purna. Never paste these into chat summaries, Notion or Devpost.
4. gh workflow run "Deploy Purna Family" and watch it. It migrates D1, deploys, and smoke-tests https://purna.dualmindlab.tech. From now on every green merge to main deploys by itself.
5. If the account has the Workers rate-limiting binding, add one on POST /api/v1/pair (10/min per IP) via issue → PR.
6. Smoke test as a family: cd family && npm ci && npm run sample -- --post https://purna.dualmindlab.tech <32 random hex chars> ; pair with the printed DIYA code as "Papa"; make a doctor link; open it in a private window. Send me the code and both links.

PART C: issues for the remaining work
In ~/purna: bash tools/create-issues.sh (creates labels and one issue per open task in docs/04-TASKS.md; finished ✅ tasks are skipped).

PART D: build the Lens with CLAD (only after I say the brief is approved; devpost/design-brief.md must say status: approved)
Use docs/05-PROMPTS.md: try §1 (the official one-shot) first; if it stalls, /clear and run the §2 slices in order (slice 1, setup panel, slice 2, slice 3, slice 4, then self-test + demo director), each in a fresh /clear. Assets/Scripts/Core is done and tested: CLAD must call PurnaEngine, never rewrite it, and the Core CI must stay green. After each slice: run its LEAF tests, close its issue through a PR, and send me a 1-line status plus anything to look at in the Preview. Stop at the Gate 2 cut line in docs/00-RUNBOOK.md if C1–C5 aren't passing by Fri 4 Dec 21:00.
```
