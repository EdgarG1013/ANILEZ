import api from './axios';

// ─── Servicio de catálogo conectado al backend ──────────────────────────────
// Reemplaza las llamadas directas a Tenrai/Jikan por llamadas a nuestro backend.
// El backend se encarga del rate-limiting, caché y formateo de datos.

// ─── Tipos (mismos shapes que usa el frontend) ──────────────────────────────

export type Medio = 'anime' | 'manga';
export type Temporada = 'winter' | 'spring' | 'summer' | 'fall';

export interface CatalogoItem {
  id: number;
  title: string;
  img: string;
  type: string;
  year: number | null;
  score: number | null;
  status: string;
  genres: string[];
  synopsis: string | null;
  total: number | null;
}

export interface CatalogoRespuesta {
  items: CatalogoItem[];
  paginaActual: number;
  ultimaPagina: number;
  total: number;
}

export interface PopularItem {
  id: number;
  title: string;
  synopsis: string | null;
  genres: string[];
  year: number | null;
  count: number | null;
  countLabel: string;
  img: string;
  medio: Medio;
}

export interface Personaje {
  nombre: string;
  rol: string;
  img?: string;
  seiyuu?: string;
}

export interface Episodio {
  num: number;
  titulo: string;
  fecha: string;
}

export interface LinkExterno {
  nombre: string;
  url: string;
}

export interface AnimeCard {
  id: number;
  title: string;
  year: number;
  score: number;
  type: string;
  img: string;
}

export interface AnimeDetalle {
  id: number;
  titulo: string;
  tituloIngles?: string;
  score: number;
  votos: number;
  rank: number;
  popularidad: number;
  tipo: string;
  year: number;
  estudio: string;
  eps: number;
  estado: string;
  fuente: string;
  clasificacion: string;
  duracion: string;
  generos: string[];
  sinopsis: string;
  img: string;
  banner: string;
  trailerYtId?: string;
  openings: string[];
  endings: string[];
  personajes: Personaje[];
  episodios: Episodio[];
  relacionados: AnimeCard[];
  similares: AnimeCard[];
  streaming: LinkExterno[];
  externales: LinkExterno[];
}

export interface MangaDetalle {
  id: number;
  titulo: string;
  tituloIngles?: string;
  tituloJapones?: string;
  score: number;
  votos: number;
  rank: number;
  popularidad: number;
  tipo: string;
  year: number;
  volumenes: number;
  capitulos: number;
  estado: string;
  fuente: string;
  generos: string[];
  sinopsis: string;
  img: string;
  autores: string[];
  personajes: Personaje[];
  relacionados: AnimeCard[];
  similares: AnimeCard[];
  externales: LinkExterno[];
}

export interface Noticia {
  id: number;
  titulo: string;
  extracto: string;
  img: string;
  fuente: string;
  fecha: string;
  url: string;
}

export interface HeroItem {
  id: number;
  title: string;
  altTitle: string;
  score: number;
  type: string;
  year: number;
  studio: string;
  eps: number;
  genres: string[];
  synopsis: string;
  img: string;
}

// ─── Constantes de filtros (se mantienen en el frontend) ─────────────────────

export const TIPOS: Record<Medio, string[]> = {
  anime: ['TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music'],
  manga: ['Manga', 'Novel', 'Lightnovel', 'Oneshot', 'Doujin', 'Manhwa', 'Manhua'],
};

export const ESTADOS: Record<Medio, { valor: string; etiqueta: string }[]> = {
  anime: [
    { valor: 'airing', etiqueta: 'En emisión' },
    { valor: 'complete', etiqueta: 'Finalizado' },
    { valor: 'upcoming', etiqueta: 'Próximamente' },
  ],
  manga: [
    { valor: 'publishing', etiqueta: 'En publicación' },
    { valor: 'complete', etiqueta: 'Finalizado' },
    { valor: 'upcoming', etiqueta: 'Próximamente' },
  ],
};

export const GENEROS: { id: number; nombre: string }[] = [
  { id: 1, nombre: 'Acción' },
  { id: 2, nombre: 'Aventura' },
  { id: 4, nombre: 'Comedia' },
  { id: 8, nombre: 'Drama' },
  { id: 10, nombre: 'Fantasía' },
  { id: 7, nombre: 'Misterio' },
  { id: 22, nombre: 'Romance' },
  { id: 24, nombre: 'Sci-Fi' },
  { id: 36, nombre: 'Recuentos de la vida' },
  { id: 30, nombre: 'Deportes' },
  { id: 37, nombre: 'Sobrenatural' },
  { id: 41, nombre: 'Suspenso' },
];

export const ANIOS: number[] = Array.from({ length: 37 }, (_, i) => 2026 - i);

