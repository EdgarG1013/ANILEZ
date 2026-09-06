// ─── Datos locales de fallback (offline) ─────────────────────────────────────
// Estos datos se usan cuando el backend no está disponible.
// Se pueden actualizar manualmente cuando cambie el catálogo.

import type { HeroItem, CatalogoItem, PopularItem, Noticia } from './catalogoService';

// ─── Hero del carrusel principal ─────────────────────────────────────────────

export const HERO_LOCAL: HeroItem[] = [
  {
    id: 38000,
    title: "Kimetsu no Yaiba",
    altTitle: "Demon Slayer: Kimetsu no Yaiba",
    score: 8.4,
    type: "TV",
    year: 2019,
    studio: "ufotable",
    eps: 26,
    genres: ["Acción", "Sobrenatural", "Histórico"],
    synopsis:
      "Desde la muerte de su padre, la carga de mantener a la familia recae sobre Tanjirou Kamado. Un día, regresa a casa para encontrar a su familia masacrada y a su hermana convertida en demonio. Comienza así su viaje para convertirla de vuelta en humana…",
    img: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
  },
  {
    id: 61316,
    title: "Re:Zero kara Hajimeru",
    altTitle: "Re:Zero − Starting Life in Another World S4",
    score: 8.8,
    type: "TV",
    year: 2026,
    studio: "White Fox",
    eps: 24,
    genres: ["Drama", "Fantasía", "Suspenso"],
    synopsis:
      "Subaru Natsuki continúa su lucha usando su poder de Regreso por Muerte para proteger a quienes ama. La cuarta temporada eleva las apuestas más que nunca en un mundo lleno de misterios y peligros.",
    img: "https://cdn.myanimelist.net/images/anime/1003/156525l.jpg",
  },
];

// ─── Anime en temporada ─────────────────────────────────────────────────────

export const TEMPORADA_LOCAL: CatalogoItem[] = [
  { id: 59193, title: "Mushoku Tensei III", img: "", type: "TV", year: 2026, score: 8.67, status: "Airing", genres: ["Fantasía", "Drama"], synopsis: null, total: 24 },
  { id: 49233, title: "Youjo Senki II", img: "", type: "TV", year: 2026, score: 8.32, status: "Airing", genres: ["Acción", "Fantasía"], synopsis: null, total: 12 },
  { id: 60636, title: "Bleach: Sennen Kessen-hen", img: "", type: "TV", year: 2026, score: 9.03, status: "Airing", genres: ["Acción", "Sobrenatural"], synopsis: null, total: 26 },
];

// ─── Top anime ──────────────────────────────────────────────────────────────

export const TOP_ANIME_LOCAL: PopularItem[] = [
  { id: 38000, title: "Kimetsu no Yaiba", synopsis: "Un joven cazarrecompensas busca cura para su hermana demonio.", genres: ["Acción", "Sobrenatural"], year: 2019, count: 26, countLabel: "episodio", img: "", medio: "anime" },
  { id: 5114, title: "Fullmetal Alchemist: Brotherhood", synopsis: "Dos hermanos buscan la Piedra Filosofal para restaurar sus cuerpos.", genres: ["Acción", "Aventura"], year: 2009, count: 64, countLabel: "episodio", img: "", medio: "anime" },
];

// ─── Top manga ──────────────────────────────────────────────────────────────

export const TOP_MANGA_LOCAL: PopularItem[] = [
  { id: 2, title: "Berserk", synopsis: "Un espadachín maldito lucha en un mundo oscuro y brutal.", genres: ["Acción", "Drama"], year: 1989, count: 376, countLabel: "capítulo", img: "", medio: "manga" },
  { id: 1, title: "One Piece", synopsis: "Un joven pirata busca el tesoro más grande del mundo.", genres: ["Acción", "Aventura"], year: 1997, count: 1140, countLabel: "capítulo", img: "", medio: "manga" },
];

// ─── Próximos estrenos ──────────────────────────────────────────────────────

export const PROXIMOS_LOCAL: CatalogoItem[] = [
  { id: 62516, title: "Dandadan 3rd Season", img: "", type: "TV", year: 2027, score: null, status: "Upcoming", genres: ["Acción", "Comedia"], synopsis: null, total: null },
  { id: 57584, title: "Kage no Jitsuryokusha ni Naritakute! Movie", img: "", type: "Movie", year: 2027, score: null, status: "Upcoming", genres: ["Acción", "Fantasía"], synopsis: null, total: null },
];

// ─── Noticias ───────────────────────────────────────────────────────────────

export const NOTICIAS_LOCAL: Noticia[] = [
  { id: 1, titulo: "Bienvenido a ANILEZ", extracto: "Explora tu catálogo favorito de anime y manga.", img: "", fuente: "ANILEZ", fecha: new Date().toISOString(), url: "" },
];
