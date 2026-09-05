import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { fetchTmdb, fetchTrailerKey } from "./tmdb.server";

const FEED_IDS = [
  "kids_new",
  "family_new",
  "teens_new",
  "animation_new",
  "free_to_watch",
  "trending",
] as const;

const schema = z.object({
  feed: z.enum(FEED_IDS).default("kids_new"),
  query: z.string().trim().max(120).default(""),
  page: z.number().int().min(1).max(20).default(1),
  region: z.string().trim().length(2).default("US"),
});

/** Only films released 2020 or later appear in the curated kids/teen feeds. */
const SINCE = "2020-01-01";

export const fetchNewReleases = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    if (data.query) {
      return fetchTmdb("/search/movie", {
        query: data.query,
        page: String(data.page),
        include_adult: "false",
      });
    }

    const base: Record<string, string> = {
      page: String(data.page),
      include_adult: "false",
      sort_by: "popularity.desc",
      "primary_release_date.gte": SINCE,
      "vote_count.gte": "40",
      certification_country: "US",
      language: "en-US",
    };

    switch (data.feed) {
      case "kids_new":
        return fetchTmdb("/discover/movie", {
          ...base,
          "certification.lte": "PG",
          with_genres: "16,10751",
        });
      case "family_new":
        return fetchTmdb("/discover/movie", { ...base, "certification.lte": "PG", with_genres: "10751" });
      case "teens_new":
        return fetchTmdb("/discover/movie", {
          ...base,
          certification: "PG-13",
          with_genres: "12,14,28,35,878",
        });
      case "animation_new":
        return fetchTmdb("/discover/movie", { ...base, "certification.lte": "PG-13", with_genres: "16" });
      case "trending":
        return fetchTmdb("/discover/movie", { ...base, "certification.lte": "PG-13" });
      case "free_to_watch":
      default:
        return fetchTmdb("/discover/movie", {
          ...base,
          "certification.lte": "PG-13",
          watch_region: data.region,
          with_watch_monetization_types: "free,ads",
        });
    }
  });

export const fetchMovieTrailer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => ({ key: await fetchTrailerKey(data.id) }));
