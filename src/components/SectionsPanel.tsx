import type { Section, SectionProgress, GuidedStep } from "../engine/sections";

interface Props {
  sections: Section[];
  progress: SectionProgress[];
  currentSectionIndex: number;
  guidedStep: GuidedStep;
  onJumpToSection: (sectionIndex: number) => void;
  onMarkLearned: (sectionIndex: number) => void;
}

const MASTERY_COLORS: Record<string, string> = {
  new: "bg-slate-700 text-slate-400",
  practiced: "bg-amber-700 text-amber-200",
  learned: "bg-green-700 text-green-200",
};

const MASTERY_LABELS: Record<string, string> = {
  new: "New",
  practiced: "Practiced",
  learned: "Learned",
};

const STEP_MESSAGES: Record<GuidedStep, string> = {
  "right-hand": "Try right hand first",
  "left-hand": "Now try left hand",
  "both-hands": "Both hands together",
  "next-section": "Move to next section",
  complete: "Song complete!",
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SectionsPanel({
  sections,
  progress,
  currentSectionIndex,
  guidedStep,
  onJumpToSection,
  onMarkLearned,
}: Props) {
  return (
    <div className="w-52 bg-slate-800 border-l border-slate-700 flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-700">
        <p className="text-xs text-amber-400 font-medium">
          {STEP_MESSAGES[guidedStep]}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sections.map((section, i) => {
          const prog = progress[i];
          const isCurrent = i === currentSectionIndex;

          return (
            <div
              key={i}
              className={`px-3 py-2 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 ${
                isCurrent ? "bg-slate-700/80 border-l-2 border-l-cyan-500" : ""
              }`}
              onClick={() => onJumpToSection(i)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${isCurrent ? "text-white" : "text-slate-300"}`}>
                  Section {i + 1}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${MASTERY_COLORS[prog.mastery]}`}>
                  {MASTERY_LABELS[prog.mastery]}
                </span>
              </div>

              <div className="text-[10px] text-slate-500">
                m{section.startMeasure + 1}-{section.endMeasure + 1} &middot; {formatTime(prog.practiceTimeSec)}
              </div>

              {isCurrent && prog.mastery !== "learned" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkLearned(i);
                  }}
                  className="mt-1 text-[10px] px-2 py-0.5 rounded bg-green-700 hover:bg-green-600 text-green-200"
                >
                  Mark Learned
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t border-slate-700 text-[10px] text-slate-500">
        {progress.filter((p) => p.mastery === "learned").length}/{sections.length} learned
      </div>
    </div>
  );
}
