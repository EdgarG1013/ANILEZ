import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";

const anioActual = new Date().getFullYear();

// ─── Columnas de enlaces del pie de página ────────────────────────────────────

const COLUMNAS = [
  {
    titulo: "Explorar",
    enlaces: [
      { etiqueta: "Inicio", ruta: "/" },
      { etiqueta: "Más populares", ruta: "/explorar?type=popular-all" },
      { etiqueta: "Temporada actual", ruta: "/explorar?type=season" },
      { etiqueta: "Próximos estrenos", ruta: "/explorar?type=upcoming" },
      { etiqueta: "Top en emisión", ruta: "/explorar?type=airing" },
    ],
  },
  {
    titulo: "Géneros",
    enlaces: [
      { etiqueta: "Acción", ruta: "/explorar?type=genre&genre=1" },
      { etiqueta: "Romance", ruta: "/explorar?type=genre&genre=22" },
      { etiqueta: "Shounen", ruta: "/explorar?type=genre&genre=27" },
      { etiqueta: "Sci-Fi", ruta: "/explorar?type=genre&genre=24" },
      { etiqueta: "Fantasía", ruta: "/explorar?type=genre&genre=10" },
    ],
  },
  {
    titulo: `Temporada ${anioActual}`,
    enlaces: [
      { etiqueta: "Invierno", ruta: `/explorar?type=season-archive&year=${anioActual}&season=winter` },
      { etiqueta: "Primavera", ruta: `/explorar?type=season-archive&year=${anioActual}&season=spring` },
      { etiqueta: "Verano", ruta: `/explorar?type=season-archive&year=${anioActual}&season=summer` },
      { etiqueta: "Otoño", ruta: `/explorar?type=season-archive&year=${anioActual}&season=fall` },
    ],
  },
  {
    titulo: "Formatos",
    enlaces: [
      { etiqueta: "ONAs", ruta: "/explorar?type=ona" },
      { etiqueta: "OVAs", ruta: "/explorar?type=ova" },
      { etiqueta: "Especiales", ruta: "/explorar?type=special" },
      { etiqueta: "Películas", ruta: "/explorar?type=movies" },
    ],
  },
] as const;

// ─── Pie de página principal ──────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="bg-[#06050e] text-[#8b82a8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">

          {/* Marca e información general */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-block mb-4" aria-label="ANILEZ">
              <img src={logo} alt="ANILEZ" className="h-5 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed max-w-[260px] mb-4">
              Tu espacio personal para rastrear, organizar y descubrir anime y manga.
              Ten el control de todo lo que ves y lees.
            </p>
          </div>

          {/* Columnas de navegación generadas dinámicamente */}
          {COLUMNAS.map(col => (
            <div key={col.titulo}>
              <h4 className="font-semibold uppercase text-[#946ed9] text-[11px] tracking-[1.4px] mb-4">
                {col.titulo}
              </h4>
              <ul className="space-y-2.5">
                {col.enlaces.map(enlace => (
                  <li key={enlace.etiqueta}>
                    <Link to={enlace.ruta} className="text-sm hover:text-[#f0eefa] transition-colors">
                      {enlace.etiqueta}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Barra inferior con copyright y políticas */}
      <div className="border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#4a4360]">
          <span>
            <a href="/sobre-nosotros" className="underline text-[#8b82a8] hover:text-[#f0eefa] transition-colors" >
              Sobre nosotros
            </a>
          </span>
          <span>© {anioActual} ANILEZ. Todos los derechos reservados.</span>
          <span className="flex items-center gap-3">
            <a href="/privacidad" className="underline text-[#8b82a8] hover:text-[#f0eefa] transition-colors">
              Privacidad
            </a>
            <a href="/terminos" className="underline text-[#8b82a8] hover:text-[#f0eefa] transition-colors">
              Términos
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}