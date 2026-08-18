import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Code2,
  ExternalLink,
  Globe,
  History,
  Home,
  Loader2,
  Palette,
  Plus,
  RotateCw,
  Search,
  Settings2,
  ShieldCheck,
  Star,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site-layout";
import { themes, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { proxyConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchThroughProxy } from "@/lib/proxy.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/proxy")({
  head: () => ({
    meta: [
      { title: "Quantum Browser — private themeable proxy browser" },
      {
        name: "description",
        content:
          "Browse the web through Quantum's proxy: tabs, history, bookmarks, reader mode, script blocking and six dark themes.",
      },
      { property: "og:title", content: "Quantum Browser — private themeable proxy browser" },
      {
        property: "og:description",
        content:
          "Tabs, bookmarks, history, reader mode and script blocking in a fully themeable proxy browser.",
      },
    ],
  }),
  component: BrowserPage,
});

type Result = Awaited<ReturnType<typeof fetchThroughProxy>>;

type Tab = {
  id: string;
  address: string;
  title: string;
  history: string[];
  index: number;
  loading: boolean;
  error: string;
  result: Result | null;
};

type Bookmark = { id: string; title: string; url: string };

const HISTORY_KEY = "quantum-browser-history";
const BOOKMARKS_KEY = "quantum-browser-bookmarks";

const newTab = (address = ""): Tab => ({
  id: Math.random().toString(36).slice(2),
  address,
  title: "New tab",
  history: [],
  index: -1,
  loading: false,
  error: "",
  result: null,
});

function normalizeInput(raw: string, engine: string) {
  const value = raw.trim();
  if (!value) return "";
  const looksLikeUrl =
    /^https?:\/\//i.test(value) ||
    (/^[\w-]+(\.[\w-]+)+(\/|$|:\d)/.test(value) && !value.includes(" "));
  if (looksLikeUrl) return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return engine.replace("{{query}}", encodeURIComponent(value));
}

