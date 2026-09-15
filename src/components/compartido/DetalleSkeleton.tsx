// ─── Skeleton de carga para páginas de detalle (anime / manga) ───────────────

function Barra({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-[#16141e] animate-pulse ${className}`} />;
}

export default function DetalleSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero placeholder */}
      <div className="relative h-[320px] sm:h-[400px] lg:h-[480px]">
        <div className="absolute inset-0 bg-[#110f1a] animate-pulse" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 pb-12 flex gap-8 items-end">
            {/* Portada */}
            <div className="hidden md:block shrink-0">
              <div className="w-[180px] rounded-2xl border border-[#2a2140] animate-pulse" style={{ aspectRatio: "2/3", backgroundColor: "#16141e" }} />
            </div>
            <div className="flex-1 pb-2 space-y-3 min-w-0">
              <Barra className="w-40 h-6" />
              <Barra className="w-3/4 h-10" />
              <Barra className="w-1/2 h-5" />
              <Barra className="w-full h-4" />
              <div className="flex flex-nowrap gap-2 pt-2 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => <Barra key={i} className="w-20 h-6 rounded-full shrink-0" />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Sinopsis */}
            <div className="space-y-3">
              <Barra className="w-40 h-6" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Barra key={i} className={`h-4 w-full ${i === 5 ? "w-2/3" : ""}`} />
              ))}
            </div>
            {/* Carrousel */}
            <div className="space-y-4">
              <Barra className="w-48 h-6" />
              <div className="flex gap-4 overflow-x-auto pb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-[#2a2140] animate-pulse shrink-0" style={{ width: "160px" }}>
                    <div className="aspect-[2/3]" style={{ backgroundColor: "#16141e" }} />
                    <div className="p-3 space-y-2">
                      <Barra className="w-full h-3" />
                      <Barra className="w-1/2 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-3">
            <div className="rounded-2xl p-5 border border-[#2a2140]" style={{ backgroundColor: "#110f1a" }}>
              <Barra className="w-32 h-5 mb-4" />
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex justify-between gap-4 py-2">
                  <Barra className="w-20 h-3" />
                  <Barra className="w-28 h-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}