export const TEMPORADAS: { valor: string; etiqueta: string; meses: [number, number] }[] = [
  { valor: 'winter', etiqueta: 'Invierno', meses: [1, 3] },
  { valor: 'spring', etiqueta: 'Primavera', meses: [4, 6] },
  { valor: 'summer', etiqueta: 'Verano', meses: [7, 9] },
  { valor: 'fall', etiqueta: 'Otoño', meses: [10, 12] },
];

export const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const ORDENES = [
  { valor: '', etiqueta: 'Predeterminado' },
  { valor: 'score:desc', etiqueta: 'Mejor puntuados' },
  { valor: 'popularity:asc', etiqueta: 'Más populares' },
  { valor: 'title:asc', etiqueta: 'Título (A-Z)' },
  { valor: 'title:desc', etiqueta: 'Título (Z-A)' },
  { valor: 'start_date:desc', etiqueta: 'Más recientes' },
];

// ─── FUNCIONES DE API ───────────────────────────────────────────────────────

export interface CatalogoFiltros {
  medio: Medio;
  q?: string;
  letra?: string;
  tipo?: string;
  genero?: string;
  anio?: string;
  temporada?: string;
  estado?: string;
  orden?: string;
  pagina?: number;
  sfw?: boolean;
}

/** Consulta el catálogo con filtros y paginación */
export async function buscarCatalogo(f: CatalogoFiltros): Promise<CatalogoRespuesta> {
  const params: Record<string, string> = {};
  params.pagina = String(f.pagina || 1);
  if (f.q) params.q = f.q;
  if (f.letra) params.letra = f.letra;
  if (f.tipo) params.tipo = f.tipo;
  if (f.genero) params.genero = f.genero;
  if (f.anio) params.anio = f.anio;
  if (f.temporada) params.temporada = f.temporada;
  if (f.estado) params.estado = f.estado;
  if (f.orden) params.orden = f.orden;
  if (f.sfw === false) params.sfw = 'false';

  const res = await api.get<CatalogoRespuesta>(`/catalogo/${f.medio}`, { params });
  return res.data;
}

/** Detalle completo de un anime */
export async function obtenerDetalleAnime(id: number): Promise<AnimeDetalle> {
  const res = await api.get<AnimeDetalle>(`/catalogo/anime/${id}`);
  return res.data;
}

/** Detalle completo de un manga */
export async function obtenerDetalleManga(id: number): Promise<MangaDetalle> {
  const res = await api.get<MangaDetalle>(`/catalogo/manga/${id}`);
  return res.data;
}

/** Hero del carrusel principal */
export async function obtenerHero(): Promise<HeroItem[]> {
  const res = await api.get<HeroItem[]>('/catalogo/hero');
  return res.data;
}

/** Anime en temporada */
export async function obtenerEnTemporada(): Promise<CatalogoItem[]> {
  const res = await api.get<CatalogoItem[]>('/catalogo/temporada');
  return res.data;
}

/** Top anime */
export async function obtenerTopAnime(): Promise<PopularItem[]> {
  const res = await api.get<PopularItem[]>('/catalogo/top-anime');
  return res.data;
}

/** Top manga */
export async function obtenerTopManga(): Promise<PopularItem[]> {
  const res = await api.get<PopularItem[]>('/catalogo/top-manga');
  return res.data;
}

/** Próximos estrenos */
export async function obtenerProximos(): Promise<CatalogoItem[]> {
  const res = await api.get<CatalogoItem[]>('/catalogo/proximos');
  return res.data;
}

/** Noticias de la industria */
export async function obtenerNoticias(cantidad = 5): Promise<Noticia[]> {
  const res = await api.get<Noticia[]>('/catalogo/noticias', {
    params: { cantidad },
  });
  return res.data;
}

/** Búsqueda global (anime + manga) */
export async function buscarGlobal(
  q: string,
  sfw = true,
): Promise<{ anime: CatalogoItem[]; manga: CatalogoItem[] }> {
  const res = await api.get<{ anime: CatalogoItem[]; manga: CatalogoItem[] }>(
    '/catalogo/buscar',
    { params: { q, sfw } },
  );
  return res.data;
}

/** Catálogo por temporada específica */
export async function buscarPorTemporada(
  anio: number,
  temporada: string,
  pagina = 1,
  sfw = true,
): Promise<CatalogoRespuesta> {
  const res = await api.get<CatalogoRespuesta>(
    `/catalogo/seasons/${anio}/${temporada}`,
    { params: { pagina, sfw } },
  );
  return res.data;
}

/** Info básica de anime/manga (para EstadoPage) */
export async function obtenerBasico(
  medio: Medio,
  id: number,
): Promise<{ id: number; title: string; img: string; total: number | null }> {
  const res = await api.get<{ id: number; title: string; img: string; total: number | null }>(
    `/catalogo/${medio}/${id}`,
  );
  return res.data;
}
