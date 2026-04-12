import { useCallback, useState, useRef, useEffect } from "react";
import { STARTER_SONGS } from "../data/starter-songs";
import type { StarterSong } from "../data/starter-songs";
import { searchSongs, fetchSongMidi, importSong } from "../utils/song-api";
import type { SongResult } from "../utils/song-api";
import { addRecentSong, getRecentSongs } from "../utils/storage";
import type { RecentSong } from "../utils/storage";

interface Props {
  onFileLoad: (arrayBuffer: ArrayBuffer, fileName: string) => void;
}

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-brand-green-base",
  2: "bg-purple-base",
  3: "bg-yellow-base",
  4: "bg-pink-base",
  5: "bg-purple-dark",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FileLoader({ onFileLoad }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SongResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"recent" | "library">("recent");
  const [recents, setRecents] = useState<RecentSong[]>([]);
  const [importToast, setImportToast] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const r = getRecentSongs();
    setRecents(r);
    if (r.length === 0) setTab("library");
  }, []);

  useEffect(() => {
    searchSongs("", { limit: 1 })
      .then((r) => setApiAvailable(r.length > 0))
      .catch(() => setApiAvailable(false));
  }, []);

  useEffect(() => {
    if (!query.trim() || !apiAvailable) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchSongs(query, { limit: 20 });
        setResults(res);
      } catch {
        setResults([]);
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, apiAvailable]);

  const showToast = useCallback((msg: string) => {
    setImportToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setImportToast(null), 3000);
  }, []);

  const refreshRecents = useCallback(() => {
    setRecents(getRecentSongs());
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer();
      const title = file.name.replace(/\.(mid|midi)$/i, "");

      // Fire-and-forget import to persist in DB
      importSong(buffer.slice(0), title).then((imported) => {
        addRecentSong({
          title: imported?.title ?? title,
          source: "imported",
          songId: imported?.id,
          difficulty: imported?.difficulty ?? 0,
          artist: "Imported",
        });
        refreshRecents();
        showToast(`"${imported?.title ?? title}" saved to your library`);
      });

      onFileLoad(buffer, file.name);
    },
    [onFileLoad, refreshRecents, showToast]
  );

  const handleStarterSong = useCallback(
    async (song: StarterSong) => {
      setLoading(song.file);
      try {
        const response = await fetch(`/songs/${song.file}`);
        const buffer = await response.arrayBuffer();
        addRecentSong({
          title: song.title,
          source: "starter",
          fileKey: song.file,
          difficulty: song.level,
          artist: song.composer,
        });
        refreshRecents();
        onFileLoad(buffer, song.file);
      } catch {
        setLoading(null);
      }
    },
    [onFileLoad, refreshRecents]
  );

  const handleSearchResult = useCallback(
    async (song: SongResult) => {
      setLoading(song.id);
      try {
        const buffer = await fetchSongMidi(song.id);
        addRecentSong({
          title: song.title,
          source: song.source === "imported" ? "imported" : "library",
          songId: song.id,
          difficulty: song.difficulty,
          artist: song.artist,
        });
        refreshRecents();
        onFileLoad(buffer, `${song.title}.mid`);
      } catch {
        setLoading(null);
      }
    },
    [onFileLoad, refreshRecents]
  );

  const handleRecentSong = useCallback(
    async (recent: RecentSong) => {
      setLoading(recent.title);
      try {
        if (recent.source === "starter" && recent.fileKey) {
          const response = await fetch(`/songs/${recent.fileKey}`);
          const buffer = await response.arrayBuffer();
          // Refresh timestamp
          addRecentSong({ ...recent });
          refreshRecents();
          onFileLoad(buffer, recent.fileKey);
        } else if (recent.songId) {
          const buffer = await fetchSongMidi(recent.songId);
          addRecentSong({ ...recent });
          refreshRecents();
          onFileLoad(buffer, `${recent.title}.mid`);
        }
      } catch {
        setLoading(null);
      }
    },
    [onFileLoad, refreshRecents]
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
      {/* Import toast */}
      {importToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-brand-green-dark text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
          {importToast}
        </div>
      )}

      <div className="text-center mb-6">
        <img src="/logos/chorda-logo-white-horizontal.png" alt="Chorda" className="h-10 mx-auto mb-2" />
        <p className="text-n-400">Choose a song to start learning</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-n-800 p-1 rounded-lg w-full max-w-sm">
        <button
          onClick={() => setTab("recent")}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === "recent" ? "bg-n-700 text-white" : "text-n-500 hover:text-n-300"
          }`}
        >
          Recent
        </button>
        <button
          onClick={() => setTab("library")}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === "library" ? "bg-n-700 text-white" : "text-n-500 hover:text-n-300"
          }`}
        >
          Library
        </button>
      </div>

      {/* Recent tab */}
      {tab === "recent" && (
        <div className="w-full max-w-sm">
          {recents.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-n-500 text-sm mb-3">No recently played songs yet.</p>
              <button
                onClick={() => setTab("library")}
                className="text-purple-light text-sm hover:text-purple-base transition-colors"
              >
                Browse the library →
              </button>
            </div>
          ) : (
            <div className="grid gap-1.5">
              {recents.map((recent) => (
                <button
                  key={`${recent.title}-${recent.ts}`}
                  onClick={() => handleRecentSong(recent)}
                  disabled={loading !== null}
                  className="flex items-center gap-3 px-4 py-2.5 bg-n-800 hover:bg-n-700 rounded-lg text-left transition-colors disabled:opacity-50"
                >
                  {recent.difficulty > 0 ? (
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-bold text-n-900 shrink-0 ${LEVEL_COLORS[recent.difficulty] ?? "bg-n-600"}`}
                    >
                      {LEVEL_LABELS[recent.difficulty] ?? "?"}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-xs font-bold text-n-500 bg-n-700 shrink-0">
                      Import
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      {loading === recent.title ? "Loading..." : recent.title}
                    </div>
                    {recent.artist && (
                      <div className="text-n-500 text-xs truncate">{recent.artist}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Library tab */}
      {tab === "library" && (
        <>
          {/* Search bar */}
          {apiAvailable && (
            <div className="w-full max-w-sm mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 11,000+ songs..."
                className="w-full px-4 py-2.5 bg-n-800 border border-n-600 rounded-lg text-white placeholder-n-500 text-sm focus:outline-none focus:border-purple-light"
              />
            </div>
          )}

          {/* Search results */}
          {query.trim() && results.length > 0 && (
            <div className="w-full max-w-sm mb-6">
              <div className="text-n-500 text-xs mb-2">
                {searching ? "Searching..." : `${results.length} results`}
              </div>
              <div className="grid gap-1.5 max-h-[400px] overflow-y-auto">
                {results.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => handleSearchResult(song)}
                    disabled={loading !== null}
                    className="flex items-center gap-3 px-4 py-2.5 bg-n-800 hover:bg-n-700 rounded-lg text-left transition-colors disabled:opacity-50"
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-bold text-n-900 shrink-0 ${LEVEL_COLORS[song.difficulty] ?? "bg-n-600"}`}
                    >
                      {LEVEL_LABELS[song.difficulty] ?? "?"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">
                        {loading === song.id ? "Loading..." : song.title}
                      </div>
                      <div className="text-n-500 text-xs truncate">
                        {song.artist} — {song.genre} — {formatDuration(song.duration_sec)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && results.length === 0 && !searching && (
            <div className="w-full max-w-sm mb-6 text-center text-n-500 text-sm py-4">
              No songs found for "{query}"
            </div>
          )}

          {/* Starter songs (show when not searching) */}
          {!query.trim() && (
            <div className="w-full max-w-sm mb-8">
              <div className="text-n-500 text-xs mb-2">Starter songs</div>
              <div className="grid gap-2">
                {STARTER_SONGS.map((song) => (
                  <button
                    key={song.file}
                    onClick={() => handleStarterSong(song)}
                    disabled={loading !== null}
                    className="flex items-center gap-3 px-4 py-3 bg-n-800 hover:bg-n-700 rounded-lg text-left transition-colors disabled:opacity-50"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold text-n-900 shrink-0 ${LEVEL_COLORS[song.level]}`}
                    >
                      {song.levelLabel}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">
                        {loading === song.file ? "Loading..." : song.title}
                      </div>
                      <div className="text-n-500 text-xs truncate">
                        {song.composer} — {song.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-n-500 text-xs mb-3">or load your own</div>

          <div className="border-2 border-dashed border-n-700 rounded-xl p-8 hover:border-purple-light transition-colors cursor-pointer">
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <svg
                className="w-8 h-8 text-n-600"
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
              <span className="text-n-400 text-sm">Drop a MIDI file or click to browse</span>
              <input
                type="file"
                accept=".mid,.midi"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}
