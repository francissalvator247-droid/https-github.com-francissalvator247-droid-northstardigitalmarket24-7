import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { ScrollLogoBackground } from "@/components/ScrollLogoBackground";
import { LiveFeed } from "@/components/LiveFeed";
import { Counter } from "@/components/Counter";
import { Countdown } from "@/components/Countdown";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Wallet,
  LineChart,
  Bot,
  Smartphone,
  BarChart3,
} from "lucide-react";
import { Footer } from "@/components/Footer";
// Stable remote image URLs (Unsplash) so they load on every deploy target.
const traderPhone = {
  url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
};
const metatrader = {
  url: "https://images.unsplash.com/photo-1642790551116-18e150f248e3?auto=format&fit=crop&w=800&q=80",
};
const candlestickPhone = {
  url: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=800&q=80",
};
const amelia = {
  url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
};
const marco = {
  url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
};
const yuki = {
  url: "https://images.unsplash.com/photo-1545996124-0501ebae84d0?auto=format&fit=crop&w=400&q=80",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Northstar Digital Markets – Intelligent Market Tools" },
      {
        name: "description",
        content:
          "Northstar Digital Markets brings intelligent market tools, automated strategies, and secure portfolio access together.",
      },
      { property: "og:title", content: "Northstar Digital Markets – Intelligent Market Tools" },
      {
        property: "og:description",
        content:
          "Intelligent market tools and secure portfolio access from Northstar Digital Markets.",
      },
      { property: "og:url", content: "https://globalcoincap.app/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://globalcoincap.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Northstar Digital Markets",
          url: "https://globalcoincap.app/",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Northstar Digital Markets",
          url: "https://globalcoincap.app/",
          logo: "https://globalcoincap.app/northstar-brand.png",
        }),
      },
    ],
  }),
  component: Landing,
});

const plans = [
  {
    name: "Starter",
    range: "$500 - $10,000",
    bonus: "10% Investment Bonus",
    hash: "50GH/s Hash Power",
    perks: [
      "Daily profit",
      "Instant withdrawal",
      "Market Insights",
      "24/7 Client Support",
      "Competitive Spreads",
    ],
  },
  {
    name: "Classic",
    range: "$5,000 - $25,000",
    bonus: "15% Investment Bonus",
    hash: "100GH/s Hash Power",
    perks: [
      "Daily profit",
      "Instant withdrawal",
      "Market Insights",
      "24/7 Client Support",
      "High-Frequency Strategies",
    ],
  },
  {
    name: "Pro",
    range: "$30,000 - $150,000",
    bonus: "25% Investment Bonus",
    hash: "120GH/s Hash Power",
    featured: true,
    perks: [
      "Daily profit",
      "Instant withdrawal",
      "Market Insights",
      "24/7 Client Support",
      "High-Frequency Strategies",
      "Personalized Wealth Planning",
    ],
  },
  {
    name: "Executive",
    range: "$100,000 - $350,000",
    bonus: "35% Investment Bonus",
    hash: "150GH/s Hash Power",
    perks: [
      "Daily profit",
      "Instant withdrawal",
      "Market Insights",
      "24/7 Client Support",
      "High-Frequency Strategies",
      "Personalized Wealth Planning",
      "Dedicated Analyst Access",
    ],
  },
  {
    name: "Golden",
    range: "$1,000,000 - $2,000,000",
    bonus: "50% Investment Bonus",
    hash: "350GH/s Hash Power",
    perks: [
      "Daily profit",
      "Instant withdrawal",
      "Market Insights",
      "24/7 Client Support",
      "High-Frequency Strategies",
      "Personalized Wealth Planning",
      "Dedicated Analyst Access",
    ],
  },
];

const steps = [
  {
    icon: Wallet,
    title: "Register account",
    desc: "Create your secure account in under a minute and claim your $100 welcome bonus.",
  },
  {
    icon: Sparkles,
    title: "Fund investment",
    desc: "Choose a plan and fund using Bitcoin. Your capital is deployed instantly.",
  },
  {
    icon: Bot,
    title: "AI generates returns",
    desc: "Our AI engine trades 24/7 across global markets. Watch your balance grow.",
  },
];

