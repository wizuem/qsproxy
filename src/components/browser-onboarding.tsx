import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Clapperboard,
  Expand,
  Gamepad2,
  Globe,
  History,
  LayoutGrid,
  Mail,
  Maximize2,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Youtube,
} from "lucide-react";

import { themes, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/quantum-logo.png.asset.json";

export const ONBOARDING_KEY = "quantum-browser-onboarded";

const FEATURES = [
  { icon: Search, title: "Address bar", text: "Type a URL or a search — we detect which you meant." },
  { icon: ShieldCheck, title: "Script blocking", text: "Pages are fetched by our servers and stripped of scripts and trackers." },
  { icon: BookOpen, title: "Reader mode", text: "Strip layout and ads down to clean, readable text." },
  { icon: Star, title: "Bookmarks", text: "Star any page. Signed in, bookmarks sync to your account." },
  { icon: History, title: "History & tabs", text: "Open multiple tabs, go back and forward, revisit anything." },
  { icon: Maximize2, title: "Fullscreen", text: "Use the sidebar's fullscreen button to fill your whole screen." },
  { icon: Expand, title: "Leave page + Shield", text: "The bar at the bottom asks you to confirm before the session closes." },
];

const SECTIONS = [
  { icon: Globe, title: "Browser", text: "The private proxy browser — your home screen." },
  { icon: Clapperboard, title: "Movies", text: "New releases, free-to-watch films, trailers and a huge free classic library you can play in-app." },
  { icon: Youtube, title: "YouTube", text: "Search and watch videos through privacy-friendly front-ends — pick your region in Settings." },
  { icon: Gamepad2, title: "Games", text: "Thousands of emulated classics and open-source browser games." },
  { icon: LayoutGrid, title: "Apps", text: "A launcher of handy sites, tools and our Discord." },
  { icon: Sparkles, title: "Quantum AI", text: "A built-in assistant for questions, summaries and help." },
  { icon: Mail, title: "Contact", text: "Message us straight from the workspace." },
  { icon: Settings2, title: "Settings", text: "Themes, proxy engine, search engine, player options, UI scale, Shield and sign-in — all in one place." },
];

export function BrowserOnboarding({
  onDone,
  signedIn,
}: {
  onDone: () => void;
  signedIn: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [step, setStep] = useState(0);

  const finish = () => {
    try {
      window.localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      /* ignore */
    }
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/90 p-4 backdrop-blur-md">
      <div className="surface-card glow-ring w-full max-w-2xl overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <img src={logoAsset.url} alt="" className="size-9 object-contain" />
          <div>
            <h2 className="font-display text-base font-semibold">Welcome to Quantum Browser</h2>
            <p className="text-xs text-muted-foreground">Step {step + 1} of 4</p>
          </div>
          <button
            type="button"
            onClick={finish}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Skip tutorial
          </button>
        </div>

        <div className="max-h-[65vh] overflow-auto p-5">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Here's everything you can do. Pages never load directly in your browser — our servers
                fetch them and render them in an isolated frame.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {FEATURES.map((f) => (
                  <div key={f.title} className="rounded-xl border border-border bg-card/60 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold">
                      <f.icon className="size-4 text-primary" /> {f.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{f.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Everything lives in the sidebar on the left — no separate website, just one workspace.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {SECTIONS.map((s) => (
                  <div key={s.title} className="rounded-xl border border-border bg-card/60 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold">
                      <s.icon className="size-4 text-primary" /> {s.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pick your theme — you can change it any time from the palette button.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left text-xs transition-colors",
                      theme === t.id ? "border-primary bg-secondary" : "border-border hover:bg-secondary/60",
                    )}
                  >
                    <span className="flex gap-1">
                      {t.swatch.map((c) => (
                        <span
                          key={c}
                          className="size-4 rounded-full border border-border"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {signedIn
                  ? "You're signed in — bookmarks, themes and settings sync to your account."
                  : "Sign in to sync bookmarks, themes and settings across devices, or continue as a guest (everything stays on this device)."}
              </p>
              <div className="flex flex-wrap gap-2">
                {!signedIn && (
                  <Button
                    onClick={() => {
                      finish();
                      setSection("settings");
                    }}
                  >
                    Sign in or create an account
                  </Button>
                )}
                <Button variant="outline" onClick={finish}>
                  {signedIn ? "Start browsing" : "Continue as guest"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            Back
          </button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Next <ArrowRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button onClick={finish}>Done</Button>
          )}
        </div>
      </div>
    </div>
  );
}
