import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink, Loader2, Play, Search, X } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { moviesConfig } from "@/config/site";
import { fetchArchiveItems } from "@/lib/media.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "Quantum Movies — stream classic films free" },
      {
        name: "description",
        content:
          "Watch a huge library of public-domain films in your browser, or look up any title and jump to a legal stream.",
      },
      { property: "og:title", content: "Quantum Movies — stream classic films free" },
      {
        property: "og:description",
        content: "Watch public-domain classics instantly, or find where any film streams legally.",
      },
    ],
  }),
  component: MoviesPage,
});

function MoviesPage() {
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
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        <PageHeader title={moviesConfig.heading} subtitle={moviesConfig.subheading} />

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
            placeholder="Search films by title…"
            aria-label="Search films"
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

        {query && (
          <a
            href={moviesConfig.legalSearch.replace("{{query}}", encodeURIComponent(query))}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex items-center gap-2 text-xs text-primary hover:underline"
          >
            <ExternalLink className="size-3.5" /> Find “{query}” on legal streaming services
          </a>
        )}

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
    </AppShell>
  );
}
