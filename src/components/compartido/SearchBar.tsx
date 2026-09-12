import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { buscarCatalogo, type CatalogoItem } from "../../api/catalogoService";

// ─── Barra de búsqueda con sugerencias en vivo ───────────────────────────────
// Al escribir, consulta anime y manga y muestra hasta 6 coincidencias.
// Al presionar un resultado navega a la página de detalle correspondiente.

interface Sugerencia {
  medio: "anime" | "manga";
  item: CatalogoItem;
}

export default function SearchBar({ onNavegacion }: { onNavegacion?: () => void }) {
  const navigate = useNavigate();
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<Sugerencia[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Cerrar el panel al hacer clic fuera
  useEffect(() => {
    function alClicFuera(e: MouseEvent) {
      if (!contenedorRef.current?.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", alClicFuera);
    return () => document.removeEventListener("mousedown", alClicFuera);
  }, []);

  // Debounce de la búsqueda
  useEffect(() => {
    if (!texto.trim()) {
      setResultados([]);
      setCargando(false);
      return;
    }
    const t = setTimeout(async () => {
      setCargando(true);
      const q = texto.trim();
      const [anime, manga] = await Promise.allSettled([
        buscarCatalogo({ medio: "anime", q, sfw: false }), // true para filtrar contenido NSFW, false para mostrar todo
        buscarCatalogo({ medio: "manga", q, sfw: false }),
      ]);

      const res: Sugerencia[] = [];
      if (anime.status === "fulfilled") for (const i of anime.value.items) res.push({ medio: "anime", item: i });
      if (manga.status === "fulfilled") for (const i of manga.value.items) res.push({ medio: "manga", item: i });
      setResultados(res.slice(0, 6));
      setAbierto(true);
      setCargando(false);
    }, 350);
    return () => clearTimeout(t);
  }, [texto]);

  function irA(s: Sugerencia) {
    setTexto("");
    setResultados([]);
    setAbierto(false);
    onNavegacion?.();
    navigate(s.medio === "anime" ? `/anime/${s.item.id}` : `/manga/${s.item.id}`);
  }

  return (
    <div ref={contenedorRef} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b82a8]" />
      <input
        type="search"
        value={texto}
        onChange={e => setTexto(e.target.value)}
        onFocus={() => resultados.length > 0 && setAbierto(true)}
        placeholder="Buscar anime, manga…"
        aria-label="Buscar anime o manga"
        className="w-full h-9 bg-[#16141e] border border-[#2a2140] text-sm pl-9 pr-4 rounded-xl text-[#f0eefa] placeholder:text-[#8b82a8] focus:outline-none focus:border-[#946ed9] transition-colors"
      />

      {cargando && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 text-[#946ed9] animate-spin" />
        </span>
      )}

      {abierto && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden shadow-2xl z-50">
          {resultados.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[#8b82a8]">
              {cargando ? "Buscando…" : "Sin coincidencias."}
            </p>
          ) : (
            <ul>
              {resultados.map(s => {
                const esAnime = s.medio === "anime";
                return (
                  <li key={`${s.medio}-${s.item.id}`}>
                    <button
                      onClick={() => irA(s)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#16141e] transition-colors text-left"
                    >
                      <img
                        src={s.item.img}
                        alt=""
                        loading="lazy"
                        className="w-9 h-12 object-cover rounded-md bg-[#1c1928] shrink-0"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium truncate text-[#f0eefa]">
                          {s.item.title}
                        </span>
                        <span className="block text-xs text-[#8b82a8]">
                          {esAnime ? "Anime" : "Manga"}
                          {s.item.year ? ` · ${s.item.year}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}