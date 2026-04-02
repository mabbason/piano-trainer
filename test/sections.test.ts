import { describe, it, expect } from "vitest";
import {
  buildSections,
  initProgress,
  findCurrentSection,
  markPlayed,
  markLearned,
  addPracticeTime,
  suggestNextStep,
} from "../src/engine/sections";
import type { Song, Measure } from "../src/models/song";

function makeMeasures(count: number, measureDuration: number = 2): Measure[] {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    startSec: i * measureDuration,
    endSec: (i + 1) * measureDuration,
  }));
}

function makeSong(measureCount: number): Song {
  return {
    title: "Test Song",
    tempos: [{ bpm: 120, timeSec: 0 }],
    timeSignatures: [{ numerator: 4, denominator: 4, timeSec: 0 }],
    durationSec: measureCount * 2,
    measures: makeMeasures(measureCount),
    tracks: [],
  };
}

describe("buildSections", () => {
  it("divides 8 measures into 2 sections of 4", () => {
    const sections = buildSections(makeSong(8));
    expect(sections).toHaveLength(2);
    expect(sections[0]).toEqual({
      index: 0,
      startMeasure: 0,
      endMeasure: 3,
      startSec: 0,
      endSec: 8,
    });
    expect(sections[1]).toEqual({
      index: 1,
      startMeasure: 4,
      endMeasure: 7,
      startSec: 8,
      endSec: 16,
    });
  });

  it("handles non-multiple of 4 (remainder goes in last section)", () => {
    const sections = buildSections(makeSong(6));
    expect(sections).toHaveLength(2);
    expect(sections[0].endMeasure).toBe(3);
    expect(sections[1].startMeasure).toBe(4);
    expect(sections[1].endMeasure).toBe(5);
  });

  it("handles 1 measure", () => {
    const sections = buildSections(makeSong(1));
    expect(sections).toHaveLength(1);
    expect(sections[0].startMeasure).toBe(0);
    expect(sections[0].endMeasure).toBe(0);
  });

  it("handles 0 measures", () => {
    const song = makeSong(0);
    song.measures = [];
    expect(buildSections(song)).toHaveLength(0);
  });
});

describe("initProgress", () => {
  it("creates progress entries for all sections", () => {
    const sections = buildSections(makeSong(8));
    const progress = initProgress(sections);
    expect(progress).toHaveLength(2);
    expect(progress[0]).toEqual({
      sectionIndex: 0,
      mastery: "new",
      practiceTimeSec: 0,
      playThroughCount: 0,
    });
  });
});

describe("findCurrentSection", () => {
  it("finds section for given time", () => {
    const sections = buildSections(makeSong(8));
    expect(findCurrentSection(sections, 0)).toBe(0);
    expect(findCurrentSection(sections, 5)).toBe(0);
    expect(findCurrentSection(sections, 8)).toBe(1);
    expect(findCurrentSection(sections, 15)).toBe(1);
  });

  it("returns last section for time past end", () => {
    const sections = buildSections(makeSong(8));
    expect(findCurrentSection(sections, 100)).toBe(1);
  });
});

describe("mastery transitions", () => {
  it("markPlayed transitions new -> practiced", () => {
    const prog = initProgress(buildSections(makeSong(4)))[0];
    const updated = markPlayed(prog);
    expect(updated.mastery).toBe("practiced");
    expect(updated.playThroughCount).toBe(1);
  });

  it("markPlayed keeps practiced status", () => {
    let prog = initProgress(buildSections(makeSong(4)))[0];
    prog = markPlayed(prog);
    prog = markPlayed(prog);
    expect(prog.mastery).toBe("practiced");
    expect(prog.playThroughCount).toBe(2);
  });

  it("markLearned transitions to learned", () => {
    const prog = initProgress(buildSections(makeSong(4)))[0];
    const updated = markLearned(prog);
    expect(updated.mastery).toBe("learned");
  });
});

describe("addPracticeTime", () => {
  it("accumulates practice time", () => {
    let prog = initProgress(buildSections(makeSong(4)))[0];
    prog = addPracticeTime(prog, 5);
    prog = addPracticeTime(prog, 3);
    expect(prog.practiceTimeSec).toBe(8);
  });
});

describe("suggestNextStep", () => {
  const hands = new Set(["left", "right", "unknown"]);
  const rightOnly = new Set(["right"]);
  const leftOnly = new Set(["left"]);

  it("suggests right hand first for new section with both hands", () => {
    const prog = initProgress(buildSections(makeSong(4)))[0];
    expect(suggestNextStep(prog, hands, false)).toBe("right-hand");
  });

  it("suggests left hand when right is showing", () => {
    let prog = initProgress(buildSections(makeSong(4)))[0];
    prog = markPlayed(prog);
    expect(suggestNextStep(prog, rightOnly, false)).toBe("left-hand");
  });

  it("suggests both hands when left is showing", () => {
    let prog = initProgress(buildSections(makeSong(4)))[0];
    prog = markPlayed(prog);
    expect(suggestNextStep(prog, leftOnly, false)).toBe("both-hands");
  });

  it("suggests next section when learned", () => {
    let prog = initProgress(buildSections(makeSong(4)))[0];
    prog = markLearned(prog);
    expect(suggestNextStep(prog, hands, false)).toBe("next-section");
  });

  it("suggests complete when last section is learned", () => {
    let prog = initProgress(buildSections(makeSong(4)))[0];
    prog = markLearned(prog);
    expect(suggestNextStep(prog, hands, true)).toBe("complete");
  });
});
