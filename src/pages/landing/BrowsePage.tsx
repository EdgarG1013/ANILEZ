import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  TrendingUp, Sparkles, Clock, Film, Radio, Tv, Star, CalendarDays,
  Tag, Snowflake, Flower2, Sun, Leaf, ChevronLeft, ChevronRight,
} from "lucide-react";
import AnimeCard, { type AnimeCardData } from "../../components/landing/AnimeCard";
import Select from "../../components/ui/Select";
import {
  buscarCatalogo, buscarPorTemporada, TIPOS, ESTADOS, GENEROS,
  type Medio, type Temporada,
} from "../../api/catalogoService";
import CatalogoError from "../../components/compartido/CatalogoError";

// ─── Navegador de anime (Browse) ─────────────────────────────────────────────
// Lee la URL (?type=..., ?genre=..., ?year=...&season=...) y muestra una grilla
// con paginación. Es la página que usan los enlaces del footer, el navbar y los
// "Ver todo" de las secciones del home.

const SEASON_LABELS: Record<Temporada, string> = {
  winter: "Invierno",
  spring: "Primavera",
  summer: "Verano",
  fall: "Otoño",
};

const GENRE_NAMES: Record<number, string> = {
  1: "Acción", 2: "Aventura", 4: "Comedia", 8: "Drama", 10: "Fantasía",
  7: "Misterio", 22: "Romance", 24: "Sci-Fi", 36: "Recuentos de la vida",
  30: "Deportes", 37: "Sobrenatural", 41: "Suspenso", 27: "Shounen",
};

type TipoPagina =
  | "popular" | "popular-all" | "season" | "upcoming" | "airing" | "movies"
  | "ona" | "ova" | "special" | "genre" | "season-archive";

function useIcon(tipo: string, seasonName?: Temporada) {
  if (tipo === "season-archive" && seasonName) {
    const map: Record<Temporada, typeof Snowflake> = {
      winter: Snowflake, spring: Flower2, summer: Sun, fall: Leaf,
    };
    const Icon = map[seasonName];
    return { icon: <Icon size={18} />, bg: "#16141e" };
  }
  const map: Record<string, { icon: typeof Star; bg: string }> = {
    popular: { icon: TrendingUp, bg: "rgba(148,110,217,0.15)" },
    "popular-all": { icon: TrendingUp, bg: "rgba(148,110,217,0.15)" },
    season: { icon: Sparkles, bg: "rgba(255,170,60,0.15)" },
    upcoming: { icon: Clock, bg: "rgba(0,180,180,0.15)" },
    airing: { icon: Radio, bg: "rgba(255,80,80,0.15)" },
    movies: { icon: Film, bg: "rgba(217,119,6,0.15)" },
    ona: { icon: Tv, bg: "rgba(0,151,167,0.15)" },
    ova: { icon: Tv, bg: "rgba(56,142,60,0.15)" },
    special: { icon: Star, bg: "rgba(240,240,240,0.15)" },
    genre: { icon: Tag, bg: "rgba(148,110,217,0.15)" },
    "season-archive": { icon: CalendarDays, bg: "rgba(148,110,217,0.15)" },
  };
  const c = map[tipo] ?? map.popular;
  const Icon = c.icon;
  return { icon: <Icon size={18} />, bg: c.bg };
}

function buildTitle(tipo: TipoPagina, genreId: number | null, anio: number | null, season: Temporada | null): string {
  if (tipo === "genre") return GENRE_NAMES[genreId ?? 0] || "Género";
  if (tipo === "season-archive" && season) return `${SEASON_LABELS[season]} ${anio ?? ""}`.trim();
  const map: Record<TipoPagina, string> = {
    popular: "Más Populares",
    "popular-all": "Más Populares",
    season: "En Temporada",
    upcoming: "Próximos",
    airing: "Top en Emisión",
    movies: "Películas",
    ona: "ONAs",
    ova: "OVAs",
    special: "Especiales",
    genre: "Género",
    "season-archive": "Temporada",
  };
  return map[tipo];
}

const SUBTITLES: Record<TipoPagina, string> = {
  popular: "Los más populares de todos los tiempos",
  "popular-all": "Anime y manga más populares de todos los tiempos",
  season: "Que se está emitiendo en esta temporada",
  upcoming: "Se estrena muy pronto",
  airing: "Los mejor puntuados que están en emisión",
  movies: "Las películas mejor valoradas",
  ona: "Animaciones originales de internet",
  ova: "Animaciones de vídeo originales",
  special: "Episodios especiales y capítulos únicos",
  genre: "",
  "season-archive": "",
};

