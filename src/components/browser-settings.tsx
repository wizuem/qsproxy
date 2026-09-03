import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { proxyConfig } from "@/config/site";

export type BrowserSettings = {
  presetId: string;
  customTemplate: string;
  engineId: string;
  blockScripts: boolean;
  readerMode: boolean;
  homepage: string;
  exitGuard: boolean;
  /** Preferred YouTube front-end; "auto" tries every configured instance. */
  videoInstance: string;
  videoRegion: string;
  /** "youtube" = privacy-mode youtube-nocookie player, "frontend" = Invidious embed. */
  playerMode: "youtube" | "frontend";
  autoplay: boolean;
  /** Movies: preferred watch-provider region for free-to-watch discovery. */
  movieRegion: string;
  /** UI scale in percent (90–125). */
  uiScale: number;
  reduceMotion: boolean;
  compactSidebar: boolean;
  /** Where the sidebar "home" lands and what loads first. */
  startPage: "browser" | "movies" | "youtube" | "games" | "apps" | "ai";
  openInNewTab: boolean;
  showClock: boolean;
};

const DEFAULTS: BrowserSettings = {
  presetId: proxyConfig.presets[0]!.id,
  customTemplate: "",
  engineId: proxyConfig.searchEngines[0]!.id,
  blockScripts: true,
  readerMode: false,
  homepage: proxyConfig.homepage,
  exitGuard: true,
  videoInstance: "auto",
  videoRegion: "US",
  playerMode: "youtube",
  autoplay: false,
  movieRegion: "US",
  uiScale: 100,
  reduceMotion: false,
  compactSidebar: false,
  startPage: "browser",
  openInNewTab: true,
  showClock: false,
};

const STORAGE_KEY = "quantum-browser-settings";

type Ctx = {
  settings: BrowserSettings;
  update: (patch: Partial<BrowserSettings>) => void;
  reset: () => void;
  /** Resolved proxy endpoint template ("" = built-in server fetch). */
  template: string;
  /** Resolved search-engine URL template. */
  engineUrl: string;
  /** Ordered list of video front-ends to try. */
  videoInstances: string[];
};

const BrowserSettingsContext = createContext<Ctx | null>(null);

export function BrowserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BrowserSettings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings((prev) => ({ ...prev, ...(JSON.parse(raw) as Partial<BrowserSettings>) }));
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${Math.min(125, Math.max(90, settings.uiScale)) / 100 * 16}px`;
    root.dataset["motion"] = settings.reduceMotion ? "reduced" : "full";
  }, [settings.uiScale, settings.reduceMotion]);

  const value = useMemo<Ctx>(() => {
    const persist = (next: BrowserSettings) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    };

    const template =
      settings.presetId === "custom"
        ? settings.customTemplate.trim()
        : (proxyConfig.presets.find((p) => p.id === settings.presetId)?.url ?? "");

    const engineUrl =
      proxyConfig.searchEngines.find((e) => e.id === settings.engineId)?.url ??
      proxyConfig.searchEngines[0]!.url;

    const videoInstances =
      settings.videoInstance === "auto"
        ? [...proxyConfig.videoInstances]
        : [
            settings.videoInstance,
            ...proxyConfig.videoInstances.filter((i) => i !== settings.videoInstance),
          ];

    return {
      settings,
      template,
      engineUrl,
      videoInstances,
      update: (patch) => setSettings((prev) => persist({ ...prev, ...patch })),
      reset: () => setSettings(persist(DEFAULTS)),
    };
  }, [settings]);

  return <BrowserSettingsContext.Provider value={value}>{children}</BrowserSettingsContext.Provider>;
}

export function useBrowserSettings() {
  const ctx = useContext(BrowserSettingsContext);
  if (!ctx) throw new Error("useBrowserSettings must be used inside BrowserSettingsProvider");
  return ctx;
}
