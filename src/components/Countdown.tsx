import { useEffect, useState } from "react";

export function Countdown({ hours = 23 }: { hours?: number }) {
  const [end] = useState(() => Date.now() + hours * 3600_000);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, end - now);
  const h = Math.floor(diff / 3600_000);
  const m = Math.floor((diff % 3600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const cell = (n: number, l: string) => (
    <div className="flex flex-col items-center bg-card border border-border rounded-xl px-4 py-3 min-w-[72px]">
      <span className="text-2xl font-bold tabular-nums">{n.toString().padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</span>
    </div>
  );
  return (
    <div className="flex gap-2 justify-center">
      {cell(h, "Hrs")}
      {cell(m, "Min")}
      {cell(s, "Sec")}
    </div>
  );
}
