import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { proxyConfig } from "@/config/site";
import { fetchThroughProxy } from "@/lib/proxy.functions";

export const Route = createFileRoute("/proxy")({
  head: () => ({
    meta: [
      { title: "Quantum Proxy — Customizable web proxy" },
      {
        name: "description",
        content: "Fetch any page through the built-in Quantum proxy or your own custom upstream endpoint.",
      },
      { property: "og:title", content: "Quantum Proxy — Customizable web proxy" },
      {
        property: "og:description",
        content: "Fetch any page through the built-in Quantum proxy or your own custom upstream endpoint.",
      },
    ],
  }),
  component: ProxyPage,
});

type Result = Awaited<ReturnType<typeof fetchThroughProxy>>;

function ProxyPage() {
  const run = useServerFn(fetchThroughProxy);
  const [target, setTarget] = useState(proxyConfig.defaultTarget);
  const [presetId, setPresetId] = useState(proxyConfig.presets[0]!.id);
  const [customTemplate, setCustomTemplate] = useState("");
  const [view, setView] = useState<"rendered" | "source">("rendered");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setResult(null);

    let url = target.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      new URL(url);
    } catch {
      setError("That doesn't look like a valid URL.");
      return;
    }

    const template =
      presetId === "custom"
        ? customTemplate.trim()
        : (proxyConfig.presets.find((p) => p.id === presetId)?.url ?? "");
    if (presetId === "custom" && !template.includes("{{target}}")) {
      setError("Custom endpoints must include {{target}} where the destination URL goes.");
      return;
    }

    setLoading(true);
    try {
      const data = await run({ data: { target: url, template: template || undefined, mode: "html" } });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The proxy request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto w-full max-w-6xl px-5 py-14 md:py-20">
        <h1 className="text-3xl font-bold md:text-5xl">
          Quantum <span className="text-nebula">Proxy</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">{proxyConfig.subheading}</p>

        <form onSubmit={onSubmit} className="surface-card mt-8 space-y-5 rounded-2xl p-6 md:p-8">
          <div className="space-y-2">
            <Label htmlFor="target">Destination URL</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="https://example.com"
                maxLength={2000}
              />
              <Button type="submit" size="lg" disabled={loading} className="sm:w-40">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <>Fetch <ArrowRight className="ml-1 size-4" /></>}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preset">Proxy endpoint</Label>
              <select
                id="preset"
                value={presetId}
                onChange={(e) => setPresetId(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {proxyConfig.presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
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
          </div>

          {error && (
            <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">{error}</p>
          )}
        </form>

        {result && (
          <div className="surface-card mt-8 overflow-hidden rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 text-xs text-muted-foreground">
              <div className="space-y-1">
                <p className="text-foreground">
                  {result.status} · {result.contentType}
                </p>
                <p className="break-all">{result.finalUrl}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={view === "rendered" ? "default" : "outline"}
                  onClick={() => setView("rendered")}
                >
                  Rendered
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={view === "source" ? "default" : "outline"}
                  onClick={() => setView("source")}
                >
                  Source
                </Button>
              </div>
            </div>

            {view === "rendered" ? (
              <iframe
                title="Proxied page"
                srcDoc={result.body}
                sandbox=""
                className="h-[70vh] w-full bg-background"
              />
            ) : (
              <pre className="max-h-[70vh] overflow-auto p-4 text-xs text-muted-foreground">
                {result.body}
              </pre>
            )}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
