import { useServerFn } from "@tanstack/react-start";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink, Film, Loader2, Play, Search, Star, X } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { useBrowserSettings } from "@/components/browser-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { moviesConfig } from "@/config/site";
import { fetchArchiveItems } from "@/lib/media.functions";
import { fetchMovieTrailer, fetchNewReleases } from "@/lib/tmdb.functions";
import { cn } from "@/lib/utils";

const FEEDS = [
  { id: "free_to_watch", label: "Free to watch" },
  { id: "now_playing", label: "In cinemas" },
  { id: "trending", label: "Trending" },
  { id: "upcoming", label: "Coming soon" },
  { id: "popular", label: "Popular" },
  { id: "top_rated", label: "Top rated" },
] as const;

type Feed = (typeof FEEDS)[number]["id"];

type Playing = { title: string; embed: string };

function legalLink(title: string) {
  return moviesConfig.legalSearch.replace("{{query}}", encodeURIComponent(title));
}

export function MoviesPage() {
  const [playing, setPlaying] = useState<Playing | null>(null);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        <PageHeader title={moviesConfig.heading} subtitle={moviesConfig.subheading} />

        <FreeToWatch onPlay={setPlaying} />

        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold">Watch newer films free, in-app</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These services stream modern, fully licensed movies for free — ad-supported or with a
            library card.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {moviesConfig.freeServices.map((service) => (
              <a
                key={service.label}
                href={service.url}
                target="_blank"
                rel="noreferrer noopener"
                className="surface-card flex flex-col gap-1 rounded-xl p-3 transition-colors hover:bg-secondary/50"
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Film className="size-4 text-primary" /> {service.label}
                </span>
                <span className="text-xs text-muted-foreground">{service.note}</span>
              </a>
            ))}
          </div>
        </section>

        <FreeToPlay onPlay={setPlaying} />
      </div>

      {playing && <PlayerOverlay playing={playing} onClose={() => setPlaying(null)} />}
    </AppShell>
  );
}

function PlayerOverlay({ playing, onClose }: { playing: Playing; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-background/95 p-3 backdrop-blur-md">
      <div className="flex items-center gap-3 pb-3">
        <h2 className="truncate font-display text-sm font-semibold">{playing.title}</h2>
        <button
          type="button"
          aria-label="Close player"
          onClick={onClose}
          className="ml-auto rounded-md border border-border p-2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <iframe
        title={playing.title}
        src={playing.embed}
        allow="autoplay; fullscreen; encrypted-media"
        allowFullScreen
        className="min-h-0 w-full flex-1 rounded-xl border border-border bg-black"
      />
    </div>
  );
}

/** TMDB-powered discovery: free-to-watch first, plus cinema/trending feeds. */
function FreeToWatch({ onPlay }: { onPlay: (playing: Playing) => void }) {
  const load = useServerFn(fetchNewReleases);
  const loadTrailer = useServerFn(fetchMovieTrailer);
  const { settings } = useBrowserSettings();
  const region = settings.movieRegion || "US";
  const [feed, setFeed] = useState<Feed>("free_to_watch");
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

  const results = useInfiniteQuery({
    queryKey: ["tmdb", feed, query, region],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => load({ data: { feed, query, page: pageParam as number, region } }),
    getNextPageParam: (_last, pages) => (pages.length < 10 ? pages.length + 1 : undefined),
  });

  const items = results.data?.pages.flatMap((page) => page.items) ?? [];

  const playTrailer = async (id: number, title: string) => {
    setPendingId(id);
    try {
      const { key } = await loadTrailer({ data: { id } });
      if (key) {
        onPlay({
          title: `${title} — trailer`,
          embed: `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&rel=0`,
        });
      }
    } finally {
      setPendingId(null);
    }
  };

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

      {!query ? (
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
      ) : (
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
          <Loader2 className="size-4 animate-spin" /> Loading films…
        </div>
      )}
      {results.isError && (
        <p className="mt-10 text-sm text-destructive">
          {results.error instanceof Error ? results.error.message : "Could not load films."}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
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
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => void playTrailer(item.id, item.title)}
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  {pendingId === item.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Play className="size-3.5" />
                  )}
                  Watch trailer
                </button>
                <a
                  href={legalLink(item.title)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="size-3.5" /> Watch now
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {items.length > 0 && results.hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => void results.fetchNextPage()}
            disabled={results.isFetchingNextPage}
          >
            {results.isFetchingNextPage ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Load more films
          </Button>
        </div>
      )}
    </div>
  );
}

/** Public-domain library, playable in-app, merged into this page. */
function FreeToPlay({ onPlay }: { onPlay: (playing: Playing) => void }) {
  const load = useServerFn(fetchArchiveItems);
  const [collection, setCollection] = useState(moviesConfig.collections[0]!.id);
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  const results = useInfiniteQuery({
    queryKey: ["archive-movies", collection, query],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      load({
        data: { collection, query, page: pageParam as number, rows: 60, mediatype: "movies" },
      }),
    getNextPageParam: (_last, pages) => (pages.length < 20 ? pages.length + 1 : undefined),
  });

  const items = results.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="mt-12">
      <h2 className="font-display text-lg font-semibold">Thousands more, free to play right here</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Public-domain and freely licensed films — press play and they stream inside Quantum.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(term.trim());
        }}
        className="mt-4 flex gap-2"
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
        {items.map((item) => (
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
              <Button
                size="sm"
                className="w-full"
                onClick={() => onPlay({ title: item.title, embed: item.embed })}
              >
                <Play className="mr-1.5 size-4" /> Play now
              </Button>
            </div>
          </article>
        ))}
      </div>

      {items.length > 0 && results.hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => void results.fetchNextPage()}
            disabled={results.isFetchingNextPage}
          >
            {results.isFetchingNextPage ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Load more free films
          </Button>
        </div>
      )}
    </section>
  );
}
