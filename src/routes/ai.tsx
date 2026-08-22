import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { QuantumAI } from "@/components/quantum-ai";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "Quantum AI — built-in assistant" },
      {
        name: "description",
        content: "Ask Quantum AI anything: summaries, explanations and help without leaving your session.",
      },
      { property: "og:title", content: "Quantum AI — built-in assistant" },
      {
        property: "og:description",
        content: "Ask Quantum AI anything: summaries, explanations and help without leaving your session.",
      },
    ],
  }),
  component: AiPage,
});

function AiPage() {
  return (
    <AppShell noScroll>
      <QuantumAI className="h-full" />
    </AppShell>
  );
}
