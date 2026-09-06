import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Check, Plus, Loader2 } from "lucide-react";
import {
  buscarCatalogo, TIPOS, ESTADOS, GENEROS, ANIOS, LETRAS, ORDENES, TEMPORADAS,
  type CatalogoItem, type Medio,
} from "../../api/catalogoService";
import { useBiblioteca } from "../../store/biblioteca";
import { TipoBadge, PuntuacionBadge } from "../landing/badges";
import Select from "../ui/Select";
import CatalogoError from "../compartido/CatalogoError";

// ─── Catálogo reutilizable (anime / manga) ───────────────────────────────────

function FiltroConLabel({
  etiqueta, valor, onChange, opciones,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  opciones: { valor: string; etiqueta: string }[];
}) {
  return (
    <div className="flex-1 min-w-[150px]">
      <label className="block text-xs text-[#8b82a8] mb-1">{etiqueta}</label>
      <Select valor={valor} onChange={onChange} opciones={opciones} />
    </div>
  );
}

function Paginacion({
  pagina, ultima, onCambio,
}: { pagina: number; ultima: number; onCambio: (p: number) => void }) {
  const paginas = useMemo(() => {
    const set = new Set<number>([1, ultima]);
    for (let i = pagina - 2; i <= pagina + 2; i++) if (i > 0 && i <= ultima) set.add(i);
    return [...set].sort((a, b) => a - b);
  }, [pagina, ultima]);

  if (ultima <= 1) return null;

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5 mt-8" aria-label="Paginación">
      <button
        onClick={() => onCambio(pagina - 1)}
        disabled={pagina <= 1}
        className="h-9 px-3 rounded-lg border border-[#2a2140] text-sm text-[#8b82a8] disabled:opacity-40 hover:text-[#f0eefa]"
      >
        Anterior
      </button>
      {paginas.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - paginas[i - 1] > 1 && <span className="text-[#8b82a8] px-1">…</span>}
          <button
            onClick={() => onCambio(p)}
            aria-current={p === pagina ? "page" : undefined}
            className={`min-w-9 h-9 px-2 rounded-lg text-sm border transition-colors ${
              p === pagina
                ? "bg-[#946ed9] border-[#946ed9] text-white font-semibold"
                : "border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa]"
            }`}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        onClick={() => onCambio(pagina + 1)}
        disabled={pagina >= ultima}
        className="h-9 px-3 rounded-lg border border-[#2a2140] text-sm text-[#8b82a8] disabled:opacity-40 hover:text-[#f0eefa]"
      >
        Siguiente
      </button>
    </nav>
  );
}