// Páginas que ya fijan un formato; el filtro de tipo no aplica.
const FORMAT_PAGES: TipoPagina[] = ["movies", "ona", "ova", "special"];

export default function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const tipo = (params.get("type") || "popular") as TipoPagina;
  const medioUrl = (params.get("medio") || "anime") as Medio;
  const genreId = params.get("genre") ? Number(params.get("genre")) : null;
  const anio = params.get("year") ? Number(params.get("year")) : null;
  const season = (params.get("season") as Temporada | null) || null;

  // Filtros (se leen de la URL)
  const urlTipo = params.get("filter") || "";
  const urlGenero = params.get("genre") || "";
  const urlEstado = params.get("status") || "";

  const paginaActual = Number(params.get("page") || "1");

  const [items, setItems] = useState<AnimeCardData[]>([]);
  const [ultima, setUltima] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // El género puede venir de la URL como id (genre=22) o como filtro seleccionado.
  const generoSeleccionado = urlGenero && urlGenero !== String(genreId ?? "") ? urlGenero : String(genreId ?? "");

  const { icon, bg } = useIcon(tipo, season ?? undefined);

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    setError(null);

    const f = {
      medio: medioUrl,
      q: params.get("q") || "",
      tipo: urlTipo,
      genero: generoSeleccionado,
      estado: urlEstado,
      orden: "",
      pagina: paginaActual,
      sfw: true,
    };

    const promesa: Promise<{ items: { id: number; title: string; img: string; type: string; year: number | null; score: number | null }[]; ultimaPagina: number; total: number }> =
      tipo === "popular-all"
        ? Promise.all([
            buscarCatalogo({ medio: "anime", orden: "popularity:asc", pagina: paginaActual }),
            buscarCatalogo({ medio: "manga", orden: "popularity:asc", pagina: paginaActual }),
          ]).then(([animeRes, mangaRes]) => {
            const combined = [...animeRes.items, ...mangaRes.items]
              .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
            return {
              items: combined,
              ultimaPagina: Math.max(animeRes.ultimaPagina, mangaRes.ultimaPagina),
              total: animeRes.total + mangaRes.total,
            };
          })
        : tipo === "season-archive" && anio && season
        ? buscarPorTemporada(anio, season, paginaActual, true)
        : (() => {
            switch (tipo) {
              case "season": return buscarCatalogo({ ...f, estado: "airing", orden: "popularity:asc" });
              case "upcoming": return buscarCatalogo({ ...f, estado: "upcoming", orden: "popularity:asc" });
              case "airing": return buscarCatalogo({ ...f, estado: "airing", orden: "score:desc" });
              case "movies": return buscarCatalogo({ ...f, tipo: "movie", orden: "popularity:asc" });
              case "ona": return buscarCatalogo({ ...f, tipo: "ona", orden: "popularity:asc" });
              case "ova": return buscarCatalogo({ ...f, tipo: "ova", orden: "popularity:asc" });
              case "special": return buscarCatalogo({ ...f, tipo: "special", orden: "popularity:asc" });
              case "genre": return buscarCatalogo({ ...f, genero: String(genreId ?? ""), orden: "popularity:asc" });
              default: return buscarCatalogo({ ...f, orden: "popularity:asc" });
            }
          })();

    promesa
      .then(r => {
        if (!vivo) return;
        setItems(r.items);
        setUltima(r.ultimaPagina);
        setTotal(r.total);
      })
      .catch(() => vivo && setError("No pudimos cargar el catálogo. Intenta de nuevo."))
      .finally(() => vivo && setCargando(false));

    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, medioUrl, genreId, anio, season, urlTipo, urlGenero, urlEstado, paginaActual, params, retryKey]);

  const titulo = buildTitle(tipo, genreId, anio, season);
  const medioLabel = medioUrl === "manga" ? "Manga" : "Anime";
  const subtitulo = tipo === "popular-all"
    ? SUBTITLES[tipo]
    : tipo === "genre"
      ? `${medioLabel} de ${titulo} populares`
      : `${medioLabel} — ${SUBTITLES[tipo]}`;

  function actualizarPagina(pagina: number) {
    const p = new URLSearchParams(params);
    if (pagina > 1) p.set("page", String(pagina));
    else p.delete("page");
    setParams(p, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const paginas = useMemo(() => {
    const set = new Set<number>([1, ultima]);
    for (let i = paginaActual - 2; i <= paginaActual + 2; i++) if (i > 0 && i <= ultima) set.add(i);
    return [...set].sort((a, b) => a - b);
  }, [paginaActual, ultima]);

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-5">
        <button onClick={() => navigate("/")} className="text-[#8b82a8] hover:text-[#f0eefa] transition-colors">
          Inicio
        </button>
        <span className="text-[#8b82a8]">/</span>
        <span className="text-[#f0eefa] font-medium">{titulo}</span>
      </div>

      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[#946ed9]" style={{ backgroundColor: bg }}>
          {icon}
        </div>
        <h1 className="text-2xl font-semibold tracking-wider" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          {titulo}
        </h1>
      </div>
      <p className="text-[#8b82a8] text-sm mb-8">{subtitulo}</p>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        {!FORMAT_PAGES.includes(tipo) && tipo !== "season-archive" && tipo !== "popular-all" && (
          <Select
            valor={urlTipo}
            onChange={v => {
              const p = new URLSearchParams(params);
              if (v) p.set("filter", v);
              else p.delete("filter");
              p.delete("page");
              setParams(p, { replace: true });
            }}
            opciones={[{ valor: "", etiqueta: "Tipo: Todos" }, ...TIPOS[medioUrl].map(t => ({ valor: t, etiqueta: t }))]}
            className="w-44"
          />
        )}

        {tipo !== "season-archive" && tipo !== "popular-all" && (
          <Select
            valor={generoSeleccionado}
            onChange={v => {
              const p = new URLSearchParams(params);
              if (v) p.set("genre", v);
              else p.delete("genre");
              p.delete("page");
              setParams(p, { replace: true });
            }}
            opciones={[{ valor: "", etiqueta: "Género: Todos" }, ...GENEROS.map(g => ({ valor: String(g.id), etiqueta: g.nombre }))]}
            className="w-48"
          />
        )}

        {tipo === "popular" && (
          <Select
            valor={urlEstado}
            onChange={v => {
              const p = new URLSearchParams(params);
              if (v) p.set("status", v);
              else p.delete("status");
              p.delete("page");
              setParams(p, { replace: true });
            }}
            opciones={[{ valor: "", etiqueta: "Estado: Todos" }, ...ESTADOS[medioUrl].map(s => ({ valor: s.valor, etiqueta: s.etiqueta }))]}
            className="w-48"
          />
        )}
      </div>

      {/* Resumen */}
      <p className="text-sm text-[#8b82a8] mb-4" aria-live="polite">
        {cargando ? "Cargando resultados…" : `${total.toLocaleString("es")} resultados`}
      </p>

      {error && <CatalogoError onReintentar={() => setRetryKey(k => k + 1)} />}

      {/* Grilla */}
      {cargando ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-[#16141e] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 && !error ? (
        <p className="py-20 text-center text-[#8b82a8]">No encontramos títulos con esos filtros.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-10">
          {items.map(item => <AnimeCard key={item.id} anime={item} medio={medioUrl} />)}
        </div>
      )}

      {/* Paginación */}
      {!cargando && ultima > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Paginación">
          <button
            onClick={() => actualizarPagina(paginaActual - 1)}
            disabled={paginaActual <= 1}
            className="h-9 px-3 rounded-lg border border-[#2a2140] text-sm text-[#8b82a8] disabled:opacity-40 hover:text-[#f0eefa]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {paginas.map((p, i) => (
            <span key={p} className="flex items-center gap-1.5">
              {i > 0 && p - paginas[i - 1] > 1 && <span className="text-[#8b82a8] px-1">…</span>}
              <button
                onClick={() => actualizarPagina(p)}
                aria-current={p === paginaActual ? "page" : undefined}
                className={`min-w-9 h-9 px-2 rounded-lg text-sm border transition-colors ${
                  p === paginaActual
                    ? "bg-[#946ed9] border-[#946ed9] text-white font-semibold"
                    : "border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa]"
                }`}
              >
                {p}
              </button>
            </span>
          ))}
          <button
            onClick={() => actualizarPagina(paginaActual + 1)}
            disabled={paginaActual >= ultima}
            className="h-9 px-3 rounded-lg border border-[#2a2140] text-sm text-[#8b82a8] disabled:opacity-40 hover:text-[#f0eefa]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </main>
  );
}