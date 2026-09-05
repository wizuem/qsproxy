import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpRight, Gamepad2, Loader2, Search, X } from "lucide-react";

import { AppShell, PageHeader, useWorkspace } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gamesConfig } from "@/config/games";
import { fetchArchiveItems } from "@/lib/media.functions";
import { cn } from "@/lib/utils";

export function GamesPage() {
  const load = useServerFn(fetchArchiveItems);
  const { openInBrowser } = useWorkspace();
  const [collection, setCollection] = useState(gamesConfig.archiveCollections[0]!.id);
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState<{ title: string; embed: string } | null>(null);

  const results = useQuery({
    queryKey: ["archive-games", collection, query],
    queryFn: () => load({ data: { collection, query, page: 1, rows: 48, mediatype: "software" } }),
  });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        <PageHeader title={gamesConfig.heading} subtitle={gamesConfig.subheading} />

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
            placeholder="Search the game library…"
            aria-label="Search games"
          />
          <Button type="submit">
            <Search className="size-4" />
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {gamesConfig.archiveCollections.map((item) => (
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
            <Loader2 className="size-4 animate-spin" /> Loading games…
          </div>
        )}
        {results.isError && (
          <p className="mt-10 text-sm text-destructive">
            {results.error instanceof Error ? results.error.message : "Could not load the catalogue."}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.data?.items.map((item) => (
            <article key={item.id} className="surface-card overflow-hidden rounded-2xl">
              <img
                src={item.thumb}
                alt={`${item.title} cover`}
                loading="lazy"
                className="h-32 w-full bg-secondary object-cover"
              />
              <div className="space-y-2 p-3">
                <h3 className="line-clamp-2 text-xs font-semibold">{item.title}</h3>
                <Button size="sm" className="w-full" onClick={() => setPlaying(item)}>
                  <Gamepad2 className="mr-2 size-4" /> Play
                </Button>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold">Web games</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gamesConfig.openSourceGames.map((game) => (
              <button
                key={game.label}
                type="button"
                onClick={() => openInBrowser(game.url)}
                className="surface-card flex items-center gap-3 rounded-xl p-4 text-left transition-colors hover:border-primary"
              >
                <span className="text-sm font-medium">{game.label}</span>
                <span className="ml-auto text-[11px] text-muted-foreground">{game.tag}</span>
                <ArrowUpRight className="size-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>

        <section className="mt-12 pb-4">
          <h2 className="font-display text-lg font-semibold">Game portals</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {gamesConfig.portals.map((portal) => (
              <button
                key={portal.label}
                type="button"
                onClick={() => openInBrowser(portal.url)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                {portal.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      {playing && (
        <div className="fixed inset-0 z-[95] flex flex-col bg-background/95 p-3 backdrop-blur-md">
          <div className="flex items-center gap-3 pb-3">
            <h2 className="truncate font-display text-sm font-semibold">{playing.title}</h2>
            <button
              type="button"
              aria-label="Close game"
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
