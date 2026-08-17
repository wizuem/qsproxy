import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe2, ShieldCheck, Zap, Network } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import logoAsset from "@/assets/quantum-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quantum Services — Fast, private network infrastructure" },
      { name: "description", content: siteConfig.description },
      { property: "og:title", content: "Quantum Services — Fast, private network infrastructure" },
      { property: "og:description", content: siteConfig.description },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: Network,
    title: "Configurable proxying",
    body: "Route requests through our edge or your own upstream — swap providers without touching code.",
  },
  {
    icon: Zap,
    title: "Edge performance",
    body: "Requests resolve at the nearest node, so pages load in milliseconds anywhere on the planet.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "No request logs, no resale of traffic data. Your destinations stay between you and us.",
  },
  {
    icon: Globe2,
    title: "Global reach",
    body: "Coverage across the regions your users actually live in, with predictable throughput.",
  },
];

function Home() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full orbit-ring" />
              {siteConfig.tagline}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
              Move data like <span className="text-nebula">light</span>.
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
              {siteConfig.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/proxy">Open the proxy</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Talk to us</Link>
              </Button>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div
              className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-40"
              style={{ backgroundImage: "var(--gradient-nebula)" }}
              aria-hidden
            />
            <img
              src={logoAsset.url}
              alt="Quantum Services orbital mark"
              className="w-full max-w-md object-contain mix-blend-screen"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-16 md:pb-24">
        <h2 className="text-2xl font-semibold md:text-3xl">What we run</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, body }) => (
            <article key={title} className="surface-card rounded-2xl p-6">
              <Icon className="size-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20">
        <div className="surface-card flex flex-col items-start gap-5 rounded-2xl p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Ready when you are</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us your stack and we'll map out the fastest route.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/contact">Get in touch</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
