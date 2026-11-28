// Writes Purna's sounds to Assets/Audio (run from tools/: npm run sounds).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { render, SOUNDS, wav } from "./sounds";

const dir = join(process.cwd(), "..", "Assets", "Audio");
mkdirSync(dir, { recursive: true });
for (const s of SOUNDS) {
  writeFileSync(join(dir, s.file), wav(render(s)));
  console.log(`wrote Assets/Audio/${s.file}  ${s.seconds}s  peak ${s.peakDb} dBFS  ${s.use}`);
}
