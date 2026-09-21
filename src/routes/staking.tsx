import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, Sparkles, Timer, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/staking")({
  head: () => ({
    meta: [
      { title: "Earn · Staking Pools · Northstar Digital Markets" },
      {
        name: "description",
        content:
          "Stake your crypto and earn institutional-grade APY across BTC, ETH, SOL, and more.",
      },
      { property: "og:title", content: "Earn · Staking · Northstar Digital Markets" },
      {
        property: "og:description",
        content: "Stake and earn industry-leading APY with flexible and locked vaults.",
      },
      { property: "og:url", content: "https://globalcoincap.app/staking" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://globalcoincap.app/staking" }],
  }),
  component: StakingPage,
});

const pools = [
  { asset: "BTC", apy: 6.4, tvl: "$842M", lock: "Flexible", color: "oklch(0.78 0.18 70)" },
  { asset: "ETH", apy: 8.2, tvl: "$1.24B", lock: "30 days", color: "oklch(0.65 0.2 270)" },
  { asset: "SOL", apy: 11.7, tvl: "$420M", lock: "60 days", color: "oklch(0.7 0.22 320)" },
  {
    asset: "USDT",
    apy: 14.5,
    tvl: "$2.1B",
    lock: "90 days",
    color: "oklch(0.78 0.18 150)",
    hot: true,
  },
  { asset: "BNB", apy: 9.1, tvl: "$310M", lock: "Flexible", color: "oklch(0.85 0.18 90)" },
  { asset: "MATIC", apy: 12.3, tvl: "$145M", lock: "30 days", color: "oklch(0.65 0.22 290)" },
];

function StakingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Up to 14.5% APY
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-5 tracking-tight">
            Earn while you hold
          </h1>
          <p className="text-muted-foreground mt-3">
            Stake your idle crypto in audited vaults and earn premium yield. Withdraw anytime on
            flexible pools.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4 mt-10 max-w-3xl mx-auto">
          {[
            { label: "Total value locked", value: "$5.1B" },
            { label: "Active stakers", value: "284,920" },
            { label: "Rewards paid", value: "$118M" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl glass p-5 text-center">
              <div className="text-2xl font-extrabold text-gradient-brand">{s.value}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {pools.map((p, i) => (
            <motion.div
              key={p.asset}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl glass p-6 relative overflow-hidden group hover:border-accent/40 transition"
            >
              {p.hot && (
                <span className="absolute top-4 right-4 text-[10px] font-bold tracking-wider bg-destructive text-destructive-foreground px-2 py-0.5 rounded">
                  HOT
                </span>
              )}
              <div
                className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition"
                style={{ background: p.color }}
              />
              <div className="flex items-center gap-3 relative">
                <div
                  className="h-12 w-12 rounded-2xl grid place-items-center font-bold text-lg"
                  style={{
                    background: `color-mix(in oklab, ${p.color} 18%, transparent)`,
                    color: p.color,
                  }}
                >
                  {p.asset[0]}
                </div>
                <div>
                  <div className="font-semibold">{p.asset} Vault</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Timer className="h-3 w-3" /> {p.lock}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">APY</div>
                  <div className="text-3xl font-extrabold text-accent flex items-center gap-1">
                    {p.apy}% <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">TVL</div>
                  <div className="font-mono font-semibold">{p.tvl}</div>
                </div>
              </div>
              <Button
                onClick={() => toast.success(`Joined ${p.asset} vault — rewards start accruing`)}
                className="w-full mt-5 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                <Lock className="h-4 w-4 mr-1.5" /> Stake {p.asset}
              </Button>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
