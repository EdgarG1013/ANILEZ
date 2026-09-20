// ─── Lógica de importación y exportación de biblioteca ───────────────────────
// Separado de biblioteca.tsx para mantener responsabilidades.

import type { Entrada, Grupo, ListaPersonalizada, ItemListaGrupo, Estado } from "./biblioteca";
import type { Medio } from "../api/catalogoService";
import api from "../api/axios";

// ─── Tipos del archivo exportado ────────────────────────────────────────────

export interface EntradaExport {
  id: number;
  medio: Medio;
  titulo: string;
  img: string;
  tipo: string;
  estado: string;
  progreso: number;
  total: number | null;
  favorito: boolean;
  puntuacion: number;
  notas: string;
  fechaInicio: string;
  fechaFin: string;
  agregado: string;
  orden: number;
  etiquetas: string[];
}

export interface ItemListaExport {
  medio: Medio;
  tenraiId: string;
  titulo: string;
  img: string;
  tipo: string;
  esExterno: boolean;
}

export interface ListaExport {
  nombre: string;
  orden: number;
  items: ItemListaExport[];
}

export interface GrupoExport {
  titulo: string;
  descripcion: string;
  portadaUrl: string | null;
  etiquetas: string[];
  listas: ListaExport[];
  creadoEn: string;
}

export interface ArchivoExport {
  version: number;
  exportadoEn: string;
  entradas: EntradaExport[];
  grupos: GrupoExport[];
}

export interface ImportResultado {
  entradasImportadas: number;
  entradasConErrores: number;
  gruposImportados: number;
  errores: { item: string; error: string }[];
}

type ImportEstado = "idle" | "procesando" | "completado" | "cancelado";

// ─── Constantes ─────────────────────────────────────────────────────────────

const DELAY_ENTRE_ITEMS = 300;
const MAX_RETRIES = 2;
const TIMEOUT = 15000;

// ─── Exportación ────────────────────────────────────────────────────────────

function stripUUIDs(entradas: Entrada[], grupos: Grupo[]): ArchivoExport {
  const entradasLimpias: EntradaExport[] = entradas.map(e => ({
    id: e.id,
    medio: e.medio,
    titulo: e.titulo,
    img: e.img,
    tipo: e.tipo,
    estado: e.estado,
    progreso: e.progreso,
    total: e.total,
    favorito: e.favorito,
    puntuacion: e.puntuacion,
    notas: e.notas,
    fechaInicio: e.fechaInicio,
    fechaFin: e.fechaFin,
    agregado: e.agregado,
    orden: e.orden,
    etiquetas: [...e.etiquetas],
  }));

  const gruposLimpios: GrupoExport[] = grupos.map(g => ({
    titulo: g.titulo,
    descripcion: g.descripcion,
    portadaUrl: g.portadaUrl,
    etiquetas: [...g.etiquetas],
    listas: g.listas.map(l => ({
      nombre: l.nombre,
      orden: l.orden,
      items: l.items.map(it => ({
        medio: it.medio,
        tenraiId: it.tenraiId,
        titulo: it.titulo,
        img: it.img,
        tipo: it.tipo,
        esExterno: it.esExterno,
      })),
    })),
    creadoEn: g.creadoEn,
  }));

  return {
    version: 1,
    exportadoEn: new Date().toISOString(),
    entradas: entradasLimpias,
    grupos: gruposLimpios,
  };
}

