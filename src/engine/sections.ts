import type { Song } from "../models/song";

export type MasteryStatus = "new" | "practiced" | "learned";

export interface Section {
  index: number;
  startMeasure: number;
  endMeasure: number;
  startSec: number;
  endSec: number;
}

export interface SectionProgress {
  sectionIndex: number;
  mastery: MasteryStatus;
  practiceTimeSec: number;
  playThroughCount: number;
}

const MEASURES_PER_SECTION = 4;

export function buildSections(song: Song): Section[] {
  const { measures } = song;
  if (measures.length === 0) return [];

  const sections: Section[] = [];
  let i = 0;

  while (i < measures.length) {
    const startIdx = i;
    const endIdx = Math.min(i + MEASURES_PER_SECTION - 1, measures.length - 1);

    sections.push({
      index: sections.length,
      startMeasure: startIdx,
      endMeasure: endIdx,
      startSec: measures[startIdx].startSec,
      endSec: measures[endIdx].endSec,
    });

    i = endIdx + 1;
  }

  return sections;
}

export function initProgress(sections: Section[]): SectionProgress[] {
  return sections.map((s) => ({
    sectionIndex: s.index,
    mastery: "new",
    practiceTimeSec: 0,
    playThroughCount: 0,
  }));
}

export function findCurrentSection(
  sections: Section[],
  timeSec: number
): number {
  for (let i = 0; i < sections.length; i++) {
    if (timeSec < sections[i].endSec) return i;
  }
  return sections.length - 1;
}

export function markPlayed(progress: SectionProgress): SectionProgress {
  const updated = { ...progress, playThroughCount: progress.playThroughCount + 1 };
  if (updated.mastery === "new") {
    updated.mastery = "practiced";
  }
  return updated;
}

export function markLearned(progress: SectionProgress): SectionProgress {
  return { ...progress, mastery: "learned" };
}

export function addPracticeTime(
  progress: SectionProgress,
  deltaSec: number
): SectionProgress {
  return { ...progress, practiceTimeSec: progress.practiceTimeSec + deltaSec };
}

export type GuidedStep = "right-hand" | "left-hand" | "both-hands" | "next-section" | "complete";

export function suggestNextStep(
  progress: SectionProgress,
  visibleHands: Set<string>,
  isLastSection: boolean
): GuidedStep {
  if (progress.mastery === "learned") {
    return isLastSection ? "complete" : "next-section";
  }

  const hasRight = visibleHands.has("right");
  const hasLeft = visibleHands.has("left");

  if (hasRight && hasLeft) {
    // Both hands visible - suggest trying one hand first if still new
    if (progress.mastery === "new") return "right-hand";
    return "both-hands";
  }

  if (hasRight && !hasLeft) return "left-hand";
  if (hasLeft && !hasRight) return "both-hands";

  return "right-hand";
}
