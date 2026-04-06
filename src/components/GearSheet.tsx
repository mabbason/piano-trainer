import { useEffect, useRef } from "react";
import type { LoopRange } from "../utils/loop";

interface Props {
  open: boolean;
  onClose: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  visibleHands: Set<string>;
  onToggleHand: (hand: string) => void;
  loop: LoopRange | null;
  loopAMeasure: number | null;
  onSetA: () => void;
  onSetB: () => void;
  onClearLoop: () => void;
}

export function GearSheet({
  open,
  onClose,
  speed,
  onSpeedChange,
  visibleHands,
  onToggleHand,
  loop,
  loopAMeasure,
  onSetA,
  onSetB,
  onClearLoop,
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-n-800 border-t border-n-700 rounded-t-2xl px-5 pb-6 pt-3 transition-transform duration-200 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-n-600" />
        </div>

        {/* Speed */}
        <div className="mb-5">
          <p className="text-n-400 text-xs font-medium mb-2">Speed</p>
          <div className="flex gap-2">
            {[0.25, 0.5, 0.75, 1].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${
                  speed === s
                    ? "bg-purple-base text-white"
                    : "bg-n-700 text-n-300"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Hands */}
        <div className="mb-5">
          <p className="text-n-400 text-xs font-medium mb-2">Hands</p>
          <div className="flex gap-2">
            {[
              { hand: "left", label: "Left", color: "green" },
              { hand: "right", label: "Right", color: "purple" },
            ].map(({ hand, label, color }) => {
              const active = visibleHands.has(hand);
              return (
                <button
                  key={hand}
                  onClick={() => onToggleHand(hand)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? color === "purple"
                        ? "bg-purple-base text-white"
                        : "bg-brand-green-base text-white"
                      : "bg-n-700 text-n-500"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loop */}
        <div>
          <p className="text-n-400 text-xs font-medium mb-2">Loop</p>
          <div className="flex gap-2 items-center">
            <button
              onClick={onSetA}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${
                loopAMeasure !== null && !loop
                  ? "bg-yellow-base text-white"
                  : "bg-n-700 text-n-300"
              }`}
            >
              Set A
            </button>
            <button
              onClick={onSetB}
              disabled={loopAMeasure === null}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${
                loop
                  ? "bg-yellow-base text-white"
                  : loopAMeasure !== null
                    ? "bg-n-700 text-n-300"
                    : "bg-n-800 text-n-600"
              }`}
            >
              Set B
            </button>
            {loop && (
              <button
                onClick={onClearLoop}
                className="px-4 py-2.5 rounded-lg text-sm font-medium bg-n-700 text-n-300"
              >
                Clear
              </button>
            )}
          </div>
          {loop && (
            <p className="text-yellow-base text-xs mt-2">
              Looping measures {loop.startMeasure + 1}–{loop.endMeasure + 1}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
