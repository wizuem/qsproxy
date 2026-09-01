import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink, Loader2, Play, Search, Star, X } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { moviesConfig } from "@/config/site";
import { fetchArchiveItems } from "@/lib/media.functions";
import { fetchNewReleases } from "@/lib/tmdb.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "Quantum Movies — new releases & free classics" },
      {
        name: "description",
        content:
          "Browse what's in cinemas and trending now, or watch a huge library of public-domain films right in your browser.",
      },
      { property: "og:title", content: "Quantum Movies — new releases & free classics" },
      {
        property: "og:description",
        content: "New releases, trending titles and thousands of free public-domain films.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MoviesPage,
});

const FEEDS = [
  { id: "now_playing", label: "In cinemas" },
  { id: "trending", label: "Trending" },
  { id: "upcoming", label: "Coming soon" },
  { id: "popular", label: "Popular" },
  { id: "top_rated", label: "Top rated" },
] as const;

type Feed = (typeof FEEDS)[number]["id"];

function legalLink(title: string) {
  return moviesConfig.legalSearch.replace("{{query}}", encodeURIComponent(title));
}

function MoviesPage() {
  const [mode, setMode] = useState<"new" | "free">("new");

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        <PageHeader title={moviesConfig.heading} subtitle={moviesConfig.subheading} />

        <div className="mb-6 inline-flex rounded-full border border-border p-1">
          {(
            [
              { id: "new", label: "New releases" },
              { id: "free", label: "Free library" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                mode === tab.id && "bg-primary/15 text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mode === "new" ? <NewReleases /> : <FreeLibrary />}
      </div>
    </AppShell>
  );
}

function NewReleases() {
  const load = useServerFn(fetchNewReleases);
  const [feed, setFeed] = useState<Feed>("now_playing");
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  const results = useQuery({
    queryKey: ["tmdb", feed, query],
    queryFn: () => load({ data: { feed, query, page: 1 } }),
  });

  return (
    <div>
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
          placeholder="Search any film — new or old…"
          aria-label="Search films"
        />
        <Button type="submit">
          <Search className="size-4" />
        </Button>
      </form>

      {!query && (
        <div className="mt-4 flex flex-wrap gap-2">
          {FEEDS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFeed(item.id)}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
                feed === item.id && "border-primary bg-primary/10 text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setTerm("");
          }}
          className="mt-4 text-xs text-primary hover:underline"
        >
          Clear search “{query}”
        </button>
      )}

      {results.isPending && (
        <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading new releases…
        </div>
      )}
      {results.isError && (
        <p className="mt-10 text-sm text-destructive">
          {results.error instanceof Error ? results.error.message : "Could not load new releases."}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.data?.items.map((item) => (
          <article key={item.id} className="surface-card flex gap-3 overflow-hidden rounded-2xl p-3">
            {item.poster ? (
              <img
                src={item.poster}
                alt={`${item.title} poster`}
                loading="lazy"
                className="h-36 w-24 shrink-0 rounded-lg bg-secondary object-cover"
              />
            ) : (
              <div className="h-36 w-24 shrink-0 rounded-lg bg-secondary" />
            )}
            <div className="flex min-w-0 flex-col">
              <h3 className="line-clamp-2 text-sm font-semibold">{item.title}</h3>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {item.year}
                {item.rating ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3 text-primary" /> {item.rating}
                  </span>
                ) : null}
              </p>
              {item.overview && (
                <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{item.overview}</p>
              )}
              <a
                href={legalLink(item.title)}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs text-primary hover:underline"
              >
                <ExternalLink className="size-3.5" /> Where to watch
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function FreeLibrary() {
  const load = useServerFn(fetchArchiveItems);
  const [collection, setCollection] = useState(moviesConfig.collections[0]!.id);
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState<{ title: string; embed: string } | null>(null);

  const results = useQuery({
    queryKey: ["archive-movies", collection, query],
    queryFn: () => load({ data: { collection, query, page: 1, rows: 36, mediatype: "movies" } }),
  });

  return (
    <div>
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
          placeholder="Search free films by title…"
          aria-label="Search free films"
        />
        <Button type="submit">
          <Search className="size-4" />
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {moviesConfig.collections.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCollection(item.id)}
            className={cn(
              "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
              collection === item.id && "border-primary bg-primary/10 text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {results.isPending && (
        <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading the library…
        </div>
      )}
      {results.isError && (
        <p className="mt-10 text-sm text-destructive">
          {results.error instanceof Error ? results.error.message : "Could not load the catalogue."}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.data?.items.map((item) => (
          <article key={item.id} className="surface-card overflow-hidden rounded-2xl">
            <img
              src={item.thumb}
              alt={`${item.title} poster`}
              loading="lazy"
              className="h-40 w-full bg-secondary object-cover"
            />
            <div className="space-y-2 p-4">
              <h3 className="line-clamp-2 text-sm font-semibold">{item.title}</h3>
              {item.year && <p className="text-xs text-muted-foreground">{item.year}</p>}
              <Button size="sm" className="w-full" onClick={() => setPlaying(item)}>
                <Play className="mr-2 size-4" /> Watch
              </Button>
            </div>
          </article>
        ))}
      </div>

      {playing && (
        <div className="fixed inset-0 z-[95] flex flex-col bg-background/95 p-3 backdrop-blur-md">
          <div className="flex items-center gap-3 pb-3">
            <h2 className="truncate font-display text-sm font-semibold">{playing.title}</h2>
            <button
              type="button"
              aria-label="Close player"
              onClick={() => setPlaying(null)}
              className="ml-auto rounded-md border border-border p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <iframe
            title={playing.title}
            src={playing.embed}
            allowFullScreen
            className="min-h-0 w-full flex-1 rounded-xl border border-border bg-black"
          />
        </div>
      )}
    </div>
  );
}
