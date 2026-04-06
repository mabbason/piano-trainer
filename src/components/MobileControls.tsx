import { useState } from "react";
import type { LoopRange } from "../utils/loop";
import { UserMenu } from "./UserMenu";
import { GearSheet } from "./GearSheet";

interface Props {
  isPlaying: boolean;
  songTitle: string;
  currentTime: number;
  duration: number;
  speed: number;
  visibleHands: Set<string>;
  loop: LoopRange | null;
  loopAMeasure: number | null;
  samplerLoaded: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (time: number) => void;
  onBack: () => void;
  onToggleHand: (hand: string) => void;
  onSetA: () => void;
  onSetB: () => void;
  onClearLoop: () => void;
  userAvatar?: string | null;
  onDashboard: () => void;
  onSwitchUser: () => void;
  onDeleteProfile?: () => void;
  onLogout: () => void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 14 14" fill="currentColor">
      <polygon points="2,0 14,7 2,14" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 14 14" fill="currentColor">
      <rect x="1" y="0" width="4" height="14" rx="1" />
      <rect x="9" y="0" width="4" height="14" rx="1" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor">
      <rect x="0" y="0" width="12" height="12" rx="2" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function MobileControlsHeader({
  songTitle,
  onBack,
  speed,
  onSpeedChange,
  visibleHands,
  onToggleHand,
  loop,
  loopAMeasure,
  onSetA,
  onSetB,
  onClearLoop,
  userAvatar,
  onDashboard,
  onSwitchUser,
  onDeleteProfile,
  onLogout,
}: Props) {
  const [gearOpen, setGearOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 bg-n-800 border-b border-n-700">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-n-700 text-n-300 flex items-center justify-center shrink-0"
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-white font-medium text-sm truncate flex-1 min-w-0">
          {songTitle}
        </span>

        <button
          onClick={() => setGearOpen((p) => !p)}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            gearOpen ? "bg-purple-base text-white" : "bg-n-700 text-n-300"
          }`}
          aria-label="Settings"
        >
          <GearIcon />
        </button>

        <UserMenu
          avatar={userAvatar}
          onDashboard={onDashboard}
          onSwitchUser={onSwitchUser}
          onDeleteProfile={onDeleteProfile}
          onLogout={onLogout}
        />
      </div>

      <GearSheet
        open={gearOpen}
        onClose={() => setGearOpen(false)}
        speed={speed}
        onSpeedChange={onSpeedChange}
        visibleHands={visibleHands}
        onToggleHand={onToggleHand}
        loop={loop}
        loopAMeasure={loopAMeasure}
        onSetA={onSetA}
        onSetB={onSetB}
        onClearLoop={onClearLoop}
      />
    </>
  );
}

export function MobileControlsTransport({
  isPlaying,
  currentTime,
  duration,
  samplerLoaded,
  onPlay,
  onPause,
  onStop,
  onSeek,
}: Pick<Props, "isPlaying" | "currentTime" | "duration" | "samplerLoaded" | "onPlay" | "onPause" | "onStop" | "onSeek">) {
  return (
    <div className="bg-n-800 border-t border-n-700 px-3 py-2">
      {/* Transport buttons */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={!samplerLoaded}
          className={`w-12 h-12 rounded-full text-white flex items-center justify-center ${
            samplerLoaded
              ? "bg-purple-base active:bg-purple-light"
              : "bg-n-600 cursor-wait"
          }`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {!samplerLoaded ? (
            <span className="text-xs">...</span>
          ) : isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          onClick={onStop}
          className="w-10 h-10 rounded-full bg-n-700 text-n-300 flex items-center justify-center"
          aria-label="Stop"
        >
          <StopIcon />
        </button>

        <div className="flex-1" />

        <span className="text-n-400 text-xs tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Timeline scrubber — full width */}
      <input
        type="range"
        min={0}
        max={duration}
        step={0.1}
        value={currentTime}
        onChange={(e) => onSeek(parseFloat(e.target.value))}
        className="w-full h-2 accent-purple-light"
      />
    </div>
  );
}
