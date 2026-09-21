// ─── Lógica de importación y exportación de biblioteca ───────────────────────
// Separado de biblioteca.tsx para mantener responsabilidades.
// Sincroniza cada item con el backend durante la importación.

import type { Entrada, Grupo, ListaPersonalizada, ItemListaGrupo, Estado } from "./biblioteca";
import type { Medio } from "../api/catalogoService";
import api from "../api/axios";
import { agregarALista, type CrearListaPayload } from "../api/listaService";
import {
  crearGrupo as crearGrupoApi,
  crearListaGrupo,
  agregarItemGrupo,
} from "../api/grupoService";

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
  datosCatalogo: Record<string, unknown>;
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

const DELAY_ENTRE_ITEMS = 600;
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
        datosCatalogo: { ...it.datosCatalogo },
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
  const animeCount = entradas.filter(e => e.medio === "anime").length;
  const mangaCount = entradas.filter(e => e.medio === "manga").length;
  const data = stripUUIDs(entradas, grupos);
  const jsonBloque = JSON.stringify(data, null, 2);

  const lineas = [
    "═══════════════════════════════════════════════════",
    "  ANILEZ — Respaldo de biblioteca",
    `  Exportado: ${new Date().toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" })}`,
    "═══════════════════════════════════════════════════",
    "",
    `  Anime: ${animeCount}  |  Manga: ${mangaCount}  |  Grupos: ${grupos.length}`,
    "",
    "─── Resumen de títulos ───",
    "",
    ...entradas.filter(e => e.medio === "anime").map(e =>
      `  [anime] ${e.titulo} — ${e.estado} — ${e.progreso}/${e.total ?? "?"}`
    ),
    "",
    ...entradas.filter(e => e.medio === "manga").map(e =>
      `  [manga] ${e.titulo} — ${e.estado} — ${e.progreso}/${e.total ?? "?"}`
    ),
    "",
    ...grupos.map(g => [
      `  Grupo: ${g.titulo}${g.etiquetas.length ? ` (${g.etiquetas.join(", ")})` : ""}`,
      ...g.listas.map(l => `    • ${l.nombre} [${l.items.length} títulos]`),
    ].join("\n")),
    "",
    "═══════════════════════════════════════════════════",
    "  Los datos completos para importar se encuentran",
    "  en el bloque JSON debajo de esta línea.",
    "  NO edites la sección JSON a menos que sepas",
    "  lo que estás haciendo.",
    "═══════════════════════════════════════════════════",
    "",
    "---JSON_DATA_START---",
    jsonBloque,
    "---JSON_DATA_END---",
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

  // TXT: intentar extraer bloque JSON embebido (nuevo formato)
  const jsonInicio = texto.indexOf("---JSON_DATA_START---");
  const jsonFin = texto.indexOf("---JSON_DATA_END---");

  if (jsonInicio !== -1 && jsonFin !== -1) {
    const jsonBloque = texto.slice(jsonInicio + "---JSON_DATA_START---".length, jsonFin).trim();
    try {
      const raw = JSON.parse(jsonBloque) as Record<string, unknown>;
      if (raw.version && Array.isArray(raw.entradas)) {
        return raw as unknown as ArchivoExport;
      }
    } catch {
      throw new Error("El bloque JSON dentro del archivo TXT está corrupto.");
    }
  }

  // TXT legacy: formato antiguo sin JSON embebido
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

// ─── Helpers de API ─────────────────────────────────────────────────────────

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

/** Buscar título por nombre en el catálogo (para TXT que no tienen ID) */
async function buscarPorTitulo(medio: Medio, titulo: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await api.get(`/catalogo/${medio}`, {
      params: { q: titulo, pagina: 1 },
    });
    const items = (res.data as { items?: Record<string, unknown>[] })?.items;
    if (items && items.length > 0) {
      return items[0];
    }
  } catch {
    // silenciar
  }
  return null;
}

