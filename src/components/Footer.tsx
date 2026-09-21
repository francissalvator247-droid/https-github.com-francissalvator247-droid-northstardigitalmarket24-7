import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Mail, Phone, Twitter, Github, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const socials = [
  { Icon: Twitter, label: "Follow Northstar Digital Markets on Twitter", href: "#" },
  { Icon: Send, label: "Join our Telegram channel", href: "#" },
  { Icon: Github, label: "Northstar Digital Markets on GitHub", href: "#" },
];

export function Footer() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data?.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <footer className="relative mt-20 border-t border-border/60 glass">
      <div className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Logo />
          <p className="text-sm text-muted-foreground mt-3 max-w-sm">
            Northstar Digital Markets — intelligent market tools, automated strategies, and
            institutional-grade security.
          </p>
          <div className="flex gap-2 mt-4">
            {socials.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="h-9 w-9 grid place-items-center rounded-full border border-border/60 hover:border-accent/60 hover:text-accent transition"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Platform
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-accent transition">
                Markets
              </Link>
            </li>
            <li>
              <Link to="/trade" className="hover:text-accent transition">
                Trade
              </Link>
            </li>
            <li>
              <Link to="/staking" className="hover:text-accent transition">
                Earn
              </Link>
            </li>
            <li>
              <Link to={signedIn ? "/dashboard" : "/auth"} className="hover:text-accent transition">
                {signedIn ? "Dashboard" : "Log in now"}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Contact
          </div>
          <a
            href="mailto:globalcoinmarketcapsupport247@gmail.com"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Mail className="h-4 w-4 text-accent" /> Support email
          </a>
          <a
            href="https://wa.me/19286988365"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-2"
          >
            <Phone className="h-4 w-4 text-accent" /> +1 (928) 698-8365
          </a>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 py-5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Northstar Digital Markets. All rights reserved.</span>
          <span className="font-mono">v4.0 · AI engine online</span>
        </div>
      </div>
    </footer>
  );
}
