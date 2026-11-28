// suggestNext: two clean sessions → a step harder; a hard session → a step easier; otherwise stay.
import { describe, expect, it } from "vitest";
import { briefOf, HINT_DELAYS, PRESET_ORDER, SessionBrief, suggestNext } from "../../Assets/Scripts/Core/Next";
import { runPlayer } from "./bench";

const b = (over: Partial<SessionBrief> = {}): SessionBrief => ({
  preset: "standard", hintDelayS: 6, leftHits: 6, leftTotal: 6, rightHits: 6, rightTotal: 6, hints: 0, ...over,
});
const struggle = (over: Partial<SessionBrief> = {}) => b({ leftHits: 2, hints: 3, ...over });

describe("suggestNext", () => {
  it("starts on Standard with a 6 s hint", () => {
    expect(suggestNext([])).toMatchObject({ preset: "standard", hintDelayS: 6, change: "start" });
  });

  it("steps up the table after two clean sessions on the same setting, keeping the hint delay", () => {
    expect(suggestNext([b(), b()])).toMatchObject({ preset: "hard", hintDelayS: 6, change: "harder" });
    expect(suggestNext([b({ preset: "easy", hintDelayS: 4 }), b({ preset: "easy", hintDelayS: 4 })])).toMatchObject({ preset: "standard", hintDelayS: 4 });
    expect(suggestNext([b(), b()]).reason).toBe("Every diya found without hints, twice in a row. Try Hard.");
  });

  it("on Hard, makes the hint wait longer instead, and stops at the hardest setting", () => {
    expect(suggestNext([b({ preset: "hard" }), b({ preset: "hard" })])).toMatchObject({ preset: "hard", hintDelayS: 10, change: "harder" });
    expect(suggestNext([b({ preset: "hard", hintDelayS: 10 }), b({ preset: "hard", hintDelayS: 10 })])).toMatchObject({ preset: "hard", hintDelayS: 10, change: "same" });
  });

  it("needs both clean sessions on the same setting, so a level change resets the count", () => {
    expect(suggestNext([b({ preset: "hard" }), b({ preset: "standard" })]).change).toBe("same");
    expect(suggestNext([b(), b({ hintDelayS: 4 })]).change).toBe("same");
    expect(suggestNext([b()]).change).toBe("same");
    expect(suggestNext([b(), b({ hints: 1 })]).change).toBe("same");
    expect(suggestNext([b(), b({ rightHits: 5 })]).change).toBe("same");
  });

  it("steps down after a hard session: under half the left found and 3 or more hints", () => {
    expect(suggestNext([struggle({ preset: "hard" })])).toMatchObject({ preset: "standard", change: "easier" });
    expect(suggestNext([struggle()]).reason).toBe("Last time was hard work. Try Easy.");
    expect(suggestNext([struggle({ preset: "easy", hintDelayS: 6 })])).toMatchObject({ preset: "easy", hintDelayS: 4, change: "easier" });
    expect(suggestNext([struggle({ preset: "easy", hintDelayS: 4 })])).toMatchObject({ preset: "easy", hintDelayS: 4, change: "same" });
  });

  it("doesn't call a session hard on misses alone or hints alone", () => {
    expect(suggestNext([b({ leftHits: 2, hints: 2 })]).change).toBe("same");
    expect(suggestNext([b({ leftHits: 3, hints: 5 })]).change).toBe("same");
  });

  it("snaps an odd stored hint delay to the nearest offered one", () => {
    expect(suggestNext([b({ hintDelayS: 7 })]).hintDelayS).toBe(6);
    expect(suggestNext([b({ hintDelayS: 1 })]).hintDelayS).toBe(4);
    expect(HINT_DELAYS).toEqual([4, 6, 10]);
    expect(PRESET_ORDER).toEqual(["easy", "standard", "hard"]);
  });

  it("works from real engine sessions: the bench's searchers get sensible suggestions", () => {
    const healthy = [runPlayer("healthy", 11, { hintDelayS: 6 }), runPlayer("healthy", 12, { hintDelayS: 6 })].map(briefOf);
    expect(suggestNext(healthy).change).toBe("harder");
    const neglect = briefOf(runPlayer("leftNeglect", 23, { hintDelayS: 6 }));
    expect(neglect.hints).toBeGreaterThan(0);
    expect(["same", "easier"]).toContain(suggestNext([neglect]).change);
  });
});
