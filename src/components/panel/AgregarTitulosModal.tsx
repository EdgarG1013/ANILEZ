import { useEffect, useState } from "react";
import { Search, Loader2, Plus, Check, X, Library, Globe } from "lucide-react";
import { buscarCatalogo, type CatalogoItem, type Medio } from "../../api/catalogoService";
import type { Entrada } from "../../store/biblioteca";
import { useBiblioteca } from "../../store/biblioteca";
import Select from "../ui/Select";

// ─── Modal para agregar títulos a una lista personalizada ────────────────────

interface AgregarTitulosModalProps {
  isOpen: boolean;
  onClose: () => void;
  listaNombre: string;
  entradas: Entrada[];
  clavesActivas: Set<string>;
  clave: (medio: Medio, id: number) => string;
  onAgregarItem: (medio: Medio, tenraiId: string, datosCatalogo?: Record<string, unknown>) => void;
}

export default function AgregarTitulosModal({
  isOpen,
  onClose,
  listaNombre,
  entradas,
  clavesActivas,
  clave,
  onAgregarItem,
}: AgregarTitulosModalProps) {
  const { preferencias } = useBiblioteca();
  const [fuente, setFuente] = useState<"biblioteca" | "externo">("biblioteca");
  const [busqueda, setBusqueda] = useState("");
  const [medioBusqueda, setMedioBusqueda] = useState<Medio>("anime");
  const [resultados, setResultados] = useState<CatalogoItem[]>([]);
  const [cargando, setCargando] = useState(false);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setFuente("biblioteca");
      setBusqueda("");
      setMedioBusqueda("anime");
      setResultados([]);
    }
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [isOpen, onClose]);

  // Búsqueda en catálogo externo con debounce
  useEffect(() => {
    if (fuente !== "externo" || busqueda.trim().length < 3) { setResultados([]); return; }
    const t = setTimeout(async () => {
      setCargando(true);
      try {
        const r = await buscarCatalogo({ medio: medioBusqueda, q: busqueda.trim(), pagina: 1, sfw: preferencias.sfw });
        setResultados(r.items.slice(0, 12));
      } catch { setResultados([]); }
      setCargando(false);
    }, 500);
    return () => clearTimeout(t);
  }, [busqueda, medioBusqueda, fuente]);

  if (!isOpen) return null;

  const disponibles = entradas
    .filter(e => !clavesActivas.has(clave(e.medio, e.id)))
    .filter(e => !busqueda.trim() || e.titulo.toLowerCase().includes(busqueda.trim().toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(6,5,14,0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[#110f1a] rounded-2xl max-w-lg w-full shadow-2xl border border-[#2a2140] flex flex-col max-h-[85vh]"
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-semibold text-[#f0eefa]" style={{ fontFamily: "'Oxanium', sans-serif" }}>
            Agregar títulos a "{listaNombre}"
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fuentes */}
        <div className="flex gap-2 px-5 mb-3">
          {([["biblioteca", "Mi biblioteca", Library], ["externo", "Buscar en el catálogo", Globe]] as const).map(([v, label, Icono]) => (
            <button
              key={v}
              onClick={() => { setFuente(v); setBusqueda(""); }}
              className={`h-9 px-3 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
                fuente === v ? "bg-[#946ed9] border-[#946ed9] text-white" : "bg-[#16141e] border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa]"
              }`}
            >
              <Icono className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="flex gap-2 px-5 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8b82a8] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <label htmlFor="buscar-item-modal" className="sr-only">Buscar títulos</label>
            <input
              id="buscar-item-modal"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder={fuente === "biblioteca" ? "Filtrar mi biblioteca…" : "Buscar anime o manga (mín. 3 letras)…"}
              className="w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl pl-9 pr-3 text-sm focus:outline-none focus:border-[#946ed9]"
            />
          </div>
          {fuente === "externo" && (
            <Select
              valor={medioBusqueda}
              onChange={v => setMedioBusqueda((v || "anime") as Medio)}
              opciones={[{ valor: "anime", etiqueta: "Anime" }, { valor: "manga", etiqueta: "Manga" }]}
              className="w-36"
            />
          )}
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 select-scrollbar">
          {fuente === "biblioteca" ? (
            disponibles.length === 0 ? (
              <p className="text-sm text-[#8b82a8] py-8 text-center">No hay títulos disponibles en tu biblioteca.</p>
            ) : (
              <ul className="grid gap-2">
                {disponibles.map(e => {
                  const k = clave(e.medio, e.id);
                  return (
                    <li key={k}>
                      <button
                        onClick={() => onAgregarItem(e.medio, String(e.id))}
                        className="w-full flex items-center gap-2 bg-[#16141e] border border-[#2a2140] rounded-xl p-2 text-left hover:border-[#946ed9]/60"
                      >
                        <img src={e.img} alt="" className="w-8 h-11 object-cover rounded bg-[#1c1928] shrink-0" loading="lazy" />
                        <span className="flex-1 min-w-0 overflow-hidden">
                          <span className="block text-sm truncate">{e.titulo}</span>
                          <span className="block text-[11px] uppercase text-[#8b82a8]">{e.medio}</span>
                        </span>
                        <Plus className="w-4 h-4 text-[#946ed9] shrink-0" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )
          ) : cargando ? (
            <p className="flex items-center justify-center gap-2 text-sm text-[#8b82a8] py-8">
              <Loader2 className="w-4 h-4 animate-spin" /> Buscando…
            </p>
          ) : resultados.length === 0 ? (
            <p className="text-sm text-[#8b82a8] py-8 text-center">Escribe al menos 3 letras para buscar títulos que no están en tus listas.</p>
          ) : (
            <ul className="grid gap-2">
              {resultados.map(r => {
                const k = `${medioBusqueda}:${r.id}`;
                const ya = clavesActivas.has(k);
                return (
                  <li key={k}>
                    <button
                      disabled={ya}
                      onClick={() => onAgregarItem(medioBusqueda, String(r.id), r as unknown as Record<string, unknown>)}
                      className="w-full flex items-center gap-2 bg-[#16141e] border border-[#2a2140] rounded-xl p-2 text-left hover:border-[#946ed9]/60 disabled:opacity-40"
                    >
                      <img src={r.img} alt="" className="w-8 h-11 object-cover rounded bg-[#1c1928] shrink-0" loading="lazy" />
                      <span className="flex-1 min-w-0 overflow-hidden">
                        <span className="block text-sm truncate">{r.title}</span>
                        <span className="block text-[11px] uppercase text-[#8b82a8]">{medioBusqueda} · {r.type}</span>
                      </span>
                      {ya ? <Check className="w-4 h-4 text-[#8b82a8] shrink-0" /> : <Plus className="w-4 h-4 text-[#946ed9] shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
