export default function Loading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4efe4_0%,#f8f5ef_38%,#f1ebdf_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-[2rem] border border-stone-300/70 bg-white/80"
          />
        ))}
      </div>
    </main>
  );
}
