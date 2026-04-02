import { useCallback, useState } from "react";
import { STARTER_SONGS } from "../data/starter-songs";
import type { StarterSong } from "../data/starter-songs";

interface Props {
  onFileLoad: (arrayBuffer: ArrayBuffer, fileName: string) => void;
}

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-green-600",
  2: "bg-cyan-600",
  3: "bg-amber-600",
  4: "bg-red-600",
};

export function FileLoader({ onFileLoad }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer();
      onFileLoad(buffer, file.name);
    },
    [onFileLoad]
  );

  const handleStarterSong = useCallback(
    async (song: StarterSong) => {
      setLoading(song.file);
      try {
        const response = await fetch(`/songs/${song.file}`);
        const buffer = await response.arrayBuffer();
        onFileLoad(buffer, song.file);
      } catch {
        setLoading(null);
      }
    },
    [onFileLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".mid") || file.name.endsWith(".midi"))) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="flex flex-col items-center h-full py-8 px-4 overflow-y-auto"
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Piano Trainer</h1>
        <p className="text-slate-400">Choose a song to start learning</p>
      </div>

      <div className="w-full max-w-2xl mb-8">
        <div className="grid gap-2">
          {STARTER_SONGS.map((song) => (
            <button
              key={song.file}
              onClick={() => handleStarterSong(song)}
              disabled={loading !== null}
              className="flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-colors disabled:opacity-50"
            >
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shrink-0 ${LEVEL_COLORS[song.level]}`}
              >
                {song.levelLabel}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {loading === song.file ? "Loading..." : song.title}
                </div>
                <div className="text-slate-500 text-xs truncate">
                  {song.composer} — {song.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-slate-500 text-xs mb-3">or load your own</div>

      <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-cyan-500 transition-colors cursor-pointer">
        <label className="cursor-pointer flex flex-col items-center gap-2">
          <svg
            className="w-8 h-8 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-slate-400 text-sm">Drop a MIDI file or click to browse</span>
          <input
            type="file"
            accept=".mid,.midi"
            onChange={handleInputChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
