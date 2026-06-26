import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-timber">{eyebrow}</p> : null}
      <h2 className="font-display text-4xl font-semibold leading-tight text-graphite md:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-stone md:text-lg">{description}</p> : null}
    </div>
  );
}
