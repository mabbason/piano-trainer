import { useState, useEffect, useRef } from "react";
import { searchSongs, fetchGenres } from "../utils/song-api";
import type { SongResult } from "../utils/song-api";

const PAGE_SIZE = 24;

const DIFF_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

const DIFF_COLORS: Record<number, string> = {
  1: "bg-brand-green-base",
  2: "bg-blue-base",
  3: "bg-yellow-base",
  4: "bg-pink-base",
  5: "bg-purple-base",
};

const DURATION_OPTIONS = [
  { value: "short", label: "< 2 min" },
  { value: "medium", label: "2-5 min" },
  { value: "long", label: "5+ min" },
];

const SORT_OPTIONS = [
  { value: "title", label: "A-Z" },
  { value: "diff_asc", label: "Easiest first" },
  { value: "diff_desc", label: "Hardest first" },
  { value: "dur_asc", label: "Shortest first" },
  { value: "dur_desc", label: "Longest first" },
];

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const sectionLabel = "text-[10px] uppercase tracking-wide font-medium text-n-500 mb-1.5";
const chipBase =
  "shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors";

interface Props {
  onSelectSong: (song: SongResult) => void;
  loadingId: string | null;
  onImportFile: (file: File) => void;
}

function loadSavedFilters() {
  try {
    const s = sessionStorage.getItem("chorda_library_filters");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function LibraryBrowser({ onSelectSong, loadingId, onImportFile }: Props) {
  const saved = loadSavedFilters();
  const [query, setQuery] = useState<string>(saved?.query ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState<string>(saved?.query ?? "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(saved?.genres ?? []);
  const [selectedDiffs, setSelectedDiffs] = useState<number[]>(saved?.diffs ?? []);
  const [selectedDurations, setSelectedDurations] = useState<string[]>(saved?.durations ?? []);
  const [sort, setSort] = useState<string>(saved?.sort ?? "title");
  const [page, setPage] = useState<number>(saved?.page ?? 0);
  const [songs, setSongs] = useState<SongResult[]>([]);
  const [total, setTotal] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [genreOptions, setGenreOptions] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGenres().then((data) => {
      setGenreOptions(data.slice(0, 12).map((g) => g.genre));
    });
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, selectedGenres, selectedDiffs, selectedDurations, sort]);

  useEffect(() => {
    sessionStorage.setItem("chorda_library_filters", JSON.stringify({
      query,
      genres: selectedGenres,
      diffs: selectedDiffs,
      durations: selectedDurations,
      sort,
      page,
    }));
  }, [query, selectedGenres, selectedDiffs, selectedDurations, sort, page]);

  useEffect(() => {
    setFetching(true);
    searchSongs(debouncedQuery || undefined, {
      genres: selectedGenres,
      difficulties: selectedDiffs,
      durations: selectedDurations,
      sort,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })
      .then(({ songs, total }) => {
        setSongs(songs);
        setTotal(total);
        setFetching(false);
        listRef.current?.scrollTo({ top: 0 });
      })
      .catch(() => {
        setSongs([]);
        setTotal(0);
        setFetching(false);
      });
  }, [debouncedQuery, selectedGenres, selectedDiffs, selectedDurations, sort, page]);

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  const toggleDiff = (d: number) =>
    setSelectedDiffs((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  const toggleDuration = (d: string) =>
    setSelectedDurations((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedDiffs([]);
    setSelectedDurations([]);
    setQuery("");
  };

  const hasFilters =
    selectedGenres.length > 0 ||
    selectedDiffs.length > 0 ||
    selectedDurations.length > 0 ||
    query.trim().length > 0;

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startItem = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Filter area: genre | difficulty | duration | search+import */}
      <div className="shrink-0 px-6 pt-3 pb-2">
        <div className="grid grid-cols-[4fr_2fr_2fr_1fr] gap-3 max-w-6xl mx-auto">

        {/* COL 1: Genre chips (~2 rows) */}
        <div className="min-w-0">
          <div className={sectionLabel}>Genre</div>
          <div className="flex flex-wrap gap-1.5">
            {genreOptions.map((g) => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={`${chipBase} ${
                  selectedGenres.includes(g)
                    ? "bg-pink-base border-pink-base text-white"
                    : "bg-n-800 border-n-600 text-n-400 hover:border-pink-base hover:text-pink-light"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* COL 2: Difficulty — wraps to 3+2 at this column width */}
        <div>
          <div className={sectionLabel}>Difficulty</div>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => toggleDiff(d)}
                className={`${chipBase} ${
                  selectedDiffs.includes(d)
                    ? "bg-brand-green-base border-brand-green-base text-n-900"
                    : "bg-n-800 border-n-600 text-n-400 hover:border-brand-green-base hover:text-brand-green-light"
                }`}
              >
                {DIFF_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* COL 3: Duration */}
        <div>
          <div className={sectionLabel}>Duration</div>
          <div className="flex flex-wrap gap-1.5">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => toggleDuration(d.value)}
                className={`${chipBase} ${
                  selectedDurations.includes(d.value)
                    ? "bg-yellow-base border-yellow-base text-n-900"
                    : "bg-n-800 border-n-600 text-n-400 hover:border-yellow-base hover:text-yellow-light"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* COL 4: Search stacked above Import */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-n-500 w-3.5 h-3.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs..."
              className="w-full pl-8 pr-3 py-1.5 bg-n-800 border border-n-600 rounded-lg text-white placeholder-n-500 text-xs focus:outline-none focus:border-purple-light"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 border border-purple-base text-purple-light bg-transparent hover:bg-purple-base/10 hover:border-purple-light text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Import MIDI
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mid,.midi"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      </div>

      {/* Table header: count | sort (centered) | pagination */}
      <div className="shrink-0 bg-n-800 border-y border-n-700">
        <div className="grid grid-cols-3 items-center px-6 py-2 text-xs max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <span className="text-n-500">
            {fetching
              ? "Loading..."
              : total > 0
                ? `${startItem}-${endItem} of ${total.toLocaleString()}`
                : "No results"}
          </span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-n-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-n-400">
          <span>Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent text-n-300 text-xs focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-n-800">
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-n-700 hover:bg-n-600 text-n-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <span className="text-n-400 tabular-nums w-14 text-center">
            {page + 1} / {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-n-700 hover:bg-n-600 text-n-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Next
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        </div>
      </div>

      {/* Song list — dark styled scrollbar */}
      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-n-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-n-600"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#3f4858 transparent" }}
      >
        {songs.length === 0 && !fetching && (
          <div className="text-center py-12 text-n-600 text-sm">
            No songs match your filters.
          </div>
        )}
        <div className="grid gap-1 max-w-6xl mx-auto w-full px-6">
          {songs.map((song) => (
            <button
              key={song.id}
              onClick={() => onSelectSong(song)}
              disabled={loadingId !== null}
              className="flex items-center gap-3 px-3 py-2 bg-n-800 hover:bg-n-700 rounded-lg text-left transition-colors disabled:opacity-50 w-full"
            >
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-bold text-n-900 shrink-0 ${DIFF_COLORS[song.difficulty] ?? "bg-n-600"}`}
              >
                {DIFF_LABELS[song.difficulty] ?? "?"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {loadingId === song.id ? "Loading..." : song.title}
                </div>
                <div className="text-n-500 text-xs truncate">
                  {song.artist} — {song.genre} — {formatDuration(song.duration_sec)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