function descargar(contenido: string, nombre: string, mime: string) {
  const url = URL.createObjectURL(new Blob([contenido], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportarJSON(entradas: Entrada[], grupos: Grupo[]): void {
  const data = stripUUIDs(entradas, grupos);
  const fecha = new Date().toISOString().slice(0, 10);
  descargar(JSON.stringify(data, null, 2), `ANILEZ-biblioteca-${fecha}.json`, "application/json");
}

export function exportarTXT(entradas: Entrada[], grupos: Grupo[]): void {
  const lineas = [
    "ANILEZ — Biblioteca personal",
    "",
    "─── Anime ───",
    ...entradas.filter(e => e.medio === "anime").map(e =>
      `  ${e.titulo} — ${e.estado} — ${e.progreso}/${e.total ?? "?"} — agregado ${new Date(e.agregado).toLocaleDateString("es")}`
    ),
    "",
    "─── Manga ───",
    ...entradas.filter(e => e.medio === "manga").map(e =>
      `  ${e.titulo} — ${e.estado} — ${e.progreso}/${e.total ?? "?"} — agregado ${new Date(e.agregado).toLocaleDateString("es")}`
    ),
    "",
    "─── Grupos ───",
    ...grupos.map(g => [
      `  ${g.titulo}${g.etiquetas.length ? ` (${g.etiquetas.join(", ")})` : ""}`,
      ...g.listas.map(l => `    • ${l.nombre} [${l.items.length} títulos]`),
    ].join("\n")),
  ];
  const fecha = new Date().toISOString().slice(0, 10);
  descargar(lineas.join("\n"), `ANILEZ-biblioteca-${fecha}.txt`, "text/plain");
}

// ─── Parseo de archivo importado ────────────────────────────────────────────

export async function parsearArchivo(file: File): Promise<ArchivoExport> {
  const texto = await file.text();

  if (file.name.endsWith(".json")) {
    const raw = JSON.parse(texto) as Record<string, unknown>;

    if (!raw.version || !Array.isArray(raw.entradas)) {
      throw new Error("Formato JSON no reconocido. Asegúrate de exportar desde ANILEZ.");
    }

    return raw as unknown as ArchivoExport;
  }

  // TXT: convertir a formato unificado (sin catálogo real)
  const entradas: EntradaExport[] = [];
  const lineas = texto.split("\n");
  let orden = 0;

  for (const linea of lineas) {
    const m = linea.match(/^\s*\[(anime|manga)\]\s*(.+?)\s*—\s*([\w-]+)/i);
    if (!m) continue;
    entradas.push({
      id: 0,
      medio: m[1].toLowerCase() as Medio,
      titulo: m[2].trim(),
      img: "",
      tipo: m[1].toLowerCase() === "anime" ? "TV" : "Manga",
      estado: m[3].toLowerCase(),
      progreso: 0,
      total: null,
      favorito: false,
      puntuacion: 0,
      notas: "",
      fechaInicio: "",
      fechaFin: "",
      agregado: new Date().toISOString(),
      orden: orden++,
      etiquetas: [],
    });
  }

  return { version: 1, exportadoEn: new Date().toISOString(), entradas, grupos: [] };
}

// ─── ImportManager: cola de importación con progreso ────────────────────────

function esperar(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchCatalogo(medio: Medio, id: number): Promise<Record<string, unknown> | null> {
  for (let intento = 0; intento <= MAX_RETRIES; intento++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT);

      const res = await api.get(`catalogo/${medio}/${id}`, { signal: controller.signal });
      clearTimeout(timer);
      return res.data as Record<string, unknown>;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429 && intento < MAX_RETRIES) {
        const retryAfter = (err as { response?: { headers?: Record<string, string> } })?.response?.headers?.["retry-after"];
        const delay = retryAfter ? Number(retryAfter) * 1000 : 5000;
        await esperar(delay);
        continue;
      }
      return null;
    }
  }
  return null;
}

export class ImportManager {
  estado: ImportEstado = "idle";
  total = 0;
  procesados = 0;
  errores: { item: string; error: string }[] = [];
  mensajes: { texto: string; tipo: "info" | "exito" | "error" }[] = [];

  onProgress: ((procesados: number, total: number) => void) | null = null;
  onMensaje: ((msg: string, tipo: "info" | "exito" | "error") => void) | null = null;
  onEstadoChange: ((estado: ImportEstado) => void) | null = null;
  onCompletado: ((resultado: ImportResultado) => void) | null = null;

  private cancelado = false;

  private emitir(msg: string, tipo: "info" | "exito" | "error") {
    this.mensajes.push({ texto: msg, tipo });
    this.onMensaje?.(msg, tipo);
  }

  private actualizarEstado(estado: ImportEstado) {
    this.estado = estado;
    this.onEstadoChange?.(estado);
  }

  cancelar() {
    this.cancelado = true;
  }

  async iniciar(datos: ArchivoExport, reemplazarTodo: (d: { entradas?: Entrada[]; grupos?: Grupo[] }) => void): Promise<void> {
    this.cancelado = false;
    this.errores = [];
    this.mensajes = [];
    this.procesados = 0;
    this.total = datos.entradas.length + datos.grupos.reduce((acc, g) => acc + g.listas.reduce((a, l) => a + l.items.length, 0), 0);
    this.actualizarEstado("procesando");

    this.emitir(`Iniciando importación de ${datos.entradas.length} títulos y ${datos.grupos.length} grupos...`, "info");

    // ── Procesar entradas ──
    const entradasImportadas: Entrada[] = [];
    let entradasConErrores = 0;

    for (const entrada of datos.entradas) {
      if (this.cancelado) break;

      try {
        if (entrada.id > 0) {
          const datosCat = await fetchCatalogo(entrada.medio, entrada.id);
          if (datosCat) {
            entradasImportadas.push({
              listaId: null,
              id: entrada.id,
              medio: entrada.medio,
              titulo: (datosCat.title as string) || entrada.titulo,
              img: (datosCat.img as string) || entrada.img,
              tipo: (datosCat.type as string) || entrada.tipo,
              estado: entrada.estado as Estado,
              progreso: entrada.progreso,
              total: (datosCat.total as number) ?? entrada.total,
              favorito: entrada.favorito,
              puntuacion: entrada.puntuacion,
              notas: entrada.notas,
              fechaInicio: entrada.fechaInicio,
              fechaFin: entrada.fechaFin,
              agregado: entrada.agregado,
              orden: entrada.orden,
              etiquetas: entrada.etiquetas,
              urlRespaldo: null,
            });
          } else {
            // Sin datos del catálogo, usar los del archivo
            entradasImportadas.push({
              listaId: null,
              id: entrada.id,
              medio: entrada.medio,
              titulo: entrada.titulo,
              img: entrada.img,
              tipo: entrada.tipo,
              estado: entrada.estado as Estado,
              progreso: entrada.progreso,
              total: entrada.total,
              favorito: entrada.favorito,
              puntuacion: entrada.puntuacion,
              notas: entrada.notas,
              fechaInicio: entrada.fechaInicio,
              fechaFin: entrada.fechaFin,
              agregado: entrada.agregado,
              orden: entrada.orden,
              etiquetas: entrada.etiquetas,
              urlRespaldo: null,
            });
            this.emitir(`"${entrada.titulo}" — sin datos de catálogo, usando datos del archivo`, "info");
          }
        } else {
          // TXT import: id === 0, crear entrada básica
          entradasImportadas.push({
            listaId: null,
            id: Date.now() + entradasImportadas.length,
            medio: entrada.medio,
            titulo: entrada.titulo,
            img: entrada.img,
            tipo: entrada.tipo,
            estado: entrada.estado as Estado,
            progreso: entrada.progreso,
            total: entrada.total,
            favorito: entrada.favorito,
            puntuacion: entrada.puntuacion,
            notas: entrada.notas,
            fechaInicio: entrada.fechaInicio,
            fechaFin: entrada.fechaFin,
            agregado: entrada.agregado,
            orden: entrada.orden,
            etiquetas: entrada.etiquetas,
            urlRespaldo: null,
          });
        }
      } catch (err) {
        entradasConErrores++;
        const msg = `Error al procesar "${entrada.titulo}": ${err instanceof Error ? err.message : "Error desconocido"}`;
        this.errores.push({ item: entrada.titulo, error: msg });
        this.emitir(msg, "error");
      }

      this.procesados++;
      this.onProgress?.(this.procesados, this.total);

      if (datos.entradas.length > 0) {
        await esperar(DELAY_ENTRE_ITEMS);
      }
    }

    // ── Procesar grupos ──
    const gruposImportados: Grupo[] = [];

    for (const grupo of datos.grupos) {
      if (this.cancelado) break;

      try {
        const listas: ListaPersonalizada[] = [];

        for (const lista of grupo.listas) {
          const items: ItemListaGrupo[] = [];

          for (const item of lista.items) {
            if (this.cancelado) break;

            let img = item.img;
            let tipo = item.tipo;

            if (item.esExterno && item.tenraiId) {
              const idNum = Number(item.tenraiId);
              if (!isNaN(idNum) && idNum > 0) {
                const datosCat = await fetchCatalogo(item.medio, idNum);
                if (datosCat) {
                  img = (datosCat.img as string) || img;
                  tipo = (datosCat.type as string) || tipo;
                }
              }
              await esperar(DELAY_ENTRE_ITEMS);
            }

            items.push({
              clave: `${item.medio}:${item.tenraiId}`,
              medio: item.medio,
              tenraiId: item.tenraiId,
              titulo: item.titulo,
              img,
              tipo,
              datosCatalogo: {},
              esExterno: item.esExterno,
            });

            this.procesados++;
            this.onProgress?.(this.procesados, this.total);
          }

          listas.push({
            id: crypto.randomUUID(),
            nombre: lista.nombre,
            items,
            orden: lista.orden,
          });
        }

        gruposImportados.push({
          id: crypto.randomUUID(),
          titulo: grupo.titulo,
          descripcion: grupo.descripcion,
          portadaUrl: grupo.portadaUrl,
          etiquetas: [...grupo.etiquetas],
          listas,
          creadoEn: grupo.creadoEn || new Date().toISOString(),
        });

        this.emitir(`Grupo "${grupo.titulo}" importado con ${listas.length} listas.`, "exito");
      } catch (err) {
        const msg = `Error al importar grupo "${grupo.titulo}": ${err instanceof Error ? err.message : "Error desconocido"}`;
        this.errores.push({ item: grupo.titulo, error: msg });
        this.emitir(msg, "error");
      }
    }

    // ── Resultado final ──
    if (!this.cancelado) {
      reemplazarTodo({
        entradas: entradasImportadas.length > 0 ? entradasImportadas : undefined,
        grupos: gruposImportados.length > 0 ? gruposImportados : undefined,
      });
    }

    const resultado: ImportResultado = {
      entradasImportadas: entradasImportadas.length,
      entradasConErrores,
      gruposImportados: gruposImportados.length,
      errores: [...this.errores],
    };

    if (this.cancelado) {
      this.emitir("Importación cancelada por el usuario.", "error");
      this.actualizarEstado("cancelado");
    } else if (this.errores.length === 0) {
      this.emitir(`Importación completada: ${resultado.entradasImportadas} títulos, ${resultado.gruposImportados} grupos.`, "exito");
      this.actualizarEstado("completado");
    } else {
      this.emitir(`Importación completada con ${this.errores.length} errores.`, "error");
      this.actualizarEstado("completado");
    }

    this.onCompletado?.(resultado);
  }
}
