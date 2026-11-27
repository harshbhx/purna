import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "../public/assets/csv.js";
import demo from "../public/demo/sessions.json";

describe("csvCell", () => {
  it("quotes everything and doubles inner quotes", () => {
    expect(csvCell("Papa")).toBe('"Papa"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell(null)).toBe('""');
    expect(csvCell(undefined)).toBe('""');
  });

  it("neutralises spreadsheet formulas", () => {
    for (const evil of ["=HYPERLINK(\"x\")", "+cmd", "-cmd|' /C calc'!A0", "@SUM(A1)", "\tx", "\rx"]) {
      expect(csvCell(evil).startsWith("\"'")).toBe(true);
    }
  });

  it("leaves numbers alone, including negatives", () => {
    expect(csvCell(-0.21)).toBe('"-0.21"');
    expect(csvCell(0)).toBe('"0"');
    expect(csvCell(12.5)).toBe('"12.5"');
  });
});

describe("toCsv", () => {
  const csv = toCsv(demo);
  const rows = csv.trimEnd().split("\r\n");

  it("has a header and one row per session, each with the same column count", () => {
    expect(rows).toHaveLength(demo.length + 1);
    const cols = rows[0].split(",").length;
    expect(cols).toBe(33);
    for (const r of rows.slice(1)) expect(r.match(/","/g)!.length + 1).toBe(cols);
  });

  it("puts the right values in the right columns", () => {
    const head = rows[0].split(",").map((h) => h.replace(/"/g, ""));
    const first = rows[1].split('","').map((c) => c.replace(/^"|"$/g, ""));
    const s = demo[0];
    expect(first[head.indexOf("session_id")]).toBe(s.sessionId);
    expect(first[head.indexOf("left_hits")]).toBe(String(s.near.leftHits));
    expect(first[head.indexOf("coc")]).toBe(String(s.near.coc));
    expect(first[head.indexOf("far_left_hits")]).toBe("");
  });

  it("ends with CRLF so Excel and Sheets open it cleanly", () => {
    expect(csv.endsWith("\r\n")).toBe(true);
  });
});
