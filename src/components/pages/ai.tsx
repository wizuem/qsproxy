import { AppShell } from "@/components/app-shell";
import { QuantumAI } from "@/components/quantum-ai";

export function AiPage() {
  return (
    <AppShell noScroll>
      <QuantumAI className="h-full" />
    </AppShell>
  );
}
