import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, Camera, Clock3, Home, LogIn, LogOut, MapPin, Moon, Sparkles, Sun } from "lucide-react";
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
  return <header className="kinetic-sidebar">
      <div className="kinetic-sidebar__inner">
        <Link
    to="/"
    className="kinetic-brand"
    aria-label="AI Symptoms Detector home"
  >
          <span className="kinetic-brand__mark">
            <Activity className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0"><strong>AI Symptoms</strong><small>Detector</small></span>
        </Link>

        <nav className="kinetic-nav" aria-label="Main">
          <Button asChild variant="ghost" size="sm" className="kinetic-nav__item hidden lg:flex">
            <Link to="/" activeProps={{ className: "kinetic-nav__active" }}><Home /><span>Overview</span></Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="kinetic-nav__item">
            <Link to="/assessment" activeProps={{ className: "bg-accent text-accent-foreground" }}>
              <Sparkles /><span>Assessment</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="kinetic-nav__item">
            <Link to="/image-analysis" activeProps={{ className: "bg-accent text-accent-foreground" }}>
              <Camera /><span>Image analysis</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="kinetic-nav__item hidden sm:inline-flex">
            <Link to="/nearby" activeProps={{ className: "bg-accent text-accent-foreground" }}>
              <MapPin /><span>Nearby care</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="kinetic-nav__item hidden sm:inline-flex">
            <Link to="/history" activeProps={{ className: "bg-accent text-accent-foreground" }}>
              <Clock3 /><span>History</span>
            </Link>
          </Button>
          {user ? <Button
    variant="ghost"
    size="sm"
    className="kinetic-nav__item"
    onClick={signOut}
    title={user.email ?? user.phone ?? "Signed in"}
  >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden lg:inline">Sign out</span>
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
    className="kinetic-theme"
  >
            {theme === "dark" ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
          </Button>
        </nav>
        <p className="kinetic-sidebar__note hidden lg:block">Educational guidance only. Your assessment history stays on this device.</p>
      </div>
    </header>;
}
export {
  SiteHeader
};