const testimonials = [
  {
    name: "Amelia R.",
    role: "London, UK",
    earnings: 48230,
    quote: "I've withdrawn three times already. This platform is unreal.",
    image: amelia.url,
  },
  {
    name: "Marco T.",
    role: "Milan, IT",
    earnings: 31900,
    quote: "The AI consistency surprised me. Smooth dashboard, instant payouts.",
    image: marco.url,
  },
  {
    name: "Yuki S.",
    role: "Tokyo, JP",
    earnings: 72440,
    quote: "Started Premium 6 weeks ago. Doubled my capital. Bullish.",
    image: yuki.url,
  },
];

function Section({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={false}
      whileInView={{ opacity: [0.001, 1], y: [20, 0] }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`max-w-6xl mx-auto px-4 py-20 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollLogoBackground />
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade opacity-60" />
        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold tracking-wide">
              <Sparkles className="h-3.5 w-3.5" /> NEW: AI v4 engine is live
            </div>
            <h1 className="mt-6 text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
              NORTHSTAR <span className="text-gradient-brand">DIGITAL MARKETS</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              Intelligent market tools engineered for serious investors. Automated, transparent, and
              built to help you move with confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold glow-accent"
                >
                  Start Investing <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/trade">
                <Button size="lg" variant="outline">
                  Open trading terminal
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" /> Bank-grade security · Cold storage ·
              99.99% uptime
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 bg-accent/20 blur-3xl rounded-full opacity-50" />
            <img
              src={traderPhone.url}
              alt="Trader checking crypto prices on phone"
              className="absolute -right-6 -bottom-10 w-44 md:w-56 drop-shadow-2xl animate-float pointer-events-none select-none z-10"
            />
            <div className="relative rounded-2xl glass p-6 glow-primary">
              <div className="flex items-center justify-between mb-4">
                <Logo size={44} animated />
                <span className="text-xs text-accent font-semibold">● LIVE</span>
              </div>
              <div className="text-xs text-muted-foreground mb-1">Portfolio value</div>
              <div className="text-4xl font-bold tabular-nums">
                $<Counter to={284_192} />
              </div>
              <div className="text-accent text-sm mt-1 font-medium">+12.4% today</div>
              <div className="mt-4 h-32 rounded-lg bg-gradient-to-tr from-primary/10 to-accent/10 border border-border relative overflow-hidden">
                <svg viewBox="0 0 300 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.78 0.2 145)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="oklch(0.78 0.2 145)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 C40,70 60,60 90,55 S150,45 180,30 240,25 300,10 L300,100 L0,100 Z"
                    fill="url(#g)"
                  />
                  <path
                    d="M0,80 C40,70 60,60 90,55 S150,45 180,30 240,25 300,10"
                    fill="none"
                    stroke="oklch(0.78 0.2 145)"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="mt-4">
                <LiveFeed />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME VIDEO */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" /> Welcome Video
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mt-4">See how it works</h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Watch our quick introduction to understand how Northstar Digital Markets supports your
            investment journey.
          </p>
        </div>
        <div className="aspect-video rounded-2xl overflow-hidden border border-border/60 shadow-xl">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/KkE3kweQKgE?rel=0&modestbranding=1"
            title="Welcome to Northstar Digital Markets"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* TRUST INDICATORS */}
      <Section className="!py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Active investors", value: 124380, suffix: "+" },
            { label: "Total volume traded", value: 2_400_000_000, prefix: "$" },
            { label: "AI win rate", value: 94, suffix: "%" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="text-3xl font-bold text-gradient-brand">
                <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* TRADING PLATFORMS */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold">
              <BarChart3 className="h-3.5 w-3.5" /> Pro trading suite
            </div>
            <h2 className="text-4xl font-bold mt-4">Powered by MetaTrader 5 + our AI engine</h2>
            <p className="text-muted-foreground mt-3 max-w-md">
              Trade across spot, futures, and AI-managed strategies with deep liquidity routed
              through MT5 institutional rails.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/trade">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold">
                  Open terminal <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/staking">
                <Button variant="outline">Explore Earn</Button>
              </Link>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl glass p-10 grid place-items-center min-h-[260px]"
          >
            <div className="absolute -inset-6 bg-accent/15 blur-3xl rounded-full opacity-60" />
            <img
              src={metatrader.url}
              alt="MetaTrader 5 platform"
              className="relative max-w-[260px] w-full animate-float"
            />
          </motion.div>
        </div>
      </Section>

      {/* MOBILE FEATURE */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden border border-border/60"
          >
            <img
              src={candlestickPhone.url}
              alt="Live candlestick chart on mobile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="text-xs font-mono text-accent">BTC/USDT · LIVE</span>
              <span className="text-xs text-muted-foreground">12,420 trades/min</span>
            </div>
          </motion.div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold">
              <Smartphone className="h-3.5 w-3.5" /> Mobile first
            </div>
            <h2 className="text-4xl font-bold mt-4">Markets in your pocket</h2>
            <p className="text-muted-foreground mt-3 max-w-md">
              Real-time candlesticks, order books, and AI alerts on every device. Execute trades in
              a single tap with biometric confirmation.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {[
                "Live multi-pair candlestick charts",
                "Push alerts on breakout signals",
                "Biometric one-tap execution",
                "Offline-friendly portfolio sync",
              ].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <LineChart className="h-3.5 w-3.5 text-accent" /> {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section id="how">
        <h2 className="text-4xl font-bold text-center">How it works</h2>
        <p className="text-center text-muted-foreground mt-2">
          Three steps from sign-up to passive income.
        </p>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-card p-6">
              <div className="absolute -top-3 -left-3 h-9 w-9 rounded-full bg-accent text-accent-foreground grid place-items-center font-bold">
                {i + 1}
              </div>
              <s.icon className="h-7 w-7 text-accent" />
              <h3 className="mt-3 font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* PLANS */}
      <Section id="plans">
        <h2 className="text-4xl font-bold text-center">Investment plans</h2>
        <p className="text-center text-muted-foreground mt-2">
          Pick the tier that matches your ambition.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {plans.map((p) => {
            return (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-7 bg-card ${p.featured ? "border-accent glow-accent scale-[1.02]" : "border-border"}`}
              >
                {p.featured && (
                  <div className="absolute -top-3 right-6 text-[10px] font-bold tracking-wider bg-accent text-accent-foreground px-2 py-1 rounded">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-sm text-muted-foreground">{p.name} Plan</div>
                <div className="text-3xl font-extrabold mt-1">{p.range}</div>
                <div className="mt-4 space-y-1 text-sm">
                  <div className="text-accent font-bold">{p.bonus}</div>
                  <div className="text-muted-foreground">{p.hash}</div>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <LineChart className="h-3.5 w-3.5 text-accent" /> {perk}
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className="block mt-6">
                  <Button
                    className={`w-full ${p.featured ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </Section>

      {/* LIVE ACTIVITY */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl font-bold">Live activity, every second.</h2>
            <p className="text-muted-foreground mt-3 max-w-md">
              Watch real investors compound profits in real time. Our AI feed updates continuously
              across the network.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/70 p-5">
            <LiveFeed />
          </div>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section id="testimonials">
        <h2 className="text-4xl font-bold text-center">What investors say</h2>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <img
                  src={t.image}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover border border-border"
                  loading="lazy"
                  width={40}
                  height={40}
                />
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <div className="ml-auto text-accent font-bold text-sm">
                  +${t.earnings.toLocaleString()}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section>
        <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-background p-10 text-center glow-primary">
          <div className="text-xs uppercase tracking-widest text-accent font-bold">
            Limited AI slots remaining
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-3">
            Claim your seat in the next cycle
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Each cycle is capped. Sign up now to lock in current ROI rates before they reset.
          </p>
          <div className="mt-7">
            <Countdown hours={23} />
          </div>
          <Link to="/auth" className="inline-block mt-7">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold glow-accent"
            >
              Start investing now <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
