import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, LogIn, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
function SiteHeader() {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
  return <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
        <Link
    to="/"
    className="flex min-w-0 items-center gap-2.5"
    aria-label="AI Symptoms Detector home"
  >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl clinical-gradient text-primary-foreground">
            <Activity className="size-5" aria-hidden="true" />
          </span>
          <span className="truncate text-base font-bold tracking-tight sm:text-lg">
            AI Symptoms Detector
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/assessment" activeProps={{ className: "bg-accent text-accent-foreground" }}>
              Assessment
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/history" activeProps={{ className: "bg-accent text-accent-foreground" }}>
              History
            </Link>
          </Button>
          {user ? <Button
    variant="ghost"
    size="sm"
    onClick={signOut}
    title={user.email ?? user.phone ?? "Signed in"}
  >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </Button> : <Button asChild variant="ghost" size="sm">
              <Link to="/auth" activeProps={{ className: "bg-accent text-accent-foreground" }}>
                <LogIn className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            </Button>}
          <Button
    variant="outline"
    size="icon"
    onClick={toggle}
    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    className="min-h-11 min-w-11 rounded-xl"
  >
            {theme === "dark" ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
          </Button>
        </nav>
      </div>
    </header>;
}
export {
  SiteHeader
};
