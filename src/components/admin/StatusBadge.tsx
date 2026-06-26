import { cn } from "@/lib/utils/cn";

export function StatusBadge({ status }: { status: string }) {
  const tone = status === "published" || status === "accepted" ? "bg-green-100 text-green-800" : status === "draft" || status === "new" ? "bg-linen text-graphite" : "bg-stone/10 text-stone";
  return <span className={cn("inline-flex rounded-sm px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em]", tone)}>{status}</span>;
}
