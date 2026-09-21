import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Copy,
  X,
  Wallet,
  ArrowDownToLine,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DepositModal } from "@/components/DepositModal";
const candlestickImg = {
  url: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1200&q=80",
};

export const Route = createFileRoute("/trade")({
  head: () => ({
    meta: [
      { title: "Trade · Northstar Digital Markets" },
      {
        name: "description",
        content:
          "Advanced crypto trading terminal with live candlestick chart, order book, and instant buy/sell.",
      },
      { property: "og:title", content: "Trade · Northstar Digital Markets" },
      {
        property: "og:description",
        content: "Pro trading terminal with deep order book and instant execution.",
      },
      { property: "og:image", content: candlestickImg.url },
      { property: "og:url", content: "https://globalcoincap.app/trade" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://globalcoincap.app/trade" }],
  }),
  component: TradePage,
});

const pairs = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"];
import { BTC_RECIPIENT_ADDRESS as BTC_ADDRESS } from "@/config/wallet";

function seedFromPair(pair: string) {
  return Array.from(pair).reduce((seed, character) => seed + character.charCodeAt(0), 0);
}

function seededValue(seed: number, index: number) {
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function generateCandles(n: number, pair: string, base = 67450) {
  const seed = seedFromPair(pair);
  let price = base;
  return Array.from({ length: n }).map((_, i) => {
    const open = price;
    const close = price + (Math.sin(i * 0.7 + seed) + seededValue(seed, i) - 0.5) * base * 0.004;
    const high = Math.max(open, close) + seededValue(seed, i + n) * base * 0.002;
    const low = Math.min(open, close) - seededValue(seed, i + n * 2) * base * 0.002;
    price = close;
    return { open, close, high, low };
  });
}

function generateBook(side: "bid" | "ask", pair: string, base = 67450) {
  const seed = seedFromPair(pair) + (side === "bid" ? 1 : 2);
  return Array.from({ length: 10 }).map((_, i) => {
    const offset = (i + 1) * (seededValue(seed, i) * 4 + 2);
    const price = side === "bid" ? base - offset : base + offset;
    const size = +(Math.random() * 2 + 0.05).toFixed(4);
    return { price: +price.toFixed(2), size, total: +(price * size).toFixed(2) };
  });
}

function TradePage() {
  const [pair, setPair] = useState("BTC/USDT");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.05");
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositReqUsd, setDepositReqUsd] = useState<number | undefined>(undefined);
  const [depositReqBtc, setDepositReqBtc] = useState<string | undefined>(undefined);
  const [profile, setProfile] = useState<{ balance?: number } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("balance")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) setProfile(data as { balance?: number });
          });
      }
    });
  }, []);

  const cashBalance = Number(profile?.balance ?? 0);
  const total = (Number(amount) || 0) * 67452.18;
  const btcDue = (total / 67452.18).toFixed(8);

  const handlePlaceOrder = () => {
    const amtNum = Number(amount) || 0;
    if (amtNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Trade is executed from cash balance
    if (cashBalance < total) {
      const shortfall = total - cashBalance;
      toast.error(
        `Insufficient funds: Available cash balance is $${cashBalance.toFixed(2)}, but this trade requires $${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Please deposit BTC to fund your balance.`,
        {
          duration: 6000,
          action: {
            label: "Deposit BTC",
            onClick: () => {
              setDepositReqUsd(shortfall);
              setDepositReqBtc((shortfall / 67452.18).toFixed(5));
              setDepositOpen(true);
            },
          },
        },
      );
      setDepositReqUsd(shortfall);
      setDepositReqBtc((shortfall / 67452.18).toFixed(5));
      setDepositOpen(true);
      return;
    }

    toast.success(
      `Order placed: ${side.toUpperCase()} ${amount} ${pair.split("/")[0]} executed from cash balance!`,
    );
  };

  const candles = useMemo(() => generateCandles(60, pair), [pair]);
  const bids = useMemo(() => generateBook("bid", pair), [pair]);
  const asks = useMemo(() => generateBook("ask", pair), [pair]);

  const allVals = candles.flatMap((c) => [c.high, c.low]);
  const min = Math.min(...allVals),
    max = Math.max(...allVals);
  const range = max - min || 1;
  const W = 800,
    H = 280,
    cw = W / candles.length;
  const y = (v: number) => H - ((v - min) / range) * (H - 20) - 10;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{pair}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className="text-2xl font-mono text-accent">$67,452.18</span>
              <span className="text-accent flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                +2.41%
              </span>
            </div>
          </div>
          <div className="flex gap-1 p-1 rounded-xl glass">
            {pairs.map((p) => (
              <button
                key={p}
                onClick={() => setPair(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${p === pair ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl glass p-5"
          >
            <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
              <div className="flex gap-1">
                {["1m", "5m", "15m", "1H", "4H", "1D"].map((t, i) => (
                  <span
                    key={t}
                    className={`px-2 py-1 rounded ${i === 3 ? "bg-accent/15 text-accent" : "hover:text-foreground cursor-pointer"}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span className="font-mono">O 67380.2 · H 67610.0 · L 67120.4 · C 67452.1</span>
            </div>
            <div className="h-72 w-full">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    x2={W}
                    y1={(H / 4) * i + 10}
                    y2={(H / 4) * i + 10}
                    stroke="oklch(1 0 0 / 0.06)"
                  />
                ))}
                {candles.map((c, i) => {
                  const up = c.close >= c.open;
                  const color = up ? "oklch(0.82 0.22 150)" : "oklch(0.62 0.25 22)";
                  const x = i * cw + cw / 2;
                  return (
                    <g key={i}>
                      <line
                        x1={x}
                        x2={x}
                        y1={y(c.high)}
                        y2={y(c.low)}
                        stroke={color}
                        strokeWidth="1"
                      />
                      <rect
                        x={i * cw + 1}
                        width={cw - 2}
                        y={y(Math.max(c.open, c.close))}
                        height={Math.max(1, Math.abs(y(c.open) - y(c.close)))}
                        fill={color}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </motion.div>

          {/* Order book + form */}
          <div className="space-y-4">
            <div className="rounded-2xl glass p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Order book
              </div>
              <div className="text-[11px] text-muted-foreground grid grid-cols-3 gap-2 px-2 py-1 font-mono">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Total</span>
              </div>
              <div className="space-y-0.5">
                {asks
                  .slice()
                  .reverse()
                  .map((r, i) => (
                    <div
                      key={i}
                      className="relative grid grid-cols-3 gap-2 px-2 py-0.5 font-mono text-xs"
                    >
                      <div
                        className="absolute inset-y-0 right-0 bg-destructive/10"
                        style={{ width: `${(r.size / 2) * 100}%` }}
                      />
                      <span className="text-destructive relative">{r.price}</span>
                      <span className="text-right relative">{r.size}</span>
                      <span className="text-right relative text-muted-foreground">{r.total}</span>
                    </div>
                  ))}
              </div>
              <div className="text-center py-2 text-lg font-bold text-accent font-mono">
                67,452.18
              </div>
              <div className="space-y-0.5">
                {bids.map((r, i) => (
                  <div
                    key={i}
                    className="relative grid grid-cols-3 gap-2 px-2 py-0.5 font-mono text-xs"
                  >
                    <div
                      className="absolute inset-y-0 right-0 bg-accent/10"
                      style={{ width: `${(r.size / 2) * 100}%` }}
                    />
                    <span className="text-accent relative">{r.price}</span>
                    <span className="text-right relative">{r.size}</span>
                    <span className="text-right relative text-muted-foreground">{r.total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl glass p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60 text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-accent" /> Cash Balance:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground">
                    $
                    {cashBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <button
                    onClick={() => {
                      setDepositReqUsd(undefined);
                      setDepositReqBtc("0.05");
                      setDepositOpen(true);
                    }}
                    className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-0.5"
                  >
                    <ArrowDownToLine className="h-3 w-3" /> Deposit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-background/40 mb-3">
                <button
                  onClick={() => setSide("buy")}
                  className={`py-2 rounded-md text-sm font-semibold ${side === "buy" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setSide("sell")}
                  className={`py-2 rounded-md text-sm font-semibold ${side === "sell" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground"}`}
                >
                  Sell
                </button>
              </div>
              <label className="text-xs text-muted-foreground">Amount ({pair.split("/")[0]})</label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 font-mono"
              />
              <label className="text-xs text-muted-foreground mt-3 block">Price (USDT)</label>
              <Input defaultValue="67452.18" className="mt-1 font-mono" />
              <div className="grid grid-cols-4 gap-1 mt-3 text-xs">
                {["25%", "50%", "75%", "100%"].map((p) => (
                  <button
                    key={p}
                    className="py-1 rounded border border-border/60 hover:border-accent/60 hover:text-accent"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-3">
                <span>Total</span>
                <span className="font-mono">
                  $
                  {(Number(amount) * 67452.18).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <Button
                onClick={handlePlaceOrder}
                className={`w-full mt-3 font-bold ${side === "buy" ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`}
              >
                {side === "buy" ? (
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1.5" />
                )}
                {side === "buy" ? "Buy" : "Sell"} {pair.split("/")[0]}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Full-featured Bitcoin Deposit Modal with exact amount input, QR code, and address copy */}
      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        initialBtcAmount={depositReqBtc}
        initialUsdAmount={depositReqUsd}
      />
    </div>
  );
}
