// CSV export for the doctor view. Every cell is quoted; text that a spreadsheet would run as a
// formula (=, +, -, @, tab, CR) is prefixed with an apostrophe. Plain numbers stay numbers.

export function csvCell(v) {
  const t = String(v ?? "");
  // Neutralise spreadsheet formulas and quote everything.
  const safe = /^[=+\-@\t\r]/.test(t) && !/^-?\d/.test(t) ? "'" + t : t;
  return '"' + safe.replace(/"/g, '""') + '"';
}

export function toCsv(sessions) {
  const head = ["started_at", "session_id", "preset", "duration_s", "hint_delay_s", "left_hits", "left_total", "right_hits", "right_total",
    "coc", "ego_asym", "allo_asym", "fp_chip_left", "fp_chip_right", "best_r", "crossings", "revisits", "mean_step_cm",
    "t_left_s", "t_centre_s", "t_right_s", "hint1", "hint2", "beam_end", "max_left_deg", "max_right_deg", "pct_time_left",
    "far_left_hits", "far_left_total", "far_right_hits", "far_right_total", "far_coc", "summary"];
  const rows = sessions.map((s) => {
    const n = s.near, f = s.far;
    return [s.startedAt, s.sessionId, s.settings.preset, s.durationS, s.settings.hintDelayS, n.leftHits, n.leftTotal, n.rightHits, n.rightTotal,
      n.coc, n.egoAsym, n.alloAsym, n.fpChipLeft, n.fpChipRight, n.bestR, n.crossings, n.revisits, n.meanStepCm,
      ...n.timeByColumnS, s.cues.hint1, s.cues.hint2, s.cues.beamEnd, s.head.maxLeftDeg, s.head.maxRightDeg, s.head.pctTimeLeft,
      f ? f.leftHits : "", f ? f.leftTotal : "", f ? f.rightHits : "", f ? f.rightTotal : "", f ? f.coc : "", s.summary];
  });
  return [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
