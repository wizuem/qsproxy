import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { QuantumBrowser } from "@/components/quantum-browser";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quantum Services — private fullscreen proxy browser" },
      { name: "description", content: siteConfig.description },
      { property: "og:title", content: "Quantum Services — private fullscreen proxy browser" },
      { property: "og:description", content: siteConfig.description },
    ],
  }),
  component: BrowserPage,
});

function BrowserPage() {
  return (
    <AppShell noScroll>
      <QuantumBrowser />
    </AppShell>
  );
}
