export const API_BASE = import.meta.env.VITE_SONG_API_URL || (
  import.meta.env.DEV ? "http://localhost:3001" : ""
);

export interface SongResult {
  id: string;
  title: string;
  artist: string;
  genre: string;
  difficulty: number;
  duration_sec: number;
  note_count: number;
  tempo_bpm: number;
  source?: string;
}

import { fetchWithAuth } from "./auth";

const opts: RequestInit = { credentials: "include" };

export async function searchSongs(
  query?: string,
  options?: { genre?: string; difficulty?: number; limit?: number }
): Promise<SongResult[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (options?.genre) params.set("genre", options.genre);
  if (options?.difficulty) params.set("difficulty", String(options.difficulty));
  params.set("limit", String(options?.limit ?? 20));

  const res = await fetch(`${API_BASE}/api/songs/search?${params}`, opts);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchSongMidi(id: string): Promise<ArrayBuffer> {
  const res = await fetchWithAuth(`${API_BASE}/api/songs/${encodeURIComponent(id)}/midi`);
  if (!res.ok) throw new Error("Failed to fetch MIDI");
  return res.arrayBuffer();
}

export async function importSong(buffer: ArrayBuffer, title: string): Promise<SongResult | null> {
  try {
    const res = await fetchWithAuth(
      `${API_BASE}/api/songs/import?title=${encodeURIComponent(title)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: buffer,
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchGenres(): Promise<{ genre: string; count: number }[]> {
  const res = await fetch(`${API_BASE}/api/songs/genres`, opts);
  if (!res.ok) return [];
  return res.json();
}