export default function Catalogo({ medio, titulo }: { medio: Medio; titulo: string }) {
  const { enBiblioteca, agregar, preferencias } = useBiblioteca();

  const [texto, setTexto] = useState("");
  const [q, setQ] = useState("");
  const [letra, setLetra] = useState("");
  const [tipo, setTipo] = useState("");
  const [genero, setGenero] = useState("");
  const [anio, setAnio] = useState("");
  const [temporada, setTemporada] = useState("");
  const [estado, setEstado] = useState("");
  const [orden, setOrden] = useState("");
  const [pagina, setPagina] = useState(1);

  const [items, setItems] = useState<CatalogoItem[]>([]);
  const [ultima, setUltima] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Debounce de la barra de búsqueda
  useEffect(() => {
    const t = setTimeout(() => { setQ(texto.trim()); setPagina(1); }, 450);
    return () => clearTimeout(t);
  }, [texto]);

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    setError(null);
    buscarCatalogo({ medio, q, letra, tipo, genero, anio, temporada, estado, orden, pagina, sfw: preferencias.sfw })
      .then(r => {
        if (!vivo) return;
        setItems(r.items);
        setUltima(r.ultimaPagina);
        setTotal(r.total);
      })
      .catch(() => vivo && setError("No pudimos cargar el catálogo. Intenta de nuevo."))
      .finally(() => vivo && setCargando(false));
    return () => { vivo = false; };
  }, [medio, q, letra, tipo, genero, anio, temporada, estado, orden, pagina, preferencias.sfw, retryKey]);

  const cambiar = (fn: (v: string) => void) => (v: string) => { fn(v); setPagina(1); };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-wider mb-5" style={{ fontFamily: "'Oxanium', sans-serif" }}>
        {titulo}
      </h1>

      {/* Búsqueda */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b82a8]" />
        <input
          type="search"
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder={medio === "anime" ? "Buscar anime por título…" : "Buscar manga por título…"}
          aria-label={medio === "anime" ? "Buscar anime" : "Buscar manga"}
          className="w-full h-11 bg-[#16141e] border border-[#2a2140] rounded-xl pl-9 pr-4 text-sm text-[#f0eefa] placeholder:text-[#8b82a8] focus:outline-none focus:border-[#946ed9]"
        />
      </div>

      {/* Alfabeto */}
      <div className="flex flex-wrap gap-1.5 mb-4" role="group" aria-label="Filtrar por inicial">
        <button
          onClick={() => cambiar(setLetra)("")}
          aria-pressed={letra === ""}
          className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold border transition-colors ${
            letra === "" ? "bg-[#946ed9] border-[#946ed9] text-white" : "border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa]"
          }`}
        >
          Todo
        </button>
        {LETRAS.map(l => (
          <button
            key={l}
            onClick={() => cambiar(setLetra)(l)}
            aria-pressed={letra === l}
            className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors ${
              letra === l ? "bg-[#946ed9] border-[#946ed9] text-white" : "border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa]"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <FiltroConLabel etiqueta="Tipo" valor={tipo} onChange={cambiar(setTipo)}
          opciones={TIPOS[medio].map(t => ({ valor: t, etiqueta: t }))} />
        <FiltroConLabel etiqueta="Género" valor={genero} onChange={cambiar(setGenero)}
          opciones={GENEROS.map(g => ({ valor: String(g.id), etiqueta: g.nombre }))} />
        <FiltroConLabel etiqueta="Año" valor={anio} onChange={cambiar(setAnio)}
          opciones={ANIOS.map(a => ({ valor: String(a), etiqueta: String(a) }))} />
        {medio === "anime" && (
          <FiltroConLabel etiqueta="Temporada" valor={temporada} onChange={cambiar(setTemporada)}
            opciones={TEMPORADAS.map(t => ({ valor: t.valor, etiqueta: t.etiqueta }))} />
        )}
        <FiltroConLabel etiqueta="Estado" valor={estado} onChange={cambiar(setEstado)} opciones={ESTADOS[medio]} />
      </div>

      {/* Resumen + orden */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-[#8b82a8]" aria-live="polite">
          {cargando ? "Cargando resultados…" : `${total.toLocaleString("es")} resultados`}
        </p>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#8b82a8]">Ordenar por</label>
          <Select valor={orden} onChange={cambiar(setOrden)} opciones={ORDENES} className="w-52" />
        </div>
      </div>

      {error && <CatalogoError onReintentar={() => setRetryKey(k => k + 1)} />}

      {cargando ? (
        <div className="flex items-center justify-center py-20 text-[#8b82a8]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : items.length === 0 && !error ? (
        <p className="py-20 text-center text-[#8b82a8]">No encontramos títulos con esos filtros.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {items.map(item => {
            const guardado = enBiblioteca(medio, item.id);
            const rutaDetalle = medio === "anime" ? `/panel/anime/${item.id}` : `/panel/manga/${item.id}`;
            return (
              <li key={item.id}>
                <article className="h-full bg-[#110f1a] rounded-2xl overflow-hidden border border-[#2a2140] hover:border-[#946ed9]/40 transition-colors flex flex-col">
                  <Link to={rutaDetalle} className="block relative aspect-[2/3] bg-[#1c1928] group">
                    {item.img && <img src={item.img} alt={`Portada de ${item.title}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />}
                    <div className="absolute top-2 right-2"><TipoBadge tipo={item.type} /></div>
                    {item.score != null && (
                      <div className="absolute top-2 left-2"><PuntuacionBadge score={item.score} /></div>
                    )}
                  </Link>
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <Link to={rutaDetalle}>
                      <h2 className="text-[13px] font-semibold leading-snug line-clamp-2 hover:text-[#b08ee8] transition-colors" style={{ fontFamily: "'Oxanium', sans-serif" }}>
                        {item.title}
                      </h2>
                    </Link>
                    <p className="text-xs text-[#8b82a8]">{item.year ?? "—"}</p>
                    <button
                      onClick={() => agregar(item, medio)}
                      disabled={!!guardado}
                      className={`mt-auto h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        guardado
                          ? "bg-[#1c1928] text-[#8b82a8] border border-[#2a2140]"
                          : "text-white hover:opacity-90"
                      }`}
                      style={guardado ? undefined : { background: "linear-gradient(135deg, #946ed9, #7c4dca)" }}
                    >
                      {guardado ? <><Check className="w-3.5 h-3.5" /> En mi lista</> : <><Plus className="w-3.5 h-3.5" /> Agregar</>}
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <Paginacion pagina={pagina} ultima={ultima} onCambio={p => { setPagina(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
    </div>
  );
}
