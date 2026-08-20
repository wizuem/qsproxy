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
  invidiousInstance: string;
};

const DEFAULTS: BrowserSettings = {
  presetId: proxyConfig.presets[0]!.id,
  customTemplate: "",
  engineId: proxyConfig.searchEngines[0]!.id,
  blockScripts: true,
  readerMode: false,
  homepage: proxyConfig.homepage,
  exitGuard: false,
  invidiousInstance: proxyConfig.invidiousInstances[0]!,
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

    return {
      settings,
      template,
      engineUrl,
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
