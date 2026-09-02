import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { searchArchive, searchVideos, trendingVideos } from "./media.server";

const archiveSchema = z.object({
  collection: z.string().trim().max(80),
  query: z.string().trim().max(120).default(""),
  page: z.number().int().min(1).max(50).default(1),
  rows: z.number().int().min(6).max(60).default(36),
  mediatype: z.enum(["movies", "software"]).default("movies"),
});

export const fetchArchiveItems = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => archiveSchema.parse(data))
  .handler(async ({ data }) => searchArchive(data));

const videoSchema = z.object({
  instances: z.array(z.string().trim().url().max(200)).min(1).max(10),
  query: z.string().trim().max(200).default(""),
  region: z.string().trim().length(2).default("US"),
});

export const searchYouTube = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => videoSchema.parse(data))
  .handler(async ({ data }) =>
    data.query
      ? searchVideos(data.instances, data.query, data.region)
      : trendingVideos(data.instances, data.region),
  );
