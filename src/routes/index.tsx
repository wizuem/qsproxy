import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell, WorkspaceProvider, type Section } from "@/components/app-shell";
import { useBrowserSettings } from "@/components/browser-settings";
import { QuantumBrowser } from "@/components/quantum-browser";
import { QuantumAI } from "@/components/quantum-ai";
import { AppsPage } from "@/components/pages/apps";
import { ContactPage } from "@/components/pages/contact";
import { GamesPage } from "@/components/pages/games";
import { MoviesPage } from "@/components/pages/movies";
import { SettingsPage } from "@/components/pages/settings";
import { YouTubePage } from "@/components/pages/youtube";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quantum Services — private browser, movies, games & AI" },
      { name: "description", content: siteConfig.description },
      {
        property: "og:title",
        content: "Quantum Services — private browser, movies, games & AI",
      },
      { property: "og:description", content: siteConfig.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkspacePage,
});

const FULL_HEIGHT: Section[] = ["browser", "ai"];

function WorkspacePage() {
  const { settings } = useBrowserSettings();
  const [section, setSection] = useState<Section>("browser");
  const [started, setStarted] = useState(false);
  const [browserUrl, setBrowserUrl] = useState("");
  const [browserKey, setBrowserKey] = useState(0);

  // Honour the configured start page on first mount only.
  useEffect(() => {
    if (started) return;
    setStarted(true);
    if (settings.startPage) setSection(settings.startPage as Section);
  }, [settings.startPage, started]);

  /** Opens any destination inside the Quantum Browser instead of a new tab. */
  const openInBrowser = (url: string) => {
    setBrowserUrl(url);
    setBrowserKey((value) => value + 1);
    setSection("browser");
  };

  return (
    <WorkspaceProvider section={section} setSection={setSection} openInBrowser={openInBrowser}>
      <AppShell noScroll={FULL_HEIGHT.includes(section)}>
        {section === "browser" && (
          <QuantumBrowser key={browserKey} initialUrl={browserUrl || undefined} />
        )}
        {section === "ai" && <QuantumAI className="h-full" />}
        {section === "movies" && <MoviesPage />}
        {section === "youtube" && <YouTubePage />}
        {section === "games" && <GamesPage />}
        {section === "apps" && <AppsPage />}
        {section === "contact" && <ContactPage />}
        {section === "settings" && <SettingsPage />}
      </AppShell>
    </WorkspaceProvider>
  );
}
