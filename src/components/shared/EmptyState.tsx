import { SearchX } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center border border-graphite/10 bg-white p-10 text-center">
      <SearchX className="mb-4 h-9 w-9 text-timber" aria-hidden />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-stone">{description}</p>
    </div>
  );
}
