import { createFileRoute } from "@tanstack/react-router";

import { QuantumBrowser } from "@/components/quantum-browser";

export const Route = createFileRoute("/browser")({
  head: () => ({
    meta: [
      { title: "Quantum Browser — standalone proxy app" },
      {
        name: "description",
        content:
          "The standalone Quantum Browser: a distraction-free, fullscreen-ready proxy browser with tabs, AI and themes.",
      },
      { property: "og:title", content: "Quantum Browser — standalone proxy app" },
      {
        property: "og:description",
        content: "Distraction-free proxy browsing with tabs, bookmarks, Quantum AI and dark themes.",
      },
    ],
  }),
  component: () => <QuantumBrowser standalone />,
});
