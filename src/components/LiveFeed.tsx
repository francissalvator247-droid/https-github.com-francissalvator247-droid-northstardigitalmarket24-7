import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ArrowDownToLine } from "lucide-react";

const names = [
  "John",
  "Mary",
  "Aiden",
  "Lukas",
  "Sofia",
  "Marco",
  "Yuki",
  "Chen",
  "Priya",
  "Hassan",
  "Olga",
  "Diego",
  "Amara",
  "Nora",
];
const countries = [
  "UK",
  "US",
  "Germany",
  "Japan",
  "India",
  "Brazil",
  "Canada",
  "France",
  "UAE",
  "Nigeria",
  "Spain",
  "Australia",
];
const rnd = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const amt = () => Math.floor(2_000 + Math.random() * 198_000);

type Item = { id: number; kind: "invest" | "withdraw"; text: string };

export function LiveFeed() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let id = 0;
    const push = () => {
      const kind: Item["kind"] = Math.random() > 0.4 ? "invest" : "withdraw";
      const text =
        kind === "invest"
          ? `${rnd(names)} from ${rnd(countries)} just invested $${amt().toLocaleString()}`
          : `${rnd(names)} withdrew $${amt().toLocaleString()} profit`;
      setItems((p) => [{ id: ++id, kind, text }, ...p].slice(0, 5));
    };
    push();
    const t = setInterval(push, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {items.map((i) => (
          <motion.div
            key={i.id}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card/70 backdrop-blur p-3"
          >
            <div
              className={`h-9 w-9 rounded-full grid place-items-center ${i.kind === "invest" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"}`}
            >
              {i.kind === "invest" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <ArrowDownToLine className="h-4 w-4" />
              )}
            </div>
            <div className="text-sm">{i.text}</div>
            <div className="ml-auto h-2 w-2 rounded-full bg-accent pulse-ring" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
