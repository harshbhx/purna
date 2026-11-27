// Contract: every session the real Purna engine can produce is accepted by Purna Family.
// Runs the simulated players from tools/test/bench.ts through every preset and add-on combination.

import { describe, expect, it } from "vitest";
import { runPlayer, type Player } from "../../tools/test/bench";
import { validateSession } from "../src/lib/validate";

const players: Player[] = ["healthy", "leftNeglect", "objectNeglect"];
const presets = ["easy", "standard", "hard"] as const;

describe("engine → Purna Family contract", () => {
  for (const preset of presets) {
    for (const far of [false, true]) {
      for (const drift of [false, true]) {
        it(`${preset}${far ? " + far board" : ""}${drift ? " + warm-up" : ""}: every player's session validates and fits in 64 KB`, () => {
          for (const player of players) {
            for (const seed of [1, 7, 42]) {
              const s = runPlayer(player, seed, { preset, far, drift });
              expect(() => validateSession(JSON.parse(JSON.stringify(s)))).not.toThrow();
              // Not trivially empty: the player really played every phase.
              expect(s.near.leftHits + s.near.rightHits).toBeGreaterThan(0);
              if (far) expect(s.far!.leftHits + s.far!.rightHits).toBeGreaterThan(0);
              else expect(s.far).toBeNull();
              if (drift) expect(s.drift!.hits).toBeGreaterThan(0);
              else expect(s.drift).toBeNull();
              const bytes = new TextEncoder().encode(JSON.stringify({ deviceId: "0".repeat(32), session: s })).length;
              expect(bytes).toBeLessThan(64 * 1024);
            }
          }
        });
      }
    }
  }
});
