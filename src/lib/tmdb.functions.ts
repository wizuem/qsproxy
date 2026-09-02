import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { fetchTmdb, fetchTrailerKey } from "./tmdb.server";

const schema = z.object({
  feed: z
    .enum(["now_playing", "trending", "upcoming", "popular", "top_rated", "free_to_watch"])
    .default("now_playing"),
  query: z.string().trim().max(120).default(""),
  page: z.number().int().min(1).max(20).default(1),
  region: z.string().trim().length(2).default("US"),
});

const paths: Record<string, string> = {
  now_playing: "/movie/now_playing",
  trending: "/trending/movie/week",
  upcoming: "/movie/upcoming",
  popular: "/movie/popular",
  top_rated: "/movie/top_rated",
};

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
    if (data.feed === "free_to_watch") {
      return fetchTmdb("/discover/movie", {
        page: String(data.page),
        include_adult: "false",
        sort_by: "popularity.desc",
        watch_region: data.region,
        with_watch_monetization_types: "free,ads",
      });
    }
    return fetchTmdb(paths[data.feed]!, { page: String(data.page) });
  });

export const fetchMovieTrailer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => ({ key: await fetchTrailerKey(data.id) }));
