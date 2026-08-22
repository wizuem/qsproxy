import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Search, X } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { useBrowserSettings } from "@/components/browser-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchYouTube } from "@/lib/media.functions";

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
    ],
  }),
  component: YouTubePage,
});

function YouTubePage() {
  const search = useServerFn(searchYouTube);
  const { settings } = useBrowserSettings();
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [video, setVideo] = useState<{ id: string; title: string } | null>(null);

  const results = useQuery({
    queryKey: ["youtube", settings.invidiousInstance, query],
    queryFn: () => search({ data: { instance: settings.invidiousInstance, query } }),
  });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        <PageHeader
          title="Quantum YouTube"
          subtitle="Watch through a privacy-friendly front-end — no ads, no tracking. Change the instance in Settings."
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

        {results.isPending && (
          <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading videos…
          </div>
        )}
        {results.isError && (
          <p className="mt-10 text-sm text-destructive">
            {results.error instanceof Error
              ? results.error.message
              : "This front-end is not responding — try another instance in Settings."}
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
              <img
                src={item.thumb}
                alt={`${item.title} thumbnail`}
                loading="lazy"
                className="h-40 w-full bg-secondary object-cover"
              />
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
            src={`${settings.invidiousInstance}/embed/${video.id}`}
            allow="fullscreen; autoplay"
            className="min-h-0 w-full flex-1 rounded-xl border border-border bg-black"
          />
        </div>
      )}
    </AppShell>
  );
}
