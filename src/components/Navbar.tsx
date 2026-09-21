import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Moon, Sun, LogIn, LayoutDashboard } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data?.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground" }}
            className="hover:text-foreground transition"
          >
            Markets
          </Link>
          <Link
            to="/trade"
            activeProps={{ className: "text-foreground" }}
            className="hover:text-foreground transition"
          >
            Trade
          </Link>
          <Link
            to="/staking"
            activeProps={{ className: "text-foreground" }}
            className="hover:text-foreground transition"
          >
            Earn
          </Link>
          <Link
            to={signedIn ? "/dashboard" : "/auth"}
            activeProps={{ className: "text-foreground" }}
            className="hover:text-foreground transition font-medium"
          >
            {signedIn ? "Dashboard" : "Log in now"}
          </Link>
          <a href="/#plans" className="hover:text-foreground transition">
            Plans
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link to={signedIn ? "/dashboard" : "/auth"}>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-sm">
              {signedIn ? (
                <>
                  <LayoutDashboard className="h-4 w-4 mr-1.5" /> Dashboard
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-1.5" /> Log in now
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
