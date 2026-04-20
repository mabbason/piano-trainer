import { useCallback, useState, useEffect, useRef } from "react";
import { STARTER_SONGS } from "../data/starter-songs";
import type { StarterSong } from "../data/starter-songs";
import { fetchSongMidi, importSong } from "../utils/song-api";
import type { SongResult } from "../utils/song-api";
import { addRecentSong, getRecentSongs, removeRecentSong, clearRecentSongs } from "../utils/storage";
import type { RecentSong } from "../utils/storage";
import { LibraryBrowser } from "./LibraryBrowser";

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

export function FileLoader({ onFileLoad }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"recent" | "library">(
    () => (sessionStorage.getItem("chorda_tab") as "recent" | "library") ?? "recent"
  );
  const [recents, setRecents] = useState<RecentSong[]>([]);
  const [importToast, setImportToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const switchTab = useCallback((t: "recent" | "library") => {
    setTab(t);
    sessionStorage.setItem("chorda_tab", t);
  }, []);

  useEffect(() => {
    const r = getRecentSongs();
    setRecents(r);
    if (r.length === 0) switchTab("library");
  }, [switchTab]);

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

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="flex flex-col h-full overflow-hidden"
    >
      {importToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-brand-green-dark text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
          {importToast}
        </div>
      )}

      {/* Static header: logo + tabs. Never moves. */}
      <div className="shrink-0 pt-8 pb-4 flex flex-col items-center gap-4">
        <div className="text-center">
          <img
            src="/logos/chorda-logo-white-horizontal.png"
            alt="Chorda"
            className="h-10 mx-auto mb-2"
          />
          <p className="text-n-400 text-sm">Choose a song to start learning</p>
        </div>
        <div className="flex gap-1 bg-n-800 p-1 rounded-lg w-full max-w-sm">
          <button
            onClick={() => switchTab("recent")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === "recent" ? "bg-n-700 text-white" : "text-n-500 hover:text-n-300"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => switchTab("library")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === "library" ? "bg-n-700 text-white" : "text-n-500 hover:text-n-300"
            }`}
          >
            Library
          </button>
        </div>
      </div>

      {/* Content: fills remaining height, no layout shift */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Recent tab */}
        {tab === "recent" && (
          <div className="h-full overflow-y-auto px-4 pb-8">
            {recents.length === 0 ? (
              <div className="text-center py-10 max-w-sm mx-auto">
                <p className="text-n-500 text-sm mb-3">No recently played songs yet.</p>
                <button
                  onClick={() => switchTab("library")}
                  className="text-purple-light text-sm hover:text-purple-base transition-colors"
                >
                  Browse the library →
                </button>
              </div>
            ) : (
              <div className="max-w-sm mx-auto">
                <div className="flex justify-end mb-1.5">
                  <button
                    onClick={() => { clearRecentSongs(); setRecents([]); switchTab("library"); }}
                    className="text-n-600 hover:text-n-400 text-xs transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid gap-1.5">
                  {recents.map((recent) => (
                    <div key={`${recent.title}-${recent.ts}`} className="group relative">
                      <button
                        onClick={() => handleRecentSong(recent)}
                        disabled={loading !== null}
                        className="flex items-center gap-3 px-4 py-2.5 bg-n-800 hover:bg-n-700 rounded-lg text-left transition-colors disabled:opacity-50 w-full pr-10"
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSong(recent.ts);
                          setRecents(getRecentSongs());
                        }}
                        className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 text-n-600 hover:text-n-300 hover:bg-n-700/50 rounded-r-lg transition-all"
                        title="Remove"
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <div className="text-n-500 text-xs mb-3 text-center">Starter songs</div>
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
              </div>
            )}
          </div>
        )}

        {/* Library tab */}
        {tab === "library" && (
          <LibraryBrowser
            onSelectSong={handleSearchResult}
            loadingId={loading}
            onImportFile={handleFile}
          />
        )}
      </div>
    </div>
  );
}
