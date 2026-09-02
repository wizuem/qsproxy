import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, RefreshCw, Search, X } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { useBrowserSettings } from "@/components/browser-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { proxyConfig } from "@/config/site";
import { searchYouTube } from "@/lib/media.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/youtube")({
  head: () => ({
    meta: [
      { title: "Quantum YouTube — private video viewing" },
      {
        name: "description",
        content: "Search and watch YouTube through a privacy-friendly front-end, with no tracking or ads.",
      },
      { property: "og:title", content: "Quantum YouTube — private video viewing" },
      {
        property: "og:description",
        content: "Search and watch YouTube through a privacy-friendly front-end, with no tracking or ads.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: YouTubePage,
});

function duration(seconds?: number) {
  if (!seconds || seconds < 0) return null;
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function YouTubePage() {
  const search = useServerFn(searchYouTube);
  const { settings, videoInstances, update } = useBrowserSettings();
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [video, setVideo] = useState<{ id: string; title: string } | null>(null);

  const results = useQuery({
    queryKey: ["youtube", videoInstances.join(","), settings.videoRegion, query],
    queryFn: () => search({ data: { instances: videoInstances, query, region: settings.videoRegion } }),
    retry: 1,
  });

  const playerSrc = (id: string) => {
    const autoplay = settings.autoplay ? "1" : "0";
    if (settings.playerMode === "frontend") {
      const host = videoInstances.find((i) => !/pipedapi|api\.piped|piped-api/.test(i));
      if (host) return `${host.replace(/\/$/, "")}/embed/${id}?autoplay=${autoplay}`;
    }
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplay}&rel=0&modestbranding=1`;
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        <PageHeader
          title="Quantum YouTube"
          subtitle="Watch privately — no account, no tracking cookies. Front-end, region and player are configurable in Settings."
        />

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(term.trim());
          }}
          className="flex gap-2"
        >
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search YouTube…"
            aria-label="Search YouTube"
          />
          <Button type="submit">
            <Search className="size-4" />
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {proxyConfig.videoRegions.slice(0, 6).map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => update({ videoRegion: region.id })}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
                settings.videoRegion === region.id && "border-primary bg-primary/10 text-foreground",
              )}
            >
              {region.id}
            </button>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => void results.refetch()}
          >
            <RefreshCw className={cn("mr-2 size-3.5", results.isFetching && "animate-spin")} /> Retry
          </Button>
        </div>

        {results.isPending && (
          <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading videos…
          </div>
        )}
        {results.isError && (
          <p className="mt-10 text-sm text-destructive">
            {results.error instanceof Error
              ? results.error.message
              : "No front-end is responding — try another instance in Settings."}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.data?.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setVideo(item)}
              className="surface-card overflow-hidden rounded-2xl text-left transition-colors hover:border-primary"
            >
              <div className="relative">
                <img
                  src={item.thumb}
                  alt={`${item.title} thumbnail`}
                  loading="lazy"
                  className="h-40 w-full bg-secondary object-cover"
                />
                {duration(item.lengthSeconds) && (
                  <span className="absolute bottom-2 right-2 rounded bg-background/85 px-1.5 py-0.5 text-[11px]">
                    {duration(item.lengthSeconds)}
                  </span>
                )}
              </div>
              <div className="space-y-1 p-4">
                <h3 className="line-clamp-2 text-sm font-semibold">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.author}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {video && (
        <div className="fixed inset-0 z-[95] flex flex-col bg-background/95 p-3 backdrop-blur-md">
          <div className="flex items-center gap-3 pb-3">
            <h2 className="truncate font-display text-sm font-semibold">{video.title}</h2>
            <button
              type="button"
              aria-label="Close player"
              onClick={() => setVideo(null)}
              className="ml-auto rounded-md border border-border p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <iframe
            title={video.title}
            src={playerSrc(video.id)}
            allow="fullscreen; autoplay; encrypted-media"
            allowFullScreen
            className="min-h-0 w-full flex-1 rounded-xl border border-border bg-black"
          />
        </div>
      )}
    </AppShell>
  );
}
