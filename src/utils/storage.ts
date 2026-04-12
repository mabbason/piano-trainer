import type { SectionProgress } from "../engine/sections";

// --- Recent songs (localStorage) ---

const RECENTS_KEY = "chorda_recent_songs";
const MAX_RECENTS = 10;

export interface RecentSong {
  title: string;
  source: "starter" | "library" | "imported";
  fileKey?: string;    // starter: the .mid filename
  songId?: string;     // library/imported: DB id
  difficulty: number;  // 1-5
  artist?: string;
  ts: number;
}

export function getRecentSongs(): RecentSong[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addRecentSong(song: Omit<RecentSong, "ts">): void {
  const recents = getRecentSongs().filter((r) => r.title !== song.title);
  recents.unshift({ ...song, ts: Date.now() });
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, MAX_RECENTS)));
}
import { API_BASE } from "./song-api";
import { fetchWithAuth } from "./auth";

// --- In-memory cache (loaded once per user session) ---

let progressCache: Map<string, SectionProgress[]> = new Map();

export async function loadAllProgress(userId: number): Promise<void> {
  progressCache = new Map();
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/users/${userId}/progress`);
    if (!res.ok) return;
    const rows: { song_title: string; section_progress: string }[] = await res.json();
    for (const row of rows) {
      try {
        progressCache.set(row.song_title, JSON.parse(row.section_progress));
      } catch {
        // skip malformed
      }
    }
  } catch {
    // API unavailable — start with empty cache
  }
}

export function loadProgress(
  songTitle: string,
  sectionCount: number
): SectionProgress[] | null {
  const cached = progressCache.get(songTitle);
  if (!cached) return null;
  if (cached.length !== sectionCount) return null;
  return cached;
}

// --- Debounced save ---

let pendingSave: { songTitle: string; progress: SectionProgress[]; userId: number } | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

function flushSave() {
  if (!pendingSave) return;
  const { songTitle, progress, userId } = pendingSave;
  pendingSave = null;
  clearTimeout(debounceTimer);

  // Update cache immediately
  progressCache.set(songTitle, progress);

  // Fire-and-forget to API
  fetchWithAuth(
    `${API_BASE}/api/users/${userId}/progress/${encodeURIComponent(songTitle)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionProgress: progress }),
    }
  ).catch(() => {
    // silent — cache is still updated
  });
}

export function saveProgress(
  songTitle: string,
  progress: SectionProgress[],
  userId: number,
  immediate = false
): void {
  pendingSave = { songTitle, progress, userId };
  progressCache.set(songTitle, progress);

  if (immediate) {
    flushSave();
    return;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flushSave, 3000);
}

// Flush on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flushSave);
}
