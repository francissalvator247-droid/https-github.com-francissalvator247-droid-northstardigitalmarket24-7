// Client-side Supabase client with graceful mock fallback when unconfigured.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { brokeredPreviewStorage } from "./previewAuthStorage";

const MOCK_STORAGE_KEY_USER = "northstar_mock_user";
const MOCK_STORAGE_KEY_PROFILE = "northstar_mock_profile";
const MOCK_STORAGE_KEY_INVESTMENTS = "northstar_mock_investments";
const MOCK_STORAGE_KEY_TRANSACTIONS = "northstar_mock_transactions";

function getMockStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setMockStorage<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota errors in sandbox
  }
}

function createMockSupabaseClient(): any {
  console.warn("[AI Studio] Supabase credentials not set — using in-memory mock client");

  const defaultUser = {
    id: "demo-user-123",
    email: "trader@northstar.io",
    user_metadata: { full_name: "Alex Vance" },
  };

  const defaultProfile = {
    id: "demo-user-123",
    full_name: "Alex Vance",
    email: "trader@northstar.io",
    balance: 148500,
    bonus_balance: 100,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const defaultInvestments = [
    {
      id: "inv-1",
      user_id: "demo-user-123",
      plan_name: "Starter",
      amount: 60000,
      daily_roi: 2.5,
      current_value: 67800,
      duration_days: 30,
      status: "active",
      started_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "inv-2",
      user_id: "demo-user-123",
      plan_name: "Basic",
      amount: 15000,
      daily_roi: 1.8,
      current_value: 16890,
      duration_days: 21,
      status: "active",
      started_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ];

  const defaultTransactions = [
    {
      id: "tx-1",
      user_id: "demo-user-123",
      type: "deposit",
      amount: 75000,
      status: "completed",
      note: "BTC Deposit Confirmed (Network Tx #98124)",
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: "tx-2",
      user_id: "demo-user-123",
      type: "bonus",
      amount: 100,
      status: "completed",
      note: "Welcome Bonus Claimed",
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
  ];

  return {
    auth: {
      async getSession() {
        const user = getMockStorage(MOCK_STORAGE_KEY_USER, null);
        if (!user) return { data: { session: null }, error: null };
        return {
          data: {
            session: {
              access_token: "mock-token-xyz",
              user,
            },
          },
          error: null,
        };
      },
      async signUp({ email, password, options }: any) {
        const user = {
          id: "user-" + Date.now().toString(36),
          email,
          user_metadata: options?.data || {
            full_name: options?.data?.full_name || email.split("@")[0],
          },
        };
        const profile = {
          id: user.id,
          full_name: user.user_metadata.full_name,
          email,
          balance: 0,
          bonus_balance: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setMockStorage(MOCK_STORAGE_KEY_USER, user);
        setMockStorage(MOCK_STORAGE_KEY_PROFILE, profile);
        setMockStorage(MOCK_STORAGE_KEY_INVESTMENTS, []);
        setMockStorage(MOCK_STORAGE_KEY_TRANSACTIONS, [
          {
            id: "tx-" + Date.now().toString(36),
            user_id: user.id,
            type: "bonus",
            amount: 100,
            status: "pending",
            note: "Welcome Bonus ($100 Locked - Requires Investment)",
            created_at: new Date().toISOString(),
          },
        ]);
        return {
          data: {
            user,
            session: { access_token: "mock-token-xyz", user },
          },
          error: null,
        };
      },
      async signInWithPassword({ email }: any) {
        const existingUser = getMockStorage(MOCK_STORAGE_KEY_USER, null);
        const user = existingUser || {
          id: "user-" + Date.now().toString(36),
          email,
          user_metadata: { full_name: email.split("@")[0] },
        };
        setMockStorage(MOCK_STORAGE_KEY_USER, user);
        return {
          data: {
            user,
            session: { access_token: "mock-token-xyz", user },
          },
          error: null,
        };
      },
      async signOut() {
        if (typeof window !== "undefined") {
          localStorage.removeItem(MOCK_STORAGE_KEY_USER);
          localStorage.removeItem(MOCK_STORAGE_KEY_PROFILE);
          localStorage.removeItem(MOCK_STORAGE_KEY_INVESTMENTS);
          localStorage.removeItem(MOCK_STORAGE_KEY_TRANSACTIONS);
        }
        return { error: null };
      },
      onAuthStateChange(callback: any) {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
    from(table: string) {
      let filteredData: any[] = [];
      if (table === "profiles") {
        const p = getMockStorage(MOCK_STORAGE_KEY_PROFILE, defaultProfile);
        filteredData = [p];
      } else if (table === "investments") {
        filteredData = getMockStorage(MOCK_STORAGE_KEY_INVESTMENTS, defaultInvestments);
      } else if (table === "transactions") {
        filteredData = getMockStorage(MOCK_STORAGE_KEY_TRANSACTIONS, defaultTransactions);
      }

      const builder: any = {
        select: (_cols?: string) => builder,
        eq: (col: string, val: any) => {
          filteredData = filteredData.filter((item) => item[col] === val);
          return builder;
        },
        order: (col: string, { ascending }: { ascending?: boolean } = {}) => {
          filteredData.sort((a, b) => {
            if (a[col] < b[col]) return ascending ? -1 : 1;
            if (a[col] > b[col]) return ascending ? 1 : -1;
            return 0;
          });
          return builder;
        },
        limit: (n: number) => {
          filteredData = filteredData.slice(0, n);
          return builder;
        },
        maybeSingle: async () => ({
          data: filteredData[0] || null,
          error: null,
        }),
        single: async () => ({
          data: filteredData[0] || null,
          error: filteredData[0] ? null : { message: "Not found" },
        }),
        insert: async (rows: any) => {
          const arr = Array.isArray(rows) ? rows : [rows];
          if (table === "transactions") {
            const txs = getMockStorage(MOCK_STORAGE_KEY_TRANSACTIONS, defaultTransactions);
            const newTxs = [...arr, ...txs];
            setMockStorage(MOCK_STORAGE_KEY_TRANSACTIONS, newTxs);
          }
          return { data: arr, error: null };
        },
        then(resolve: any) {
          resolve({ data: filteredData, error: null });
        },
      };
      return builder;
    },
    rpc: async (fn: string, args: any = {}) => {
      const profile = getMockStorage(MOCK_STORAGE_KEY_PROFILE, defaultProfile);
      const investments = getMockStorage(MOCK_STORAGE_KEY_INVESTMENTS, defaultInvestments);
      const transactions = getMockStorage(MOCK_STORAGE_KEY_TRANSACTIONS, defaultTransactions);

      if (fn === "accrue_my_investments") {
        const updated = investments.map((inv: any) => ({
          ...inv,
          current_value: Math.round(
            Number(inv.current_value) + (Number(inv.amount) * (Number(inv.daily_roi) / 100)) / 100,
          ),
        }));
        setMockStorage(MOCK_STORAGE_KEY_INVESTMENTS, updated);
        return { data: true, error: null };
      }

      if (fn === "start_investment_plan") {
        const planAmounts: Record<
          string,
          { amount: number; minAmount: number; maxAmount: number; roi: number; days: number }
        > = {
          Starter: { amount: 500, minAmount: 500, maxAmount: 10000, roi: 2.5, days: 14 },
          Classic: { amount: 5000, minAmount: 5000, maxAmount: 25000, roi: 3.2, days: 21 },
          Pro: { amount: 30000, minAmount: 30000, maxAmount: 150000, roi: 4.5, days: 30 },
          Executive: { amount: 100000, minAmount: 100000, maxAmount: 350000, roi: 6.0, days: 45 },
          Golden: { amount: 1000000, minAmount: 1000000, maxAmount: 2000000, roi: 8.5, days: 60 },
          // Legacy fallbacks
          Micro: { amount: 5000, minAmount: 5000, maxAmount: 25000, roi: 1.2, days: 14 },
          Basic: { amount: 15000, minAmount: 15000, maxAmount: 30000, roi: 1.8, days: 21 },
          Standard: { amount: 30000, minAmount: 30000, maxAmount: 60000, roi: 2.1, days: 28 },
          Advanced: { amount: 100000, minAmount: 100000, maxAmount: 350000, roi: 3.8, days: 45 },
          Premium: { amount: 200000, minAmount: 200000, maxAmount: 500000, roi: 5.2, days: 60 },
          Elite: { amount: 500000, minAmount: 500000, maxAmount: 1000000, roi: 6.5, days: 90 },
          VIP: { amount: 1000000, minAmount: 1000000, maxAmount: 2000000, roi: 8.0, days: 120 },
        };
        const p = planAmounts[args.p_plan_name];
        if (!p) return { error: { message: "Invalid plan" } };

        const targetAmount =
          typeof args.p_amount === "number" && args.p_amount > 0 ? args.p_amount : p.amount;

        if (targetAmount < p.minAmount) {
          return {
            error: {
              message: `Minimum investment for the ${args.p_plan_name} plan is $${p.minAmount.toLocaleString()}.`,
            },
          };
        }

        if ((profile.balance || 0) < targetAmount) {
          return {
            error: {
              message: `Insufficient funds. Your cash balance is $${Number(profile.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}, but this investment requires $${targetAmount.toLocaleString()}. Please deposit funds first.`,
            },
          };
        }
        profile.balance -= targetAmount;
        const wasLocked = investments.length === 0;
        const newInv = {
          id: "inv-" + Date.now().toString(36),
          user_id: profile.id,
          plan_name: args.p_plan_name,
          amount: targetAmount,
          daily_roi: p.roi,
          current_value: targetAmount,
          duration_days: p.days,
          status: "active",
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        const newTx = {
          id: "tx-" + Date.now().toString(36),
          user_id: profile.id,
          type: "investment",
          amount: targetAmount,
          status: "completed",
          note: `Activated ${args.p_plan_name} AI Trading Plan ($${targetAmount.toLocaleString()})`,
          created_at: new Date().toISOString(),
        };
        const bonusTx = wasLocked
          ? [
              {
                id: "tx-bonus-" + Date.now().toString(36),
                user_id: profile.id,
                type: "bonus",
                amount: 100,
                status: "completed",
                note: `Welcome Bonus ($100) Unlocked via ${args.p_plan_name} Plan`,
                created_at: new Date().toISOString(),
              },
            ]
          : [];
        setMockStorage(MOCK_STORAGE_KEY_PROFILE, profile);
        setMockStorage(MOCK_STORAGE_KEY_INVESTMENTS, [newInv, ...investments]);
        setMockStorage(MOCK_STORAGE_KEY_TRANSACTIONS, [newTx, ...bonusTx, ...transactions]);
        return { data: true, error: null };
      }

      if (fn === "process_withdrawal") {
        const amt = Number(args.p_amount);
        if (amt > profile.balance) {
          return { error: { message: "Insufficient balance" } };
        }
        profile.balance -= amt;
        const newTx = {
          id: "tx-" + Date.now().toString(36),
          user_id: profile.id,
          type: "withdrawal",
          amount: amt,
          status: "pending",
          note: `Withdrawal request to ${args.p_wallet || "external wallet"}`,
          created_at: new Date().toISOString(),
        };
        setMockStorage(MOCK_STORAGE_KEY_PROFILE, profile);
        setMockStorage(MOCK_STORAGE_KEY_TRANSACTIONS, [newTx, ...transactions]);
        return { data: true, error: null };
      }

      if (fn === "submit_deposit") {
        const btcAmt = Number(args.p_btc_amount) || 0;
        const usdAmt = Number(args.p_usd_amount) || (btcAmt > 0 ? btcAmt * 67450 : 0);
        const newTx = {
          id: "tx-" + Date.now().toString(36),
          user_id: profile.id,
          type: "deposit",
          amount: usdAmt,
          status: "pending",
          note: `BTC Deposit (${btcAmt > 0 ? btcAmt + " BTC" : "$" + usdAmt.toLocaleString()}) to ${args.p_wallet || "Vault Address"}`,
          created_at: new Date().toISOString(),
        };
        setMockStorage(MOCK_STORAGE_KEY_TRANSACTIONS, [newTx, ...transactions]);
        return { data: true, error: null };
      }

      return { data: null, error: null };
    },
    channel(_name: string) {
      const ch = {
        on: () => ch,
        subscribe: () => ch,
        unsubscribe: () => {},
      };
      return ch;
    },
    removeChannel: () => {},
  };
}

function createSupabaseClient() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return createMockSupabaseClient();
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: brokeredPreviewStorage(),
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
