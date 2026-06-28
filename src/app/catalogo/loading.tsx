export default function CatalogLoading() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
      <div className="h-8 w-48 animate-pulse bg-graphite/10" />
      <div className="mt-4 h-14 max-w-xl animate-pulse bg-graphite/10" />
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid gap-4">
            <div className="aspect-[4/5] animate-pulse bg-graphite/10" />
            <div className="h-5 w-2/3 animate-pulse bg-graphite/10" />
            <div className="h-4 w-full animate-pulse bg-graphite/10" />
          </div>
        ))}
      </div>
    </section>
  );
}
