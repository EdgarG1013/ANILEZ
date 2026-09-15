import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, CalendarClock, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import { obtenerProximos, obtenerTopAnime, obtenerTopManga, obtenerNoticias, type CatalogoItem, type Noticia, type Medio } from "../../api/catalogoService";
import { useBiblioteca } from "../../store/biblioteca";
import { useAuth } from "../../store/auth";
import { TipoBadge, PuntuacionBadge } from "../../components/landing/badges";

// ─── Inicio del panel: noticias, próximos estrenos y recomendados ────────────

function Fila({
  titulo, Icono, items, cargando, medio,
}: { titulo: string; Icono: typeof Sparkles; items: CatalogoItem[]; cargando: boolean; medio: Medio }) {
  return (
    <section className="mb-10">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-wide mb-4" style={{ fontFamily: "'Oxanium', sans-serif" }}>
        <Icono className="w-5 h-5 text-[#946ed9]" /> {titulo}
      </h2>
      {cargando ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-[#16141e] animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.slice(0, 5).map(item => (
            <li key={item.id}>
              <Link
                to={medio === "anime" ? `/panel/anime/${item.id}` : `/panel/manga/${item.id}`}
                className="block bg-[#110f1a] border border-[#2a2140] rounded-2xl overflow-hidden hover:border-[#946ed9]/40 transition-colors"
              >
                <div className="relative aspect-[2/3] bg-[#1c1928]">
                  {item.img && <img src={item.img} alt={`Portada de ${item.title}`} loading="lazy" className="w-full h-full object-cover" />}
                  <div className="absolute top-2 right-2"><TipoBadge tipo={item.type} /></div>
                  {item.score != null && <div className="absolute top-2 left-2"><PuntuacionBadge score={item.score} /></div>}
                </div>
                <div className="p-3">
                  <h3 className="text-[13px] font-semibold line-clamp-2" style={{ fontFamily: "'Oxanium', sans-serif" }}>{item.title}</h3>
                  <p className="text-xs text-[#8b82a8] mt-1">{item.year ?? "—"}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function InicioPage() {
  const { entradas } = useBiblioteca();
  const { usuario } = useAuth();
  const [proximos, setProximos] = useState<CatalogoItem[]>([]);
  const [animes, setAnimes] = useState<CatalogoItem[]>([]);
  const [mangas, setMangas] = useState<CatalogoItem[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    Promise.allSettled([
      obtenerProximos(),
      obtenerTopAnime(),
      obtenerTopManga(),
      obtenerNoticias(5),
    ]).then(([p, a, m, n]) => {
      if (!vivo) return;
      // Top anime/manga devuelven PopularItem[], convertir a CatalogoItem[]
      if (p.status === "fulfilled") setProximos(p.value);
      if (a.status === "fulfilled") setAnimes(a.value.map(i => ({
        id: i.id, title: i.title, img: i.img, type: i.type, year: i.year,
        score: null, status: "", genres: i.genres, synopsis: i.synopsis, total: i.count,
      })));
      if (m.status === "fulfilled") setMangas(m.value.map(i => ({
        id: i.id, title: i.title, img: i.img, type: i.type, year: i.year,
        score: null, status: "", genres: i.genres, synopsis: i.synopsis, total: i.count,
      })));
      if (n.status === "fulfilled") setNoticias(n.value);
      setCargando(false);
    });
    return () => { vivo = false; };
  }, []);

  function formatearFecha(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const ahora = Date.now();
    const diffMin = Math.floor((ahora - d.getTime()) / 60000);
    if (diffMin < 60) return diffMin <= 1 ? "hace 1 min" : `hace ${diffMin} min`;
    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `hace ${diffHoras} h`;
    const diffDias = Math.floor(diffHoras / 24);
    if (diffDias < 7) return `hace ${diffDias} d`;
    return d.toLocaleDateString("es");
  }

  const stats = [
    { etiqueta: "Animes guardados", valor: entradas.filter(e => e.medio === "anime").length, a: "/panel/listas-anime" },
    { etiqueta: "Mangas guardados", valor: entradas.filter(e => e.medio === "manga").length, a: "/panel/listas-manga" },
    { etiqueta: "Favoritos", valor: entradas.filter(e => e.favorito).length, a: "/panel/listas-anime" },
    { etiqueta: "En progreso", valor: entradas.filter(e => e.estado === "viendo" || e.estado === "leyendo").length, a: "/panel/listas-anime" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-wider mb-1" style={{ fontFamily: "'Oxanium', sans-serif" }}>
        Hola, {usuario?.nombre ?? "Usuario"}
      </h1>
      <p className="text-sm text-[#8b82a8] mb-6">Este es el resumen de tu biblioteca y lo que viene en la industria.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {stats.map(s => (
          <Link key={s.etiqueta} to={s.a} className="bg-[#110f1a] border border-[#2a2140] rounded-2xl p-4 hover:border-[#946ed9]/40 transition-colors">
            <p className="text-2xl font-semibold" style={{ fontFamily: "'Oxanium', sans-serif" }}>{s.valor}</p>
            <p className="text-xs text-[#8b82a8] mt-1">{s.etiqueta}</p>
          </Link>
        ))}
      </div>

      {/* Noticias */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-wide mb-4" style={{ fontFamily: "'Oxanium', sans-serif" }}>
          <Newspaper className="w-5 h-5 text-[#946ed9]" /> Noticias
        </h2>
        <ul className="bg-[#110f1a] border border-[#2a2140] rounded-2xl divide-y divide-[#2a2140]">
          {noticias.length === 0 ? (
            <li className="p-4 text-sm text-[#8b82a8]">
              {cargando ? "Cargando noticias…" : "No pudimos cargar las noticias."}
            </li>
          ) : (
            noticias.map(n => (
              <li key={n.id}>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 flex items-start gap-4 hover:bg-[#16141e] transition-colors group"
                >
                  {n.img && (
                    <img src={n.img} alt="" loading="lazy" className="w-16 h-16 object-cover rounded-xl bg-[#1c1928] shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-[#b08ee8] transition-colors">
                      {n.titulo}
                    </p>
                    <p className="text-xs text-[#8b82a8] mt-0.5">
                      {n.fuente} · {formatearFecha(n.fecha)}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#8b82a8] shrink-0 mt-1" aria-hidden="true" />
                </a>
              </li>
            ))
          )}
        </ul>
      </section>

      <Fila titulo="Próximos estrenos" Icono={CalendarClock} items={proximos} cargando={cargando} medio="anime" />
      <Fila titulo="Anime recomendado" Icono={Sparkles} items={animes} cargando={cargando} medio="anime" />
      <Fila titulo="Manga recomendado" Icono={BookOpen} items={mangas} cargando={cargando} medio="manga" />
    </div>
  );
}
