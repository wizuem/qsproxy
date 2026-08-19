import { createFileRoute } from "@tanstack/react-router";

import { QuantumBrowser } from "@/components/quantum-browser";

export const Route = createFileRoute("/proxy")({
  head: () => ({
    meta: [
      { title: "Quantum Browser — private themeable proxy browser" },
      {
        name: "description",
        content:
          "Browse the web through Quantum's proxy: tabs, history, bookmarks, built-in AI, reader mode, script blocking and six dark themes.",
      },
      { property: "og:title", content: "Quantum Browser — private themeable proxy browser" },
      {
        property: "og:description",
        content:
          "Tabs, bookmarks, history, Quantum AI, reader mode and script blocking in a fully themeable proxy browser.",
      },
    ],
  }),
  component: () => <QuantumBrowser />,
});
