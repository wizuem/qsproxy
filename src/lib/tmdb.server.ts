export type TmdbMovie = {
  id: number;
  title: string;
  year?: string | undefined;
  overview?: string | undefined;
  rating?: number | undefined;
  poster?: string | undefined;
};

type TmdbResponse = {
  results?: {
    id: number;
    title?: string;
    name?: string;
    release_date?: string;
    overview?: string;
    vote_average?: number;
    poster_path?: string | null;
  }[];
  status_message?: string;
};

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

/** Supports both v3 (32-char) keys and v4 read tokens. */
function authFor(key: string) {
  const isV4 = key.startsWith("ey") || key.length > 40;
  return {
    headers: isV4
      ? { accept: "application/json", authorization: `Bearer ${key}` }
      : { accept: "application/json" },
    queryKey: isV4 ? null : key,
  };
}

export async function fetchTmdb(
  path: string,
  params: Record<string, string>,
): Promise<{ items: TmdbMovie[] }> {
  const key = process.env["TMDB_API_KEY"];
  if (!key) throw new Error("Movie discovery is not configured yet.");

  const auth = authFor(key);
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  if (auth.queryKey) url.searchParams.set("api_key", auth.queryKey);

  const res = await fetch(url, { headers: auth.headers });
  const json = (await res.json()) as TmdbResponse;
  if (!res.ok) {
    console.error(`TMDB request failed [${res.status}]: ${json.status_message ?? "unknown"}`);
    throw new Error("Could not load new releases right now. Please try again.");
  }

  return {
    items: (json.results ?? [])
      .filter((row) => row.title ?? row.name)
      .map((row) => ({
        id: row.id,
        title: (row.title ?? row.name)!,
        year: row.release_date ? row.release_date.slice(0, 4) : undefined,
        overview: row.overview || undefined,
        rating: typeof row.vote_average === "number" ? Math.round(row.vote_average * 10) / 10 : undefined,
        poster: row.poster_path ? `${IMAGE_BASE}${row.poster_path}` : undefined,
      })),
  };
}

type TmdbVideos = { results?: { key?: string; site?: string; type?: string; official?: boolean }[] };

/** Returns the YouTube key of a title's trailer, or null when none exists. */
export async function fetchTrailerKey(movieId: number): Promise<string | null> {
  const key = process.env["TMDB_API_KEY"];
  if (!key) throw new Error("Movie discovery is not configured yet.");

  const auth = authFor(key);
  const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}/videos`);
  if (auth.queryKey) url.searchParams.set("api_key", auth.queryKey);

  const res = await fetch(url, { headers: auth.headers });
  if (!res.ok) {
    console.error(`TMDB trailer lookup failed [${res.status}]`);
    return null;
  }
  const json = (await res.json()) as TmdbVideos;
  const rows = (json.results ?? []).filter((row) => row.site === "YouTube" && row.key);
  const best =
    rows.find((row) => row.type === "Trailer" && row.official) ??
    rows.find((row) => row.type === "Trailer") ??
    rows.find((row) => row.type === "Teaser") ??
    rows[0];
  return best?.key ?? null;
}
