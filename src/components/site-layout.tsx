import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LogIn, LogOut, Menu, Palette, X } from "lucide-react";
import logoAsset from "@/assets/quantum-logo.png.asset.json";
import { themes, useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/proxy", label: "Proxy" },
  { to: "/contact", label: "Contact" },
] as const;

function HeaderControls() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <div className="relative">
        <button
          type="button"
          aria-label="Change theme"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Palette className="size-4" />
        </button>
        {open && (
          <div className="surface-card absolute right-0 z-50 mt-2 w-52 space-y-1 rounded-xl p-2">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors hover:bg-secondary/70",
                  theme === t.id && "bg-secondary text-foreground",
                )}
              >
                <span className="flex gap-1">
                  {t.swatch.map((c) => (
                    <span
                      key={c}
                      className="size-3 rounded-full border border-border"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </span>
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {user ? (
        <button
          type="button"
          onClick={() => void signOut()}
          title={user.email ?? "Sign out"}
          className="flex items-center gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="size-4" />
          <span className="hidden md:inline">Sign out</span>
        </button>
      ) : (
        <Link
          to="/auth"
          className="flex items-center gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogIn className="size-4" />
          <span className="hidden md:inline">Sign in</span>
        </Link>
      )}
    </div>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src={logoAsset.url} alt="Quantum Services logo" className="h-10 w-10 object-contain" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Quantum <span className="text-nebula">Services</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground bg-secondary/70" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <HeaderControls />
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setOpen((v) => !v)}
              className="rounded-md border border-border p-2 text-foreground sm:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 border-t border-border/60 px-5 py-3 sm:hidden">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground"
                activeProps={{ className: "text-foreground bg-secondary/70" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Quantum Services. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/proxy" className="transition-colors hover:text-foreground">
              Proxy
            </Link>
            <Link to="/contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
