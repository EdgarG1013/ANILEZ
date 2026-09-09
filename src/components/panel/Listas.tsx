import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, GripVertical, Minus, Plus, ClipboardList } from "lucide-react";
import type { Medio } from "../../api/catalogoService";
import {
  useBiblioteca, ESTADOS_ANIME, ESTADOS_MANGA, type Entrada, type Estado,
} from "../../store/biblioteca";
import DeleteConfirmModal from "../compartido/DeleteConfirmModal";
import Select from "../ui/Select";

// ─── Listas clásicas con ordenamiento personalizable ─────────────────────────

type Orden = "fecha-desc" | "fecha-asc" | "alfa-asc" | "alfa-desc" | "manual";

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: "fecha-desc", etiqueta: "Fecha de guardado (reciente)" },
  { valor: "fecha-asc", etiqueta: "Fecha de guardado (antiguo)" },
  { valor: "alfa-asc", etiqueta: "Alfabético (A-Z)" },
  { valor: "alfa-desc", etiqueta: "Alfabético (Z-A)" },
  { valor: "manual", etiqueta: "Orden manual" },
];

export default function Listas({ medio, titulo }: { medio: Medio; titulo: string }) {
  const { entradas, actualizar, quitar, reordenar, clave } = useBiblioteca();
  const estados = medio === "anime" ? ESTADOS_ANIME : ESTADOS_MANGA;

  const [seccion, setSeccion] = useState<"todos" | Estado>("todos");
  const [orden, setOrden] = useState<Orden>("fecha-desc");
  const [arrastrado, setArrastrado] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Entrada | null>(null);

  const visibles = useMemo(() => {
    const base = entradas.filter(e => e.medio === medio && (seccion === "todos" || e.estado === seccion));
    const copia = [...base];
    // En "todos" el orden manual no aplica: se usa la fecha en que se agregó.
    const efectivo: Orden = seccion === "todos" && orden === "manual" ? "fecha-desc" : orden;
    switch (efectivo) {
      case "alfa-asc": return copia.sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
      case "alfa-desc": return copia.sort((a, b) => b.titulo.localeCompare(a.titulo, "es"));
      case "fecha-asc": return copia.sort((a, b) => a.agregado.localeCompare(b.agregado));
      case "manual": return copia.sort((a, b) => a.orden - b.orden);
      default: return copia.sort((a, b) => b.agregado.localeCompare(a.agregado));
    }
  }, [entradas, medio, seccion, orden]);

  const manualActivo = orden === "manual" && seccion !== "todos";

  /** Mueve una entrada a la posición indicada (1-indexada) dentro de la vista */
  function moverA(entrada: Entrada, posicion: number) {
    const claves = visibles.map(e => clave(e.medio, e.id));
    const desde = claves.indexOf(clave(entrada.medio, entrada.id));
    const hasta = Math.min(Math.max(posicion - 1, 0), claves.length - 1);
    if (desde === hasta || desde === -1) return;
    claves.splice(hasta, 0, claves.splice(desde, 1)[0]);
    reordenar(medio, seccion, claves);
  }

  const conteo = (valor: "todos" | Estado) =>
    entradas.filter(e => e.medio === medio && (valor === "todos" || e.estado === valor)).length;

  const secciones: { valor: "todos" | Estado; etiqueta: string }[] = [
    { valor: "todos", etiqueta: medio === "anime" ? "Todos los animes" : "Todos los mangas" },
    ...estados,
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-wider mb-5" style={{ fontFamily: "'Oxanium', sans-serif" }}>
        {titulo}
      </h1>

      {/* Secciones */}
      <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Secciones de la lista">
        {secciones.map(s => (
          <button
            key={s.valor}
            role="tab"
            aria-selected={seccion === s.valor}
            onClick={() => { setSeccion(s.valor); if (s.valor === "todos") setOrden("fecha-desc"); }}
            className={`h-10 px-4 rounded-xl text-sm font-semibold border transition-colors ${
              seccion === s.valor
                ? "bg-[#946ed9] border-[#946ed9] text-white"
                : "bg-[#16141e] border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa]"
            }`}
            style={{ fontFamily: "'Oxanium', sans-serif" }}
          >
            {s.etiqueta} <span className="opacity-70">({conteo(s.valor)})</span>
          </button>
        ))}
      </div>

      {/* Ordenamiento */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <label className="text-xs text-[#8b82a8]">Ordenar por</label>
        <Select
          valor={orden}
          onChange={v => setOrden(v as Orden)}
          opciones={ORDENES.filter(o => o.valor !== "manual" || seccion !== "todos")}
          className="w-56"
        />
        {manualActivo && (
          <span className="text-xs text-[#8b82a8]">
            Arrastra las filas o escribe el número de posición para reordenar.
          </span>
        )}
      </div>

      {visibles.length === 0 ? (
        <p className="py-16 text-center text-[#8b82a8]">
          Aún no hay títulos en esta sección. Agrégalos desde el catálogo.
        </p>
      ) : (
        <ul className="bg-[#110f1a] border border-[#2a2140] rounded-2xl divide-y divide-[#2a2140]">
          {visibles.map((e, i) => {
            const k = clave(e.medio, e.id);
            return (
              <li
                key={k}
                draggable={manualActivo}
                onDragStart={() => setArrastrado(k)}
                onDragOver={ev => manualActivo && ev.preventDefault()}
                onDrop={() => {
                  if (!manualActivo || !arrastrado) return;
                  const claves = visibles.map(x => clave(x.medio, x.id));
                  const desde = claves.indexOf(arrastrado);
                  if (desde === -1) return;
                  claves.splice(i, 0, claves.splice(desde, 1)[0]);
                  reordenar(medio, seccion, claves);
                  setArrastrado(null);
                }}
                className="flex items-center gap-3 p-3 hover:bg-[#16141e] transition-colors"
              >
                {manualActivo && (
                  <>
                    <GripVertical className="hidden sm:block w-4 h-4 text-[#8b82a8] shrink-0 cursor-grab" aria-hidden="true" />
                    <input
                      type="number"
                      min={1}
                      max={visibles.length}
                      value={i + 1}
                      onChange={ev => moverA(e, Number(ev.target.value))}
                      aria-label={`Posición de ${e.titulo}`}
                      className="hidden sm:block w-14 h-9 bg-[#16141e] border border-[#2a2140] rounded-lg text-center text-sm text-[#f0eefa] focus:outline-none focus:border-[#946ed9]"
                    />
                  </>
                )}

                <img
                  src={e.img}
                  alt={`Portada de ${e.titulo}`}
                  className="w-18 h-[100px] sm:w-12 sm:h-16 object-cover rounded-lg bg-[#1c1928] shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <Link
                    to={e.medio === "anime" ? `/panel/anime/${e.id}` : `/panel/manga/${e.id}`}
                    className="text-sm font-semibold truncate block hover:text-[#b08ee8] transition-colors"
                    style={{ fontFamily: "'Oxanium', sans-serif" }}
                  >
                    {e.titulo}
                  </Link>
                  <p className="text-xs text-[#8b82a8]">
                    {e.tipo} · guardado el {new Date(e.agregado).toLocaleDateString("es")}
                  </p>
                  {/* Controles en móvil: debajo del título, alineados a la derecha */}
                  <div className="flex items-center justify-end gap-2 mt-4 sm:hidden">
                    <Select
                      valor={e.estado}
                      onChange={v => actualizar(e.medio, e.id, { estado: v as Estado })}
                      opciones={estados}
                      className="w-36"
                    />
                    <Link
                      to={`/panel/estado/${e.medio}/${e.id}`}
                      aria-label={`Estado de ${e.titulo}`}
                      className="w-9 h-9 rounded-lg border border-[#2a2140] flex items-center justify-center text-[#8b82a8] hover:text-[#b08ee8] hover:border-[#946ed9]/60 transition-colors"
                    >
                      <ClipboardList className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => actualizar(e.medio, e.id, { favorito: !e.favorito })}
                      aria-label={e.favorito ? `Quitar ${e.titulo} de favoritos` : `Marcar ${e.titulo} como favorito`}
                      aria-pressed={e.favorito}
                      className="w-9 h-9 rounded-lg border border-[#2a2140] flex items-center justify-center text-[#8b82a8] hover:text-[#f0eefa]"
                    >
                      <Heart className={`w-4 h-4 ${e.favorito ? "fill-[#946ed9] text-[#946ed9]" : ""}`} />
                    </button>
                    <button
                      onClick={() => setAEliminar(e)}
                      aria-label={`Eliminar ${e.titulo} de la lista`}
                      className="w-9 h-9 rounded-lg border border-[#2a2140] flex items-center justify-center text-[#8b82a8] hover:text-[#ff9aa8]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Controles en desktop: a la derecha, en línea con el título */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => actualizar(e.medio, e.id, { progreso: Math.max(0, e.progreso - 1) })}
                      aria-label={`Restar progreso a ${e.titulo}`}
                      className="w-8 h-8 rounded-lg border border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa] flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm text-[#8b82a8] tabular-nums w-16 text-center">
                      {e.progreso} / {e.total ?? "?"}
                    </span>
                    <button
                      onClick={() => actualizar(e.medio, e.id, { progreso: e.progreso + 1 })}
                      aria-label={`Sumar progreso a ${e.titulo}`}
                      className="w-8 h-8 rounded-lg border border-[#2a2140] text-[#8b82a8] hover:text-[#f0eefa] flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Select
                    valor={e.estado}
                    onChange={v => actualizar(e.medio, e.id, { estado: v as Estado })}
                    opciones={estados}
                    className="w-36"
                  />
                  <Link
                    to={`/panel/estado/${e.medio}/${e.id}`}
                    aria-label={`Estado de ${e.titulo}`}
                    className="w-9 h-9 rounded-lg border border-[#2a2140] flex items-center justify-center text-[#8b82a8] hover:text-[#b08ee8] hover:border-[#946ed9]/60 transition-colors"
                  >
                    <ClipboardList className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => actualizar(e.medio, e.id, { favorito: !e.favorito })}
                    aria-label={e.favorito ? `Quitar ${e.titulo} de favoritos` : `Marcar ${e.titulo} como favorito`}
                    aria-pressed={e.favorito}
                    className="w-9 h-9 rounded-lg border border-[#2a2140] flex items-center justify-center text-[#8b82a8] hover:text-[#f0eefa]"
                  >
                    <Heart className={`w-4 h-4 ${e.favorito ? "fill-[#946ed9] text-[#946ed9]" : ""}`} />
                  </button>
                  <button
                    onClick={() => setAEliminar(e)}
                    aria-label={`Eliminar ${e.titulo} de la lista`}
                    className="w-9 h-9 rounded-lg border border-[#2a2140] flex items-center justify-center text-[#8b82a8] hover:text-[#ff9aa8]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <DeleteConfirmModal
        isOpen={aEliminar !== null}
        onClose={() => setAEliminar(null)}
        onConfirm={() => {
          if (aEliminar) {
            quitar(aEliminar.medio, aEliminar.id);
            setAEliminar(null);
          }
        }}
        title={aEliminar?.titulo ?? ""}
        itemLabel={medio === "anime" ? "anime" : "manga"}
      />
    </div>
  );
}