function BrowserPage() {
  const run = useServerFn(fetchThroughProxy);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [tabs, setTabs] = useState<Tab[]>(() => [newTab()]);
  const [activeId, setActiveId] = useState<string>(() => "");
  const [panel, setPanel] = useState<"none" | "bookmarks" | "history" | "settings" | "themes">("none");
  const [view, setView] = useState<"page" | "source">("page");
  const [zoom, setZoom] = useState(100);

  const [presetId, setPresetId] = useState(proxyConfig.presets[0]!.id);
  const [customTemplate, setCustomTemplate] = useState("");
  const [engineId, setEngineId] = useState(proxyConfig.searchEngines[0]!.id);
  const [blockScripts, setBlockScripts] = useState(true);
  const [readerMode, setReaderMode] = useState(false);
  const [homepage, setHomepage] = useState(proxyConfig.homepage);

  const [historyList, setHistoryList] = useState<{ url: string; title: string; at: number }[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0]!;

  useEffect(() => {
    setActiveId((current) => current || tabs[0]!.id);
  }, [tabs]);

  /* ── persisted local state ─────────────────────────────── */
  useEffect(() => {
    try {
      const h = window.localStorage.getItem(HISTORY_KEY);
      if (h) setHistoryList(JSON.parse(h));
      const b = window.localStorage.getItem(BOOKMARKS_KEY);
      if (b) setBookmarks(JSON.parse(b));
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  /* ── cloud-synced bookmarks + prefs when signed in ─────── */
  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [{ data: rows }, { data: prefs }] = await Promise.all([
        supabase.from("bookmarks").select("id,title,url").order("created_at", { ascending: false }),
        supabase.from("browser_prefs").select("theme,homepage,block_scripts").eq("user_id", user.id).maybeSingle(),
      ]);
      if (rows) setBookmarks(rows as Bookmark[]);
      if (prefs) {
        setHomepage(prefs.homepage);
        setBlockScripts(prefs.block_scripts);
        if (themes.some((t) => t.id === prefs.theme)) setTheme(prefs.theme as typeof theme);
      }
    })();
  }, [user, setTheme]);

  const savePrefs = async () => {
    if (!user) {
      toast.error("Sign in to sync your settings.");
      return;
    }
    const { error } = await supabase
      .from("browser_prefs")
      .upsert({ user_id: user.id, theme, homepage, block_scripts: blockScripts, updated_at: new Date().toISOString() });
    if (error) toast.error(error.message);
    else toast.success("Settings synced to your account.");
  };

  const template = useMemo(() => {
    if (presetId === "custom") return customTemplate.trim();
    return proxyConfig.presets.find((p) => p.id === presetId)?.url ?? "";
  }, [presetId, customTemplate]);

  const engineUrl =
    proxyConfig.searchEngines.find((e) => e.id === engineId)?.url ?? proxyConfig.searchEngines[0]!.url;

  const patchTab = useCallback((id: string, patch: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const pushHistory = (url: string, title: string) => {
    setHistoryList((prev) => {
      const next = [{ url, title, at: Date.now() }, ...prev.filter((h) => h.url !== url)].slice(0, 120);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const load = useCallback(
    async (tabId: string, rawUrl: string, mode: "push" | "replace" = "push") => {
      const url = normalizeInput(rawUrl, engineUrl);
      if (!url) return;
      if (presetId === "custom" && !template.includes("{{target}}")) {
        patchTab(tabId, { error: "Custom endpoints must include {{target}}." });
        return;
      }

      patchTab(tabId, { loading: true, error: "", address: url });
      try {
        const data = await run({
          data: { target: url, template: template || undefined, blockScripts, readerMode },
        });
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id !== tabId) return t;
            const history =
              mode === "push" ? [...t.history.slice(0, t.index + 1), data.finalUrl] : t.history;
            return {
              ...t,
              loading: false,
              result: data,
              title: data.title,
              address: data.finalUrl,
              history,
              index: mode === "push" ? history.length - 1 : t.index,
            };
          }),
        );
        pushHistory(data.finalUrl, data.title);
      } catch (err) {
        patchTab(tabId, {
          loading: false,
          error: err instanceof Error ? err.message : "This page could not be loaded.",
        });
      }
    },
    [blockScripts, engineUrl, patchTab, presetId, readerMode, run, template],
  );

  /* ── link clicks inside the frame ──────────────────────── */
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { __quantum?: boolean; type?: string; url?: string };
      if (!data?.__quantum) return;
      if (data.type === "navigate" && data.url) void load(activeIdRef.current, data.url);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [load]);

  const goBack = () => {
    if (activeTab.index <= 0) return;
    const nextIndex = activeTab.index - 1;
    patchTab(activeTab.id, { index: nextIndex });
    void load(activeTab.id, activeTab.history[nextIndex]!, "replace");
  };
  const goForward = () => {
    if (activeTab.index >= activeTab.history.length - 1) return;
    const nextIndex = activeTab.index + 1;
    patchTab(activeTab.id, { index: nextIndex });
    void load(activeTab.id, activeTab.history[nextIndex]!, "replace");
  };

  const addBookmark = async () => {
    const url = activeTab.result?.finalUrl ?? activeTab.address;
    if (!url) return;
    const title = activeTab.title || url;
    if (user) {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, title, url })
        .select("id,title,url")
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      setBookmarks((prev) => [data as Bookmark, ...prev]);
    } else {
      const entry = { id: Math.random().toString(36).slice(2), title, url };
      setBookmarks((prev) => {
        const next = [entry, ...prev];
        window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
        return next;
      });
    }
    toast.success("Bookmarked.");
  };

  const removeBookmark = async (id: string) => {
    if (user) await supabase.from("bookmarks").delete().eq("id", id);
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      if (!user) window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const bookmarked = bookmarks.some((b) => b.url === (activeTab.result?.finalUrl ?? activeTab.address));

  return (
    <SiteLayout>
      <section className="mx-auto w-full max-w-7xl px-3 py-6 md:px-5 md:py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold md:text-4xl">
              Quantum <span className="text-nebula">Browser</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{proxyConfig.subheading}</p>
          </div>
          {!user && (
            <Link
              to="/auth"
              className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in to sync bookmarks & themes
            </Link>
          )}
        </div>

        <div className="surface-card glow-ring overflow-hidden rounded-2xl">
          {/* Tab strip */}
          <div className="chrome-bar flex items-center gap-1 overflow-x-auto border-b border-border px-2 pt-2">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "group flex min-w-[9rem] max-w-[14rem] cursor-pointer items-center gap-2 rounded-t-lg border border-b-0 px-3 py-2 text-xs transition-colors",
                  tab.id === activeId
                    ? "border-border bg-card text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.loading ? (
                  <Loader2 className="size-3 shrink-0 animate-spin" />
                ) : (
                  <Globe className="size-3 shrink-0" />
                )}
                <span className="truncate">{tab.title || "New tab"}</span>
                {tabs.length > 1 && (
                  <button
                    type="button"
                    aria-label="Close tab"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTabs((prev) => prev.filter((t) => t.id !== tab.id));
                      if (tab.id === activeId) {
                        const rest = tabs.filter((t) => t.id !== tab.id);
                        setActiveId(rest[0]?.id ?? "");
                      }
                    }}
                    className="ml-auto opacity-50 transition-opacity hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              aria-label="New tab"
              onClick={() => {
                const tab = newTab();
                setTabs((prev) => [...prev, tab]);
                setActiveId(tab.id);
              }}
              className="mb-1 ml-1 rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Plus className="size-4" />
            </button>
          </div>

          {/* Toolbar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void load(activeTab.id, activeTab.address);
            }}
            className="chrome-bar flex flex-wrap items-center gap-2 border-b border-border p-2"
          >
            <div className="flex items-center gap-1">
              <ToolbarButton label="Back" onClick={goBack} disabled={activeTab.index <= 0}>
                <ArrowLeft className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Forward"
                onClick={goForward}
                disabled={activeTab.index >= activeTab.history.length - 1}
              >
                <ArrowRight className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Reload"
                onClick={() => void load(activeTab.id, activeTab.address, "replace")}
                disabled={!activeTab.address}
              >
                <RotateCw className={cn("size-4", activeTab.loading && "animate-spin")} />
              </ToolbarButton>
              <ToolbarButton label="Home" onClick={() => void load(activeTab.id, homepage)}>
                <Home className="size-4" />
              </ToolbarButton>
            </div>

            <div className="relative flex min-w-[12rem] flex-1 items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
              <Input
                value={activeTab.address}
                onChange={(e) => patchTab(activeTab.id, { address: e.target.value })}
                placeholder="Search the web or enter an address"
                className="rounded-full pl-9 pr-24"
                maxLength={2000}
                spellCheck={false}
              />
              <div className="absolute right-2 flex items-center gap-1">
                <ToolbarButton label="Bookmark this page" onClick={addBookmark} disabled={!activeTab.address}>
                  <Star className={cn("size-4", bookmarked && "fill-current text-primary")} />
                </ToolbarButton>
                <Button type="submit" size="sm" className="h-7 rounded-full px-3 text-xs">
                  Go
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <ToolbarButton
                label="Reader mode"
                active={readerMode}
                onClick={() => {
                  setReaderMode((v) => !v);
                  if (activeTab.address) void load(activeTab.id, activeTab.address, "replace");
                }}
              >
                <BookOpen className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="View source"
                active={view === "source"}
                onClick={() => setView(view === "source" ? "page" : "source")}
              >
                <Code2 className="size-4" />
              </ToolbarButton>
              <ToolbarButton label="Zoom out" onClick={() => setZoom((z) => Math.max(50, z - 10))}>
                <ZoomOut className="size-4" />
              </ToolbarButton>
              <ToolbarButton label="Zoom in" onClick={() => setZoom((z) => Math.min(180, z + 10))}>
                <ZoomIn className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Bookmarks"
                active={panel === "bookmarks"}
                onClick={() => setPanel(panel === "bookmarks" ? "none" : "bookmarks")}
              >
                <Star className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="History"
                active={panel === "history"}
                onClick={() => setPanel(panel === "history" ? "none" : "history")}
              >
                <History className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Themes"
                active={panel === "themes"}
                onClick={() => setPanel(panel === "themes" ? "none" : "themes")}
              >
                <Palette className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Settings"
                active={panel === "settings"}
                onClick={() => setPanel(panel === "settings" ? "none" : "settings")}
              >
                <Settings2 className="size-4" />
              </ToolbarButton>
            </div>
          </form>

          {activeTab.loading && (
            <div className="h-0.5 w-full overflow-hidden bg-secondary">
              <div className="h-full w-1/3 animate-pulse orbit-ring" />
            </div>
          )}

          <div className="flex min-h-[60vh] flex-col lg:flex-row">
            {/* Side panel */}
            {panel !== "none" && (
              <aside className="w-full shrink-0 space-y-4 border-b border-border bg-sidebar/60 p-4 text-sm lg:w-80 lg:border-b-0 lg:border-r">
                {panel === "bookmarks" && (
                  <PanelList
                    title="Bookmarks"
                    empty="No bookmarks yet — press the star in the address bar."
                    items={bookmarks.map((b) => ({
                      key: b.id,
                      title: b.title,
                      subtitle: b.url,
                      onOpen: () => void load(activeTab.id, b.url),
                      onRemove: () => void removeBookmark(b.id),
                    }))}
                    footer={
                      user ? "Synced to your account." : "Stored on this device — sign in to sync."
                    }
                  />
                )}
                {panel === "history" && (
                  <PanelList
                    title="History"
                    empty="Nothing here yet."
                    items={historyList.map((h) => ({
                      key: `${h.url}-${h.at}`,
                      title: h.title || h.url,
                      subtitle: new Date(h.at).toLocaleString(),
                      onOpen: () => void load(activeTab.id, h.url),
                    }))}
                    onClear={() => {
                      setHistoryList([]);
                      window.localStorage.removeItem(HISTORY_KEY);
                    }}
                  />
                )}
                {panel === "themes" && (
                  <div className="space-y-3">
                    <h2 className="font-display text-sm font-semibold">Themes</h2>
                    <div className="grid gap-2">
                      {themes.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t.id)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-3 text-left text-xs transition-colors",
                            theme === t.id
                              ? "border-primary bg-secondary"
                              : "border-border hover:bg-secondary/60",
                          )}
                        >
                          <span className="flex gap-1">
                            {t.swatch.map((c) => (
                              <span
                                key={c}
                                className="size-4 rounded-full border border-border"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {panel === "settings" && (
                  <div className="space-y-4">
                    <h2 className="font-display text-sm font-semibold">Browser settings</h2>
                    <div className="space-y-2">
                      <Label htmlFor="preset">Proxy endpoint</Label>
                      <select
                        id="preset"
                        value={presetId}
                        onChange={(e) => setPresetId(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {proxyConfig.presets.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                        <option value="custom">Custom endpoint…</option>
                      </select>
                    </div>
                    {presetId === "custom" && (
                      <div className="space-y-2">
                        <Label htmlFor="template">Custom endpoint template</Label>
                        <Input
                          id="template"
                          value={customTemplate}
                          onChange={(e) => setCustomTemplate(e.target.value)}
                          placeholder="https://my-proxy.dev/get?url={{target}}"
                          maxLength={500}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="engine">Search engine</Label>
                      <select
                        id="engine"
                        value={engineId}
                        onChange={(e) => setEngineId(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {proxyConfig.searchEngines.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="homepage">Homepage</Label>
                      <Input
                        id="homepage"
                        value={homepage}
                        onChange={(e) => setHomepage(e.target.value)}
                        maxLength={2000}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                      <div>
                        <p className="flex items-center gap-2 text-xs font-medium">
                          <ShieldCheck className="size-4" /> Block scripts & trackers
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Strips page scripts before rendering.
                        </p>
                      </div>
                      <Switch checked={blockScripts} onCheckedChange={setBlockScripts} />
                    </div>
                    <Button type="button" variant="outline" className="w-full" onClick={savePrefs}>
                      {user ? "Save to my account" : "Sign in to sync"}
                    </Button>
                  </div>
                )}
              </aside>
            )}

            {/* Viewport */}
            <div className="min-w-0 flex-1">
              {activeTab.error && (
                <div className="m-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm">
                  {activeTab.error}
                </div>
              )}

              {!activeTab.result && !activeTab.error && (
                <div className="flex h-full flex-col items-center justify-center gap-6 p-10 text-center">
                  <img
                    src={logoAsset.url}
                    alt="Quantum Services logo"
                    className="glow-ring size-16 rounded-full object-contain"
                  />
                  <div>
                    <h2 className="font-display text-xl font-semibold">Start browsing privately</h2>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Type a search or an address above. Pages are fetched by our servers, stripped of
                      scripts, and rendered in an isolated frame.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {proxyConfig.quickLinks.map((link) => (
                      <button
                        key={link.url}
                        type="button"
                        onClick={() => void load(activeTab.id, link.url)}
                        className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab.result && view === "page" && (
                <iframe
                  key={`${activeTab.id}-${activeTab.result.finalUrl}-${zoom}`}
                  title={activeTab.title || "Proxied page"}
                  srcDoc={activeTab.result.document}
                  sandbox="allow-scripts allow-popups-to-escape-sandbox"
                  referrerPolicy="no-referrer"
                  className="h-[72vh] w-full border-0 bg-background"
                  style={{ zoom: `${zoom}%` }}
                />
              )}

              {activeTab.result && view === "source" && (
                <pre className="max-h-[72vh] overflow-auto p-4 text-xs text-muted-foreground">
                  {activeTab.result.source}
                </pre>
              )}
            </div>
          </div>

          {/* Status bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-sidebar/60 px-4 py-2 text-[11px] text-muted-foreground">
            {activeTab.result ? (
              <>
                <span className="text-foreground">HTTP {activeTab.result.status}</span>
                <span className="truncate">{activeTab.result.finalUrl}</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" /> {activeTab.result.elapsedMs} ms
                </span>
                <span>{(activeTab.result.bytes / 1024).toFixed(1)} KB</span>
                <span>{blockScripts ? "Scripts blocked" : "Scripts allowed"}</span>
                <span>Zoom {zoom}%</span>
                <a
                  href={activeTab.result.finalUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="ml-auto flex items-center gap-1 hover:text-foreground"
                >
                  Open original <ExternalLink className="size-3" />
                </a>
              </>
            ) : (
              <span>Ready · {proxyConfig.presets.find((p) => p.id === presetId)?.label ?? "Custom endpoint"}</span>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        active && "bg-secondary text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function PanelList({
  title,
  items,
  empty,
  footer,
  onClear,
}: {
  title: string;
  empty: string;
  footer?: string;
  onClear?: () => void;
  items: {
    key: string;
    title: string;
    subtitle: string;
    onOpen: () => void;
    onRemove?: () => void;
  }[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold">{title}</h2>
        {onClear && items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="max-h-[55vh] space-y-1 overflow-auto pr-1">
          {items.map((item) => (
            <li key={item.key} className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-secondary/60">
              <button type="button" onClick={item.onOpen} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-xs text-foreground">{item.title}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{item.subtitle}</span>
              </button>
              {item.onRemove && (
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={item.onRemove}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {footer && <p className="text-[11px] text-muted-foreground">{footer}</p>}
    </div>
  );
}
