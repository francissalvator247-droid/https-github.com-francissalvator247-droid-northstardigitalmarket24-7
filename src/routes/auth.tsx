import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Gift, Lock, LogIn, UserPlus, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or Register · Northstar Digital Markets" },
      {
        name: "description",
        content:
          "Sign in or register your account to access your portfolio dashboard and claim your $100 locked welcome bonus.",
      },
      { property: "og:title", content: "Log in or Register · Northstar Digital Markets" },
      {
        property: "og:description",
        content: "Access your Northstar Digital Markets portfolio dashboard and market tools.",
      },
      { property: "og:url", content: "https://globalcoincap.app/auth" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://globalcoincap.app/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) nav({ to: "/dashboard" });
    });
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (signUpError) throw signUpError;

        // If session was not immediately returned, log in explicitly
        if (!signUpData?.session) {
          await supabase.auth.signInWithPassword({ email, password }).catch(() => {});
        }

        toast.success("Account created! $100 Locked Welcome Bonus credited to your account.", {
          duration: 6000,
        });
        nav({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back to your dashboard!");
        nav({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      if (
        msg.toLowerCase().includes("weak_password") ||
        msg.toLowerCase().includes("easy to guess")
      ) {
        toast.error("Please choose a stronger password with a mix of letters and numbers.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary/20 via-background to-accent/10 border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade opacity-40 pointer-events-none" />
        <Logo />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold">
            <Gift className="h-3.5 w-3.5" /> $100 Welcome Bonus for New Members
          </div>
          <h2 className="text-4xl font-extrabold leading-tight text-foreground">
            Smart AI-driven
            <br />
            crypto wealth.
          </h2>
          <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
            Create your account today to access automated trading strategies, institutional-grade
            execution, and a $100 locked welcome bonus ready to unlock with your first investment.
          </p>

          <div className="pt-4 space-y-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span>Instant registration — claim $100 bonus immediately</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span>Unlock bonus upon investing in any AI trading plan</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Protected cold storage with 24/7 client support</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground relative">
          © Northstar Digital Markets · AI Engine Online
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="lg:hidden flex justify-center">
            <Logo />
          </div>

          {/* Segmented Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-card border border-border">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`py-2 px-3 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                mode === "signin"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`py-2 px-3 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                mode === "signup"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" /> Register / Sign up
            </button>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {mode === "signup" ? "Create your account" : "Log in to your account"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {mode === "signup"
                ? "Register below to receive your $100 locked welcome bonus."
                : "Enter your credentials to access your dashboard and active plans."}
            </p>
          </div>

          {/* Bonus callout banner */}
          <div className="rounded-xl border border-accent/40 bg-accent/10 p-3.5 flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent/20 grid place-items-center text-accent shrink-0">
              <Gift className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-accent uppercase tracking-wider">
                $100 Welcome Bonus Offer
              </div>
              <p className="text-muted-foreground mt-0.5 leading-normal">
                New accounts receive a{" "}
                <span className="text-foreground font-semibold">$100 locked bonus</span> upon
                registering. Unlock it automatically by investing in any plan.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Full name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1.5 h-11"
                />
              </div>
            )}
            <div>
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Password
                </Label>
                {mode === "signup" && (
                  <span className="text-[11px] text-muted-foreground">Min. 6 characters</span>
                )}
              </div>
              <Input
                id="password"
                type="password"
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5 h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-md text-sm mt-2"
            >
              {loading ? (
                "Processing…"
              ) : mode === "signup" ? (
                <span className="flex items-center justify-center gap-2">
                  Register & Claim $100 Bonus <ArrowRight className="h-4 w-4" />
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" /> Log in now
                </span>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground pt-2">
            {mode === "signup" ? "Already have an account?" : "Don't have an account yet?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-accent font-semibold hover:underline ml-1"
            >
              {mode === "signup" ? "Log in here" : "Register now"}
            </button>
          </div>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition">
              ← Return to homepage
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
