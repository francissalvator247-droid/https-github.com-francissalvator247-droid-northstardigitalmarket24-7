import { useEffect, useState } from "react";
import { Bot, TrendingUp, TrendingDown, Activity } from "lucide-react";

type Trade = {
  id: number;
  pair: string;
  side: "LONG" | "SHORT";
  entry: number;
  exit: number;
  pnl: number;
  size: number;
  time: string;
  status: "OPEN" | "CLOSED";
};

const PAIRS = [
  "BTC/USDT",
  "ETH/USDT",
  "SOL/USDT",
  "BNB/USDT",
  "XRP/USDT",
  "ADA/USDT",
  "AVAX/USDT",
  "LINK/USDT",
  "DOGE/USDT",
  "MATIC/USDT",
];
const STRATEGIES = [
  "Momentum breakout detected",
  "RSI oversold reversal",
  "MACD bullish crossover",
  "Liquidity sweep on 15m",
  "Order block retest",
  "Whale accumulation signal",
  "Volume divergence captured",
  "Smart-money entry confirmed",
];

function randTrade(id: number): Trade {
  const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
  const side = Math.random() > 0.35 ? "LONG" : "SHORT";
  const entry = +(Math.random() * 60000 + 100).toFixed(2);
  const move = entry * (Math.random() * 0.018 + 0.003);
  const win = Math.random() > 0.12;
  const exit =
    side === "LONG" ? entry + (win ? move : -move * 0.6) : entry - (win ? move : -move * 0.6);
  const size = +(Math.random() * 4 + 0.5).toFixed(3);
  const pnl = +((exit - entry) * (side === "LONG" ? 1 : -1) * size).toFixed(2);
  return {
    id,
    pair,
    side,
    entry,
    exit: +exit.toFixed(2),
    pnl,
    size,
    time: new Date().toLocaleTimeString(),
    status: "CLOSED",
  };
}

export function AiTradeTracker() {
  const [trades, setTrades] = useState<Trade[]>(() =>
    Array.from({ length: 6 }).map((_, i) => randTrade(Date.now() - i)),
  );
  const [signal, setSignal] = useState(STRATEGIES[0]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let id = Date.now();
    const t = setInterval(() => {
      setScanning(true);
      setSignal(STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)]);
      setTimeout(() => {
        id += 1;
        setTrades((prev) => [randTrade(id), ...prev].slice(0, 8));
        setScanning(false);
      }, 1200);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const wins = trades.filter((t) => t.pnl > 0).length;
  const winRate = Math.round((wins / Math.max(trades.length, 1)) * 100);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-5 w-5 text-accent" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
          </div>
          <div>
            <div className="font-semibold leading-tight">AI Trade Tracker</div>
            <div className="text-[11px] text-muted-foreground">
              Live algorithmic trades · v4 engine
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Win rate </span>
            <span className="font-bold text-accent">{winRate}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Session PnL </span>
            <span className={`font-bold ${totalPnl >= 0 ? "text-accent" : "text-destructive"}`}>
              {totalPnl >= 0 ? "+" : "-"}${Math.abs(totalPnl).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30 text-xs mb-3">
        <Activity className={`h-3.5 w-3.5 text-accent ${scanning ? "animate-pulse" : ""}`} />
        <span className="text-accent font-medium">
          {scanning ? "Scanning order books…" : "Signal:"}
        </span>
        <span className="text-foreground/90 truncate">{signal}</span>
      </div>

      <div className="space-y-1.5 max-h-72 overflow-hidden">
        {trades.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-background/40 border border-border text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              {t.side === "LONG" ? (
                <TrendingUp className="h-3.5 w-3.5 text-accent shrink-0" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-destructive shrink-0" />
              )}
              <span className="font-semibold">{t.pair}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.side === "LONG" ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"}`}
              >
                {t.side}
              </span>
            </div>
            <div className="hidden sm:block text-muted-foreground tabular-nums">
              {t.entry.toLocaleString()} → {t.exit.toLocaleString()}
            </div>
            <div
              className={`font-bold tabular-nums ${t.pnl >= 0 ? "text-accent" : "text-destructive"}`}
            >
              {t.pnl >= 0 ? "+" : "-"}${Math.abs(t.pnl).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
