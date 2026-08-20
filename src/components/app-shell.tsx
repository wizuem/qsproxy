import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Clapperboard,
  Gamepad2,
  Globe,
  LayoutGrid,
  Mail,
  Maximize2,
  Menu,
  MessageCircle,
  Minimize2,
  PanelLeftClose,
  Settings2,
  Sparkles,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";

import logoAsset from "@/assets/quantum-logo.png.asset.json";
import { useBrowserSettings } from "@/components/browser-settings";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Browser", icon: Globe, exact: true },
  { to: "/movies", label: "Movies", icon: Clapperboard },
  { to: "/youtube", label: "YouTube", icon: Youtube },
  { to: "/games", label: "Games", icon: Gamepad2 },
  { to: "/apps", label: "Apps", icon: LayoutGrid },
  { to: "/ai", label: "Quantum AI", icon: Sparkles },
  { to: "/contact", label: "Contact", icon: Mail },
  { to: "/settings", label: "Settings", icon: Settings2 },
] as const;

export function AppShell({
  children,
  /** Set for pages whose own body scrolls (the browser viewport). */
  noScroll = false,
}: {
  children: ReactNode;
  noScroll?: boolean;
}) {
  const { settings } = useBrowserSettings();
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!settings.exitGuard) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [settings.exitGuard]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void shellRef.current?.requestFullscreen?.().catch(() => {
        toast.error("Fullscreen was blocked by your browser.");
      });
    }
  };

  return (
    <div ref={shellRef} className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "absolute inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-sidebar/95 backdrop-blur-xl transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2 px-4 py-4">
          <img src={logoAsset.url} alt="Quantum Services logo" className="size-9 object-contain" />
          <span className="font-display text-sm font-semibold leading-tight">
            Quantum <span className="text-nebula">Services</span>
          </span>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
            className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-secondary md:hidden"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: Boolean((item as { exact?: boolean }).exact) }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 border-t border-border/60 p-3">
          <a
            href={siteConfig.discordInvite}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <MessageCircle className="size-4" /> Join our Discord
          </a>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            {fullscreen ? "Exit fullscreen" : "Go fullscreen"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmLeave(true)}
            className="w-full rounded-lg border border-destructive/50 px-3 py-2 text-xs text-destructive transition-colors hover:bg-destructive/10"
          >
            Leave Quantum
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setOpen(false)}
          className="absolute inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2 md:hidden">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setOpen(true)}
            className="rounded-md border border-border p-2 text-foreground"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display text-sm font-semibold">Quantum Services</span>
        </div>
        <main className={cn("min-h-0 flex-1", noScroll ? "flex flex-col overflow-hidden" : "overflow-y-auto")}>
          {children}
        </main>
      </div>

      {confirmLeave && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/85 p-4 backdrop-blur-md">
          <div className="surface-card w-full max-w-sm rounded-2xl p-5 text-center">
            <h2 className="font-display text-base font-semibold">Leave Quantum Services?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your open tabs and current session will be closed.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" onClick={() => setConfirmLeave(false)}>
                Stay here
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setConfirmLeave(false);
                  window.location.href = "about:blank";
                }}
              >
                Yes, leave
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Standard padded page header used by the non-browser sections. */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
