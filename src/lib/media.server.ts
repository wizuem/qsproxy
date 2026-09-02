export type ArchiveItem = {
  id: string;
  title: string;
  year?: string | undefined;
  description?: string | undefined;
  thumb: string;
  embed: string;
};

type ArchiveResponse = {
  response?: {
    numFound?: number;
    docs?: { identifier: string; title?: string; year?: string; description?: string | string[] }[];
  };
};

export async function searchArchive(input: {
  collection: string;
  query: string;
  page: number;
  rows: number;
  mediatype: "movies" | "software";
}): Promise<{ items: ArchiveItem[]; total: number }> {
  const safeQuery = input.query.replace(/[":\\]/g, " ").trim();
  const clauses = [`collection:(${input.collection})`, `mediatype:(${input.mediatype})`];
  if (safeQuery) clauses.push(`title:(${safeQuery})`);

  const url = new URL("https://archive.org/advancedsearch.php");
  url.searchParams.set("q", clauses.join(" AND "));
  for (const field of ["identifier", "title", "year", "description"]) {
    url.searchParams.append("fl[]", field);
  }
  url.searchParams.set("sort[]", safeQuery ? "downloads desc" : "week desc");
  url.searchParams.set("rows", String(input.rows));
  url.searchParams.set("page", String(input.page));
  url.searchParams.set("output", "json");

  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Archive search failed [${res.status}]: ${body.slice(0, 400)}`);
    throw new Error("The catalogue is unavailable right now. Please try again.");
  }

  const json = (await res.json()) as ArchiveResponse;
  const docs = json.response?.docs ?? [];

  return {
    total: json.response?.numFound ?? docs.length,
    items: docs.map((doc) => {
      const raw = Array.isArray(doc.description) ? doc.description.join(" ") : doc.description;
      return {
        id: doc.identifier,
        title: doc.title ?? doc.identifier,
        year: doc.year,
        description: raw ? raw.replace(/<[^>]*>/g, "").slice(0, 320) : undefined,
        thumb: `https://archive.org/services/img/${encodeURIComponent(doc.identifier)}`,
        embed: `https://archive.org/embed/${encodeURIComponent(doc.identifier)}`,
      };
    }),
  };
}

export type VideoItem = {
  id: string;
  title: string;
  author: string;
  views?: number | undefined;
  lengthSeconds?: number | undefined;
  thumb: string;
};

type PipedItem = {
  url?: string;
  type?: string;
  title?: string;
  uploaderName?: string;
  views?: number;
  duration?: number;
  thumbnail?: string;
};

type InvidiousVideo = {
  type?: string;
  videoId?: string;
  title?: string;
  author?: string;
  viewCount?: number;
  lengthSeconds?: number;
  videoThumbnails?: { url?: string; quality?: string }[];
};

function idFromUrl(url?: string) {
  if (!url) return undefined;
  const match = /[?&]v=([\w-]{6,})/.exec(url);
  return match?.[1];
}

function mapPiped(rows: PipedItem[]): VideoItem[] {
  return rows
    .map((row) => ({ row, id: idFromUrl(row.url) }))
    .filter((entry) => entry.id && entry.row.type !== "channel" && entry.row.type !== "playlist")
    .map(({ row, id }) => ({
      id: id!,
      title: row.title ?? "Untitled",
      author: row.uploaderName ?? "YouTube",
      views: typeof row.views === "number" && row.views >= 0 ? row.views : undefined,
      lengthSeconds: typeof row.duration === "number" ? row.duration : undefined,
      thumb: row.thumbnail || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    }));
}

function mapInvidious(rows: InvidiousVideo[]): VideoItem[] {
  return rows
    .filter((row) => row.videoId && (row.type ? row.type === "video" : true))
    .map((row) => ({
      id: row.videoId!,
      title: row.title ?? "Untitled",
      author: row.author ?? "Unknown",
      views: row.viewCount,
      lengthSeconds: row.lengthSeconds,
      thumb:
        row.videoThumbnails?.find((t) => t.quality === "medium")?.url ??
        row.videoThumbnails?.[0]?.url ??
        `https://i.ytimg.com/vi/${row.videoId}/mqdefault.jpg`,
    }));
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("json")) throw new Error("Non-JSON response");
  return res.json();
}

/**
 * Queries several YouTube front-ends in order (Piped API first, then any
 * Invidious instances) and returns the first that answers. Public instances go
 * down constantly, so a single hard-coded host is never reliable.
 */
async function firstWorking(
  instances: string[],
  build: (instance: string) => { url: string; kind: "piped" | "invidious" },
): Promise<{ items: VideoItem[]; instance: string }> {
  const errors: string[] = [];
  for (const instance of instances) {
    const { url, kind } = build(instance);
    try {
      const json = await getJson(url);
      const rows = Array.isArray(json)
        ? json
        : ((json as { items?: unknown[] }).items ?? []);
      const items =
        kind === "piped" ? mapPiped(rows as PipedItem[]) : mapInvidious(rows as InvidiousVideo[]);
      if (items.length) return { items, instance };
      errors.push(`${instance}: empty`);
    } catch (err) {
      errors.push(`${instance}: ${err instanceof Error ? err.message : "failed"}`);
    }
  }
  console.error(`All video front-ends failed — ${errors.join(" | ")}`);
  throw new Error("Every YouTube front-end is down right now. Try again shortly.");
}

function kindOf(instance: string): "piped" | "invidious" {
  return /pipedapi|api\.piped|piped-api/.test(instance) ? "piped" : "invidious";
}

export async function searchVideos(instances: string[], query: string, region: string) {
  return firstWorking(instances, (instance) => {
    const base = instance.replace(/\/$/, "");
    return kindOf(instance) === "piped"
      ? {
          url: `${base}/search?filter=videos&region=${encodeURIComponent(region)}&q=${encodeURIComponent(query)}`,
          kind: "piped" as const,
        }
      : {
          url: `${base}/api/v1/search?type=video&region=${encodeURIComponent(region)}&q=${encodeURIComponent(query)}`,
          kind: "invidious" as const,
        };
  });
}

export async function trendingVideos(instances: string[], region: string) {
  return firstWorking(instances, (instance) => {
    const base = instance.replace(/\/$/, "");
    return kindOf(instance) === "piped"
      ? { url: `${base}/trending?region=${encodeURIComponent(region)}`, kind: "piped" as const }
      : {
          url: `${base}/api/v1/trending?type=Default&region=${encodeURIComponent(region)}`,
          kind: "invidious" as const,
        };
  });
}

