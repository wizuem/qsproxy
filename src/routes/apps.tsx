import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, MessageCircle } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { appsConfig, siteConfig } from "@/config/site";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: "Quantum Apps — launch your favourite sites" },
      {
        name: "description",
        content: "A curated directory of web apps for work, learning, music, gaming and community.",
      },
      { property: "og:title", content: "Quantum Apps — launch your favourite sites" },
      {
        property: "og:description",
        content: "A curated directory of web apps for work, learning, music, gaming and community.",
      },
    ],
  }),
  component: AppsPage,
});

function AppsPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        <PageHeader title={appsConfig.heading} subtitle={appsConfig.subheading} />

        <div className="surface-card mb-8 flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-base font-semibold">Join the Quantum Discord</h2>
            <p className="text-sm text-muted-foreground">Requests, updates and support from the team.</p>
          </div>
          <Button asChild className="sm:ml-auto">
            <a href={siteConfig.discordInvite} target="_blank" rel="noreferrer noopener">
              <MessageCircle className="mr-2 size-4" /> Join our Discord
            </a>
          </Button>
        </div>

        {appsConfig.categories.map((category) => (
          <section key={category.label} className="mb-10">
            <h2 className="font-display text-lg font-semibold">{category.label}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.apps.map((app) => (
                <a
                  key={app.label}
                  href={app.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="surface-card rounded-xl p-4 transition-colors hover:border-primary"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{app.label}</span>
                    <ExternalLink className="ml-auto size-3.5 text-muted-foreground" />
                  </div>
                  {app.note && <p className="mt-1 text-xs text-muted-foreground">{app.note}</p>}
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