// ─── ImportManager: cola de importación con progreso y sincronización ───────

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

  async iniciar(
    datos: ArchivoExport,
    reemplazarTodo: (d: { entradas?: Entrada[]; grupos?: Grupo[] }) => void,
  ): Promise<void> {
    this.cancelado = false;
    this.errores = [];
    this.mensajes = [];
    this.procesados = 0;

    const totalItemsGrupos = datos.grupos.reduce(
      (acc, g) => acc + g.listas.reduce((a, l) => a + l.items.length, 0),
      0,
    );
    this.total = datos.entradas.length + totalItemsGrupos;
    this.actualizarEstado("procesando");

    this.emitir(
      `Iniciando importación de ${datos.entradas.length} títulos y ${datos.grupos.length} grupos...`,
      "info",
    );

    // ── Procesar entradas ──
    const entradasImportadas: Entrada[] = [];
    let entradasConErrores = 0;

    for (const entrada of datos.entradas) {
      if (this.cancelado) break;

      try {
        let datosCat: Record<string, unknown> | null = null;

        if (entrada.id > 0) {
          // JSON import: buscar datos actuales del catálogo por ID
          datosCat = await fetchCatalogo(entrada.medio, entrada.id);
        } else {
          // TXT import: buscar por título
          this.emitir(`Buscando "${entrada.titulo}" en el catálogo...`, "info");
          datosCat = await buscarPorTitulo(entrada.medio, entrada.titulo);
          if (datosCat) {
            this.emitir(`Encontrado: "${datosCat.title as string}"`, "exito");
          }
        }

        const idReal = datosCat
          ? ((datosCat.id as number) || entrada.id)
          : entrada.id;

        // Si es TXT y no encontramos el título, saltar
        if (entrada.id === 0 && !datosCat) {
          entradasConErrores++;
          this.errores.push({ item: entrada.titulo, error: "No se encontró en el catálogo" });
          this.emitir(`"${entrada.titulo}" — no encontrado en el catálogo, omitido`, "error");
          this.procesados++;
          this.onProgress?.(this.procesados, this.total);
          await esperar(DELAY_ENTRE_ITEMS);
          continue;
        }

        // Construir entrada local
        const nuevaEntrada: Entrada = {
          listaId: null,
          id: idReal,
          medio: entrada.medio,
          titulo: (datosCat?.title as string) || entrada.titulo,
          img: (datosCat?.img as string) || entrada.img,
          tipo: (datosCat?.type as string) || entrada.tipo,
          estado: entrada.estado as Estado,
          progreso: entrada.progreso,
          total: (datosCat?.total as number) ?? entrada.total,
          favorito: entrada.favorito,
          puntuacion: entrada.puntuacion,
          notas: entrada.notas,
          fechaInicio: entrada.fechaInicio,
          fechaFin: entrada.fechaFin,
          agregado: entrada.agregado,
          orden: entrada.orden,
          etiquetas: entrada.etiquetas.length > 0
            ? entrada.etiquetas
            : ((datosCat?.genres as string[]) || []),
          urlRespaldo: null,
        };

        entradasImportadas.push(nuevaEntrada);

        // ── Sincronizar con backend ──
        try {
          const payload: CrearListaPayload = {
            tenraiId: String(idReal),
            medio: entrada.medio,
            estado: entrada.estado,
            progreso: entrada.progreso,
            favorito: entrada.favorito,
            puntuacion: entrada.puntuacion,
            notas: entrada.notas || undefined,
            etiquetas: nuevaEntrada.etiquetas,
            orden: entrada.orden,
            datosCatalogo: (datosCat || entrada) as unknown as Record<string, unknown>,
          };
          const resultado = await agregarALista(payload);
          // Actualizar listaId con el ID del backend
          nuevaEntrada.listaId = resultado.id;
          nuevaEntrada.urlRespaldo = resultado.urlRespaldo ?? null;
          this.emitir(`"${nuevaEntrada.titulo}" sincronizado con el servidor`, "exito");
        } catch (err) {
          this.emitir(
            `"${nuevaEntrada.titulo}" guardado localmente (error al sincronizar: ${err instanceof Error ? err.message : "desconocido"})`,
            "error",
          );
        }
      } catch (err) {
        entradasConErrores++;
        const msg = `Error al procesar "${entrada.titulo}": ${err instanceof Error ? err.message : "Error desconocido"}`;
        this.errores.push({ item: entrada.titulo, error: msg });
        this.emitir(msg, "error");
      }

      this.procesados++;
      this.onProgress?.(this.procesados, this.total);
      await esperar(DELAY_ENTRE_ITEMS);
    }

    // ── Procesar grupos ──
    const gruposImportados: Grupo[] = [];

    for (const grupo of datos.grupos) {
      if (this.cancelado) break;

      try {
        // ── Crear grupo en backend ──
        let grupoBackendId: string = crypto.randomUUID();
        try {
          const grupoCreado = await crearGrupoApi({
            titulo: grupo.titulo,
            descripcion: grupo.descripcion,
            etiquetas: grupo.etiquetas,
          });
          grupoBackendId = grupoCreado.id;
          this.emitir(`Grupo "${grupo.titulo}" creado en el servidor`, "exito");
        } catch (err) {
          this.emitir(
            `Grupo "${grupo.titulo}" guardado localmente (error al sincronizar)`,
            "error",
          );
        }

        const listas: ListaPersonalizada[] = [];

        for (const lista of grupo.listas) {
          if (this.cancelado) break;

          // ── Crear lista en backend ──
          let listaBackendId: string = crypto.randomUUID();
          try {
            const listaCreada = await crearListaGrupo(grupoBackendId, {
              nombre: lista.nombre,
              orden: lista.orden,
            });
            listaBackendId = listaCreada.id;
          } catch {
            // silenciar
          }

          const items: ItemListaGrupo[] = [];

          for (const item of lista.items) {
            if (this.cancelado) break;

            let img = item.img;
            let tipo = item.tipo;
            const datosCatalogo = item.datosCatalogo ?? {};

            // Si no hay datos del catálogo en el archivo, buscar actuales
            if (Object.keys(datosCatalogo).length === 0) {
              const idNum = Number(item.tenraiId);
              if (!isNaN(idNum) && idNum > 0) {
                const datosCat = await fetchCatalogo(item.medio, idNum);
                if (datosCat) {
                  img = (datosCat.img as string) || img;
                  tipo = (datosCat.type as string) || tipo;
                }
                await esperar(DELAY_ENTRE_ITEMS);
              }
            } else {
              // Usar imágenes del datosCatalogo exportado
              const images = (datosCatalogo as Record<string, unknown>).images as Record<string, unknown> | undefined;
              const jpg = images?.jpg as Record<string, unknown> | undefined;
              img = (jpg?.large_image_url as string) || (jpg?.image_url as string) || (datosCatalogo as Record<string, unknown>).img as string || img;
              tipo = (datosCatalogo as Record<string, unknown>).type as string || tipo;
            }

            items.push({
              clave: `${item.medio}:${item.tenraiId}`,
              medio: item.medio,
              tenraiId: item.tenraiId,
              titulo: item.titulo,
              img,
              tipo,
              datosCatalogo,
              esExterno: item.esExterno,
            });

            // ── Agregar item al backend ──
            try {
              await agregarItemGrupo(listaBackendId, {
                medio: item.medio,
                tenraiId: item.tenraiId,
                orden: items.length - 1,
                datosCatalogo: Object.keys(datosCatalogo).length > 0 ? datosCatalogo : undefined,
              });
            } catch {
              // silenciar
            }

            this.procesados++;
            this.onProgress?.(this.procesados, this.total);
          }

          listas.push({
            id: listaBackendId,
            nombre: lista.nombre,
            items,
            orden: lista.orden,
          });
        }

        gruposImportados.push({
          id: grupoBackendId,
          titulo: grupo.titulo,
          descripcion: grupo.descripcion,
          portadaUrl: grupo.portadaUrl,
          etiquetas: [...grupo.etiquetas],
          listas,
          creadoEn: grupo.creadoEn || new Date().toISOString(),
        });

        this.emitir(
          `Grupo "${grupo.titulo}" importado con ${listas.length} listas.`,
          "exito",
        );
      } catch (err) {
        const msg = `Error al importar grupo "${grupo.titulo}": ${err instanceof Error ? err.message : "Error desconocido"}`;
        this.errores.push({ item: grupo.titulo, error: msg });
        this.emitir(msg, "error");
      }
    }

    // ── Guardar en estado local ──
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
      this.emitir(
        `Importación completada: ${resultado.entradasImportadas} títulos, ${resultado.gruposImportados} grupos.`,
        "exito",
      );
      this.actualizarEstado("completado");
    } else {
      this.emitir(
        `Importación completada con ${this.errores.length} errores.`,
        "error",
      );
      this.actualizarEstado("completado");
    }

    this.onCompletado?.(resultado);
  }
}
