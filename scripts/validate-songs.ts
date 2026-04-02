// Validates all MIDI files in public/songs/
// Run with: npx tsx scripts/validate-songs.ts

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Midi } = require("@tonejs/midi");

const songsDir = join(import.meta.dirname, "../public/songs");
const target = process.argv[2];
const files = readdirSync(songsDir).filter((f) => f.endsWith(".mid") && (!target || f.includes(target)));

for (const file of files) {
  const buffer = readFileSync(join(songsDir, file));
  try {
    const midi = new Midi(buffer);
    const totalNotes = midi.tracks.reduce((sum, t) => sum + t.notes.length, 0);
    const tracks = midi.tracks
      .filter((t) => t.notes.length > 0)
      .map((t) => `ch${t.channel}:prog${t.instrument.number}(${t.notes.length}n)`)
      .join(", ");
    const hasPiano = midi.tracks.some((t) => t.notes.length > 0 && t.instrument.number <= 7);
    const hasDrums = midi.tracks.some((t) => t.channel === 9 && t.notes.length > 0);

    console.log(`\n${file}:`);
    console.log(`  Title: "${midi.name || "(none)"}"`);
    console.log(`  Duration: ${midi.duration.toFixed(1)}s`);
    console.log(`  Tracks with notes: ${midi.tracks.filter((t) => t.notes.length > 0).length}`);
    console.log(`  Tracks: ${tracks}`);
    console.log(`  Total notes: ${totalNotes}`);
    console.log(`  Has piano: ${hasPiano}`);
    console.log(`  Has drums: ${hasDrums}`);
    console.log(`  Tempo: ${midi.header.tempos[0]?.bpm?.toFixed(0) ?? "none"} BPM`);

    if (!hasPiano && !hasDrums) console.log(`  ⚠️  No piano tracks detected!`);
    if (hasDrums) console.log(`  ⚠️  Has drum tracks (will be filtered)`);
    if (totalNotes < 5) console.log(`  ⚠️  Very few notes - might be empty/broken`);
  } catch (e) {
    console.log(`\n${file}: ❌ PARSE ERROR - ${e}`);
  }
}
