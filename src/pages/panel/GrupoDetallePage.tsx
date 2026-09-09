import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, GripVertical, X, ImageIcon, Pencil, Check,
  ImagePlus,
} from "lucide-react";
import { useBiblioteca, type ListaPersonalizada } from "../../store/biblioteca";
import type { Medio } from "../../api/catalogoService";
import DeleteConfirmModal from "../../components/compartido/DeleteConfirmModal";
import AgregarTitulosModal from "../../components/panel/AgregarTitulosModal";
import Select from "../../components/ui/Select";

// ─── Detalle de un grupo: sus listas personalizadas, ordenables ──────────────

type Orden = "manual" | "alfa-asc" | "alfa-desc" | "fecha-asc" | "fecha-desc";

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: "manual", etiqueta: "Orden manual" },
  { valor: "alfa-asc", etiqueta: "Alfabético (A-Z)" },
  { valor: "alfa-desc", etiqueta: "Alfabético (Z-A)" },
  { valor: "fecha-desc", etiqueta: "Fecha de guardado (reciente)" },
  { valor: "fecha-asc", etiqueta: "Fecha de guardado (antiguo)" },
];

export default function GrupoDetallePage() {
  const { id } = useParams();
  const { grupos, entradas, clave, actualizarGrupo, subirPortadaGrupo, crearListaGrupo, eliminarListaGrupo, actualizarListaGrupo, agregarItemGrupo, eliminarItemGrupo, reordenarItemsGrupo } = useBiblioteca();
  const grupo = grupos.find(g => g.id === id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [listaActiva, setListaActiva] = useState<string | null>(null);
  const [orden, setOrden] = useState<Orden>("manual");
  const [editandoGrupo, setEditandoGrupo] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [abiertoModalAgregar, setAbiertoModalAgregar] = useState(false);
  const [aEliminarLista, setAEliminarLista] = useState<ListaPersonalizada | null>(null);
  const [aEliminarItem, setAEliminarItem] = useState<{ medio: Medio; tenraiId: string; titulo: string } | null>(null);

  // Estado local para etiquetas (para evitar bug de parseo con coma final)
  const [etiquetasInput, setEtiquetasInput] = useState("");

  const listas = grupo?.listas ?? [];
  const activa = listas.find(l => l.id === listaActiva) ?? listas[0] ?? null;

  useEffect(() => {
    if (!listaActiva && listas.length) setListaActiva(listas[0].id);
  }, [listaActiva, listas]);

  // Sincronizar etiquetasInput cuando cambia el grupo o se abre edición
  useEffect(() => {
    if (editandoGrupo && grupo) {
      setEtiquetasInput(grupo.etiquetas.join(", "));
    }
  }, [editandoGrupo, grupo]);

  const mapaEntradas = useMemo(
    () => new Map(entradas.map(e => [clave(e.medio, e.id), e])),
    [entradas, clave],
  );

  const items = useMemo(() => {
    if (!activa) return [];
    const base = activa.items.map(it => {
      const entrada = mapaEntradas.get(it.clave);
      return {
        ...it,
        id: Number(it.tenraiId),
        agregado: entrada?.agregado ?? "",
        esExterno: it.esExterno,
      };
    });
    switch (orden) {
      case "alfa-asc": return [...base].sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
      case "alfa-desc": return [...base].sort((a, b) => b.titulo.localeCompare(a.titulo, "es"));
      case "fecha-asc": return [...base].sort((a, b) => a.agregado.localeCompare(b.agregado));
      case "fecha-desc": return [...base].sort((a, b) => b.agregado.localeCompare(a.agregado));
      default: return base;
    }
  }, [activa, mapaEntradas, orden]);

  if (!grupo) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#8b82a8] mb-4">Este grupo ya no existe.</p>
        <Link to="/panel/grupos" className="text-[#b08ee8] text-sm font-semibold">Volver a Grupos</Link>
      </div>
    );
  }

  const mover = (k: string, posicion: number) => {
    if (!activa) return;
    const claves = items.map(i => i.clave);
    const desde = claves.indexOf(k);
    const hasta = Math.min(Math.max(posicion - 1, 0), claves.length - 1);
    if (desde === -1 || desde === hasta) return;
    claves.splice(hasta, 0, claves.splice(desde, 1)[0]);
    const nuevosItems = claves.map(c => {
      const partes = c.split(':');
      return { medio: partes[0] as Medio, tenraiId: partes[1] };
    });
    reordenarItemsGrupo(activa.id, nuevosItems);
  };

  const agregarItem = (medio: Medio, tenraiId: string, datosCatalogo?: Record<string, unknown>) => {
    if (!activa) return;
    const k = `${medio}:${tenraiId}`;
    if (activa.items.some(i => i.clave === k)) return;
    agregarItemGrupo(activa.id, medio, tenraiId, datosCatalogo);
  };

  const nuevaLista = async () => {
    const nuevaId = await crearListaGrupo(grupo.id, `Lista ${grupo.listas.length + 1}`);
    if (nuevaId) setListaActiva(nuevaId);
  };

  const clavesActivas = useMemo(() => new Set(activa?.items.map(i => i.clave) ?? []), [activa]);

  const campo = "w-full h-10 bg-[#16141e] border border-[#2a2140] rounded-xl px-3 text-sm focus:outline-none focus:border-[#946ed9]";
  const campoLabel = "text-[11px] uppercase tracking-wider text-[#8b82a8] mb-1";

  return (
    <div>
      <Link to="/panel/grupos" className="inline-flex items-center gap-2 text-sm text-[#8b82a8] hover:text-[#f0eefa] mb-4">
        <ArrowLeft className="w-4 h-4" /> Grupos
      </Link>

      {/* Cabecera del grupo */}
      <header className="bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden mb-5">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-56 shrink-0 aspect-[16/9] sm:aspect-auto sm:min-h-[150px] bg-[#16141e] flex items-center justify-center relative group">
            {grupo.portadaUrl
              ? <img src={grupo.portadaUrl} alt="" className="w-full h-full object-cover" />
              : <ImageIcon className="w-8 h-8 text-[#2a2140]" aria-hidden="true" />}
            {editandoGrupo && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={async e => {
                    const archivo = e.target.files?.[0];
                    if (archivo && grupo) await subirPortadaGrupo(grupo.id, archivo);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity"
                >
                  <ImagePlus className="w-6 h-6 text-white" />
                  <span className="text-xs text-white font-semibold">Cambiar portada</span>
                </button>
              </>
            )}
          </div>
          <div className="flex-1 min-w-0 p-4">
            {editandoGrupo ? (
              <div className="space-y-3">
                <div>
                  <label className={campoLabel}>Título</label>
                  <input value={grupo.titulo} onChange={e => actualizarGrupo(grupo.id, { titulo: e.target.value })} aria-label="Título del grupo" className={campo} />
                </div>
                <div>
                  <label className={campoLabel}>Descripción</label>
                  <input value={grupo.descripcion} onChange={e => actualizarGrupo(grupo.id, { descripcion: e.target.value })} placeholder="Descripción del grupo" aria-label="Descripción del grupo" className={campo} />
                </div>
                <div>
                  <label className={campoLabel}>Etiquetas (separadas por coma)</label>
                  <input
                    value={etiquetasInput}
                    onChange={e => {
                      const raw = e.target.value;
                      setEtiquetasInput(raw);
                      const partes = raw.split(",").map(t => t.trim());
                      const etiquetas = raw.endsWith(",")
                        ? partes.filter(Boolean)
                        : partes.slice(0, -1).filter(Boolean);
                      actualizarGrupo(grupo.id, { etiquetas });
                    }}
                    placeholder="ej: shonen, accion, clasico"
                    aria-label="Etiquetas del grupo"
                    className={campo}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {grupo.etiquetas.map(t => (
                      <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-[#946ed9]/15 text-[#b08ee8] border border-[#946ed9]/30">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-wider pr-10" style={{ fontFamily: "'Oxanium', sans-serif" }}>
                  {grupo.titulo}
                </h1>
                {grupo.descripcion && <p className="text-sm text-[#8b82a8] mt-1">{grupo.descripcion}</p>}
                <ul className="flex flex-wrap gap-1.5 mt-3">
                  {grupo.etiquetas.map(t => (
                    <li key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-[#946ed9]/15 text-[#b08ee8] border border-[#946ed9]/30">#{t}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="p-4 sm:pl-0">
            <button
              onClick={() => setEditandoGrupo(v => !v)}
              className="h-9 px-3 rounded-xl text-xs font-semibold border border-[#2a2140] text-[#f0eefa] hover:border-[#946ed9]/60 flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              {editandoGrupo ? <><Check className="w-3.5 h-3.5" /> Listo</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
            </button>
          </div>
        </div>
      </header>

      {/* Pestañas de listas */}
      <div className="flex flex-wrap gap-2 mb-4">
        {listas.map(l => (
          <button
            key={l.id}
            onClick={() => { setListaActiva(l.id); setModoEdicion(false); }}
            aria-current={activa?.id === l.id}
            className={`h-10 px-4 rounded-xl text-sm font-semibold border transition-colors ${
              activa?.id === l.id ? "bg-[#946ed9] border-[#946ed9] text-white" : "bg-[#16141e] border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa]"
            }`}
            style={{ fontFamily: "'Oxanium', sans-serif" }}
          >
            {l.nombre} <span className="opacity-70">({l.items.length})</span>
          </button>
        ))}
        <button
          onClick={nuevaLista}
          className="h-10 px-4 rounded-xl text-sm font-semibold border border-dashed border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa] flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Nueva lista
        </button>
      </div>

      {!activa ? (
        <p className="py-16 text-center text-[#8b82a8]">Este grupo aún no tiene listas. Crea la primera arriba.</p>
      ) : (
        <>
          {/* Barra de controles de la lista */}
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center">
            {/* Fila superior en mobile: orden + nombre */}
            <div className="flex gap-2 sm:flex-1 sm:items-center">
              <Select valor={orden} onChange={v => setOrden(v as Orden)} opciones={ORDENES} className="sm:w-56 shrink-0" />
              {modoEdicion ? (
                <input
                  value={activa.nombre}
                  onChange={e => actualizarListaGrupo(activa.id, { nombre: e.target.value })}
                  aria-label="Nombre de la lista"
                  className="flex-1 min-w-0 h-10 bg-[#16141e] border border-[#946ed9] rounded-xl px-3 text-sm font-semibold focus:outline-none focus:border-[#946ed9]"
                  style={{ fontFamily: "'Oxanium', sans-serif" }}
                />
              ) : (
                <span
                  className="flex-1 min-w-0 h-10 flex items-center px-1 text-sm font-semibold text-[#f0eefa] truncate"
                  style={{ fontFamily: "'Oxanium', sans-serif" }}
                >
                  {activa.nombre}
                </span>
              )}
            </div>
            {/* Fila inferior en mobile: botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={() => setAbiertoModalAgregar(true)}
                className="flex-1 sm:flex-none h-10 px-3 rounded-xl border border-[#2a2140] text-[#946ed9] hover:border-[#946ed9]/60 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>

              <button
                onClick={() => setModoEdicion(v => !v)}
                className="flex-1 sm:flex-none h-10 px-3 rounded-xl border border-[#2a2140] text-[#f0eefa] hover:border-[#946ed9]/60 flex items-center justify-center gap-2"
              >
                {modoEdicion ? <><Check className="w-4 h-4" /> Listo</> : <><Pencil className="w-4 h-4" /> Editar</>}
              </button>

              {modoEdicion && (
                <button
                  onClick={() => setAEliminarLista(activa)}
                  aria-label={`Eliminar lista ${activa.nombre}`}
                  className="flex-1 sm:flex-none h-10 px-3 rounded-xl border border-[#2a2140] text-[#8b82a8] hover:text-[#ff9aa8] flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> <span className="sm:hidden">Eliminar</span>
                </button>
              )}
            </div>
          </div>

          {/* Filas */}
          {items.length === 0 ? (
            <p className="py-12 text-center text-[#8b82a8]">Lista vacía. Agrega títulos con el botón de arriba.</p>
          ) : (
            <ul className="bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden divide-y divide-[#2a2140] mb-5">
              {items.map((it, i) => (
                <li
                  key={it.clave}
                  draggable={modoEdicion && orden === "manual"}
                  onDragStart={ev => ev.dataTransfer.setData("text/plain", it.clave)}
                  onDragOver={ev => modoEdicion && orden === "manual" && ev.preventDefault()}
                  onDrop={ev => {
                    if (!modoEdicion || orden !== "manual") return;
                    ev.preventDefault();
                    mover(ev.dataTransfer.getData("text/plain"), i + 1);
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-[#16141e] transition-colors"
                >
                  {modoEdicion && orden === "manual" && (
                    <>
                      <GripVertical className="hidden sm:block w-4 h-4 text-[#8b82a8] shrink-0 cursor-grab" aria-hidden="true" />
                      <input
                        type="number" min={1} max={items.length} value={i + 1}
                        onChange={ev => mover(it.clave, Number(ev.target.value))}
                        aria-label={`Posición de ${it.titulo}`}
                        className="w-12 h-9 bg-[#16141e] border border-[#2a2140] rounded-lg text-center text-sm text-[#f0eefa] shrink-0 focus:outline-none focus:border-[#946ed9]"
                      />
                    </>
                  )}
                  <img src={it.img} alt="" className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded-lg bg-[#1c1928] shrink-0" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/panel/${it.medio}/${it.id}`}
                      className="text-sm font-semibold block truncate hover:text-[#b08ee8]"
                      style={{ fontFamily: "'Oxanium', sans-serif" }}
                    >
                      {it.titulo}
                    </Link>
                    <p className="text-xs text-[#8b82a8] truncate">
                      <span className="uppercase">{it.medio}</span>
                      {it.tipo ? ` · ${it.tipo}` : ""}
                      {it.esExterno ? " · fuera de mis listas" : ""}
                    </p>
                  </div>
                  {modoEdicion && (
                    <button
                      onClick={() => setAEliminarItem({ medio: it.medio, tenraiId: it.tenraiId, titulo: it.titulo })}
                      aria-label={`Quitar ${it.titulo} de ${activa.nombre}`}
                      className="w-9 h-9 rounded-lg border border-[#2a2140] text-[#8b82a8] hover:text-[#ff9aa8] flex items-center justify-center shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Modal Agregar Títulos */}
      <AgregarTitulosModal
        isOpen={abiertoModalAgregar}
        onClose={() => setAbiertoModalAgregar(false)}
        listaNombre={activa?.nombre ?? ""}
        entradas={entradas}
        clavesActivas={clavesActivas}
        clave={clave}
        onAgregarItem={agregarItem}
      />

      {/* Modal confirmar eliminar lista */}
      <DeleteConfirmModal
        isOpen={aEliminarLista !== null}
        onClose={() => setAEliminarLista(null)}
        onConfirm={() => {
          if (aEliminarLista) {
            eliminarListaGrupo(aEliminarLista.id);
            setListaActiva(null);
            setAEliminarLista(null);
            setModoEdicion(false);
          }
        }}
        title={aEliminarLista?.nombre ?? ""}
        itemLabel="lista"
      />

      {/* Modal confirmar eliminar item */}
      <DeleteConfirmModal
        isOpen={aEliminarItem !== null}
        onClose={() => setAEliminarItem(null)}
        onConfirm={() => {
          if (aEliminarItem && activa) {
            eliminarItemGrupo(activa.id, aEliminarItem.medio, aEliminarItem.tenraiId);
            setAEliminarItem(null);
          }
        }}
        title={aEliminarItem?.titulo ?? ""}
        itemLabel="título"
      />
    </div>
  );
}
