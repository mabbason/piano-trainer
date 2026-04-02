import { useState, useEffect } from "react";
import {
  getProfiles,
  createProfile,
  getActiveProfile,
  setActiveProfile,
  getProfileData,
} from "../utils/profiles";
import type { ProfileData } from "../utils/profiles";

interface Props {
  onClose: () => void;
}

function formatTime(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-cyan-500 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Dashboard({ onClose }: Props) {
  const [profiles, setProfiles] = useState(getProfiles());
  const [active, setActive] = useState(getActiveProfile());
  const [data, setData] = useState<ProfileData | null>(null);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (active) {
      setData(getProfileData(active));
    }
  }, [active]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProfile(newName.trim());
    setProfiles(getProfiles());
    setActive(newName.trim());
    setNewName("");
    setShowCreate(false);
  };

  const handleSwitch = (name: string) => {
    setActiveProfile(name);
    setActive(name);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <h2 className="text-lg font-bold">Progress Dashboard</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-sm px-2 py-1"
        >
          &times; Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Profile selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-slate-400 text-xs">Profile:</span>
            {profiles.map((p) => (
              <button
                key={p.name}
                onClick={() => handleSwitch(p.name)}
                className={`px-3 py-1 rounded text-sm ${
                  active === p.name
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={() => setShowCreate(true)}
              className="px-2 py-1 rounded text-sm bg-slate-700 text-slate-400 hover:bg-slate-600"
            >
              + New
            </button>
          </div>

          {showCreate && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Name..."
                className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
              <button
                onClick={handleCreate}
                className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="text-slate-400 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {!active && (
          <div className="text-center text-slate-500 py-12">
            Create a profile to track your progress
          </div>
        )}

        {data && (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {formatTime(data.totalPracticeTimeSec)}
                </div>
                <div className="text-slate-500 text-xs mt-1">Total Practice</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {data.songsStarted}
                </div>
                <div className="text-slate-500 text-xs mt-1">Songs Started</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {data.songsCompleted}
                </div>
                <div className="text-slate-500 text-xs mt-1">Songs Mastered</div>
              </div>
            </div>

            {/* Song progress list */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-3">Song Progress</h3>
              {data.songStats.length === 0 && (
                <div className="text-center text-slate-600 py-8 text-sm">
                  No songs practiced yet. Pick a song to get started!
                </div>
              )}
              <div className="grid gap-2">
                {data.songStats.map((s) => (
                  <div
                    key={s.songTitle}
                    className="bg-slate-800 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium truncate">
                        {s.songTitle}
                      </span>
                      <span className="text-slate-500 text-xs shrink-0 ml-2">
                        {formatTime(s.totalPracticeTimeSec)}
                      </span>
                    </div>
                    <ProgressBar value={s.sectionsLearned} max={s.totalSections} />
                    <div className="text-slate-500 text-[10px] mt-1">
                      {s.sectionsLearned}/{s.totalSections} sections learned
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
