export type ArchiveItem = {
  id: string;
  title: string;
  year?: string;
  description?: string;
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
  views?: number;
  lengthSeconds?: number;
  thumb: string;
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

function mapVideos(rows: InvidiousVideo[]): VideoItem[] {
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

async function invidious(instance: string, path: string): Promise<InvidiousVideo[]> {
  const base = new URL(instance);
  const res = await fetch(new URL(path, base), { headers: { accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Invidious request failed [${res.status}]: ${body.slice(0, 300)}`);
    throw new Error("This YouTube front-end is not responding — try another instance in Settings.");
  }
  const json = (await res.json()) as InvidiousVideo[];
  return Array.isArray(json) ? json : [];
}

export async function searchInvidiousApi(instance: string, query: string) {
  const rows = await invidious(
    instance,
    `/api/v1/search?type=video&q=${encodeURIComponent(query)}`,
  );
  return { items: mapVideos(rows) };
}

export async function trendingInvidiousApi(instance: string) {
  const rows = await invidious(instance, "/api/v1/trending?type=Default");
  return { items: mapVideos(rows) };
}
