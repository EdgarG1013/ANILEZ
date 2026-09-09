import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FolderPlus, Trash2, Layers, Search, ImageIcon, ImagePlus } from "lucide-react";
import { useBiblioteca, type Grupo } from "../../store/biblioteca";
import DeleteConfirmModal from "../../components/compartido/DeleteConfirmModal";

// ─── Grupos: índice de colecciones. El detalle vive en /panel/grupos/:id ─────

export default function GruposPage() {
  const { grupos, crearGrupo, eliminarGrupo, subirPortadaGrupo } = useBiblioteca();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [etiquetas, setEtiquetas] = useState("");
  const [filtro, setFiltro] = useState("");
  const [aEliminar, setAEliminar] = useState<Grupo | null>(null);
  const [creando, setCreando] = useState(false);
  const [previewPortada, setPreviewPortada] = useState<string | null>(null);
  const archivoPendienteRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibles = grupos.filter(g => {
    const t = filtro.trim().toLowerCase();
    if (!t) return true;
    return (
      g.titulo.toLowerCase().includes(t) ||
      g.descripcion.toLowerCase().includes(t) ||
      g.etiquetas.some(e => e.toLowerCase().includes(t))
    );
  });

  const campo =
    "w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]";
  const campoLabel = "block text-[11px] uppercase tracking-wider text-[#8b82a8] mb-1";

  const handleCrearGrupo = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!titulo.trim() || creando) return;
    setCreando(true);
    try {
      const nuevoId = await crearGrupo({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        portadaUrl: null,
        etiquetas: etiquetas.split(",").map(e => e.trim()).filter(Boolean),
      });
      // Subir portada si había una imagen seleccionada
      if (nuevoId && archivoPendienteRef.current) {
        await subirPortadaGrupo(nuevoId, archivoPendienteRef.current);
      }
      setTitulo("");
      setDescripcion("");
      setEtiquetas("");
      setPreviewPortada(null);
      archivoPendienteRef.current = null;
    } finally {
      setCreando(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      archivoPendienteRef.current = archivo;
      const url = URL.createObjectURL(archivo);
      setPreviewPortada(url);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-wider mb-1" style={{ fontFamily: "'Oxanium', sans-serif" }}>
        Grupos
      </h1>
      <p className="text-sm text-[#8b82a8] mb-5">
        Crea una colección con portada y etiquetas; entra en ella para organizar sus listas.
      </p>

      {/* Crear grupo */}
      <form
        onSubmit={handleCrearGrupo}
        className="bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden mb-5"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Portada con overlay */}
          <div className="sm:w-56 shrink-0 aspect-[16/9] sm:aspect-auto sm:min-h-[150px] bg-[#16141e] flex items-center justify-center relative group">
            {previewPortada ? (
              <img src={previewPortada} alt="subir portada" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <ImageIcon className="w-8 h-8 text-[#2a2140]" aria-hidden="true" />
                <span className="text-xs text-[#8b82a8] font-semibold mt-2">Click para subir portada</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity"
            >
              <ImagePlus className="w-6 h-6 text-white" />
              <span className="text-xs text-white font-semibold">Subir portada</span>
            </button>
          </div>

          {/* Campos del formulario */}
          <div className="flex-1 min-w-0 p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="g-titulo" className={campoLabel}>Título del grupo</label>
                <input id="g-titulo" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Clásicos de los 90" className={campo} />
              </div>
              <div>
                <label htmlFor="g-desc" className={campoLabel}>Descripción</label>
                <input id="g-desc" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Lo que quiero revisitar" className={campo} />
              </div>
            </div>
            <div>
              <label htmlFor="g-tags" className={campoLabel}>Etiquetas (separadas por coma)</label>
              <input id="g-tags" value={etiquetas} onChange={e => setEtiquetas(e.target.value)} placeholder="retro, shounen" className={campo} />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!titulo.trim() || creando}
                className="h-10 px-5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #946ed9, #7c4dca)", fontFamily: "'Oxanium', sans-serif" }}
              >
                {creando ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FolderPlus className="w-4 h-4" />
                )}
                {creando ? "Creando…" : "Crear grupo"}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="relative mb-5">
        <Search className="w-4 h-4 text-[#8b82a8] absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
        <label htmlFor="g-filtro" className="sr-only">Buscar grupos</label>
        <input
          id="g-filtro" value={filtro} onChange={e => setFiltro(e.target.value)}
          placeholder="Buscar por título, descripción o etiqueta…"
          className="w-full h-11 bg-[#16141e] border border-[#2a2140] rounded-xl pl-11 pr-4 text-sm focus:outline-none focus:border-[#946ed9]"
        />
      </div>

      {visibles.length === 0 ? (
        <p className="py-16 text-center text-[#8b82a8]">
          {grupos.length === 0 ? "Todavía no tienes grupos. Crea el primero arriba." : "Ningún grupo coincide con la búsqueda."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibles.map(g => {
            const total = g.listas.reduce((n, l) => n + l.items.length, 0);
            return (
              <li key={g.id} className="relative group">
                <Link
                  to={`/panel/grupos/${g.id}`}
                  className="block h-full bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden hover:border-[#946ed9]/60 transition-colors"
                >
                  <div className="aspect-[16/7] bg-[#16141e] flex items-center justify-center">
                    {g.portadaUrl ? (
                      <img src={g.portadaUrl} alt="subir portada" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[#2a2140]" aria-hidden="true" />
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-base font-semibold tracking-wide pr-10 truncate" style={{ fontFamily: "'Oxanium', sans-serif" }}>
                      {g.titulo}
                    </h2>
                    {g.descripcion && <p className="text-sm text-[#8b82a8] mt-1 line-clamp-2">{g.descripcion}</p>}
                    <ul className="flex flex-wrap gap-1.5 mt-3">
                      {g.etiquetas.map(t => (
                        <li key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-[#946ed9]/15 text-[#b08ee8] border border-[#946ed9]/30">
                          #{t}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-[#8b82a8] mt-3 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                      {g.listas.length} listas · {total} títulos
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => setAEliminar(g)}
                  aria-label={`Eliminar grupo ${g.titulo}`}
                  className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-[#0f0d16]/80 border border-[#2a2140] text-[#8b82a8] hover:text-[#ff9aa8] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <DeleteConfirmModal
        isOpen={aEliminar !== null}
        onClose={() => setAEliminar(null)}
        onConfirm={() => {
          if (aEliminar) { eliminarGrupo(aEliminar.id); setAEliminar(null); }
        }}
        title={aEliminar?.titulo ?? ""}
        itemLabel="grupo"
      />
    </div>
  );
}
