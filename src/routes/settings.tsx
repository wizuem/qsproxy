import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, LogIn, LogOut, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/app-shell";
import { useBrowserSettings } from "@/components/browser-settings";
import { ONBOARDING_KEY } from "@/components/browser-onboarding";
import { themes, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { proxyConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — themes, proxy and account" },
      {
        name: "description",
        content:
          "Customize your Quantum Services theme, proxy endpoint, search engine, privacy shield and account.",
      },
      { property: "og:title", content: "Settings — themes, proxy and account" },
      {
        property: "og:description",
        content: "Customize your theme, proxy endpoint, search engine, privacy shield and account.",
      },
    ],
  }),
  component: SettingsPage,
});

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 accent-primary"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}

function AccountCard() {
  const { user, loading, signOut } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/settings` },
        });
        if (error) throw error;
        toast.success("Account created — you're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed.");
      setBusy(false);
      return;
    }
    if (!result.redirected) setBusy(false);
  };

  if (loading) {
    return (
      <div className="surface-card flex items-center gap-2 rounded-2xl p-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Checking your session…
      </div>
    );
  }

  if (user) {
    return (
      <div className="surface-card space-y-3 rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{user.email}</span>. Bookmarks and preferences
          sync to this account.
        </p>
        <Button variant="outline" onClick={() => void signOut()}>
          <LogOut className="mr-2 size-4" /> Sign out
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface-card space-y-4 rounded-2xl p-6">
      <h2 className="font-display text-base font-semibold">
        {mode === "signin" ? "Sign in" : "Create account"}
      </h2>
      <p className="text-sm text-muted-foreground">
        Optional — an account syncs bookmarks, theme and proxy settings across devices.
      </p>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : mode === "signin" ? (
          <>
            <LogIn className="mr-2 size-4" /> Sign in
          </>
        ) : (
          <>
            <UserPlus className="mr-2 size-4" /> Create account
          </>
        )}
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={google} disabled={busy}>
        Continue with Google
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="text-foreground underline underline-offset-4"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>
    </form>
  );
}

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, update, reset } = useBrowserSettings();

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl px-5 py-8">
        <PageHeader
          title="Settings"
          subtitle="Themes, browsing and privacy options, plus your Quantum account."
        />

        <section className="surface-card rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold">Theme</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary",
                  theme === item.id && "border-primary bg-primary/10",
                )}
              >
                <span className="flex gap-1">
                  {item.swatch.map((color) => (
                    <span
                      key={color}
                      className="size-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="surface-card mt-6 space-y-4 rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold">Browsing</h2>

          <div className="space-y-2">
            <Label htmlFor="preset">Proxy endpoint</Label>
            <select
              id="preset"
              value={settings.presetId}
              onChange={(event) => update({ presetId: event.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {proxyConfig.presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
              <option value="custom">Custom endpoint…</option>
            </select>
          </div>

          {settings.presetId === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom">Custom template</Label>
              <Input
                id="custom"
                value={settings.customTemplate}
                onChange={(event) => update({ customTemplate: event.target.value })}
                placeholder="https://your-proxy.example/?url={{target}}"
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{"}target{"}}"} where the encoded destination URL should go.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="engine">Search engine</Label>
            <select
              id="engine"
              value={settings.engineId}
              onChange={(event) => update({ engineId: event.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {proxyConfig.searchEngines.map((engine) => (
                <option key={engine.id} value={engine.id}>
                  {engine.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homepage">Homepage</Label>
            <Input
              id="homepage"
              value={settings.homepage}
              onChange={(event) => update({ homepage: event.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoInstance">YouTube front-end</Label>
            <select
              id="videoInstance"
              value={settings.videoInstance}
              onChange={(event) => update({ videoInstance: event.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="auto">Automatic (try all)</option>
              {proxyConfig.videoInstances.map((instance) => (
                <option key={instance} value={instance}>
                  {instance.replace("https://", "")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoRegion">YouTube region</Label>
            <select
              id="videoRegion"
              value={settings.videoRegion}
              onChange={(event) => update({ videoRegion: event.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {proxyConfig.videoRegions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="playerMode">Video player</Label>
            <select
              id="playerMode"
              value={settings.playerMode}
              onChange={(event) => update({ playerMode: event.target.value as "youtube" | "frontend" })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="youtube">Privacy YouTube player</option>
              <option value="frontend">Invidious embed</option>
            </select>
          </div>

        </section>

        <section className="surface-card mt-6 space-y-3 rounded-2xl p-6">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <ShieldCheck className="size-4 text-primary" /> Privacy
          </h2>
          <Toggle
            label="Block scripts"
            hint="Strip JavaScript and trackers from proxied pages."
            checked={settings.blockScripts}
            onChange={(next) => update({ blockScripts: next })}
          />
          <Toggle
            label="Reader mode"
            hint="Render pages as clean, readable text by default."
            checked={settings.readerMode}
            onChange={(next) => update({ readerMode: next })}
          />
          <Toggle
            label="Shield"
            hint="Ask for confirmation before the page closes, so a session is never lost by accident."
            checked={settings.exitGuard}
            onChange={(next) => update({ exitGuard: next })}
          />
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" onClick={reset}>
              Reset to defaults
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  window.localStorage.removeItem(ONBOARDING_KEY);
                } catch {
                  /* ignore */
                }
                toast.success("Tutorial will play next time you open the browser.");
              }}
            >
              Replay tutorial
            </Button>
          </div>
        </section>

        <div className="mt-6">
          <AccountCard />
        </div>
      </div>
    </AppShell>
  );
}
